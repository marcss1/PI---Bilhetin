// ARQUIVO: app/cadastro/page.tsx (ATUALIZADO SEM UPLOAD DE FOTO)

"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/auth-provider";

export default function CadastroPage() {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cpf: "",
    tipo: "cliente",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value as "cliente" | "produtor" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem");
      setCarregando(false);
      return;
    }

    try {
      // O 'fotoPerfil' foi removido daqui, pois não há mais upload no cadastro
      const resultado = await register(formData);

      if (resultado.success) {
        // Você pode redirecionar para uma página de "Verifique seu e-mail"
        alert(resultado.message); // Alerta temporário
        router.push("/login"); // Redireciona para o login
      } else {
        setErro(resultado.message || "Erro ao cadastrar");
      }
    } catch (error) {
      setErro("Erro ao cadastrar");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
            <CardDescription>Preencha os campos abaixo para se cadastrar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{erro}</div>}

              {/* Seção de upload de foto foi REMOVIDA */}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input id="confirmarSenha" name="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <RadioGroup value={formData.tipo} onValueChange={handleTipoChange} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cliente" id="cliente" />
                    <Label htmlFor="cliente" className="font-normal">Cliente (comprar ingressos)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="produtor" id="produtor" />
                    <Label htmlFor="produtor" className="font-normal">Produtor de Eventos (vender ingressos)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}