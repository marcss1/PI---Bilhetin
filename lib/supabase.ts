import { createClient } from "@supabase/supabase-js"

// Criação de clientes Supabase separados para uso no servidor e no cliente
// O cliente do servidor tem permissões completas usando a chave de serviço
export const createServerSupabaseClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Cliente para uso no navegador (lado do cliente)
// Usa a chave anônima que tem permissões limitadas definidas pelas políticas RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Singleton pattern para evitar múltiplas instâncias no cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
