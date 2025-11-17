// components/ui/StripeCheckoutForm.tsx

"use client";

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

// Interface para definir as propriedades que o componente espera
interface CheckoutFormProps {
  onBack: () => void; // Adicionamos uma função para voltar
}

// O formulário em si, agora mais limpo
export function StripeCheckoutForm({ onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // ATENÇÃO: Crie uma página de confirmação em /checkout/sucesso ou similar
        return_url: `${window.location.origin}/pagamento/sucesso`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "Ocorreu um erro com seu cartão.");
    } else {
      setMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" />
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit" 
        className="w-full bg-primary text-secondary p-3 rounded-md font-bold hover:bg-primary/90 disabled:bg-gray-400"
      >
        <span id="button-text">
          {isLoading ? "Processando..." : "Pagar Agora"}
        </span>
      </button>

      {/* Botão para voltar/cancelar */}
      <button 
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-600 hover:text-primary"
      >
        Voltar para o resumo
      </button>

      {message && <div id="payment-message" className="text-red-500 mt-2 text-center">{message}</div>}
    </form>
  );
}