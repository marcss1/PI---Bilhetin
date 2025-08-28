// app/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";
// 1. IMPORTE O HOOK DE AUTENTICAÇÃO
import { useAuth } from "@/components/auth-provider";

interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string;
  horario: string;
  categoria: string;
  imagem: string;
}

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);

  // 2. PEGUE O ESTADO DO USUÁRIO E O CARREGAMENTO DA AUTENTICAÇÃO
  const { usuario: usuario, carregando: carregandoAuth } = useAuth()

  useEffect(() => {
    async function carregarEventos() {
      try {
        const res = await fetch("/api/eventos");
        if (res.ok) {
          const data = await res.json();
          setEventos(data.eventos || []);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setCarregandoEventos(false);
      }
    }

    carregarEventos();
  }, []);

  const categorias = [
    { nome: "Música", icone: "🎵", slug: "musica" },
    { nome: "Esportes", icone: "⚽", slug: "esportes" },
    { nome: "Teatro", icone: "🎭", slug: "teatro" },
    { nome: "Cinema", icone: "🎬", slug: "cinema" },
    { nome: "Arte", icone: "🎨", slug: "arte" },
    { nome: "Gastronomia", icone: "🍽️", slug: "gastronomia" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                Encontre os <span className="text-primary">melhores eventos</span> em um só lugar
              </h1>
              <p className="text-lg mb-8 text-primary">
                Compre ingressos para shows, festivais, teatro, esportes e muito mais. Tudo de forma rápida e segura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/eventos">
                  <Button className="bg-primary text-secondary hover:bg-primary/90 w-full sm:w-auto">
                    Ver Eventos
                  </Button>
                </Link>
                {!carregandoAuth && !usuario && (
                  <Link href="/cadastro">
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-secondary w-full sm:w-auto bg-transparent"
                    >
                      Criar Conta
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="/imagem_evento_inicio_teste.jpg?height=500&width=600"
                alt="Eventos"
                width={600}
                height={500}
                className="ml-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorias de Eventos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorias.map((categoria, index) => (
              <Link href={`/eventos?categoria=${categoria.slug}`} key={index}>
                <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-2">{categoria.icone}</div>
                  <h3 className="font-semibold">{categoria.nome}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos em Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Eventos em Destaque</h2>
            <Link href="/eventos">
              <Button variant="link" className="text-primary">
                Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {carregandoEventos ? (
            <div className="text-center py-12">
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventos.slice(0, 4).map((evento) => (
                <Link href={`/eventos/${evento.id}`} key={evento.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="relative h-48">
                      <Image
                        src={evento.imagem || "/placeholder.svg?height=400&width=600"}
                        alt={evento.titulo}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-secondary px-2 py-1 rounded text-xs font-medium">
                        {evento.categoria}
                      </div>
                    </div>
                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2">{evento.titulo}</h3>
                      <div className="space-y-2 text-sm text-gray-600 flex-1">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          {evento.data}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {evento.local}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {evento.horario}
                        </div>
                      </div>
                      <Button className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Comprar Ingresso
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seja um Produtor */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Seja um <span className="text-primary">Produtor de Eventos</span>
              </h2>
              <p className="mb-6 text-white">
                Crie e gerencie seus próprios eventos na plataforma Bilhetin. Alcance milhares de pessoas e venda seus
                ingressos de forma simples e segura.
              </p>
              <Link href="/cadastro?tipo=produtor">
                <Button className="bg-primary text-secondary hover:bg-primary/90">Cadastrar como Produtor</Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <Image
                src="/seja_produtor.jpg"
                alt="Produtor de Eventos"
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Fique por dentro dos melhores eventos</h2>
            <p className="mb-6">
              Assine nossa newsletter e receba em primeira mão informações sobre novos eventos e promoções exclusivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              />
              <Button className="bg-primary text-secondary hover:bg-primary/90">Assinar</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}