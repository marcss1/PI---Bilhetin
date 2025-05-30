import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }

    // Verificar se o item pertence ao usuário
    const { data: item, error: itemError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        compra:compras(*)
      `)
      .eq("id", params.id)
      .single()

    if (itemError || !item || item.compra.usuario_id !== decoded.id) {
      return NextResponse.json({ success: false, message: "Item não encontrado" }, { status: 404 })
    }

    // Remover item
    const { error: deleteError } = await supabase.from("itens_compra").delete().eq("id", params.id)

    if (deleteError) {
      throw deleteError
    }

    // Recalcular total da compra
    const { data: itensRestantes, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(*)
      `)
      .eq("compra_id", item.compra_id)

    if (itensError) {
      throw itensError
    }

    const novoTotal = itensRestantes.reduce((total, item) => total + item.quantidade * item.tipoIngresso.preco, 0)

    const { error: updateError } = await supabase.from("compras").update({ total: novoTotal }).eq("id", item.compra_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error)
    return NextResponse.json({ success: false, message: "Erro ao remover do carrinho" }, { status: 500 })
  }
}
