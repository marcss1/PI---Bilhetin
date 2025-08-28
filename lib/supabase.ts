import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Esta função é para uso em SERVER COMPONENTS e SERVER ACTIONS.
 * Ela cria um cliente Supabase que lê a sessão do usuário a partir dos cookies.
 * É a forma segura e recomendada de interagir com o Supabase no servidor.
 */
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  // Esta função oficial do Supabase cuida de toda a complexidade de ler os cookies.
  return createServerComponentClient({ cookies: () => cookieStore });
};

/**
 * Este cliente é para uso exclusivo no NAVEGADOR (componentes "use client").
 * Ele usa a chave anônima pública e respeita as Políticas de Segurança (RLS).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
