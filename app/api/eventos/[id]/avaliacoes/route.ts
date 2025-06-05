import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

// Schema de validação para avaliações
const avaliacaoSchema = z.object({
  nota: z.number().min(1, "Nota deve ser entre 1 e 5").max(5, "Nota deve ser entre 1 e 5"),
  comentario: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres"),
})

// GET - Buscar avaliações de um evento
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: avaliacoes, error } = await supabase
      .from("avaliacoes")
      .select(`
        *,
        usuario:usuarios(nome)
      `)
      .eq("evento_id", params.id)
      .order("criado_em", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, avaliacoes })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar avaliações" }, { status: 500 })
  }
}

// POST - Criar nova avaliação
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const body = await request.json()

    // Validar dados
    const result = avaliacaoSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.errors[0].message }, { status: 400 })
    }

    const { nota, comentario } = result.data

    // Verificar se o usuário já avaliou este evento
    const { data: avaliacaoExistente, error: checkError } = await supabase
      .from("avaliacoes")
      .select("id")
      .eq("evento_id", params.id)
      .eq("usuario_id", decoded.id)
      .single()

    if (avaliacaoExistente) {
      return NextResponse.json({ success: false, message: "Você já avaliou este evento" }, { status: 400 })
    }

    // Verificar se o evento existe
    const { data: evento, error: eventoError } = await supabase
      .from("eventos")
      .select("id")
      .eq("id", params.id)
      .single()

    if (eventoError || !evento) {
      return NextResponse.json({ success: false, message: "Evento não encontrado" }, { status: 404 })
    }

    // Criar avaliação
    const { data: novaAvaliacao, error: avaliacaoError } = await supabase
      .from("avaliacoes")
      .insert([
        {
          evento_id: params.id,
          usuario_id: decoded.id,
          nota,
          comentario,
        },
      ])
      .select()

    if (avaliacaoError) {
      throw avaliacaoError
    }

    return NextResponse.json({ success: true, avaliacao: novaAvaliacao[0] })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar avaliação" }, { status: 500 })
  }
}
