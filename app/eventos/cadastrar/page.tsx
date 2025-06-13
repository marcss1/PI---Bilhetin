"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, Minus } from "lucide-react"

export default function CadastrarEventoPage() {
  const [tiposIngresso, setTiposIngresso] = useState([
    { id: 1, nome: "Inteira", preco: "", quantidade: "" },
    { id: 2, nome: "Meia-entrada", preco: "", quantidade: "" },
  ])

  const adicionarTipoIngresso = () => {
    const novoId = Math.max(0, ...tiposIngresso.map((t) => t.id)) + 1
    setTiposIngresso([...tiposIngresso, { id: novoId, nome: "", preco: "", quantidade: "" }])
  }

  const removerTipoIngresso = (id: number) => {
    if (tiposIngresso.length <= 1) return
    setTiposIngresso(tiposIngresso.filter((t) => t.id !== id))
  }

  const atualizarTipoIngresso = (id: number, campo: string, valor: string) => {
    setTiposIngresso(tiposIngresso.map((t) => (t.id === id ? { ...t, [campo]: valor } : t)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica para cadastrar evento
    console.log("Cadastrando evento...")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/perfil" className="flex items-center text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para o perfil
      </Link>

      <h1 className="text-3xl font-bold mb-8">Cadastrar Novo Evento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Preencha as informações básicas do seu evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Evento</Label>
                  <Input id="titulo" placeholder="Ex: Festival de Música Brasileira" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="musica">Música</SelectItem>
                        <SelectItem value="teatro">Teatro</SelectItem>
                        <SelectItem value="esporte">Esporte</SelectItem>
                        <SelectItem value="cinema">Cinema</SelectItem>
                        <SelectItem value="arte">Arte</SelectItem>
                        <SelectItem value="gastronomia">Gastronomia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hora-inicio">Hora de Início</Label>
                    <Input id="hora-inicio" type="time" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora-fim">Hora de Término</Label>
                    <Input id="hora-fim" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Evento</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva seu evento em detalhes..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Local do Evento</CardTitle>
                <CardDescription>Informe onde o evento será realizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-local">Nome do Local</Label>
                  <Input id="nome-local" placeholder="Ex: Parque Ibirapuera" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input id="endereco" placeholder="Ex: Av. Pedro Álvares Cabral, s/n - Vila Mariana" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" placeholder="Ex: São Paulo" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac">Acre</SelectItem>
                        <SelectItem value="al">Alagoas</SelectItem>
                        <SelectItem value="ap">Amapá</SelectItem>
                        <SelectItem value="am">Amazonas</SelectItem>
                        <SelectItem value="ba">Bahia</SelectItem>
                        <SelectItem value="ce">Ceará</SelectItem>
                        <SelectItem value="df">Distrito Federal</SelectItem>
                        <SelectItem value="es">Espírito Santo</SelectItem>
                        <SelectItem value="go">Goiás</SelectItem>
                        <SelectItem value="ma">Maranhão</SelectItem>
                        <SelectItem value="mt">Mato Grosso</SelectItem>
                        <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="mg">Minas Gerais</SelectItem>
                        <SelectItem value="pa">Pará</SelectItem>
                        <SelectItem value="pb">Paraíba</SelectItem>
                        <SelectItem value="pr">Paraná</SelectItem>
                        <SelectItem value="pe">Pernambuco</SelectItem>
                        <SelectItem value="pi">Piauí</SelectItem>
                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                        <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                        <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                        <SelectItem value="ro">Rondônia</SelectItem>
                        <SelectItem value="rr">Roraima</SelectItem>
                        <SelectItem value="sc">Santa Catarina</SelectItem>
                        <SelectItem value="sp">São Paulo</SelectItem>
                        <SelectItem value="se">Sergipe</SelectItem>
                        <SelectItem value="to">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Imagens do Evento</CardTitle>
                <CardDescription>Adicione imagens para promover seu evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arraste e solte uma imagem aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG ou JPEG (máx. 5MB)</p>
                    <Button variant="outline" type="button">
                      Selecionar Imagem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Ingressos</CardTitle>
                <CardDescription>Configure os tipos de ingressos disponíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tiposIngresso.map((tipo, index) => (
                  <div key={tipo.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Tipo de Ingresso {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removerTipoIngresso(tipo.id)}
                        disabled={tiposIngresso.length <= 1}
                        className="h-8 w-8 text-gray-500"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nome-${tipo.id}`}>Nome</Label>
                        <Input
                          id={`nome-${tipo.id}`}
                          placeholder="Ex: Ingresso VIP"
                          value={tipo.nome}
                          onChange={(e) => atualizarTipoIngresso(tipo.id, "nome", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`preco-${tipo.id}`}>Preço (R$)</Label>
                        <Input
                          id={`preco-${tipo.id}`}
                          placeholder="0,00"
                          value={tipo.preco}
                          onChange={(e) => atualizarTipoIngresso(tipo.id, "preco", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantidade-${tipo.id}`}>Quantidade</Label>
                        <Input
                          id={`quantidade-${tipo.id}`}
                          placeholder="Ex: 100"
                          value={tipo.quantidade}
                          onChange={(e) => atualizarTipoIngresso(tipo.id, "quantidade", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={adicionarTipoIngresso}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tipo de Ingresso
                </Button>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
                <CardDescription>Adicione informações importantes para os participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="informacoes">Informações Adicionais</Label>
                  <Textarea
                    id="informacoes"
                    placeholder="Ex: Proibida a entrada de bebidas e alimentos. Permitida a entrada de água em garrafas transparentes..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                Salvar como Rascunho
              </Button>
              <Button type="submit" className="bg-primary text-secondary hover:bg-primary/90">
                Publicar Evento
              </Button>
            </div>
          </form>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Dicas para Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Título e Descrição</h3>
                  <p className="text-gray-600">
                    Use um título claro e atrativo. Na descrição, inclua todos os detalhes importantes sobre o evento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Imagens</h3>
                  <p className="text-gray-600">
                    Adicione imagens de alta qualidade para atrair mais público. Evite imagens desfocadas ou de baixa
                    resolução.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Ingressos</h3>
                  <p className="text-gray-600">
                    Ofereça diferentes tipos de ingressos para atender diversos públicos. Considere descontos para
                    compras antecipadas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Informações Adicionais</h3>
                  <p className="text-gray-600">
                    Inclua regras importantes, restrições de idade, informações sobre estacionamento e outras
                    orientações úteis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
