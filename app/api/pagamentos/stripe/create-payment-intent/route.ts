// app/api/pagamentos/stripe/create-payment-intent/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 1. Inicializa o Stripe com sua CHAVE SECRETA.
// O '!' no final diz ao TypeScript: "Eu garanto que esta variável de ambiente existe".
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 2. Exporta uma função POST, que é o padrão para Route Handlers no Next.js
export async function POST(req: Request) {
    try {
        // 3. Pega o corpo da requisição (que o frontend enviará) e extrai o valor
        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
        }

        // 4. Usa o SDK do Stripe para criar uma "Intenção de Pagamento"
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // IMPORTANTE: Stripe sempre trabalha com centavos!
            currency: 'brl',      // Moeda: Real Brasileiro
            automatic_payment_methods: {
                enabled: true, // Permite que o Stripe mostre os melhores métodos (cartão, etc)
            },
        });

        // 5. Retorna o 'client_secret' para o frontend. Este é o segredo que
        // autoriza o formulário do Stripe a finalizar este pagamento específico.
        return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        // Em caso de erro, retorna uma mensagem clara.
        console.error("ERRO NA API DO STRIPE:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}