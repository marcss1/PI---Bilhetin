import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("id", params.id)
      .eq("usuario_id", session.user.id)
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ success: false, message: "Compra não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      status: compra.status,
      pagamentoStatus: compra.pagamento_status,
      pagamentoMetodo: compra.pagamento_metodo,
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json({ success: false, message: "Erro ao verificar status do pagamento" }, { status: 500 })
  }
}