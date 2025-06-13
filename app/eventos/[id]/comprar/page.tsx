"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Clock, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { AlertMessage } from "@/components/alert-message"
import { useAuth } from "@/components/auth-provider"

interface TipoIngresso {
  id: string
  nome: string
  preco: number
  quantidade: number
}

interface Evento {
  id: string
  titulo: string
  data: string
  local: string
  horario: string
  imagem: string
  tiposIngresso: TipoIngresso[]
}

export default function ComprarIngressoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { usuario } = useAuth()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function carregarEvento() {
      try {
        const res = await fetch(`/api/eventos/${params.id}`)
        if (!res.ok) {
          throw new Error("Evento não encontrado")
        }
        const data = await res.json()
        setEvento(data.evento)

        // Inicializar quantidades
        const qtds: Record<string, number> = {}
        data.evento.tiposIngresso.forEach((tipo: TipoIngresso) => {
          qtds[tipo.id] = 0
        })
        setQuantidades(qtds)
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

  const handleQuantidadeChange = (tipoId: string, valor: number) => {
    if (valor < 0) return
    const tipo = evento?.tiposIngresso.find((t) => t.id === tipoId)
    if (tipo && valor > tipo.quantidade) return

    setQuantidades((prev) => ({ ...prev, [tipoId]: valor }))
  }

  const calcularTotal = () => {
    if (!evento) return 0
    return evento.tiposIngresso.reduce((total, tipo) => {
      return total + (quantidades[tipo.id] || 0) * tipo.preco
    }, 0)
  }

  const totalIngressos = Object.values(quantidades).reduce((total, qtd) => total + qtd, 0)
  const total = calcularTotal()

  // Substitua sua função handleSubmit por esta:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!usuario) {
    router.push(`/login?redirect=${encodeURIComponent(`/eventos/${params.id}/comprar`)}`);
    return;
  }

  if (totalIngressos === 0) {
    setErro("Selecione pelo menos um ingresso");
    return;
  }

  setEnviando(true);
  setErro(null);

  try {
    // 1. Filtrar apenas os ingressos que o usuário realmente selecionou (quantidade > 0)
    const ingressosSelecionados = evento?.tiposIngresso.filter(
      (tipo) => quantidades[tipo.id] > 0
    );

    if (!ingressosSelecionados || ingressosSelecionados.length === 0) {
      setErro("Nenhum ingresso selecionado.");
      setEnviando(false);
      return;
    }

    // 2. Mapear cada ingresso selecionado para uma promessa de requisição (fetch)
    const promessasDeAdicao = ingressosSelecionados.map((tipo) => {
      // Monta o corpo da requisição no formato que a API espera
      const bodyParaApi = {
        tipo_ingresso_id: tipo.id,
        quantidade: quantidades[tipo.id],
      };

      return fetch("/api/carrinho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyParaApi),
      });
    });

    // 3. Executar todas as requisições em paralelo para mais eficiência
    const resultados = await Promise.all(promessasDeAdicao);

    // 4. Verificar se alguma das requisições falhou
    const algumaFalhou = resultados.find((res) => !res.ok);

    if (algumaFalhou) {
      // Se uma falhou, pega a mensagem de erro dela e mostra para o usuário
      const dataErro = await algumaFalhou.json();
      throw new Error(dataErro.error || "Um ou mais ingressos não puderam ser adicionados.");
    }

    // 5. Se todas as requisições deram certo, redireciona o usuário para o carrinho
    router.push("/carrinho");

  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    setErro(error instanceof Error ? error.message : "Erro desconhecido ao adicionar ao carrinho");
  } finally {
    setEnviando(false);
  }
};

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
      <Link href={`/eventos/${evento.id}`} className="flex items-center text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para o evento
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Comprar Ingressos</h1>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative h-[100px] w-[180px] rounded overflow-hidden">
                  <Image src={evento.imagem || "/placeholder.svg"} alt={evento.titulo} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">{evento.titulo}</h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      {evento.data}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      {evento.horario}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {evento.local}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Selecione seus ingressos</h2>

          {erro && <AlertMessage type="error" message={erro} onClose={() => setErro(null)} />}

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                {evento.tiposIngresso.map((tipo) => (
                  <div key={tipo.id} className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{tipo.nome}</p>
                      <p className="text-sm text-gray-500">
                        {tipo.quantidade > 0 ? `${tipo.quantidade} disponíveis` : "Esgotado"}
                      </p>
                      <p className="font-bold mt-1">R$ {tipo.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantidadeChange(tipo.id, (quantidades[tipo.id] || 0) - 1)}
                        disabled={tipo.quantidade === 0}
                      >
                        -
                      </Button>
                      <span className="mx-3 w-8 text-center">{quantidades[tipo.id] || 0}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantidadeChange(tipo.id, (quantidades[tipo.id] || 0) + 1)}
                        disabled={tipo.quantidade === 0 || (quantidades[tipo.id] || 0) >= tipo.quantidade}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-primary text-secondary hover:bg-primary/90"
              disabled={totalIngressos === 0 || enviando}
            >
              {enviando ? "Adicionando..." : "Adicionar ao Carrinho"}
            </Button>
          </div>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resumo da Compra</h2>

              {totalIngressos > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {evento.tiposIngresso.map(
                      (tipo) =>
                        quantidades[tipo.id] > 0 && (
                          <div key={tipo.id} className="flex justify-between">
                            <p>
                              {quantidades[tipo.id]}x {tipo.nome}
                            </p>
                            <p>R$ {(quantidades[tipo.id] * tipo.preco).toFixed(2)}</p>
                          </div>
                        ),
                    )}

                    <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                      <p>Total</p>
                      <p>R$ {total.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Selecione pelo menos um ingresso para continuar.</p>
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="Selecione ingressos"
                    width={100}
                    height={100}
                    className="mx-auto opacity-50"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
