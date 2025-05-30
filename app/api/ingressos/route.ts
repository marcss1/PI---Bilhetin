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

    // Buscar compras confirmadas
    const { data: compras, error: comprasError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", decoded.id)
      .eq("status", "confirmado")

    if (comprasError) {
      throw comprasError
    }

    if (!compras || compras.length === 0) {
      return NextResponse.json({ success: true, ingressos: [] })
    }

    // Buscar itens das compras
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

    if (itensError) {
      throw itensError
    }

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
