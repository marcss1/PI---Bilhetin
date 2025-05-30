import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

// Schema de validação
const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  tipo: z.enum(["cliente", "produtor"]),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validação com Zod
    const result = usuarioSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.errors[0].message }, { status: 400 })
    }

    const { nome, email, senha, confirmarSenha, tipo, telefone, cpf } = result.data

    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
      return NextResponse.json({ success: false, message: "As senhas não coincidem" }, { status: 400 })
    }

    // Registrar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, message: "Erro ao criar usuário" }, { status: 500 })
    }

    // Inserir dados adicionais do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: authData.user.id,
          nome,
          email,
          tipo,
          telefone,
          cpf,
        },
      ])
      .select()

    if (userError) {
      // Tentar limpar o usuário criado no Auth se houver erro
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ success: false, message: userError.message }, { status: 500 })
    }

    // Criar token JWT personalizado
    const token = sign(
      {
        id: authData.user.id,
        email: authData.user.email,
        tipo,
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
        nome,
        email,
        tipo,
      },
    })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar usuário" }, { status: 500 })
  }
}
