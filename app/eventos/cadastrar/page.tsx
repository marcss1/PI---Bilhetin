"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, Minus, X } from "lucide-react"

export default function CadastrarEventoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para a imagem
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Estados para os campos do tipo Select
  const [categoria, setCategoria] = useState("")
  const [estado, setEstado] = useState("")

  const [tiposIngresso, setTiposIngresso] = useState([
    { id: 1, nome: "Inteira", preco: "", quantidade: "" },
    { id: 2, nome: "Meia-entrada", preco: "", quantidade: "" },
  ])

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagemFile(file)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removerImagem = () => {
    setImagemFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

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

  // LÓGICA DE ENVIO ÚNICA E CORRETA (USANDO FormData)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    const formElements = e.currentTarget.elements

    // Adiciona os campos de texto ao FormData
    formData.append("titulo", (formElements.namedItem("titulo") as HTMLInputElement).value)
    formData.append("descricao", (formElements.namedItem("descricao") as HTMLInputElement).value)
    formData.append("data", (formElements.namedItem("data") as HTMLInputElement).value)
    formData.append("horaInicio", (formElements.namedItem("hora-inicio") as HTMLInputElement).value)
    formData.append("horaFim", (formElements.namedItem("hora-fim") as HTMLInputElement).value)
    formData.append("local", (formElements.namedItem("nome-local") as HTMLInputElement).value)
    formData.append("endereco", (formElements.namedItem("endereco") as HTMLInputElement).value)
    formData.append("cidade", (formElements.namedItem("cidade") as HTMLInputElement).value)
    formData.append("cep", (formElements.namedItem("cep") as HTMLInputElement).value)

    // Adiciona os campos controlados pelo state
    formData.append("estado", estado)
    formData.append("categoria", categoria)

    // Adiciona o arquivo de imagem
    if (imagemFile) {
      formData.append("imagem", imagemFile)
    }

    // Adiciona os tipos de ingresso como string JSON
    formData.append("tiposIngresso", JSON.stringify(tiposIngresso.map(t => ({
      nome: t.nome,
      preco: parseFloat(t.preco.replace(",", ".")) || 0,
      quantidade: parseInt(t.quantidade) || 0,
    }))))

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        body: formData, // Envia o FormData (sem 'headers')
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Ocorreu um erro no servidor.")
      }

      alert("Evento publicado com sucesso!")
      router.push('/perfil')

    } catch (err: any) {
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
          <form onSubmit={handleSubmit}>
            {/* ... Todo o seu JSX do formulário continua aqui ... */}
            {/* Card de Informações Básicas */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Preencha as informações básicas do seu evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Evento</Label>
                  <Input id="titulo" name="titulo" placeholder="Ex: Festival de Música Brasileira" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select name="categoria" onValueChange={setCategoria} value={categoria} required>
                      <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
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
                  <Textarea id="descricao" name="descricao" placeholder="Descreva seu evento em detalhes..." className="min-h-[120px]" required />
                </div>
              </CardContent>
            </Card>

            {/* Card de Imagem de Divulgação */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Imagem de Divulgação</CardTitle>
                <CardDescription>Escolha uma imagem principal para o seu evento.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="imagem-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img src={previewUrl} alt="Pré-visualização da imagem" className="object-contain w-full h-full rounded-lg" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={(e) => { e.preventDefault(); removerImagem(); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                        <p className="text-xs text-gray-500">PNG, JPG ou GIF (MAX. 5MB)</p>
                      </div>
                    )}
                  </Label>
                  <Input id="imagem-upload" name="imagem" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleImagemChange} />
                </div>
              </CardContent>
            </Card>

            {/* Card de Local do Evento */}
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
                  <Input id="endereco" name="endereco" placeholder="Ex: Av. Pedro Álvares Cabral, s/n" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" name="cidade" placeholder="Ex: São Paulo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select name="estado" onValueChange={setEstado} value={estado} required>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                    <Input id="cep" name="cep" placeholder="00000-000" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Ingressos */}
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
                      <Button variant="ghost" size="icon" type="button" onClick={() => removerTipoIngresso(tipo.id)} disabled={tiposIngresso.length <= 1} className="h-8 w-8 text-gray-500">
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nome-${tipo.id}`}>Nome</Label>
                        <Input id={`nome-${tipo.id}`} placeholder="Ex: Ingresso VIP" value={tipo.nome} onChange={(e) => atualizarTipoIngresso(tipo.id, "nome", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`preco-${tipo.id}`}>Preço (R$)</Label>
                        <Input id={`preco-${tipo.id}`} placeholder="0,00" value={tipo.preco} onChange={(e) => atualizarTipoIngresso(tipo.id, "preco", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quantidade-${tipo.id}`}>Quantidade</Label>
                        <Input id={`quantidade-${tipo.id}`} placeholder="Ex: 100" type="number" value={tipo.quantidade} onChange={(e) => atualizarTipoIngresso(tipo.id, "quantidade", e.target.value)} required />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full flex items-center justify-center" onClick={adicionarTipoIngresso}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tipo de Ingresso
                </Button>
              </CardContent>
            </Card>

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

        {/* Coluna de Dicas */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Dicas para Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Título e Descrição</h3>
                  <p className="text-gray-600">Use um título claro e atrativo. Na descrição, inclua todos os detalhes importantes sobre o evento.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Imagens</h3>
                  <p className="text-gray-600">Adicione imagens de alta qualidade para atrair mais público. Evite imagens desfocadas ou de baixa resolução.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ingressos</h3>
                  <p className="text-gray-600">Ofereça diferentes tipos de ingressos para atender diversos públicos. Considere descontos para compras antecipadas.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Informações Adicionais</h3>
                  <p className="text-gray-600">Inclua regras importantes, restrições de idade, informações sobre estacionamento e outras orientações úteis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}