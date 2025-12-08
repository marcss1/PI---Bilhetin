import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { verify } from "jsonwebtoken";

// Use a mesma chave definida no seu actions.ts ou .env
const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // 1. TENTATIVA DE IDENTIFICAÇÃO (Focada no seu Token Personalizado)
    const tokenCookie = cookieStore.get("auth_token");
    const token = tokenCookie?.value;

    let usuarioId: string | null = null;
    let usuarioEmail: string = "cliente@email.com";

    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as { id: string; email: string };
        usuarioId = decoded.id;
        usuarioEmail = decoded.email;
        console.log(`✅ Usuário identificado via Token: ${usuarioEmail}`);
      } catch (e) {
        console.log("⚠️ Token inválido ou expirado.");
      }
    }

    if (!usuarioId) {
      // Se não achou token, tenta ver se tem sessão do Supabase (Fallback)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Tenta pegar o user do header Authorization se existir (caso o frontend mande)
      // Mas no seu caso, vamos retornar erro pedindo login
      return NextResponse.json({ success: false, message: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    // 2. BUSCA NO BANCO (Modo Admin)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Busca a ÚLTIMA compra criada por este usuário
    const { data: compra } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!compra) {
      return NextResponse.json({ success: false, message: "Carrinho não encontrado. Adicione itens novamente." }, { status: 400 });
    }

    // Validação de Status (Aceita Pendente, Carrinho ou Aberto)
    const status = compra.status?.toLowerCase() || "";
    if (status !== "pendente" && status !== "carrinho" && status !== "aberto") {
      // Se já estiver pago, avisa
      if (status === "confirmado" || status === "pago") {
         return NextResponse.json({ success: false, message: "Esta compra já foi paga." }, { status: 400 });
      }
    }

    // 3. BUSCA ITENS
    const { data: itens } = await supabaseAdmin
      .from("itens_compra")
      .select(`
        quantidade,
        tipoIngresso:tipos_ingresso (
          id, nome, preco, eventos (titulo)
        )
      `)
      .eq("compra_id", compra.id);

    if (!itens || itens.length === 0) {
      return NextResponse.json({ success: false, message: "Carrinho vazio (sem itens)" }, { status: 400 });
    }

    // 4. PREPARA STRIPE
    const line_items = itens.map((item: any) => {
      const unitAmount = Math.round(Number(item.tipoIngresso.preco) * 100);
      if (!unitAmount || unitAmount < 50) return null;
      
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${item.tipoIngresso.eventos?.titulo || 'Evento'} - ${item.tipoIngresso.nome}`,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantidade,
      };
    }).filter((i: any) => i !== null);

    if (line_items.length === 0) {
      return NextResponse.json({ success: false, message: "Valor total inválido" }, { status: 400 });
    }

    // 5. CRIA CHECKOUT
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: line_items as any,
      mode: "payment",
      success_url: `${baseUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrinho`,
      metadata: { compraId: compra.id, usuarioId: usuarioId },
      customer_email: usuarioEmail,
    });

    return NextResponse.json({ success: true, initPoint: checkoutSession.url });

  } catch (error: any) {
    console.error("🔥 Erro Route:", error);
    return NextResponse.json({ success: false, message: "Erro interno no servidor" }, { status: 500 });
  }
}