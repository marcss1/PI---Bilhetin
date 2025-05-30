// Importações dos ícones para os métodos de pagamento
import { CreditCard, Landmark, Wallet, Smartphone } from "lucide-react"

/**
 * Componente que exibe os métodos de pagamento aceitos
 * Usado no carrinho para informar ao usuário quais formas de pagamento estão disponíveis
 */
export function MetodosPagamento() {
  return (
    <div className="mt-6">
      {/* Título da seção */}
      <h3 className="text-sm font-medium mb-3">Métodos de pagamento aceitos</h3>

      {/* Lista de métodos de pagamento */}
      <div className="flex flex-wrap gap-2">
        {/* Cartão de Crédito */}
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
          <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-xs">Cartão de Crédito</span>
        </div>

        {/* Boleto Bancário */}
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
          <Landmark className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-xs">Boleto</span>
        </div>

        {/* Saldo do Mercado Pago */}
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
          <Wallet className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-xs">Saldo MP</span>
        </div>

        {/* PIX */}
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
          <Smartphone className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-xs">Pix</span>
        </div>
      </div>

      {/* Logo do Mercado Pago para transmitir confiança */}
      <div className="mt-4 flex justify-center">
        <img src="/placeholder.svg?height=30&width=200" alt="Pagamento seguro por Mercado Pago" className="h-8" />
      </div>
    </div>
  )
}
