"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, Session } from "@supabase/auth-helpers-nextjs";

// Tipo de usuário personalizado
type Usuario = {
  id: string;
  nome: string; 
  email: string;
  tipo: "cliente" | "produtor";
} | null;

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

  useEffect(() => {
    const fetchUserProfile = async (userSession: Session) => {
      console.log("[CLIENTE - AuthProvider] Buscando perfil para o usuário:", userSession.user.id);
  
      const { data: profile } = await supabase
        .from("usuarios")
        .select("nome, tipo")
        .eq("id", userSession.user.id)
        .single();
      
      setUsuario({
        id: userSession.user.id,
        email: userSession.user.email!,
        nome: profile?.nome || '',
        tipo: profile?.tipo || 'cliente'
      });
      setCarregando(false);
    };
  
    if (session) {
      fetchUserProfile(session);
    } else {
      setCarregando(false);
    }
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (newSession) {
        } else {
          setUsuario(null);
        }
      }
    );
  
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, session]);

  const login = async (email: string, senha: string) => {
    console.log("2. [PROVIDER] Fazendo fetch para a API de login...");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    console.log("3. [PROVIDER] Fetch para API concluído. Status:", res.status);
    return res.json();
  };
  
  const register = async (userData: any) => {
    const res = await fetch("/api/register", { // Verifique se este é o caminho correto da sua API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    // Após o cadastro, o onAuthStateChange cuidará de logar o usuário se houver confirmação automática
    return res.json();
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // VALOR CORRIGIDO (sem a função verificarAutenticacao)
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}