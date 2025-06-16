// src/app/perfil/page.tsx

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Componentes da UI (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertMessage } from "@/components/alert-message";

// Ícones
import { CalendarDays, MapPin, Clock, Download, User, CreditCard, Ticket, Settings, LogOut, Loader2 } from "lucide-react";

// Autenticação e Ações
import { useAuth } from "@/components/auth-provider";
import { logout } from "@/lib/actions";

// Definição da interface para os ingressos
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
  // --- Hooks e Estado Principal ---
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado para controle da aba ativa
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "perfil");

  // Estado para o formulário de perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Estado para os ingressos
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [carregandoIngressos, setCarregandoIngressos] = useState(false);
  const [erroIngressos, setErroIngressos] = useState<string | null>(null);

  // --- Efeitos (useEffect) ---

  // Efeito para proteger a rota contra acesso não autenticado
  useEffect(() => {
    // Se o carregamento inicial da autenticação terminou e não há usuário...
    if (!carregandoAuth && !usuario) {
      // ...redireciona para a página de login, guardando a página atual para voltar depois
      router.push("/login?redirect=/perfil");
    }
  }, [usuario, carregandoAuth, router]);

  // Efeito para preencher o formulário quando os dados do usuário estiverem disponíveis
  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      // Adicionei um campo 'telefone' ao seu hook 'useAuth' como exemplo
      setTelefone(usuario.telefone || "");
    }
  }, [usuario]);

  // Efeito para carregar os ingressos quando a aba "ingressos" for selecionada
  useEffect(() => {
    async function carregarIngressos() {
      if (!usuario) return; // Não faz nada se o usuário não estiver carregado

      setCarregandoIngressos(true);
      setErroIngressos(null);
      try {
        // Simulação de chamada à API para buscar os ingressos do usuário
        // Substitua pela sua chamada real, por exemplo: const response = await fetch(`/api/usuarios/${usuario.id}/ingressos`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da rede

        // Dados de exemplo
        const dadosMock: Ingresso[] = [
          { id: '1', evento: { id: 'evt1', titulo: 'Show de Rock', data: '2025-08-15', local: 'Estádio Nacional', horario: '20:00', imagem: '/placeholder-image.jpg' }, tipo: 'Pista Premium', quantidade: 2, codigo: 'XYZ123', status: 'Válido' },
          { id: '2', evento: { id: 'evt2', titulo: 'Festival de Jazz', data: '2025-09-20', local: 'Concha Acústica', horario: '18:00', imagem: '/placeholder-image.jpg' }, tipo: 'Camarote', quantidade: 1, codigo: 'ABC987', status: 'Utilizado' }
        ];

        setIngressos(dadosMock);
      } catch (error) {
        console.error("Erro ao buscar ingressos:", error);
        setErroIngressos("Não foi possível carregar seus ingressos. Tente novamente mais tarde.");
      } finally {
        setCarregandoIngressos(false);
      }
    }

    if (activeTab === "ingressos") {
      carregarIngressos();
    }
  }, [activeTab, usuario]);

  // --- Funções de Manipulação de Eventos ---

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoPerfil(true);
    // Simulação de chamada à API para salvar os dados
    console.log("Salvando dados:", { nome, email, telefone });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSalvandoPerfil(false);
    // Idealmente, você atualizaria o estado global do usuário aqui
    alert("Perfil atualizado com sucesso!");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/"); // Redireciona para a home após o logout
  };

  // --- Renderização Condicional ---

  // 1. Mostra um loader em tela cheia enquanto o `useAuth` verifica a sessão
  if (carregandoAuth) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Carregando...
      </div>
    );
  }

  // 2. Se o carregamento terminou e não há usuário, o `useEffect` já está redirecionando.
  // Retornar `null` evita qualquer "flash" de conteúdo na tela.
  if (!usuario) {
    return null;
  }

  // 3. Se o usuário existe, renderiza a página completa.
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Coluna da Esquerda: Navegação do Perfil */}
        <aside className="w-full md:w-1/4">
          <Card>
            <CardHeader className="items-center text-center">
              <Image
                src={usuario.avatar_url || "/avatar-placeholder.png"} // Usa a foto do usuário OU o placeholder
                alt={`Foto de ${usuario.nome}`}
                width={80}
                height={80}
                className="rounded-full mb-4 object-cover" // object-cover para evitar distorção
              />
              <CardTitle>{usuario.nome}</CardTitle>
              {/* ... */}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant={activeTab === 'perfil' ? 'default' : 'ghost'} onClick={() => setActiveTab('perfil')} className="justify-start gap-2">
                <User size={16} /> Perfil
              </Button>
              <Button variant={activeTab === 'cartoes' ? 'default' : 'ghost'} onClick={() => setActiveTab('cartoes')} className="justify-start gap-2">
                <CreditCard size={16} /> Cartões
              </Button>
              <Button variant={activeTab === 'ingressos' ? 'default' : 'ghost'} onClick={() => setActiveTab('ingressos')} className="justify-start gap-2">
                <Ticket size={16} /> Meus Ingressos
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2 text-red-500 hover:text-red-600">
                <LogOut size={16} /> Sair
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Coluna da Direita: Conteúdo das Abas */}
        <main className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* As Triggers são controladas pelos botões na coluna da esquerda, então não precisamos renderizar a TabsList */}
            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Perfil</CardTitle>
                  <CardDescription>Atualize suas informações pessoais aqui.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSalvarPerfil} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(99) 99999-9999" />
                    </div>
                    <Button type="submit" disabled={salvandoPerfil}>
                      {salvandoPerfil && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cartoes">
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>Gerencie seus cartões salvos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funcionalidade de gerenciamento de cartões em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingressos">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Ingressos</CardTitle>
                  <CardDescription>Aqui estão todos os ingressos que você comprou.</CardDescription>
                </CardHeader>
                <CardContent>
                  {carregandoIngressos ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando ingressos...
                    </div>
                  ) : erroIngressos ? (
                    <AlertMessage type="error" message={erroIngressos} />
                  ) : ingressos.length > 0 ? (
                    <div className="space-y-4">
                      {ingressos.map(ing => (
                        <Card key={ing.id} className="flex flex-col sm:flex-row">
                          <Image src={ing.evento.imagem} alt={`Imagem do evento ${ing.evento.titulo}`} width={150} height={150} className="object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
                          <div className="p-4 flex flex-col justify-between flex-grow">
                            <div>
                              <h3 className="text-lg font-bold">{ing.evento.titulo}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays size={14} /> {new Date(ing.evento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin size={14} /> {ing.evento.local}</p>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button><Download size={16} className="mr-2" /> Baixar Ingresso</Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground p-8">Você ainda não comprou nenhum ingresso.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}