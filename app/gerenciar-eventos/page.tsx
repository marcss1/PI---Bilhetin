"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users, DollarSign, Edit, Trash2, Plus, Eye, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface Evento {
  id: string
  titulo: string
  descricao: string
  data: string
  hora_inicio: string
  hora_fim: string
  local: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  categoria: string
  imagem: string
  organizador_id: string
  criado_em: string
  atualizado_em: string
}

interface EventoStats {
  total_ingressos: number
  ingressos_vendidos: number
  receita_total: number
}

export default function GerenciarEventos() {
  const { usuario, carregando } = useAuth()
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [stats, setStats] = useState<{ [key: string]: EventoStats }>({})
  const [carregandoEventos, setCarregandoEventos] = useState(true)

  // Redirect if not a producer
  useEffect(() => {
    if (!carregando && (!usuario || usuario.tipo !== "produtor")) {
      router.push("/")
    }
  }, [usuario, carregando, router])

  useEffect(() => {
    if (usuario && usuario.tipo === "produtor") {
      carregarEventos()
    }
  }, [usuario])

  const carregarEventos = async () => {
    try {
      const res = await fetch(`/api/eventos/produtor/${usuario?.id}`)
      if (res.ok) {
        const data = await res.json()
        setEventos(data.eventos || [])

        // Load stats for each event
        const statsPromises = data.eventos.map(async (evento: Evento) => {
          const statsRes = await fetch(`/api/eventos/${evento.id}/stats`)
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            return { [evento.id]: statsData }
          }
          return { [evento.id]: { total_ingressos: 0, ingressos_vendidos: 0, receita_total: 0 } }
        })

        const statsResults = await Promise.all(statsPromises)
        const statsObject = statsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        setStats(statsObject)
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
    } finally {
      setCarregandoEventos(false)
    }
  }

  const excluirEvento = async (eventoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const res = await fetch(`/api/eventos/${eventoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setEventos(eventos.filter((evento) => evento.id !== eventoId))
        alert("Evento excluído com sucesso!")
      } else {
        alert("Erro ao excluir evento. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      alert("Erro ao excluir evento. Tente novamente.")
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!usuario || usuario.tipo !== "produtor") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Eventos</h1>
          <p className="text-gray-600">Gerencie todos os seus eventos em um só lugar</p>
        </div>
        <Link href="/eventos/cadastrar">
          <Button className="bg-primary text-secondary hover:bg-primary/90 mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((acc, curr) => acc + curr.ingressos_vendidos, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(Object.values(stats).reduce((acc, curr) => acc + curr.receita_total, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {carregandoEventos ? (
        <div className="text-center py-12">
          <p>Carregando seus eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-4">
              Você ainda não criou nenhum evento. Comece criando seu primeiro evento!
            </p>
            <Link href="/eventos/cadastrar">
              <Button className="bg-primary text-secondary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventos.map((evento) => {
            const eventoStats = stats[evento.id] || { total_ingressos: 0, ingressos_vendidos: 0, receita_total: 0 }

            return (
              <Card key={evento.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={evento.imagem || "/placeholder.svg?height=400&width=600"}
                    alt={evento.titulo}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{evento.categoria}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{evento.titulo}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          {formatarData(evento.data)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {evento.hora_inicio} - {evento.hora_fim}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {evento.local}, {evento.cidade}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Ingressos</div>
                      <div className="text-lg font-bold">
                        {eventoStats.ingressos_vendidos}/{eventoStats.total_ingressos}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Vendidos</div>
                      <div className="text-lg font-bold text-green-600">
                        {eventoStats.total_ingressos > 0
                          ? Math.round((eventoStats.ingressos_vendidos / eventoStats.total_ingressos) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Receita</div>
                      <div className="text-lg font-bold text-primary">{formatarMoeda(eventoStats.receita_total)}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/eventos/${evento.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/eventos/${evento.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Link href={`/eventos/${evento.id}/relatorios`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Relatórios
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => excluirEvento(evento.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
