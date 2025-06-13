// /pages/api/auth/me.js (ou /app/api/auth/me/route.js em App Router)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Se não houver sessão, o usuário não está logado.
    if (!session) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    // Com a sessão confirmada, buscamos os dados adicionais na sua tabela 'usuarios'
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("nome, tipo") // Selecione apenas os campos que precisa
      .eq("id", session.user.id)
      .single(); // .single() é ótimo, pois garante um único resultado

    // Se houver um erro na query do banco de dados
    if (userError) {
      console.error("Erro ao buscar dados do perfil no Supabase:", userError);
      return NextResponse.json({ error: "Erro interno ao buscar dados do perfil." }, { status: 500 });
    }

    // Monta o objeto final do usuário para o frontend
    const usuarioCompleto = {
      id: session.user.id,
      email: session.user.email,
      nome: userData.nome, // Dado da sua tabela 'usuarios'
      tipo: userData.tipo, // Dado da sua tabela 'usuarios'
    };

    return NextResponse.json({ usuario: usuarioCompleto });

  } catch (error) {
    console.error("Erro inesperado na rota /api/auth/me:", error);
    return NextResponse.json({ error: "Ocorreu um erro inesperado." }, { status: 500 });
  }
}