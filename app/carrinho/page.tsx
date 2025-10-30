"use client"

// Importações
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Trash2, CreditCard } from "lucide-react"
import { removerDoCarrinho } from "@/lib/actions"
import { AlertMessage } from "@/components/alert-message"
import { formatarPreco } from "@/lib/utils"
import { MetodosPagamento } from "@/components/metodos-pagamento"

// Importações do Stripe
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm" // Nosso formulário modificado

// Interface do item do carrinho (mantida como estava)
interface ItemCarrinho {
  id: string;
  quantidade: number;
  preco_unitario: number | null;
  tipos_ingresso: {
    id: string;
    nome: string;
    preco: number;
    eventos: {
      id: string;
      titulo: string;
      data: string;
      local: string;
      imagem: string;
    };
  };
}

// Carrega a promise do Stripe fora do componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CarrinhoPage() {
  // ESTADOS DO COMPONENTE
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  // NOVOS ESTADOS PARA CONTROLAR O FLUXO DO STRIPE
  const [mostrarFormularioStripe, setMostrarFormularioStripe] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Efeito para carregar o carrinho (sem alterações)
  useEffect(() => {
    async function carregarCarrinho() {
      try {
        const res = await fetch("/api/carrinho")
        if (!res.ok) throw new Error("Erro ao carregar carrinho")
        const data = await res.json()
        setItens(data.carrinho || []);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        setErro("Erro ao carregar carrinho")
      } finally {
        setCarregando(false)
      }
    }
    carregarCarrinho()
  }, [])

  // Função para remover item (sem alterações)
  const removerItem = async (id: string) => {
    try {
      const resultado = await removerDoCarrinho(id)
      if (resultado.success) {
        setItens(itens.filter((item) => item.id !== id))
      } else {
        setErro(resultado.message || "Erro ao remover item")
      }
    } catch (error) {
      console.error("Erro ao remover item:", error)
      setErro("Erro ao remover item")
    }
  }

  // NOVA FUNÇÃO DE PAGAMENTO - AGORA CONECTADA AO STRIPE
  const handlePagamentoStripe = async () => {
    setProcessando(true)
    setErro(null)

    if (itens.length === 0) {
      setErro("Seu carrinho está vazio.")
      setProcessando(false)
      return;
    }

    try {
      // 1. Chamar NOSSA API para criar a Intenção de Pagamento
      const res = await fetch("/api/pagamentos/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: calcularTotal() }), // Envia o valor total REAL do carrinho
      })

      const data = await res.json()

      if (res.ok && data.clientSecret) {
        // 2. Se deu certo, guardamos o clientSecret e ativamos a exibição do formulário
        setClientSecret(data.clientSecret)
        setMostrarFormularioStripe(true)
      } else {
        setErro(data.error || "Erro ao iniciar o pagamento.")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      setErro("Erro ao conectar com o serviço de pagamento.")
    } finally {
      setProcessando(false)
    }
  }

  // Funções de cálculo (sem alterações)
  const calcularSubtotal = (item: ItemCarrinho) => {
    const preco = item.tipos_ingresso.preco || item.preco_unitario || 0;
    return item.quantidade * preco;
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + calcularSubtotal(item), 0);
  };

  const totalIngressos = itens.reduce((total, item) => total + item.quantidade, 0);

  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>
      {erro && <AlertMessage type="error" message={erro} onClose={() => setErro(null)} />}

      {itens.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA DOS ITENS (2/3 da largura) - SEM ALTERAÇÕES AQUI */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {itens.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-[150px] md:h-auto md:w-[200px]">
                        <Image
                          src={item.tipos_ingresso.eventos.imagem || "/placeholder.svg"}
                          alt={item.tipos_ingresso.eventos.titulo}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h2 className="text-xl font-semibold mb-2">
                              <Link href={`/eventos/${item.tipos_ingresso.eventos.id}`} className="hover:text-primary">
                                {item.tipos_ingresso.eventos.titulo}
                              </Link>
                            </h2>
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
                        <div className="flex justify-between text-sm py-2 border-t border-gray-100 mt-2">
                          <p className="font-medium">
                            {item.quantidade}x {item.tipos_ingresso.nome}
                          </p>
                          <p>{formatarPreco(item.quantidade * item.tipos_ingresso.preco)}</p>
                        </div>
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

          {/* COLUNA DO RESUMO (1/3 da largura) - AQUI ESTÁ A MÁGICA */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* RENDERIZAÇÃO CONDICIONAL: Mostra o resumo OU o formulário do Stripe */}
                {!mostrarFormularioStripe ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Resumo da Compra</h2>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <p>Subtotal ({totalIngressos} {totalIngressos === 1 ? "ingresso" : "ingressos"})</p>
                        <p>{formatarPreco(calcularTotal())}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Taxa de serviço</p>
                        <p>R$ 0,00</p>
                      </div>
                      <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                        <p>Total</p>
                        <p>{formatarPreco(calcularTotal())}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary text-secondary hover:bg-primary/90 flex items-center justify-center mb-3"
                      onClick={handlePagamentoStripe} // Chama a nova função do Stripe
                      disabled={processando}
                    >
                      {processando ? "Aguarde..." : "Ir para Pagamento"}
                      {!processando && <CreditCard className="ml-2 h-4 w-4" />}
                    </Button>
                    <MetodosPagamento />
                    <div className="mt-4">
                      <Link href="/eventos" className="text-primary text-sm hover:underline flex items-center justify-center">
                        Continuar comprando
                      </Link>
                    </div>
                  </>
                ) : (
                  // QUANDO mostrarFormularioStripe for true:
                  clientSecret && (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Detalhes do Pagamento</h2>
                      <Elements options={{ clientSecret }} stripe={stripePromise}>
                        <StripeCheckoutForm onBack={() => setMostrarFormularioStripe(false)} />
                      </Elements>
                    </>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // CARRINHO VAZIO (sem alterações)
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