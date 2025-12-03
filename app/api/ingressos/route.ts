import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { formatarData } from "@/lib/utils"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const { data: compras, error: comprasError } = await supabase
      .from("compras")
      .select("id, status") // Seleciona apenas o necessário
      .eq("usuario_id", session.user.id)
      .eq("status", "confirmado")

    if (comprasError) throw comprasError

    if (!compras || compras.length === 0) {
      return NextResponse.json({ success: true, ingressos: [] })
    }

    const compraIds = compras.map((compra) => compra.id)

    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        compra:compras(*),
        tipoIngresso:tipos_ingresso(
          *,
          evento:eventos(*)
        )
      `)
      .in("compra_id", compraIds)

    if (itensError) throw itensError

    const ingressos = itens.map((item) => ({
      id: item.id,
      evento: {
        id: item.tipoIngresso.evento.id,
        titulo: item.tipoIngresso.evento.titulo,
        data: formatarData(new Date(item.tipoIngresso.evento.data)),
        local: item.tipoIngresso.evento.local,
        horario: `${item.tipoIngresso.evento.hora_inicio} - ${item.tipoIngresso.evento.hora_fim}`,
        imagem: item.tipoIngresso.evento.imagem,
      },
      tipo: item.tipoIngresso.nome,
      quantidade: item.quantidade,
      codigo: item.codigo,
      status: item.compra.status,
    }))

    return NextResponse.json({ success: true, ingressos })
  } catch (error) {
    console.error("Erro ao buscar ingressos:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar ingressos" }, { status: 500 })
  }
}