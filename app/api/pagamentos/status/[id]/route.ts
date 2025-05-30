// Importações para verificar status de pagamento
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { supabase } from "@/lib/supabase"

// Chave secreta para verificar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

/**
 * API Route para verificar o status de um pagamento específico
 * Usada nas páginas de retorno para confirmar se o pagamento foi processado
 *
 * @param params.id - ID da compra para verificar
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // 1. VERIFICAÇÃO DE AUTENTICAÇÃO
    // Obtém e verifica o token de autenticação
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    // Decodifica o token para obter o ID do usuário
    const decoded = verify(token, JWT_SECRET) as { id: string }

    // 2. BUSCAR COMPRA NO BANCO DE DADOS
    // Busca a compra pelo ID, garantindo que pertence ao usuário logado
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("id", params.id) // ID da compra
      .eq("usuario_id", decoded.id) // Só compras do usuário logado
      .single()

    // Se compra não encontrada, retorna erro
    if (compraError || !compra) {
      return NextResponse.json({ success: false, message: "Compra não encontrada" }, { status: 404 })
    }

    // 3. RETORNAR STATUS DA COMPRA
    // Retorna informações sobre o status atual do pagamento
    return NextResponse.json({
      success: true,
      status: compra.status, // Status da compra no nosso sistema
      pagamentoStatus: compra.pagamento_status, // Status original do Mercado Pago
      pagamentoMetodo: compra.pagamento_metodo, // Método de pagamento usado
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json({ success: false, message: "Erro ao verificar status do pagamento" }, { status: 500 })
  }
}
