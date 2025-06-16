"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" // Importar o useRouter para redirecionar
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, Minus } from "lucide-react"

export default function CadastrarEventoPage() {
  const router = useRouter() // Hook para navegação
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para os campos do tipo Select
  const [categoria, setCategoria] = useState("")
  const [estado, setEstado] = useState("")

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

  // LÓGICA DE ENVIO DO FORMULÁRIO CORRIGIDA
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    console.log("1. Iniciando o cadastro do evento...")

    const formData = new FormData(e.currentTarget)

    const dadosEvento = {
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao"),
      data: formData.get("data"),
      horaInicio: formData.get("hora-inicio"),
      horaFim: formData.get("hora-fim"),
      local: formData.get("nome-local"),
      endereco: formData.get("endereco"),
      cidade: formData.get("cidade"),
      estado, // Pega do estado do componente
      cep: formData.get("cep"),
      categoria, // Pega do estado do componente
      imagem: "", // Adicione a lógica de upload de imagem aqui
      informacoesAdicionais: formData.get("informacoes"),
      tiposIngresso: tiposIngresso.map(t => ({
        nome: t.nome,
        preco: parseFloat(t.preco.replace(",", ".")) || 0,
        quantidade: parseInt(t.quantidade) || 0,
      })),
      organizadorId: "SEU_ID_DE_ORGANIZADOR_AQUI", // IMPORTANTE: Substitua pelo ID do usuário logado
    }

    console.log("2. Dados que serão enviados para a API:", dadosEvento)

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEvento),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Ocorreu um erro no servidor.")
      }

      console.log("3. Evento cadastrado com sucesso:", result)
      alert("Evento publicado com sucesso!")
      router.push('/perfil') // Redireciona para a página de perfil

    } catch (err: any) {
      console.error("ERRO NO CADASTRO:", err)
      setError(err.message || "Não foi possível cadastrar o evento.")
      alert(`Erro: ${err.message || "Não foi possível cadastrar o evento."}`)
    } finally {
      setIsLoading(false)
    }
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
          {/* O form agora chama a nova função handleSubmit */}
          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Preencha as informações básicas do seu evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Evento</Label>
                  {/* Adicionado o atributo 'name' para o FormData */}
                  <Input id="titulo" name="titulo" placeholder="Ex: Festival de Música Brasileira" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    {/* Componente Select agora controlado pelo estado */}
                    <Select name="categoria" onValueChange={setCategoria} value={categoria} required>
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
                    <Input id="data" name="data" type="date" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hora-inicio">Hora de Início</Label>
                    <Input id="hora-inicio" name="hora-inicio" type="time" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora-fim">Hora de Término</Label>
                    <Input id="hora-fim" name="hora-fim" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Evento</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
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
                  <Input id="nome-local" name="nome-local" placeholder="Ex: Parque Ibirapuera" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input id="endereco" name="endereco" placeholder="Ex: Av. Pedro Álvares Cabral, s/n - Vila Mariana" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" name="cidade" placeholder="Ex: São Paulo" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select name="estado" onValueChange={setEstado} value={estado} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Items do Select... */}
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
                    <Input id="cep" name="cep" placeholder="00000-000" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restante do seu formulário (Imagens, Ingressos, etc.) continua aqui */}
            {/* ... */}
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
                          required
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
            {/* ... */}

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" disabled={isLoading}>
                Salvar como Rascunho
              </Button>
              <Button type="submit" className="bg-primary text-secondary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar Evento"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-right mt-4">{error}</p>}
          </form>
        </div>

        {/* Sua coluna de Dicas permanece igual */}
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
                    Use um título claro e atrativo. Na descrição, inclua todos os
                    detalhes importantes sobre o evento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Imagens</h3>
                  <p className="text-gray-600">
                    Adicione imagens de alta qualidade para atrair mais público. Evite
                    imagens desfocadas ou de baixa resolução.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Ingressos</h3>
                  <p className="text-gray-600">
                    Ofereça diferentes tipos de ingressos para atender diversos
                    públicos. Considere descontos para compras antecipadas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Informações Adicionais</h3>
                  <p className="text-gray-600">
                    Inclua regras importantes, restrições de idade, informações sobre
                    estacionamento e outras orientações úteis.
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