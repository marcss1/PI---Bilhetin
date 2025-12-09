// ARQUIVO: app/cadastro/page.tsx (CPF + TELEFONE obrigatórios, validados e com MÁSCARA)

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

// ---------------------------
// Função para validar CPF
// ---------------------------
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf[i - 1]) * (11 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf[i - 1]) * (12 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

// ---------------------------
// Máscara de CPF
// ---------------------------
function maskCPF(v: string) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

// ---------------------------
// Máscara de Telefone
// ---------------------------
function maskTelefone(v: string) {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  return v;
}

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

    // Aplicar máscaras
    if (name === "cpf") {
      return setFormData((prev) => ({ ...prev, cpf: maskCPF(value) }));
    }

    if (name === "telefone") {
      return setFormData((prev) => ({ ...prev, telefone: maskTelefone(value) }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value as "cliente" | "produtor" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    // -------------------
    // Validação campos obrigatórios
    // -------------------

    if (!formData.telefone.trim()) {
      setErro("O telefone é obrigatório.");
      setCarregando(false);
      return;
    }

    if (!formData.cpf.trim()) {
      setErro("O CPF é obrigatório.");
      setCarregando(false);
      return;
    }

    if (!validarCPF(formData.cpf)) {
      setErro("CPF inválido. Verifique e tente novamente.");
      setCarregando(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem");
      setCarregando(false);
      return;
    }

    try {
      const resultado = await register(formData);

      if (resultado.success) {
        alert(resultado.message);
        router.push("/login");
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
              
              {erro && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {erro}
                </div>
              )}

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
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <RadioGroup value={formData.tipo} onValueChange={handleTipoChange} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cliente" id="cliente" />
                    <Label htmlFor="cliente" className="font-normal">Cliente (comprar ingressos)</Label>
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
