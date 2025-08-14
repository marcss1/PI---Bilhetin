"use client"

// Importações necessárias para o componente
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Trash2, CreditCard } from "lucide-react"
import { removerDoCarrinho } from "@/lib/actions"
import { AlertMessage } from "@/components/alert-message"
import { formatarPreco } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { MetodosPagamento } from "@/components/metodos-pagamento"

// Interface que define a estrutura de um item do carrinho
interface ItemCarrinho {
  id: string;
  quantidade: number;
  preco_unitario: number | null;
  tipos_ingresso: {
    id: string;
    nome: string;
    preco: number;
    eventos: { // O objeto do evento agora está aqui dentro
      id: string;
      titulo: string;
      data: string;
      local: string;
      imagem: string;
    };
  };
}

/**
 * Componente da página do carrinho de compras
 * Permite visualizar, remover itens e prosseguir para o pagamento
 */
export default function CarrinhoPage() {
  // ESTADOS DO COMPONENTE
  const [itens, setItens] = useState<ItemCarrinho[]>([]) // Lista de itens no carrinho
  const [carregando, setCarregando] = useState(true) // Estado de carregamento
  const [erro, setErro] = useState<string | null>(null) // Mensagens de erro
  const [processando, setProcessando] = useState(false) // Estado do processamento de pagamento
  const router = useRouter()

  // EFEITO PARA CARREGAR O CARRINHO
  // Executa quando o componente é montado
  useEffect(() => {
    async function carregarCarrinho() {
      try {
        // Faz requisição para buscar itens do carrinho
        const res = await fetch("/api/carrinho")
        if (!res.ok) {
          throw new Error("Erro ao carregar carrinho")
        }
        const data = await res.json()
        // Atualiza o estado com os itens recebidos
        setItens(data.carrinho || []);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        setErro("Erro ao carregar carrinho")
      } finally {
        // Para o estado de carregamento
        setCarregando(false)
      }
    }

    carregarCarrinho()
  }, []) // Array vazio = executa apenas uma vez

  /**
   * Função para remover um item do carrinho
   * @param id - ID do item a ser removido
   */
  const removerItem = async (id: string) => {
    try {
      // Chama a função de remoção
      const resultado = await removerDoCarrinho(id)
      if (resultado.success) {
        // Remove o item da lista local (atualização otimista)
        setItens(itens.filter((item) => item.id !== id))
      } else {
        setErro(resultado.message || "Erro ao remover item")
      }
    } catch (error) {
      console.error("Erro ao remover item:", error)
      setErro("Erro ao remover item")
    }
  }

  /**
   * Função para processar o pagamento
   * Cria uma preferência no Mercado Pago e redireciona para o checkout
   */
  const handlePagamento = async () => {
    setProcessando(true) // Ativa estado de processamento
    setErro(null) // Limpa erros anteriores

    try {
      // Faz requisição para criar preferência de pagamento
      const res = await fetch("/api/pagamentos/criar-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      // Se sucesso, redireciona para o checkout do Mercado Pago
      if (data.success && data.initPoint) {
        // Redireciona para a página de pagamento externa
        window.location.href = data.initPoint
      } else {
        setErro(data.message || "Erro ao processar pagamento")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      setErro("Erro ao processar pagamento")
    } finally {
      setProcessando(false) // Desativa estado de processamento
    }
  }

  /**
   * Calcula o subtotal de um item específico
   * @param item - Item do carrinho
   * @returns Valor total do item
   */
  const calcularSubtotal = (item: ItemCarrinho) => {
    const preco = item.tipos_ingresso.preco || item.preco_unitario || 0;
    return item.quantidade * preco;
  };

  /**
   * Calcula o total geral do carrinho
   * @returns Valor total de todos os itens
   */
  const calcularTotal = () => {
    return itens.reduce((total, item) => total + calcularSubtotal(item), 0);
  };

  /**
   * Calcula o total de ingressos no carrinho
   * @returns Quantidade total de ingressos
   */
  const totalIngressos = itens.reduce((total, item) => total + item.quantidade, 0);
  // RENDERIZAÇÃO CONDICIONAL - CARREGAMENTO
  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <p>Carregando...</p>
      </div>
    )
  }

  // RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

      {/* Exibe mensagens de erro se houver */}
      {erro && <AlertMessage type="error" message={erro} onClose={() => setErro(null)} />}

      {/* CARRINHO COM ITENS */}
      {itens.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA DOS ITENS (2/3 da largura) */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
            <div className="lg:col-span-2">
  <div className="space-y-6">
    {/* Mapeia e renderiza cada item do carrinho com os caminhos corretos */}
    {itens.map((item) => (
      <Card key={item.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Imagem do evento */}
            <div className="relative h-[150px] md:h-auto md:w-[200px]">
              <Image
                src={item.tipos_ingresso.eventos.imagem || "/placeholder.svg"}
                alt={item.tipos_ingresso.eventos.titulo}
                fill
                className="object-cover"
              />
            </div>

            {/* Informações do item */}
            <div className="p-6 flex-1">
              <div className="flex justify-between">
                <div>
                  {/* Título do evento (clicável) */}
                  <h2 className="text-xl font-semibold mb-2">
                    <Link href={`/eventos/${item.tipos_ingresso.eventos.id}`} className="hover:text-primary">
                      {item.tipos_ingresso.eventos.titulo}
                    </Link>
                  </h2>

                  {/* Informações do evento */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      {item.tipos_ingresso.eventos.data}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {item.tipos_ingresso.eventos.local}
                    </div>
                  </div>
                </div>

                {/* Botão para remover item */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  onClick={() => removerItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover</span>
                </Button>
              </div>

              {/* Detalhes do ingresso específico (NÃO PRECISA MAIS DE .map AQUI) */}
              <div className="flex justify-between text-sm py-2 border-t border-gray-100 mt-2">
                <p className="font-medium">
                  {item.quantidade}x {item.tipos_ingresso.nome}
                </p>
                <p>{formatarPreco(item.quantidade * item.tipos_ingresso.preco)}</p>
              </div>

              {/* Subtotal do item */}
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-semibold">
                <p>Subtotal do Item</p>
                <p>{formatarPreco(calcularSubtotal(item))}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
            </div>
          </div>

          {/* COLUNA DO RESUMO (1/3 da largura) */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumo da Compra</h2>

                {/* Detalhamento dos valores */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <p>
                      Subtotal ({totalIngressos} {totalIngressos === 1 ? "ingresso" : "ingressos"})
                    </p>
                    <p>{formatarPreco(calcularTotal())}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Taxa de serviço</p>
                    <p>R$ 0,00</p>
                  </div>
                  {/* Total final */}
                  <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                    <p>Total</p>
                    <p>{formatarPreco(calcularTotal())}</p>
                  </div>
                </div>

                {/* Botão de pagamento */}
                <Button
                  className="w-full bg-primary text-secondary hover:bg-primary/90 flex items-center justify-center mb-3"
                  onClick={handlePagamento}
                  disabled={processando}
                >
                  {processando ? "Processando..." : "Ir para Pagamento"}
                  {!processando && <CreditCard className="ml-2 h-4 w-4" />}
                </Button>

                {/* Componente que mostra os métodos de pagamento aceitos */}
                <MetodosPagamento />

                {/* Link para continuar comprando */}
                <div className="mt-4">
                  <Link
                    href="/eventos"
                    className="text-primary text-sm hover:underline flex items-center justify-center"
                  >
                    Continuar comprando
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // CARRINHO VAZIO
        <div className="text-center py-16">
          <div className="mb-6">
            <Image
              src="/carrinho_vazio.png?height=200&width=200"
              alt="Carrinho vazio"
              width={200}
              height={200}
              className="mx-auto opacity-50"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-6">Adicione ingressos para continuar com a compra.</p>
          <Link href="/eventos">
            <Button className="bg-primary text-secondary hover:bg-primary/90">Explorar Eventos</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
