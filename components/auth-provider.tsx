"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

type Usuario = {
  id: string
  nome: string
  email: string
  tipo: "cliente" | "produtor"
} | null

type AuthContextType = {
  usuario: Usuario
  carregando: boolean
  verificarAutenticacao: () => Promise<void>
  login: (email: string, senha: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: any) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  carregando: true,
  verificarAutenticacao: async () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const verificarAutenticacao = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUsuario(data.usuario)
      } else {
        setUsuario(null)
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      setUsuario(null)
    } finally {
      setCarregando(false)
    }
  }

  const login = async (email: string, senha: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      })

      const data = await res.json()

      if (data.success) {
        setUsuario(data.user)
        await verificarAutenticacao()
        return { success: true }
      }

      return { success: false, message: data.message || "Erro ao fazer login" }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { success: false, message: "Erro ao fazer login" }
    }
  }

  const register = async (userData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (data.success) {
        setUsuario(data.user)
        await verificarAutenticacao()
        return { success: true }
      }

      return { success: false, message: data.message || "Erro ao cadastrar" }
    } catch (error) {
      console.error("Erro ao cadastrar:", error)
      return { success: false, message: "Erro ao cadastrar" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUsuario(null)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  useEffect(() => {
    verificarAutenticacao()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ usuario, carregando, verificarAutenticacao, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!carregando && !usuario) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [usuario, carregando, router, pathname])

  if (carregando) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (!usuario) {
    return null
  }

  return <>{children}</>
}

export function ProducerRoute({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!carregando && (!usuario || usuario.tipo !== "produtor")) {
      router.push("/")
    }
  }, [usuario, carregando, router])

  if (carregando) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (!usuario || usuario.tipo !== "produtor") {
    return null
  }

  return <>{children}</>
}
