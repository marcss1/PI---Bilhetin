import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    // Buscar carrinho
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", session.user.id)
      .eq("status", "pendente")
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
    }

    // Buscar itens da compra
    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(*)
      `)
      .eq("compra_id", compra.id)

    if (itensError) throw itensError

    if (!itens || itens.length === 0) {
      return NextResponse.json({ success: false, message: "Carrinho vazio" }, { status: 400 })
    }

    // Atualizar estoque de ingressos
    for (const item of itens) {
      const { error: updateError } = await supabase
        .from("tipos_ingresso")
        .update({
          quantidade: item.tipoIngresso.quantidade - item.quantidade,
        })
        .eq("id", item.tipo_ingresso_id)

      if (updateError) throw updateError
    }

    // Confirmar compra
    const { error: updateCompraError } = await supabase
      .from("compras")
      .update({ status: "confirmado" })
      .eq("id", compra.id)

    if (updateCompraError) throw updateCompraError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao finalizar compra:", error)
    return NextResponse.json({ success: false, message: "Erro ao finalizar compra" }, { status: 500 })
  }
}