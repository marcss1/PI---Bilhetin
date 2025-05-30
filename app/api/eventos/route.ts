import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { formatarData } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")

    // Buscar eventos no Supabase
    let query = supabase
      .from("eventos")
      .select(`
        *,
        tiposIngresso:tipos_ingresso(*),
        organizador:usuarios!organizador_id(nome)
      `)
      .order("data", { ascending: true })

    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    const { data: eventos, error } = await query

    if (error) {
      throw error
    }

    const eventosFormatados = eventos.map((evento) => ({
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
    }))

    return NextResponse.json({ success: true, eventos: eventosFormatados })
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar eventos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      titulo,
      descricao,
      data,
      horaInicio,
      horaFim,
      local,
      endereco,
      cidade,
      estado,
      cep,
      categoria,
      imagem,
      informacoesAdicionais,
      tiposIngresso,
      organizadorId,
    } = body

    // Inserir evento no Supabase
    const { data: eventoData, error: eventoError } = await supabase
      .from("eventos")
      .insert([
        {
          titulo,
          descricao,
          data: new Date(data).toISOString(),
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          local,
          endereco,
          cidade,
          estado,
          cep,
          categoria,
          imagem,
          informacoes_adicionais: informacoesAdicionais,
          organizador_id: organizadorId,
        },
      ])
      .select()

    if (eventoError || !eventoData || eventoData.length === 0) {
      throw eventoError || new Error("Erro ao criar evento")
    }

    const eventoId = eventoData[0].id

    // Inserir tipos de ingresso
    const tiposIngressoFormatados = tiposIngresso.map((tipo: any) => ({
      nome: tipo.nome,
      preco: tipo.preco,
      quantidade: tipo.quantidade,
      evento_id: eventoId,
    }))

    const { error: tiposError } = await supabase.from("tipos_ingresso").insert(tiposIngressoFormatados)

    if (tiposError) {
      throw tiposError
    }

    return NextResponse.json({ success: true, evento: eventoData[0] })
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar evento" }, { status: 500 })
  }
}
