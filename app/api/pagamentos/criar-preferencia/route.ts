import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { criarPreferenciaPagamento } from "@/lib/mercadopago"
import { formatarData } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 1. Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const userId = session.user.id

    // 2. Buscar dados do usuário (necessário para o Mercado Pago)
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 })
    }

    // 3. Buscar itens do carrinho (itens soltos, sem compra_id)
    let { data: cartItems, error: itemsError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(
          *,
          evento:eventos(*)
        )
      `)
      .eq("usuario_id", userId)
      .is("compra_id", null)

    // Se não achou itens soltos, verifica se já existe uma compra pendente (caso o usuário tenha voltado da tela de pagamento)
    let compraId = null;

    if (!cartItems || cartItems.length === 0) {
       const { data: pendingCompra } = await supabase
          .from("compras")
          .select("id")
          .eq("usuario_id", userId)
          .eq("status", "pendente")
          .order('criado_em', { ascending: false }) // Pega a mais recente
          .limit(1)
          .maybeSingle()

       if (pendingCompra) {
          // Busca os itens dessa compra pendente
          const { data: linkedItems } = await supabase
             .from("itens_compra")
             .select(`
                *,
                tipoIngresso:tipos_ingresso(
                  *,
                  evento:eventos(*)
                )
             `)
             .eq("compra_id", pendingCompra.id)
          
          if (linkedItems && linkedItems.length > 0) {
             cartItems = linkedItems
             compraId = pendingCompra.id
          } else {
             return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
          }
       } else {
          return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
       }
    }

    // 4. Se ainda não temos um ID de compra (são itens novos do carrinho), vamos criar a compra
    if (!compraId) {
      // Calcular total
      const total = cartItems!.reduce((acc, item) => {
        return acc + (Number(item.preco_unitario) * item.quantidade)
      }, 0)

      // Criar registro na tabela de compras
      const { data: novaCompra, error: createError } = await supabase
        .from("compras")
        .insert({
          usuario_id: userId,
          status: "pendente",
          total: total
        })
        .select()
        .single()
      
      if (createError) {
        throw new Error(`Erro ao criar pedido: ${createError.message}`)
      }

      compraId = novaCompra.id

      // Vincular os itens soltos a esta nova compra
      const itemIds = cartItems!.map(i => i.id)
      const { error: updateError } = await supabase
        .from("itens_compra")
        .update({ compra_id: compraId })
        .in("id", itemIds)

      if (updateError) {
        throw new Error(`Erro ao vincular itens: ${updateError.message}`)
      }
    }

    // 5. Formatar itens para o Mercado Pago
    const mpItems = cartItems!.map((item) => ({
      id: item.id,
      title: `${item.tipoIngresso.nome} - ${item.tipoIngresso.evento.titulo}`,
      description: `${formatarData(new Date(item.tipoIngresso.evento.data))} - ${item.tipoIngresso.evento.local}`,
      quantity: item.quantidade,
      unit_price: Number(item.preco_unitario),
      currency_id: "BRL",
      category_id: "tickets",
    }))

    // 6. Criar preferência de pagamento
    const preference = await criarPreferenciaPagamento(
      mpItems,
      {
        name: userData.nome,
        email: userData.email,
        identification: userData.cpf
          ? {
              type: "CPF",
              number: userData.cpf,
            }
          : undefined,
      },
      {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/pendente`,
      },
      compraId,
    )

    // 7. Atualizar compra com o ID da preferência
    await supabase
      .from("compras")
      .update({
        preferencia_id: preference.id,
        status: "aguardando_pagamento",
      })
      .eq("id", compraId)

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
    })

  } catch (error: any) {
    console.error("Erro crítico ao criar preferência:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao processar pagamento", 
      details: error.message 
    }, { status: 500 })
  }
}