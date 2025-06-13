// /api/carrinho/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ============================================================================
// DEFINIÇÃO DE TIPOS
// Ajuda o TypeScript a entender a estrutura dos dados do Supabase
// ============================================================================
interface TipoIngresso {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

interface ItemCarrinho {
  id: number;
  quantidade: number;
  preco_unitario: number | null;
  tipos_ingresso: TipoIngresso[] | null; // A versão correta com '[]'
}

// ============================================================================
// DEFINIÇÃO DE TIPOS (COM A CORREÇÃO)
// ============================================================================


// ============================================================================
// GET - Buscar itens do carrinho e calcular o total
// ============================================================================
export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { data: carrinho, error } = await supabase
      .from('itens_compra')
      .select(`
        id,
        quantidade,
        preco_unitario,
        tipos_ingresso:tipo_ingresso_id (
          id,
          nome,
          preco,
          estoque: quantidade 
        )
      `)
      .is('compra_id', null)
      .eq('usuario_id', session.user.id);

    if (error) {
      console.error('Erro ao buscar carrinho:', error);
      return NextResponse.json({ error: 'Erro ao buscar carrinho', details: error.message }, { status: 500 });
    }

    if (!carrinho || carrinho.length === 0) {
      return NextResponse.json({ 
        carrinho: [],
        total: 0
      });
    }

    const total = carrinho.reduce((acc: number, item: ItemCarrinho) => {
      // <-- CORREÇÃO 2: Acessar o primeiro item do array
      const preco = item.tipos_ingresso?.[0]?.preco || item.preco_unitario || 0;
      return acc + (item.quantidade * preco);
    }, 0);

    return NextResponse.json({ 
      carrinho,
      total
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
// ============================================================================
// POST - Adicionar item ao carrinho
// ============================================================================
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tipo_ingresso_id, quantidade = 1 } = body;

    if (!tipo_ingresso_id) {
      return NextResponse.json({ error: 'ID do tipo de ingresso é obrigatório' }, { status: 400 });
    }

    // Verificar se o tipo de ingresso existe
    const { data: tipoIngresso, error: tipoError } = await supabase
      .from('tipos_ingresso')
      .select('id, nome, preco, quantidade')
      .eq('id', tipo_ingresso_id)
      .single();

    if (tipoError || !tipoIngresso) {
      return NextResponse.json({ error: 'Tipo de ingresso não encontrado' }, { status: 404 });
    }

    // Verificar se já existe no carrinho
    const { data: itemExistente, error: existeError } = await supabase
      .from('itens_compra')
      .select('*')
      .eq('usuario_id', session.user.id)
      .eq('tipo_ingresso_id', tipo_ingresso_id)
      .is('compra_id', null)
      .single();

    if (existeError && existeError.code !== 'PGRST116') { // Ignora erro "nenhuma linha encontrada"
      console.error('Erro ao verificar item existente:', existeError);
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    let result;

    if (itemExistente) {
      // Atualizar quantidade se já existe
      const { data, error } = await supabase
        .from('itens_compra')
        .update({ 
          quantidade: itemExistente.quantidade + quantidade
        })
        .eq('id', itemExistente.id)
        .select();

      result = { data, error };
    } else {
      // Inserir novo item
      const { data, error } = await supabase
        .from('itens_compra')
        .insert([
          {
            usuario_id: session.user.id,
            tipo_ingresso_id,
            quantidade,
            preco_unitario: tipoIngresso.preco,
            compra_id: null // null significa que está no carrinho
          }
        ])
        .select();

      result = { data, error };
    }

    if (result.error) {
      console.error('Erro ao adicionar ao carrinho:', result.error);
      return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Item adicionado ao carrinho',
      data: result.data 
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Remover item do carrinho
// ============================================================================
export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 });
    }

    // Remover item do carrinho
    const { data, error } = await supabase
      .from('itens_compra')
      .delete()
      .eq('id', itemId)
      .eq('usuario_id', session.user.id)
      .is('compra_id', null)
      .select();

    if (error) {
      console.error('Erro ao remover item:', error);
      return NextResponse.json({ error: 'Erro ao remover item do carrinho' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado ou já removido' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Item removido com sucesso' 
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}