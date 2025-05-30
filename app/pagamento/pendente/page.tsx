"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, User } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function PagamentoPendentePage() {
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
              <div className="bg-yellow-100 p-4 rounded-full">
                <Clock className="h-16 w-16 text-yellow-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Pagamento em Processamento</h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento está sendo processado. Assim que for confirmado, seus ingressos estarão disponíveis na sua
              conta.
            </p>

            <div className="space-y-4">
              <Link href="/perfil?tab=ingressos">
                <Button className="w-full bg-primary text-secondary hover:bg-primary/90 flex items-center justify-center">
                  <User className="mr-2 h-4 w-4" />
                  Ir para Meu Perfil
                </Button>
              </Link>

              <Link href="/eventos">
                <Button variant="outline" className="w-full">
                  Explorar Mais Eventos
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>ID do Pagamento: {paymentId || "Não disponível"}</p>
              <p>Status: {status || "Pendente"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
