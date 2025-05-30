"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle, ShoppingCart } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function PagamentoFalhaPage() {
  const searchParams = useSearchParams()

  // Obter parâmetros da URL
  const paymentId = searchParams.get("payment_id")
  const status = searchParams.get("status")
  const externalReference = searchParams.get("external_reference")

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Pagamento Não Aprovado</h1>
            <p className="text-gray-600 mb-6">
              Infelizmente, seu pagamento não foi aprovado. Por favor, tente novamente com outro método de pagamento.
            </p>

            <div className="space-y-4">
              <Link href="/carrinho">
                <Button className="w-full bg-primary text-secondary hover:bg-primary/90 flex items-center justify-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Voltar ao Carrinho
                </Button>
              </Link>

              <Link href="/eventos">
                <Button variant="outline" className="w-full">
                  Explorar Eventos
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>ID do Pagamento: {paymentId || "Não disponível"}</p>
              <p>Status: {status || "Rejeitado"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
