"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Clock } from "lucide-react"
import { FiltrosEventos } from "@/components/filtros-eventos"
import { useSearchParams } from "next/navigation"

interface Evento {
  id: string
  titulo: string
  data: string
  local: string
  horario: string
  categoria: string
  imagem: string
  precoMinimo: number
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Função para carregar eventos com filtros
  const carregarEventos = async () => {
    try {
      setCarregando(true)
      setErro(null)

      // Construir URL com parâmetros de busca
      const params = new URLSearchParams(searchParams.toString())
      const url = `/api/eventos?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error("Erro ao carregar eventos")
      }

      const data = await res.json()
      setEventos(data.eventos || [])
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      setErro("Erro ao carregar eventos")
    } finally {
      setCarregando(false)
    }
  }

  // Carregar eventos quando os parâmetros mudarem
  useEffect(() => {
    carregarEventos()
  }, [searchParams])

  // Obter categoria atual para exibição
  const categoriaAtual = searchParams.get("categoria")
  const buscaAtual = searchParams.get("busca")

  const categorias = [
    { nome: "Todos", slug: "" },
    { nome: "Música", slug: "musica" },
    { nome: "Esportes", slug: "esportes" },
    { nome: "Teatro", slug: "teatro" },
    { nome: "Cinema", slug: "cinema" },
    { nome: "Arte", slug: "arte" },
    { nome: "Gastronomia", slug: "gastronomia" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Eventos</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar com filtros */}
        <div className="lg:w-1/4">
          <div className="sticky top-4">
            <FiltrosEventos />
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="lg:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {buscaAtual
                ? `Resultados para "${buscaAtual}"`
                : categoriaAtual
                  ? `Eventos de ${categorias.find((c) => c.slug === categoriaAtual)?.nome || categoriaAtual}`
                  : "Todos os eventos"}
            </h2>
            <div className="text-sm text-gray-500">
              {carregando ? "Carregando..." : `${eventos.length} eventos encontrados`}
            </div>
          </div>

          {/* Exibir erro se houver */}
          {erro && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{erro}</div>}

          {/* Lista de eventos ou estado vazio */}
          {carregando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
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
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        A partir de R$ {evento.precoMinimo.toFixed(2)}
                      </div>
                    </div>
                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{evento.titulo}</h3>
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
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="Nenhum evento encontrado"
                  width={100}
                  height={100}
                  className="mx-auto opacity-50"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500 mb-6">Tente ajustar os filtros ou buscar por outros termos.</p>
              <Link href="/eventos">
                <Button className="bg-primary text-secondary hover:bg-primary/90">Ver Todos os Eventos</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
