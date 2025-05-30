// Importações necessárias do SDK do Mercado Pago
import { MercadoPagoConfig, Payment, Preference } from "mercadopago"

// Configuração principal do Mercado Pago
// O accessToken é obtido do painel de desenvolvedores do Mercado Pago
const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
})

// Cliente para criar preferências de pagamento (links de checkout)
export const preference = new Preference(mercadoPagoConfig)

// Cliente para consultar informações de pagamentos já processados
export const payment = new Payment(mercadoPagoConfig)

/**
 * Função para criar uma preferência de pagamento no Mercado Pago
 * Uma preferência é como um "carrinho de compras" que gera um link de checkout
 *
 * @param items - Array com os itens a serem pagos (ingressos)
 * @param payer - Dados do comprador (nome, email, CPF)
 * @param backUrls - URLs para onde o usuário será redirecionado após o pagamento
 * @param externalReference - ID da compra no nosso sistema (para identificar depois)
 * @returns Objeto com os dados da preferência criada
 */
export async function criarPreferenciaPagamento(
  items: Array<{
    title: string // Nome do produto/ingresso
    quantity: number // Quantidade
    unit_price: number // Preço unitário
    id?: string // ID opcional do item
    currency_id?: string // Moeda (BRL por padrão)
    description?: string // Descrição do item
    category_id?: string // Categoria do produto
  }>,
  payer: {
    name: string // Nome completo do comprador
    email: string // Email do comprador
    identification?: {
      type: string // Tipo do documento (CPF, CNPJ, etc.)
      number: string // Número do documento
    }
  },
  backUrls: {
    success: string // URL para pagamento aprovado
    failure: string // URL para pagamento rejeitado
    pending: string // URL para pagamento pendente
  },
  externalReference: string, // ID da nossa compra para rastreamento
) {
  try {
    // Dados da preferência que será enviada ao Mercado Pago
    const preferenceData = {
      items, // Itens do carrinho
      payer, // Dados do comprador
      back_urls: backUrls, // URLs de retorno
      external_reference: externalReference, // Referência externa (ID da nossa compra)
      auto_return: "approved", // Retorna automaticamente se aprovado
      statement_descriptor: "BILHETIN", // Nome que aparece na fatura do cartão
      expires: true, // A preferência expira
      expiration_date_from: new Date().toISOString(), // Data de início da validade
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Expira em 30 minutos
    }

    // Cria a preferência no Mercado Pago e retorna o resultado
    const result = await preference.create({ body: preferenceData })
    return result
  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error)
    throw error
  }
}

/**
 * Função para consultar os detalhes de um pagamento específico
 * Usada principalmente no webhook para verificar o status atual
 *
 * @param paymentId - ID do pagamento no Mercado Pago
 * @returns Dados completos do pagamento
 */
export async function consultarPagamento(paymentId: string) {
  try {
    // Busca os dados do pagamento no Mercado Pago
    const result = await payment.get({ id: paymentId })
    return result
  } catch (error) {
    console.error("Erro ao consultar pagamento:", error)
    throw error
  }
}
