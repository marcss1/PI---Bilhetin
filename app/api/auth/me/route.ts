// /app/api/auth/me/route.ts - CÓDIGO COM LOGS PARA DEPURAÇÃO

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

    if (!session) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    // Lembre-se de trocar 'avatar_path' pelo nome real da sua coluna se for diferente.
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("nome, tipo, avatar_path") // Verifique se 'avatar_path' é o nome correto da coluna
      .eq("id", session.user.id)
      .single();

    // <-- LOG 1 AQUI
    console.log("LOG 1 - DADOS BRUTOS DO BANCO:", userData);

    if (userError) {
      console.error("Erro ao buscar dados do perfil no Supabase:", userError);
      return NextResponse.json({ error: "Erro interno ao buscar dados do perfil." }, { status: 500 });
    }

    let publicAvatarUrl = null;

    if (userData && userData.avatar_path) {
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(userData.avatar_path);

      publicAvatarUrl = data.publicUrl;
      
      // <-- LOG 2 AQUI
      console.log("LOG 2 - URL PÚBLICA GERADA:", publicAvatarUrl);
    }

    const usuarioCompleto = {
      id: session.user.id,
      email: session.user.email,
      nome: userData.nome,
      tipo: userData.tipo,
      avatar_url: publicAvatarUrl,
    };

    // <-- LOG 3 AQUI
    console.log("LOG 3 - OBJETO FINAL ENVIADO PARA O FRONTEND:", usuarioCompleto);

    return NextResponse.json({ usuario: usuarioCompleto });

  } catch (error) {
    console.error("Erro inesperado na rota /api/auth/me:", error);
    return NextResponse.json({ error: "Ocorreu um erro inesperado." }, { status: 500 });
  }
}