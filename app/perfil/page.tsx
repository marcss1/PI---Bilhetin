"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Clock, Download, User, CreditCard, Ticket, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"
import { AlertMessage } from "@/components/alert-message"
import { logout } from "@/lib/actions"

interface Ingresso {
  id: string
  evento: {
    id: string
    titulo: string
    data: string
    local: string
    horario: string
    imagem: string
  }
  tipo: string
  quantidade: number
  codigo: string
  status: string
}

export default function PerfilPage() {
  const { usuario } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "perfil")
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [carregandoIngressos, setCarregandoIngressos] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setTelefone(usuario.telefone || "")
    }
  }, [usuario])

  useEffect(() => {
    async function carregarIngressos() {
      try {
        const res = await fetch("/api/ingressos")
        if (!res.ok) {
          throw new Error("Erro ao carregar ingressos")
        }
        const data = await res.json()
        setIngressos(data.ingressos || [])
      } catch (error) {
        console.error("Erro ao carregar ingressos:", error)
        setErro("Erro ao carregar ingressos")
      } finally {
        setCarregandoIngressos(false)
      }
    }

    if (activeTab === "ingressos") {
      carregarIngressos()
    }
  }, [activeTab])

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica para salvar perfil
    alert("Perfil atualizado com sucesso!")
  }

  // Dados simulados de cartões salvos
  const cartoes = [
    {
      id: 1,
      numero: "**** **** **** 1234",
      bandeira: "Visa",
      titular: "João Silva",
      validade: "12/28",
    },
    {
      id: 2,
      numero: "**** **** **** 5678",
      bandeira: "Mastercard",
      titular: "João Silva",
      validade: "09/26",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold">{nome}</h2>
                <p className="text-sm text-gray-500">{email}</p>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/perfil"
                  className={`flex items-center p-3 rounded-md ${activeTab === "perfil" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("perfil")}
                >
                  <User className="h-5 w-5 mr-3" />
                  Meu Perfil
                </Link>
                <Link
                  href="/perfil?tab=ingressos"
                  className={`flex items-center p-3 rounded-md ${activeTab === "ingressos" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("ingressos")}
                >
                  <Ticket className="h-5 w-5 mr-3" />
                  Meus Ingressos
                </Link>
                <Link
                  href="/perfil?tab=pagamentos"
                  className={`flex items-center p-3 rounded-md ${activeTab === "pagamentos" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("pagamentos")}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  Formas de Pagamento
                </Link>
                <Link
                  href="/perfil?tab=configuracoes"
                  className={`flex items-center p-3 rounded-md ${activeTab === "configuracoes" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  onClick={() => setActiveTab("configuracoes")}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Configurações
                </Link>
                <form action={logout}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    type="submit"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair
                  </Button>
                </form>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="ingressos">Meus Ingressos</TabsTrigger>
              <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSalvarPerfil} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" value={usuario?.cpf || ""} disabled />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="bg-primary text-secondary hover:bg-primary/90">
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Atualize sua senha de acesso</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senha-atual">Senha Atual</Label>
                        <Input id="senha-atual" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nova-senha">Nova Senha</Label>
                        <Input id="nova-senha" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                        <Input id="confirmar-senha" type="password" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="bg-primary text-secondary hover:bg-primary/90">
                        Alterar Senha
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingressos">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Ingressos</CardTitle>
                  <CardDescription>Visualize e gerencie seus ingressos</CardDescription>
                </CardHeader>
                <CardContent>
                  {erro && <AlertMessage type="error" message={erro} onClose={() => setErro(null)} />}

                  {carregandoIngressos ? (
                    <div className="text-center py-8">
                      <p>Carregando ingressos...</p>
                    </div>
                  ) : ingressos.length > 0 ? (
                    <div className="space-y-6">
                      {ingressos.map((ingresso) => (
                        <div key={ingresso.id} className="border rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative h-[150px] md:h-auto md:w-[200px]">
                              <Image
                                src={ingresso.evento.imagem || "/placeholder.svg"}
                                alt={ingresso.evento.titulo}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-6 flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">{ingresso.evento.titulo}</h3>
                                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                                      {ingresso.evento.data}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-primary" />
                                      {ingresso.evento.horario}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                                      {ingresso.evento.local}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {ingresso.status === "confirmado" ? "Confirmado" : "Pendente"}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Tipo de Ingresso</p>
                                  <p className="font-medium">
                                    {ingresso.tipo} ({ingresso.quantidade}x)
                                  </p>
                                  <p className="text-sm mt-1">
                                    <span className="text-gray-500">Código:</span> {ingresso.codigo}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" className="flex items-center">
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Sem ingressos"
                          width={100}
                          height={100}
                          className="mx-auto opacity-50"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Você ainda não tem ingressos</h3>
                      <p className="text-gray-500 mb-4">Explore eventos e compre ingressos para vê-los aqui.</p>
                      <Link href="/eventos">
                        <Button className="bg-primary text-secondary hover:bg-primary/90">Explorar Eventos</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagamentos">
              <Card>
                <CardHeader>
                  <CardTitle>Formas de Pagamento</CardTitle>
                  <CardDescription>Gerencie seus cartões de crédito salvos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartoes.map((cartao) => (
                      <div key={cartao.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-md mr-4">
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{cartao.bandeira}</p>
                            <p className="text-sm text-gray-500">{cartao.numero}</p>
                            <p className="text-sm text-gray-500">Validade: {cartao.validade}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          Remover
                        </Button>
                      </div>
                    ))}

                    <Button className="w-full mt-4 bg-primary text-secondary hover:bg-primary/90">
                      Adicionar Novo Cartão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
