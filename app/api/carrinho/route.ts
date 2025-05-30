import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"
import { formatarData } from "@/lib/utils"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

export async function GET() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }

    // Buscar compra pendente no Supabase
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", decoded.id)
      .eq("status", "pendente")
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ success: true, itens: [] })
    }

    // Buscar itens da compra
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

    if (itensError) {
      throw itensError
    }

    const itensFormatados = itens.map((item) => ({
      id: item.id,
      evento: {
        id: item.tipoIngresso.evento.id,
        titulo: item.tipoIngresso.evento.titulo,
        data: formatarData(new Date(item.tipoIngresso.evento.data)),
        local: item.tipoIngresso.evento.local,
        imagem: item.tipoIngresso.evento.imagem,
      },
      ingressos: [
        {
          tipo: item.tipoIngresso.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
        },
      ],
    }))

    return NextResponse.json({ success: true, itens: itensFormatados })
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar carrinho" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const body = await request.json()
    const { eventoId, tiposIngresso } = body

    // Verificar se há ingressos selecionados
    const totalIngressos = tiposIngresso.reduce((total: number, tipo: any) => total + tipo.quantidade, 0)

    if (totalIngressos === 0) {
      return NextResponse.json({ success: false, message: "Selecione pelo menos um ingresso" }, { status: 400 })
    }

    // Buscar ou criar carrinho (compra pendente)
    let compraId: string

    const { data: compraExistente, error: compraError } = await supabase
      .from("compras")
      .select("id")
      .eq("usuario_id", decoded.id)
      .eq("status", "pendente")
      .single()

    if (compraError && compraError.code !== "PGRST116") {
      // PGRST116 é o código para "não encontrado"
      throw compraError
    }

    if (compraExistente) {
      compraId = compraExistente.id
    } else {
      // Criar nova compra
      const { data: novaCompra, error: novaCompraError } = await supabase
        .from("compras")
        .insert([
          {
            usuario_id: decoded.id,
            status: "pendente",
            total: 0,
          },
        ])
        .select()

      if (novaCompraError || !novaCompra || novaCompra.length === 0) {
        throw novaCompraError || new Error("Erro ao criar compra")
      }

      compraId = novaCompra[0].id
    }

    // Adicionar itens ao carrinho
    let total = 0

    for (const tipo of tiposIngresso) {
      if (tipo.quantidade > 0) {
        // Buscar tipo de ingresso
        const { data: tipoIngresso, error: tipoError } = await supabase
          .from("tipos_ingresso")
          .select("*")
          .eq("id", tipo.id)
          .single()

        if (tipoError || !tipoIngresso) {
          continue
        }

        // Verificar disponibilidade
        if (tipo.quantidade > tipoIngresso.quantidade) {
          return NextResponse.json(
            {
              success: false,
              message: `Apenas ${tipoIngresso.quantidade} ingressos do tipo ${tipoIngresso.nome} disponíveis`,
            },
            { status: 400 },
          )
        }

        // Gerar código único para o ingresso
        const codigo = `${eventoId.substring(0, 6)}-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .substring(2, 7)}`

        // Adicionar ao carrinho
        const { error: itemError } = await supabase.from("itens_compra").insert([
          {
            compra_id: compraId,
            tipo_ingresso_id: tipo.id,
            quantidade: tipo.quantidade,
            preco_unitario: tipoIngresso.preco,
            codigo,
          },
        ])

        if (itemError) {
          throw itemError
        }

        total += tipo.quantidade * tipoIngresso.preco
      }
    }

    // Atualizar total da compra
    const { error: updateError } = await supabase.from("compras").update({ total }).eq("id", compraId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return NextResponse.json({ success: false, message: "Erro ao adicionar ao carrinho" }, { status: 500 })
  }
}
