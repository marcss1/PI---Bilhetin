"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, User } from "lucide-react"
import { useAuth } from "./auth-provider"
import { AlertMessage } from "./alert-message"

interface Avaliacao {
  id: string
  usuario: {
    nome: string
  }
  nota: number
  comentario: string
  criado_em: string
}

interface AvaliacoesEventoProps {
  eventoId: string
}

export function AvaliacoesEvento({ eventoId }: AvaliacoesEventoProps) {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  // Estados para nova avaliação
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState(0)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)

  // Carregar avaliações do evento
  useEffect(() => {
    async function carregarAvaliacoes() {
      try {
        const res = await fetch(`/api/eventos/${eventoId}/avaliacoes`)
        if (res.ok) {
          const data = await res.json()
          setAvaliacoes(data.avaliacoes || [])
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarAvaliacoes()
  }, [eventoId])

  // Função para enviar nova avaliação
  const enviarAvaliacao = async () => {
    if (!usuario) {
      setErro("Você precisa estar logado para avaliar")
      return
    }

    if (notaSelecionada === 0) {
      setErro("Selecione uma nota de 1 a 5 estrelas")
      return
    }

    if (!comentario.trim()) {
      setErro("Escreva um comentário sobre o evento")
      return
    }

    setEnviando(true)
    setErro(null)

    try {
      const res = await fetch(`/api/eventos/${eventoId}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nota: notaSelecionada,
          comentario: comentario.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSucesso("Avaliação enviada com sucesso!")
        setMostrarFormulario(false)
        setNotaSelecionada(0)
        setComentario("")

        // Recarregar avaliações
        const resAvaliacoes = await fetch(`/api/eventos/${eventoId}/avaliacoes`)
        if (resAvaliacoes.ok) {
          const dataAvaliacoes = await resAvaliacoes.json()
          setAvaliacoes(dataAvaliacoes.avaliacoes || [])
        }
      } else {
        setErro(data.message || "Erro ao enviar avaliação")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      setErro("Erro ao enviar avaliação")
    } finally {
      setEnviando(false)
    }
  }

  // Calcular média das avaliações
  const mediaAvaliacoes =
    avaliacoes.length > 0 ? avaliacoes.reduce((sum, av) => sum + av.nota, 0) / avaliacoes.length : 0

  // Renderizar estrelas
  const renderEstrelas = (nota: number, interativo = false, onSelect?: (nota: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <Star
            key={estrela}
            className={`h-5 w-5 ${
              estrela <= nota ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interativo ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interativo && onSelect && onSelect(estrela)}
          />
        ))}
      </div>
    )
  }

  // Formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliações do Evento</span>
            {usuario && (
              <Button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="bg-primary text-secondary hover:bg-primary/90"
              >
                {mostrarFormulario ? "Cancelar" : "Avaliar Evento"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {avaliacoes.length > 0 ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {renderEstrelas(Math.round(mediaAvaliacoes))}
                <span className="ml-2 text-lg font-semibold">{mediaAvaliacoes.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">
                ({avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          ) : (
            <p className="text-gray-500">Este evento ainda não possui avaliações.</p>
          )}
        </CardContent>
      </Card>

      {/* Mensagens de erro e sucesso */}
      {erro && <AlertMessage type="error" message={erro} onClose={() => setErro(null)} />}
      {sucesso && <AlertMessage type="success" message={sucesso} onClose={() => setSucesso(null)} />}

      {/* Formulário para nova avaliação */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliar Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sua nota (obrigatório)</label>
              {renderEstrelas(notaSelecionada, true, setNotaSelecionada)}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comentário (obrigatório)</label>
              <Textarea
                placeholder="Conte como foi sua experiência no evento..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={enviarAvaliacao}
              disabled={enviando || notaSelecionada === 0 || !comentario.trim()}
              className="w-full bg-primary text-secondary hover:bg-primary/90"
            >
              {enviando ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de avaliações */}
      {carregando ? (
        <div className="text-center py-8">
          <p>Carregando avaliações...</p>
        </div>
      ) : avaliacoes.length > 0 ? (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <Card key={avaliacao.id}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{avaliacao.usuario.nome}</h4>
                      <span className="text-sm text-gray-500">{formatarData(avaliacao.criado_em)}</span>
                    </div>
                    <div className="mb-2">{renderEstrelas(avaliacao.nota)}</div>
                    <p className="text-gray-700">{avaliacao.comentario}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !mostrarFormulario ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Seja o primeiro a avaliar este evento!</p>
          {usuario && (
            <Button
              onClick={() => setMostrarFormulario(true)}
              className="bg-primary text-secondary hover:bg-primary/90"
            >
              Avaliar Evento
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
