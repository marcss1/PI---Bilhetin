// app/login/page.tsx

"use client";

// 1. IMPORTE 'useState' E 'useEffect' DO REACT
import { useState, useEffect } from "react";
import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();

  // 2. PEGUE ESTES VALORES DO SEU 'useAuth'
  const { login, usuario, carregando: authLoading } = useAuth();

  // 3. ESTE É O useEffect CORRETO E COMPLETO
  useEffect(() => {
    // A condição é: "Se o carregamento inicial do provedor terminou E o usuário existe..."
    if (!authLoading && usuario) {
      // "...então podemos redirecionar com segurança."
      router.push(redirect);
    }
  }, [usuario, authLoading, redirect, router]);

  // 4. A FUNÇÃO handleSubmit MODIFICADA (SEM O REDIRECIONAMENTO)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      // Apenas chama a função de login. O useEffect acima cuidará do redirecionamento.
      const resultado = await login(email, senha);

      // Se o resultado da API indicar uma falha, nós mostramos o erro.
      if (!resultado.success) {
        setErro(resultado.message || "E-mail ou senha inválidos.");
      }
      // NÃO há redirecionamento aqui.
    } catch (error) {
      setErro("Ocorreu um erro inesperado. Tente novamente.");
      console.error("Erro no handleSubmit do login:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Se o usuário já está logado ou carregando, mostramos uma tela de espera
  if (authLoading || usuario) {
    return <div>Carregando...</div>;
  }

  // O resto do seu JSX (formulário) continua aqui.
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="hidden md:flex flex-col justify-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Bem-vindo de volta!</h1>
            <p className="text-gray-600">
              Acesse sua conta para comprar ingressos, gerenciar seus eventos e muito mais.
            </p>
            <div className="relative h-[300px] w-full">
              <Image src="/foto_equipe.png?height=600&width=600" alt="Login" fill className="object-cover rounded-lg" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>Digite seu e-mail e senha para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{erro}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <Link href="/recuperar-senha" className="text-sm text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-secondary hover:bg-primary/90"
                disabled={carregando}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
            {/* ... o resto do seu JSX continua aqui ... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}