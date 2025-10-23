// components/StripeCheckoutForm.tsx

"use client"; // ESSENCIAL: Isso marca o componente para rodar no navegador.

import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// 1. Carrega a instância do Stripe com sua chave PÚBLICA.
// Fazemos isso fora do componente para evitar que seja recarregado a cada renderização.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Subcomponente: O Formulário de Pagamento Real ---
// Este componente só funciona se estiver dentro de um <Elements> provider.
function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Não faz nada se o Stripe ou o Elements não tiverem carregado ainda.
        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // 4. Confirma o pagamento. O Stripe usa o clientSecret (que está no <Elements>)
        // para finalizar a transação com os dados inseridos pelo usuário.
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // URL para onde o usuário será redirecionado após o pagamento.
                return_url: `${window.location.origin}/pagamento-concluido`,
            },
        });

        // Este código só roda se houver um erro imediato (ex: cartão inválido).
        // Se for sucesso, o usuário será redirecionado antes de chegar aqui.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Ocorreu um erro com seu cartão.");
        } else {
            setMessage("Ocorreu um erro inesperado.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full bg-blue-600 text-white p-3 rounded-md mt-4 font-bold hover:bg-blue-700 disabled:bg-gray-400">
                <span id="button-text">
                    {isLoading ? "Processando..." : "Pagar Agora"}
                </span>
            </button>
            {message && <div id="payment-message" className="text-red-500 mt-2 text-center">{message}</div>}
        </form>
    );
}

// --- Componente Principal que você vai importar em suas páginas ---
export default function StripeCheckout() {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // 2. Assim que o componente é montado, ele chama a sua API de backend.
        fetch('/api/pagamentos/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 50 }), // Exemplo: Ingresso de R$ 50,00. Mude para o valor real.
        })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret)); // Armazena o segredo recebido.
    }, []);

    // 3. O <Elements> é o "container" do Stripe. Ele precisa do stripePromise e do
    // clientSecret para saber como renderizar o formulário de pagamento.
    return (
        <div>
            {clientSecret && (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            )}
        </div>
    );
}