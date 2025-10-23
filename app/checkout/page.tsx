// app/checkout/page.tsx
import StripeCheckout from '@/components/StripeCheckoutForm'; // Ajuste o caminho se necessário

export default function CheckoutPage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-center">Finalizar Compra</h1>
          <p className="text-center text-gray-600">Ingresso para o Evento X</p>
        </div>
        <div className="border-t pt-4">
          {/* Aqui está o seu componente de pagamento! */}
          <StripeCheckout />
        </div>
      </div>
    </main>
  );
}