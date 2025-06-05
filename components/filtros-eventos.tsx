"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface FiltrosEventosProps {
  onFiltrosChange?: (filtros: any) => void
}

export function FiltrosEventos({ onFiltrosChange }: FiltrosEventosProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estados dos filtros baseados nos parâmetros da URL
  const [busca, setBusca] = useState(searchParams.get("busca") || "")
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "")
  const [cidade, setCidade] = useState(searchParams.get("cidade") || "")
  const [dataInicio, setDataInicio] = useState(searchParams.get("dataInicio") || "")
  const [dataFim, setDataFim] = useState(searchParams.get("dataFim") || "")
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "")
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "")
  const [ordenacao, setOrdenacao] = useState(searchParams.get("ordenacao") || "data")

  const categorias = [
    { nome: "Todos", slug: "" },
    { nome: "Música", slug: "musica" },
    { nome: "Esportes", slug: "esportes" },
    { nome: "Teatro", slug: "teatro" },
    { nome: "Cinema", slug: "cinema" },
    { nome: "Arte", slug: "arte" },
    { nome: "Gastronomia", slug: "gastronomia" },
  ]

  const cidades = [
    { nome: "Todas", slug: "" },
    { nome: "São Paulo", slug: "sao-paulo" },
    { nome: "Rio de Janeiro", slug: "rio-de-janeiro" },
    { nome: "Belo Horizonte", slug: "belo-horizonte" },
    { nome: "Brasília", slug: "brasilia" },
    { nome: "Salvador", slug: "salvador" },
    { nome: "Fortaleza", slug: "fortaleza" },
  ]

  const opcoesOrdenacao = [
    { nome: "Data (mais próximo)", valor: "data" },
    { nome: "Data (mais distante)", valor: "data-desc" },
    { nome: "Preço (menor)", valor: "preco" },
    { nome: "Preço (maior)", valor: "preco-desc" },
    { nome: "Nome (A-Z)", valor: "nome" },
    { nome: "Nome (Z-A)", valor: "nome-desc" },
  ]

  // Função para aplicar os filtros
  const aplicarFiltros = () => {
    const params = new URLSearchParams()

    if (busca) params.set("busca", busca)
    if (categoria) params.set("categoria", categoria)
    if (cidade) params.set("cidade", cidade)
    if (dataInicio) params.set("dataInicio", dataInicio)
    if (dataFim) params.set("dataFim", dataFim)
    if (precoMin) params.set("precoMin", precoMin)
    if (precoMax) params.set("precoMax", precoMax)
    if (ordenacao) params.set("ordenacao", ordenacao)

    // Navegar para a página de eventos com os filtros aplicados
    router.push(`/eventos?${params.toString()}`)

    // Callback para componentes pai
    if (onFiltrosChange) {
      onFiltrosChange({
        busca,
        categoria,
        cidade,
        dataInicio,
        dataFim,
        precoMin: precoMin ? Number.parseFloat(precoMin) : undefined,
        precoMax: precoMax ? Number.parseFloat(precoMax) : undefined,
        ordenacao,
      })
    }
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setBusca("")
    setCategoria("")
    setCidade("")
    setDataInicio("")
    setDataFim("")
    setPrecoMin("")
    setPrecoMax("")
    setOrdenacao("data")

    router.push("/eventos")

    if (onFiltrosChange) {
      onFiltrosChange({})
    }
  }

  // Verificar se há filtros ativos
  const temFiltrosAtivos = busca || categoria || cidade || dataInicio || dataFim || precoMin || precoMax

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca por texto */}
        <div className="space-y-2">
          <Label htmlFor="busca">Buscar eventos</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="busca"
              placeholder="Nome do evento, local, descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Filtro por categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por cidade */}
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Select value={cidade} onValueChange={setCidade}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent>
              {cidades.map((cid) => (
                <SelectItem key={cid.slug} value={cid.slug}>
                  {cid.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por período */}
        <div className="space-y-2">
          <Label>Período</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dataInicio" className="text-xs">
                Data início
              </Label>
              <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dataFim" className="text-xs">
                Data fim
              </Label>
              <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Filtro por faixa de preço */}
        <div className="space-y-2">
          <Label>Faixa de preço (R$)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="precoMin" className="text-xs">
                Preço mínimo
              </Label>
              <Input
                id="precoMin"
                type="number"
                placeholder="0"
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="precoMax" className="text-xs">
                Preço máximo
              </Label>
              <Input
                id="precoMax"
                type="number"
                placeholder="1000"
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Ordenação */}
        <div className="space-y-2">
          <Label htmlFor="ordenacao">Ordenar por</Label>
          <Select value={ordenacao} onValueChange={setOrdenacao}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opcoesOrdenacao.map((opcao) => (
                <SelectItem key={opcao.valor} value={opcao.valor}>
                  {opcao.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button onClick={aplicarFiltros} className="flex-1 bg-primary text-secondary hover:bg-primary/90">
            Aplicar Filtros
          </Button>
          {temFiltrosAtivos && (
            <Button onClick={limparFiltros} variant="outline" className="flex items-center">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
