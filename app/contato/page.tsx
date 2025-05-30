"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { enviarMensagem } from "@/lib/actions"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  })
  const [enviando, setEnviando] = useState(false)
  const [mensagemEnviada, setMensagemEnviada] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, assunto: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      await enviarMensagem(formData)
      setMensagemEnviada(true)
      setFormData({
        nome: "",
        email: "",
        assunto: "",
        mensagem: "",
      })
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-lg">
              Estamos aqui para ajudar. Preencha o formulário abaixo ou use um de nossos canais de contato.
            </p>
          </div>
        </div>
      </section>

      {/* Formulário de Contato */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Envie uma Mensagem</h2>

              {mensagemEnviada ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Mensagem Enviada!</h3>
                      <p className="mb-6">Obrigado por entrar em contato. Responderemos o mais breve possível.</p>
                      <Button
                        onClick={() => setMensagemEnviada(false)}
                        className="bg-primary text-secondary hover:bg-primary/90"
                      >
                        Enviar Nova Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assunto">Assunto</Label>
                    <Select value={formData.assunto} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duvida">Dúvida sobre Evento</SelectItem>
                        <SelectItem value="problema">Problema com Ingresso</SelectItem>
                        <SelectItem value="parceria">Proposta de Parceria</SelectItem>
                        <SelectItem value="sugestao">Sugestão</SelectItem>
                        <SelectItem value="outro">Outro Assunto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Digite sua mensagem aqui..."
                      className="min-h-[150px]"
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-primary text-secondary hover:bg-primary/90 w-full"
                    disabled={enviando}
                  >
                    {enviando ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Informações de Contato</h2>

              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">E-mail</h3>
                        <p className="text-gray-600 mb-1">Para dúvidas gerais:</p>
                        <p className="font-medium">contato@bilhetin.com.br</p>
                        <p className="text-gray-600 mb-1 mt-3">Para suporte técnico:</p>
                        <p className="font-medium">suporte@bilhetin.com.br</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">Telefone</h3>
                        <p className="text-gray-600 mb-1">Central de Atendimento:</p>
                        <p className="font-medium">(11) 3456-7890</p>
                        <p className="text-gray-600 mb-1 mt-3">WhatsApp:</p>
                        <p className="font-medium">(11) 98765-4321</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">Endereço</h3>
                        <p className="text-gray-600 mb-1">Escritório Principal:</p>
                        <p className="font-medium">
                          Av. Paulista, 1000, 10º andar
                          <br />
                          Bela Vista, São Paulo - SP
                          <br />
                          CEP: 01310-100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="font-bold mb-4">Horário de Atendimento</h3>
                <p className="mb-2">
                  <span className="font-medium">Segunda a Sexta:</span> 9h às 18h
                </p>
                <p>
                  <span className="font-medium">Sábado:</span> 9h às 13h
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 h-[400px] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Mapa do local</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  pergunta: "Como posso solicitar reembolso de um ingresso?",
                  resposta:
                    "Para solicitar reembolso, acesse sua conta, vá até 'Meus Ingressos', selecione o ingresso desejado e clique em 'Solicitar Reembolso'. O prazo para reembolso varia de acordo com a política de cada evento.",
                },
                {
                  pergunta: "Posso transferir meu ingresso para outra pessoa?",
                  resposta:
                    "Sim, você pode transferir seu ingresso para outra pessoa. Acesse 'Meus Ingressos', selecione o ingresso que deseja transferir e clique em 'Transferir'. Você precisará informar o e-mail da pessoa que receberá o ingresso.",
                },
                {
                  pergunta: "Como me torno um produtor de eventos na plataforma?",
                  resposta:
                    "Para se tornar um produtor de eventos, você precisa criar uma conta como produtor e passar por um processo de verificação. Após a aprovação, você poderá cadastrar e gerenciar seus eventos na plataforma.",
                },
                {
                  pergunta: "Qual é a taxa cobrada pela plataforma?",
                  resposta:
                    "A Bilhetin cobra uma taxa de 10% sobre o valor de cada ingresso vendido. Esta taxa cobre os custos de processamento de pagamento, suporte ao cliente e manutenção da plataforma.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold mb-2">{item.pergunta}</h3>
                  <p className="text-gray-600">{item.resposta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
