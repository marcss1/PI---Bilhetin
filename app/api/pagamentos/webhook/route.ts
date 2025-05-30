// Importações para processar webhooks do Mercado Pago
import { NextResponse } from "next/server"
import { consultarPagamento } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"

/**
 * Webhook do Mercado Pago
 * Esta rota é chamada automaticamente pelo Mercado Pago quando há mudanças no status de um pagamento
 * É essencial para manter nosso sistema sincronizado com os pagamentos
 */
export async function POST(request: Request) {
  try {
    // 1. RECEBER DADOS DO WEBHOOK
    // O Mercado Pago envia informações sobre o que aconteceu
    const body = await request.json()

    // 2. VERIFICAR SE É NOTIFICAÇÃO DE PAGAMENTO
    // Só processamos notificações relacionadas a pagamentos
    if (body.action === "payment.created" || body.action === "payment.updated") {
      // Obtém o ID do pagamento da notificação
      const paymentId = body.data.id

      // 3. CONSULTAR DETALHES DO PAGAMENTO
      // Busca informações completas do pagamento no Mercado Pago
      const paymentData = await consultarPagamento(paymentId)

      // Se não encontrou o pagamento, retorna erro
      if (!paymentData) {
        return NextResponse.json({ success: false, message: "Pagamento não encontrado" }, { status: 404 })
      }

      // 4. OBTER REFERÊNCIA DA COMPRA
      // A referência externa é o ID da nossa compra
      const compraId = paymentData.external_reference

      // Se não tem referência, não conseguimos identificar a compra
      if (!compraId) {
        return NextResponse.json({ success: false, message: "Referência externa não encontrada" }, { status: 400 })
      }

      // 5. MAPEAR STATUS DO PAGAMENTO
      // Converte o status do Mercado Pago para nosso sistema
      let novoStatus = "aguardando_pagamento"

      switch (paymentData.status) {
        case "approved": // Pagamento aprovado
          novoStatus = "confirmado"
          break
        case "rejected": // Pagamento rejeitado
          novoStatus = "cancelado"
          break
        case "in_process": // Pagamento em processamento
        case "pending": // Pagamento pendente
          novoStatus = "aguardando_pagamento"
          break
        default: // Outros status
          novoStatus = "aguardando_pagamento"
      }

      // 6. ATUALIZAR COMPRA NO BANCO DE DADOS
      // Salva todas as informações do pagamento na nossa base
      const { error: updateError } = await supabase
        .from("compras")
        .update({
          status: novoStatus, // Novo status da compra
          pagamento_id: paymentId, // ID do pagamento no Mercado Pago
          pagamento_status: paymentData.status, // Status original do Mercado Pago
          pagamento_metodo: paymentData.payment_method_id, // Método de pagamento usado
          pagamento_detalhes: paymentData, // Dados completos do pagamento (JSON)
        })
        .eq("id", compraId)

      // Se erro ao atualizar, lança exceção
      if (updateError) {
        throw updateError
      }

      // 7. PROCESSAR PAGAMENTO APROVADO
      // Se o pagamento foi confirmado, precisamos atualizar o estoque
      if (novoStatus === "confirmado") {
        // Busca todos os itens da compra
        const { data: itens, error: itensError } = await supabase
          .from("itens_compra")
          .select(`
            *,
            tipoIngresso:tipos_ingresso(*)
          `)
          .eq("compra_id", compraId)

        if (itensError) {
          throw itensError
        }

        // 8. ATUALIZAR ESTOQUE DE INGRESSOS
        // Para cada item comprado, reduz a quantidade disponível
        for (const item of itens || []) {
          const { error: updateError } = await supabase
            .from("tipos_ingresso")
            .update({
              // Subtrai a quantidade comprada do estoque disponível
              quantidade: item.tipoIngresso.quantidade - item.quantidade,
            })
            .eq("id", item.tipo_ingresso_id)

          if (updateError) {
            throw updateError
          }
        }
      }

      // 9. CONFIRMAR PROCESSAMENTO
      return NextResponse.json({ success: true })
    }

    // Se não é uma notificação de pagamento, apenas confirma o recebimento
    return NextResponse.json({ success: true, message: "Evento não processado" })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ success: false, message: "Erro ao processar webhook" }, { status: 500 })
  }
}
