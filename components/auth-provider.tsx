// ARQUIVO: src/components/auth-provider.tsx (VERSÃO FINAL E CORRIGIDA)

"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

// Tipo para os dados do perfil que podem ser atualizados
type ProfileData = {
  nome: string;
  telefone?: string;
};

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: "cliente" | "produtor";
  telefone?: string;
  cpf?: string;
  avatar_url: string | null;
} | null;

// Tipo do Contexto de Autenticação com todas as funções
type AuthContextType = {
  usuario: Usuario;
  login: (email: string, senha: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateAvatar: (file: File) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: ProfileData) => Promise<{ success: boolean; message?: string }>;
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

  const fetchUserProfile = async (user: User) => {
    const { data: profile, error } = await supabase
      .from("usuarios")
      .select("nome, tipo, telefone, cpf, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      setCarregando(false);
      return;
    }

    let publicAvatarUrl: string | null = null;
    if (profile && profile.avatar_url) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
      publicAvatarUrl = urlData.publicUrl;
    }

    setUsuario({
      id: user.id,
      email: user.email!,
      nome: profile?.nome || "",
      tipo: profile?.tipo || "cliente",
      telefone: profile?.telefone,
      cpf: profile?.cpf,
      avatar_url: publicAvatarUrl,
    });
    setCarregando(false);
  };

  useEffect(() => {
    if (session) {
      fetchUserProfile(session.user);
    } else {
      setCarregando(false);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        fetchUserProfile(newSession.user);
      } else {
        setUsuario(null);
        setCarregando(false);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    // Chama o Supabase diretamente no cliente
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      // Retorna uma mensagem de erro compatível
      return { success: false, message: error.message };
    }

    // Sucesso! Não precisa de router.refresh() aqui.
    // O listener onAuthStateChange vai cuidar da atualização da UI.
    return { success: true };
  };
  
  const register = async (userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
        options: {
          data: {
            nome: userData.nome,
            tipo: userData.tipo,
            telefone: userData.telefone,
            cpf: userData.cpf,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Cadastro realizado! Verifique seu e-mail para ativar sua conta." };
    } catch (error) {
      return { success: false, message: "Ocorreu um erro inesperado." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // FUNÇÃO 'updateAvatar' REINSERIDA
  const updateAvatar = async (file: File) => {
    if (!usuario) return { success: false, message: "Usuário não autenticado." };
    try {
      const filePath = `${usuario.id}/avatar-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase.from("usuarios").update({ avatar_url: filePath }).eq("id", usuario.id);
      if (updateError) throw updateError;

      const { data: { session } } = await supabase.auth.getSession();
      if(session) await fetchUserProfile(session.user);
      
      return { success: true, message: "Foto de perfil atualizada com sucesso!" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  
  // FUNÇÃO 'updateProfile'
  const updateProfile = async (data: ProfileData) => {
    if (!usuario) return { success: false, message: "Usuário não autenticado." };
    try {
      const { error } = await supabase.from("usuarios").update({ nome: data.nome, telefone: data.telefone }).eq("id", usuario.id);
      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if(session) await fetchUserProfile(session.user);

      return { success: true, message: "Perfil atualizado com sucesso!" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // O objeto 'value' agora contém todas as funções declaradas no tipo
  const value = {
    usuario,
    carregando,
    login,
    register,
    logout,
    updateAvatar,
    updateProfile,
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