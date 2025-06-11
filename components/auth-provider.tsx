// src/components/auth-provider.tsx

"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
// 1. IMPORTAR O ROUTER
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

// Tipo de usuário personalizado
type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: "cliente" | "produtor";
  telefone?: string
  cpf?: string
} | null;

// Tipo do Contexto de Autenticação
type AuthContextType = {
  usuario: Usuario;
  login: (email: string, senha: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  carregando: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const supabase: SupabaseClient = createClientComponentClient();
  const [usuario, setUsuario] = useState<Usuario>(null);
  const [carregando, setCarregando] = useState(true);
  // 2. CRIAR A INSTÂNCIA DO ROUTER
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async (userSession: Session) => {
      // Busca o perfil na sua tabela 'usuarios'
      const { data: profile } = await supabase
        .from("usuarios")
        .select("nome, tipo, telefone, cpf")
        .eq("id", userSession.user.id)
        .single();

      setUsuario({
        id: userSession.user.id,
        email: userSession.user.email!,
        nome: profile?.nome || "",
        tipo: profile?.tipo || "cliente",
        telefone: profile?.telefone,
        cpf: profile?.cpf
      });
      setCarregando(false);
    };

    // Se a sessão já existe no carregamento inicial, busca o perfil
    if (session) {
      fetchUserProfile(session);
    } else {
      setCarregando(false);
    }

    // Listener que reage a mudanças de login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        fetchUserProfile(newSession);
      } else {
        setUsuario(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, session]);

  // 3. MODIFICAR A FUNÇÃO LOGIN
  const login = async (email: string, senha: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const resultado = await res.json();

    // Se o login na API foi bem-sucedido...
    if (resultado.success) {
      // ...forçamos o Next.js a atualizar os dados da página.
      // Isso fará o RootLayout rodar novamente no servidor,
      // pegar a nova sessão e redesenhar a UI corretamente.
      router.refresh();
    }

    return resultado;
  };

  const register = async (userData: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Força a atualização após o logout também
    router.refresh();
  };

  const value = {
    usuario,
    carregando,
    login,
    register,
    logout,
  };

  // Renderiza os filhos apenas quando o carregamento inicial termina
  return (
    <AuthContext.Provider value={value}>
      {!carregando && children}
    </AuthContext.Provider>
  );
}

// Hook para consumir o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}