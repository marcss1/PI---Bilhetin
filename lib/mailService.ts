// lib/mailService.ts - PRONTO PARA COLAR

import * as nodemailer from 'nodemailer';
import { Buffer } from 'buffer'; 
// Importar as variáveis de ambiente é implícito no Next.js

// Configure o transporter (MailerSend SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net', 
    port: 587,
    secure: false, // TLS
    auth: {
        // MailerSend usa a API Key como a senha SMTP
        user: process.env.EMAIL_SENDER, // O endereço de e-mail que você usa
        pass: process.env.MAILERSEND_API_KEY, // A chave de API que você gerou
    },
});

/**
 * Envia o ingresso em PDF para o cliente.
 * Exportado como função normal e, em seguida, como 'default' (abaixo).
 */
async function sendTicketEmail(clientEmail: string, pdfBuffer: Buffer, ticketId: string): Promise<void> {
    
    if (!process.env.MAILERSEND_API_KEY || !process.env.EMAIL_SENDER) {
        throw new Error('As variáveis de ambiente do MailerSend não estão configuradas.');
    }

    const mailOptions = {
        from: `Sua Empresa <${process.env.EMAIL_SENDER}>`, 
        to: clientEmail,
        subject: `🎉 Seu Ingresso Oficial - Compra #${ticketId}`,
        html: `
            <h1>Obrigado por sua compra!</h1>
            <p>Seu ingresso oficial para o evento está anexado a este e-mail.</p>
            <p>Atenciosamente,<br>Equipe de Ingressos.</p>
        `,
        attachments: [
            {
                filename: `ingresso-${ticketId}.pdf`,
                content: pdfBuffer, 
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de ingresso enviado com sucesso para: ${clientEmail}`);
    } catch (error) {
        console.error('ERRO ao enviar e-mail com o Nodemailer/MailerSend:', error);
        throw new Error('Falha no envio do e-mail.');
    }
}

// Exportação Padrão (RESOLVE O ERRO 'is not a function')
export default sendTicketEmail;