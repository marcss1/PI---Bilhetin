import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

export async function POST() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }

    // Buscar carrinho
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", decoded.id)
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

    if (itensError) {
      throw itensError
    }

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

      if (updateError) {
        throw updateError
      }
    }

    // Confirmar compra
    const { error: updateCompraError } = await supabase
      .from("compras")
      .update({ status: "confirmado" })
      .eq("id", compra.id)

    if (updateCompraError) {
      throw updateCompraError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao finalizar compra:", error)
    return NextResponse.json({ success: false, message: "Erro ao finalizar compra" }, { status: 500 })
  }
}
