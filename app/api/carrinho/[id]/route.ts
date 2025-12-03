import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    // Verificar se o item pertence ao usuário (via tabela itens_compra -> compras)
    // No entanto, seu esquema pode ter itens sem 'compra_id' (carrinho temporário) ou associados a uma compra pendente.
    // A rota anterior 'app/api/carrinho/route.ts' sugere que itens de carrinho têm 'compra_id' NULL ou associado a uma compra pendente.
    // Vamos usar a lógica mais segura: buscar o item e verificar se o usuario_id bate.
    
    const { data: item, error: itemError } = await supabase
      .from("itens_compra")
      .select("id, usuario_id")
      .eq("id", params.id)
      .single()

    if (itemError || !item) {
       return NextResponse.json({ success: false, message: "Item não encontrado" }, { status: 404 })
    }
    
    // Verificação de segurança
    if (item.usuario_id !== session.user.id) {
       return NextResponse.json({ success: false, message: "Permissão negada" }, { status: 403 })
    }

    // Remover item
    const { error: deleteError } = await supabase.from("itens_compra").delete().eq("id", params.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error)
    return NextResponse.json({ success: false, message: "Erro ao remover do carrinho" }, { status: 500 })
  }
}