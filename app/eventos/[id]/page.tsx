"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Clock, Users, Info, Share2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { formatarPreco } from "@/lib/utils"
import { AlertMessage } from "@/components/alert-message"

interface TipoIngresso {
  id: string
  nome: string
  preco: number
  quantidade: number
}

interface Evento {
  id: string
  titulo: string
  descricao: string
  data: string
  horario: string
  local: string
  endereco: string
  categoria: string
  imagem: string
  organizador: string
  preco: {
    inteira: number
    meia: number
    vip: number
  }
  ingressosDisponiveis: number
  informacoesAdicionais: string[]
  tiposIngresso: TipoIngresso[]
}

export default function EventoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`/api/eventos/${params.id}`)
        if (!res.ok) {
          throw new Error("Evento não encontrado")
        }
        const data = await res.json()
        setEvento(data.evento)
      } catch (error) {
        console.error("Erro ao carregar evento:", error)
        setErro("Evento não encontrado")
      } finally {
        setCarregando(false)
      }
    }

    if (params.id) {
      carregarEvento()
    }
  }, [params.id])

  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <p>Carregando...</p>
      </div>
    )
  }

  if (erro || !evento) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AlertMessage type="error" message={erro || "Evento não encontrado"} />
        <div className="mt-4 text-center">
          <Link href="/eventos">
            <Button className="bg-primary text-secondary hover:bg-primary/90">Ver Outros Eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6">
            <Image src={evento.imagem || "/placeholder.svg"} alt={evento.titulo} fill className="object-cover" />
            <div className="absolute top-4 right-4 bg-primary text-secondary px-3 py-1 rounded-full text-sm font-medium">
              {evento.categoria}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{evento.titulo}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p>{evento.data}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm text-gray-500">Horário</p>
                <p>{evento.horario}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm text-gray-500">Local</p>
                <p>{evento.local}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Sobre o Evento</h2>
            <p className="text-gray-700">{evento.descricao}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Localização</h2>
            <p className="text-gray-700 mb-3">{evento.endereco}</p>
            <div className="bg-gray-200 h-[300px] rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Mapa do local</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Informações Importantes</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {evento.informacoesAdicionais.map((info, index) => (
                  <li key={index} className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <div className="flex items-center">
              <p className="mr-2">Compartilhar:</p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Compartilhar</span>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Organizado por</p>
              <p className="font-medium">{evento.organizador}</p>
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ingressos</h2>

              <div className="space-y-4 mb-6">
                {evento.tiposIngresso.map((tipo) => (
                  <div key={tipo.id} className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{tipo.nome}</p>
                      <p className="text-sm text-gray-500">
                        {tipo.quantidade > 0 ? `${tipo.quantidade} disponíveis` : "Esgotado"}
                      </p>
                    </div>
                    <p className="font-bold text-lg">{formatarPreco(tipo.preco)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center mb-6">
                <Users className="h-5 w-5 mr-2 text-primary" />
                <p className="text-sm">{evento.ingressosDisponiveis} ingressos disponíveis</p>
              </div>

              <Link href={`/eventos/${evento.id}/comprar`}>
                <Button className="w-full bg-primary text-secondary hover:bg-primary/90">Comprar Ingressos</Button>
              </Link>

              <p className="text-xs text-center mt-4 text-gray-500">
                Ao comprar, você concorda com os termos e condições do evento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
