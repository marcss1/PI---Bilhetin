import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

// Schema de validação
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validação com Zod
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.errors[0].message }, { status: 400 })
    }

    const { email, senha } = result.data

    // Autenticar com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ success: false, message: "Email ou senha incorretos" }, { status: 400 })
    }

    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      return NextResponse.json({ success: false, message: "Erro ao buscar dados do usuário" }, { status: 500 })
    }

    // Criar token JWT personalizado
    const token = sign(
      {
        id: authData.user.id,
        email: authData.user.email,
        tipo: userData.tipo,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Salvar token em cookie
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        nome: userData.nome,
        email: authData.user.email,
        tipo: userData.tipo,
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json({ success: false, message: "Erro ao fazer login" }, { status: 500 })
  }
}
