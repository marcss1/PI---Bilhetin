// app/api/gerar-ingressos/route.ts - PRONTO PARA COLAR

import { NextResponse } from 'next/server';
import { generateTicketPDF } from '@/lib/pdfGenerator';
// MUDANÇA: Importa a função como 'default' (sem chaves {})
import sendTicketEmail from '@/lib/mailService'; 
import { Buffer } from 'buffer'; 

export async function POST(request: Request) {
    
    // Os dados viriam do corpo da requisição após a confirmação do pagamento
    const { clientEmail, ticketData, transactionId } = await request.json(); 

    // O código único
    const uniqueTicketCode = `TICKET-${transactionId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const dataParaPDF = {
        ...ticketData,
        uniqueCode: uniqueTicketCode,
    };

    try {
        // 1. GERAR o PDF (Buffer) - AGORA USANDO A FUNÇÃO REAL
        const pdfBuffer = await generateTicketPDF(dataParaPDF); 

        // 2. ENVIAR o E-MAIL com o Buffer anexado
        await sendTicketEmail(clientEmail, pdfBuffer, transactionId);

        return NextResponse.json({ 
            message: 'Ingresso gerado e enviado com sucesso.', 
            uniqueCode: uniqueTicketCode 
        }, { status: 200 });
        
    } catch (error) {
        console.error("Erro completo no Route Handler:", error);
        return NextResponse.json({ 
            message: 'Erro ao processar o ingresso. Verifique logs.',
            error: (error as Error).message
        }, { status: 500 });
    }
}