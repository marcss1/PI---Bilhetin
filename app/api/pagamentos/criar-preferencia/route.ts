// Importações necessárias para a API Route
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"
import { criarPreferenciaPagamento } from "@/lib/mercadopago"
import { formatarData } from "@/lib/utils"

// Chave secreta para verificar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

/**
 * API Route para criar uma preferência de pagamento
 * Esta rota é chamada quando o usuário clica em "Ir para Pagamento" no carrinho
 */
export async function POST(request: Request) {
  try {
    // 1. VERIFICAÇÃO DE AUTENTICAÇÃO
    // Obtém o token de autenticação dos cookies
    const token = cookies().get("auth_token")?.value

    // Se não há token, usuário não está logado
    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    // Decodifica o token para obter o ID do usuário
    const decoded = verify(token, JWT_SECRET) as { id: string }

    // 2. BUSCAR DADOS DO USUÁRIO
    // Busca informações completas do usuário no banco de dados
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", decoded.id)
      .single()

    // Se usuário não encontrado, retorna erro
    if (userError || !userData) {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 })
    }

    // 3. BUSCAR CARRINHO (COMPRA PENDENTE)
    // Procura por uma compra com status "pendente" do usuário
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", decoded.id)
      .eq("status", "pendente")
      .single()

    // Se não há carrinho, retorna erro
    if (compraError || !compra) {
      return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
    }

    // 4. BUSCAR ITENS DO CARRINHO
    // Busca todos os itens da compra com informações dos eventos
    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(
          *,
          evento:eventos(*)
        )
      `)
      .eq("compra_id", compra.id)

    // Se não há itens ou erro, retorna erro
    if (itensError || !itens || itens.length === 0) {
      return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
    }

    // 5. FORMATAR ITENS PARA O MERCADO PAGO
    // Converte os itens do nosso formato para o formato esperado pelo Mercado Pago
    const mpItems = itens.map((item) => ({
      id: item.id, // ID único do item
      title: `${item.tipoIngresso.nome} - ${item.tipoIngresso.evento.titulo}`, // Nome do produto
      description: `${formatarData(new Date(item.tipoIngresso.evento.data))} - ${item.tipoIngresso.evento.local}`, // Descrição
      quantity: item.quantidade, // Quantidade
      unit_price: item.preco_unitario, // Preço unitário
      currency_id: "BRL", // Moeda brasileira
      category_id: "tickets", // Categoria de ingressos
    }))

    // 6. CRIAR PREFERÊNCIA DE PAGAMENTO
    // Chama a função que cria a preferência no Mercado Pago
    const preference = await criarPreferenciaPagamento(
      mpItems, // Itens formatados
      {
        name: userData.nome, // Nome do comprador
        email: userData.email, // Email do comprador
        identification: userData.cpf
          ? {
              type: "CPF", // Tipo de documento
              number: userData.cpf, // Número do CPF
            }
          : undefined, // Se não tem CPF, não envia identificação
      },
      {
        // URLs para onde o usuário será redirecionado após o pagamento
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pagamento/pendente`,
      },
      compra.id, // ID da nossa compra como referência externa
    )

    // 7. ATUALIZAR COMPRA NO BANCO
    // Salva o ID da preferência e muda o status para "aguardando_pagamento"
    const { error: updateError } = await supabase
      .from("compras")
      .update({
        preferencia_id: preference.id, // ID da preferência do Mercado Pago
        status: "aguardando_pagamento", // Novo status
      })
      .eq("id", compra.id)

    // Se erro ao atualizar, lança exceção
    if (updateError) {
      throw updateError
    }

    // 8. RETORNAR DADOS PARA O FRONTEND
    // Retorna o ID da preferência e o link de checkout
    return NextResponse.json({
      success: true,
      preferenceId: preference.id, // ID da preferência
      initPoint: preference.init_point, // Link para o checkout do Mercado Pago
    })
  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar preferência de pagamento" }, { status: 500 })
  }
}
