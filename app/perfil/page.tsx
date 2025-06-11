// src/app/perfil/page.tsx

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Clock, Download, User, CreditCard, Ticket, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
// 1. IMPORTE O 'useRouter' PARA FAZER O REDIRECIONAMENTO
import { useSearchParams, useRouter } from "next/navigation";
import { AlertMessage } from "@/components/alert-message";
import { logout } from "@/lib/actions";

interface Ingresso {
  id: string;
  evento: {
    id: string;
    titulo: string;
    data: string;
    local: string;
    horario: string;
    imagem: string;
  };
  tipo: string;
  quantidade: number;
  codigo: string;
  status: string;
}

export default function PerfilPage() {
  // 2. PEGUE TAMBÉM O 'carregando' DO useAuth
  const { usuario, carregando } = useAuth();
  const router = useRouter(); // Instancie o router
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "perfil");
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [carregandoIngressos, setCarregandoIngressos] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // 3. ADICIONE ESTE useEffect PARA PROTEGER A ROTA E REDIRECIONAR
  useEffect(() => {
    // Se o carregamento da autenticação terminou E não há um usuário...
    if (!carregando && !usuario) {
      // ...redireciona para o login.
      router.push("/login?redirect=/perfil");
    }
  }, [usuario, carregando, router]);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setEmail(usuario.email);
      setTelefone(usuario.telefone || "");
    }
  }, [usuario]);

  useEffect(() => {
    async function carregarIngressos() {
      // ... sua função carregarIngressos (está correta) ...
    }

    if (activeTab === "ingressos") {
      carregarIngressos();
    }
  }, [activeTab]);

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Perfil atualizado com sucesso!");
  };

  const cartoes = [
    // ... seus dados de cartões ...
  ];

  // 4. ADICIONE ESTES BLOCOS DE VERIFICAÇÃO ANTES DE RENDERIZAR O CONTEÚDO
  // Enquanto o AuthProvider está validando a sessão, mostramos "Carregando...".
  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  // Se o carregamento terminou e não há usuário, o useEffect acima já está
  // trabalhando no redirecionamento. Retornamos null para não mostrar nada.
  if (!usuario) {
    return null;
  }

  // Se o carregamento terminou e o usuário existe, renderizamos a página completa.
  return (
    <div className="container mx-auto px-4 py-8">
      {/* O RESTO DO SEU CÓDIGO JSX CONTINUA AQUI, SEM ALTERAÇÕES */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* ... Coluna da Esquerda (Navegação do Perfil) ... */}
        {/* ... Coluna da Direita (Conteúdo das Abas) ... */}
      </div>
    </div>
  );
}