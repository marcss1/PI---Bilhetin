import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.errors[0].message }, { status: 400 });
    }

    const { email, senha } = result.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return NextResponse.json({ success: false, message: "Email ou senha inválidos" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json({ success: false, message: "Erro no servidor" }, { status: 500 });
  }
}