import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { formatarData } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Buscar evento no Supabase
    const { data: evento, error } = await supabase
      .from("eventos")
      .select(`
        *,
        tiposIngresso:tipos_ingresso(*),
        organizador:usuarios!organizador_id(nome)
      `)
      .eq("id", params.id)
      .single()

    if (error || !evento) {
      return NextResponse.json({ success: false, message: "Evento não encontrado" }, { status: 404 })
    }

    const eventoFormatado = {
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: formatarData(new Date(evento.data)),
      horario: `${evento.hora_inicio} - ${evento.hora_fim}`,
      local: evento.local,
      endereco: evento.endereco,
      cidade: evento.cidade,
      estado: evento.estado,
      categoria: evento.categoria,
      imagem: evento.imagem,
      organizador: evento.organizador?.nome || "Organizador",
      preco: {
        inteira: evento.tiposIngresso.find((tipo: any) => tipo.nome === "Inteira")?.preco || 0,
        meia: evento.tiposIngresso.find((tipo: any) => tipo.nome === "Meia-entrada")?.preco || 0,
        vip: evento.tiposIngresso.find((tipo: any) => tipo.nome === "VIP")?.preco || 0,
      },
      ingressosDisponiveis: evento.tiposIngresso.reduce((total: number, tipo: any) => total + tipo.quantidade, 0),
      informacoesAdicionais: evento.informacoes_adicionais
        ? evento.informacoes_adicionais.split("\n")
        : ["Proibida a entrada de bebidas e alimentos", "Permitida a entrada de água em garrafas transparentes"],
      tiposIngresso: evento.tiposIngresso.map((tipo: any) => ({
        id: tipo.id,
        nome: tipo.nome,
        preco: tipo.preco,
        quantidade: tipo.quantidade,
      })),
    }

    return NextResponse.json({ success: true, evento: eventoFormatado })
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar evento" }, { status: 500 })
  }
}
