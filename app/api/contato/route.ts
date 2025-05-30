import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

const mensagemSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validação com Zod
    const result = mensagemSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.errors[0].message }, { status: 400 })
    }

    const { nome, email, assunto, mensagem } = result.data

    // Verificar se o usuário está autenticado
    let usuarioId = null
    const token = cookies().get("auth_token")?.value

    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as { id: string }
        usuarioId = decoded.id
      } catch (error) {
        // Ignorar erro de token inválido
      }
    }

    // Criar mensagem
    const { error } = await supabase.from("mensagens").insert([
      {
        nome,
        email,
        assunto,
        mensagem,
        usuario_id: usuarioId,
        respondida: false,
      },
    ])

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ success: false, message: "Erro ao enviar mensagem" }, { status: 500 })
  }
}
