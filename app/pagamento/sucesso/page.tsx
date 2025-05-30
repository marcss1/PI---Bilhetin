"use client"

// Importações necessárias para a página de sucesso
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Ticket } from "lucide-react"
import { useSearchParams } from "next/navigation"

/**
 * Página de sucesso do pagamento
 * Exibida quando o usuário retorna do Mercado Pago após um pagamento aprovado
 */
export default function PagamentoSucessoPage() {
  // ESTADOS DO COMPONENTE
  const [carregando, setCarregando] = useState(true) // Estado de carregamento
  const [erro, setErro] = useState<string | null>(null) // Mensagens de erro
  const searchParams = useSearchParams()

  // PARÂMETROS DA URL
  // O Mercado Pago retorna estes parâmetros na URL quando redireciona o usuário
  const paymentId = searchParams.get("payment_id") // ID do pagamento no Mercado Pago
  const status = searchParams.get("status") // Status do pagamento
  const externalReference = searchParams.get("external_reference") // ID da nossa compra

  // EFEITO PARA VERIFICAR O PAGAMENTO
  // Executa quando o componente é montado para confirmar se o pagamento foi processado
  useEffect(() => {
    async function verificarPagamento() {
      // Se não tem referência da compra, não pode verificar
      if (!externalReference) {
        setErro("Referência da compra não encontrada")
        setCarregando(false)
        return
      }

      try {
        // Faz requisição para verificar o status atual da compra no nosso sistema
        const res = await fetch(`/api/pagamentos/status/${externalReference}`)
        if (!res.ok) {
          throw new Error("Erro ao verificar status do pagamento")
        }

        const data = await res.json()

        // Se o pagamento ainda não foi confirmado, mostra aviso
        if (data.status !== "confirmado") {
          setErro("Pagamento ainda não confirmado. Aguarde alguns instantes e verifique seus ingressos.")
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)
        setErro("Erro ao verificar pagamento")
      } finally {
        setCarregando(false)
      }
    }

    verificarPagamento()
  }, [externalReference]) // Executa novamente se a referência mudar

  // RENDERIZAÇÃO CONDICIONAL - CARREGAMENTO
  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
        <p>Verificando pagamento...</p>
      </div>
    )
  }

  // RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            {/* Ícone de sucesso */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Título e mensagem de sucesso */}
            <h1 className="text-2xl font-bold mb-2">Pagamento Aprovado!</h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento foi processado com sucesso e seus ingressos já estão disponíveis.
            </p>

            {/* Exibe aviso se houver algum problema */}
            {erro && <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6">{erro}</div>}

            {/* Botões de ação */}
            <div className="space-y-4">
              {/* Botão para ver os ingressos */}
              <Link href="/perfil?tab=ingressos">
                <Button className="w-full bg-primary text-secondary hover:bg-primary/90 flex items-center justify-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  Ver Meus Ingressos
                </Button>
              </Link>

              {/* Botão para explorar mais eventos */}
              <Link href="/eventos">
                <Button variant="outline" className="w-full">
                  Explorar Mais Eventos
                </Button>
              </Link>
            </div>

            {/* Informações técnicas do pagamento */}
            <div className="mt-6 text-sm text-gray-500">
              <p>ID do Pagamento: {paymentId || "Não disponível"}</p>
              <p>Status: {status || "Aprovado"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
