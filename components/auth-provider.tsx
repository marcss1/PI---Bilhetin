// src/components/auth-provider.tsx

"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

// Tipo de usuário personalizado, agora com avatar_url
type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: "cliente" | "produtor";
  telefone?: string
  cpf?: string
  avatar_url: string | null; // O tipo já estava correto aqui
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
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async (userSession: Session) => {
      // --- INÍCIO DA CORREÇÃO ---
      // A consulta agora inclui 'avatar_url' para buscar a foto do perfil
      const { data: profile, error } = await supabase
        .from("usuarios")
        .select("nome, tipo, telefone, cpf, avatar_url") // <-- CORREÇÃO APLICADA AQUI
        .eq("id", userSession.user.id)
        .single();
      // --- FIM DA CORREÇÃO ---

      if (error) {
        console.error("Erro ao buscar perfil:", error);
      }

      setUsuario({
        id: userSession.user.id,
        email: userSession.user.email!,
        nome: profile?.nome || "",
        tipo: profile?.tipo || "cliente",
        telefone: profile?.telefone,
        cpf: profile?.cpf,
        avatar_url: profile?.avatar_url || null // Agora isso funciona sem erros de tipo
      });
      setCarregando(false);
    };

    if (session) {
      fetchUserProfile(session);
    } else {
      setCarregando(false);
    }

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

  const login = async (email: string, senha: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const resultado = await res.json();

    if (resultado.success) {
      router.refresh();
    }

    return resultado;
  };

  // DENTRO DO SEU ARQUIVO: auth-provider.tsx

  // DENTRO DE auth-provider.tsx

  const register = async (userData: any) => {
    // A lógica de upload é removida daqui, pois o trigger cuidará de tudo
    // após a confirmação do e-mail.
  
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.senha,
      options: {
        data: {
          nome: userData.nome,
          tipo: userData.tipo,
          // Nós NÃO passamos a foto aqui, pois ela ainda não foi enviada.
          // O usuário poderá adicionar a foto em seu perfil depois de logado.
        },
        // Informa ao Supabase para onde redirecionar o usuário APÓS clicar no link do e-mail.
        emailRedirectTo: `${window.location.origin}/perfil`, 
      }
    });
  
    if (error) {
      return { success: false, message: error.message };
    }
  
    // Se o signUp for bem-sucedido com a confirmação de e-mail ativa,
    // não tentamos fazer mais nada, apenas informamos o usuário.
    return { 
      success: true, 
      message: "Cadastro realizado! Verifique seu e-mail para ativar sua conta." 
    };
  };


  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const value = {
    usuario,
    carregando,
    login,
    register,
    logout,
  };

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