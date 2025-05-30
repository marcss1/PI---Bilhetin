import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

export async function GET() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ usuario: null }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string; email: string; tipo: string }

    // Verificar se o usuário ainda existe no Supabase
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", decoded.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ usuario: null }, { status: 401 })
    }

    return NextResponse.json({
      usuario: {
        id: decoded.id,
        nome: userData.nome,
        email: decoded.email,
        tipo: userData.tipo,
      },
    })
  } catch (error) {
    console.error("Erro na rota /api/auth/me:", error)
    return NextResponse.json({ usuario: null }, { status: 401 })
  }
}
