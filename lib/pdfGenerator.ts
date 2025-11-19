// lib/pdfGenerator.ts - AGORA USANDO IMPORTAÇÃO PADRÃO

import * as QRCode from 'qrcode';
import { Buffer } from 'buffer';

// Usando require para garantir a compatibilidade Node.js
const htmlToPdf = require('html-pdf-node'); 

// MUDANÇA AQUI: Importa a função sem chaves, pois ela é a 'default'
import generateTicketHtml from './ticketTemplate'; 

interface TicketData {
    clientName: string;
    eventName: string;
    dateTime: string;
    sector: string;
    uniqueCode: string;
}

export async function generateTicketPDF(ticketData: TicketData): Promise<Buffer> {
    
    // 1. Gera o QR Code como um Data URL (Base64)
    const qrCodeDataUrl = await QRCode.toDataURL(ticketData.uniqueCode, {
        errorCorrectionLevel: 'H', 
        type: 'image/png',
        margin: 1,
    });
    
    // 2. Gera a string HTML completa, injetando os dados e o QR Code
    // FUNÇÃO CHAMADA DIRETAMENTE APÓS A IMPORTAÇÃO DEFAULT
    const htmlContent = generateTicketHtml({
        ...ticketData,
        qrCodeDataUrl: qrCodeDataUrl,
    });
    
    // 3. Configura a conversão para PDF
    const file = [{ content: htmlContent }];
    
    // Opções de renderização do PDF
    const options = { 
        format: 'A6', 
        preferCSSPageSize: true, 
        printBackground: true,
    };

    // 4. Converte HTML para PDF Buffer
    const pdfBuffer = await htmlToPdf.generatePdf(file, options) as Buffer;

    return pdfBuffer;
}