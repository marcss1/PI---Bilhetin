{/*import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { formatarData } from "@/lib/utils"

// --- ADICIONADO: Interfaces para tipagem dos dados ---
// Define a estrutura de um único tipo de ingresso.
interface TipoIngresso {
  nome: string;
  preco: number;
  quantidade: number;
}

// Define a estrutura do objeto de evento que vem do Supabase.
interface EventoSupabase {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // Vem como string ISO do Supabase
  hora_inicio: string;
  hora_fim: string;
  local: string;
  endereco: string;
  cidade: string;
  estado: string;
  categoria: string;
  imagem: string;
  organizador: { nome: string } | null;
  tiposIngresso: TipoIngresso[];
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extrair parâmetros de busca
    const busca = searchParams.get("busca")
    const categoria = searchParams.get("categoria")
    const cidade = searchParams.get("cidade")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const precoMin = searchParams.get("precoMin")
    const precoMax = searchParams.get("precoMax")
    const ordenacao = searchParams.get("ordenacao") || "data"

    // Construir query base
    let query = supabase.from("eventos").select(`
        *,
        tiposIngresso:tipos_ingresso(*),
        organizador:usuarios!organizador_id(nome)
      `)

    // Aplicar filtros de busca por texto
    if (busca) {
      query = query.or(`titulo.ilike.%${busca}%,descricao.ilike.%${busca}%,local.ilike.%${busca}%`)
    }

    // Aplicar filtro por categoria
    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    // Aplicar filtro por cidade
    if (cidade) {
      const cidadeNome = cidade.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
      query = query.ilike("cidade", `%${cidadeNome}%`)
    }

    // Aplicar filtro por período
    if (dataInicio) {
      query = query.gte("data", new Date(dataInicio).toISOString())
    }
    if (dataFim) {
      query = query.lte("data", new Date(dataFim).toISOString())
    }

    // Aplicar ordenação
    switch (ordenacao) {
      case "data":
        query = query.order("data", { ascending: true })
        break
      case "data-desc":
        query = query.order("data", { ascending: false })
        break
      case "nome":
        query = query.order("titulo", { ascending: true })
        break
      case "nome-desc":
        query = query.order("titulo", { ascending: false })
        break
      default:
        query = query.order("data", { ascending: true })
    }

    // --- ALTERADO: Aplica a tipagem ao executar a query ---
    const { data: eventos, error } = await query.returns<EventoSupabase[]>()

    if (error) {
      throw error
    }

    // --- CORRIGIDO: O erro em 'tipo' foi resolvido ---
    // TypeScript agora sabe que 'evento' é do tipo 'EventoSupabase',
    // então ele infere que 'tipo' é do tipo 'TipoIngresso'.
    let eventosFormatados = eventos.map((evento) => {
      const precos = evento.tiposIngresso.map((tipo) => tipo.preco)
      const precoMinimo = precos.length > 0 ? Math.min(...precos) : 0
      const precoMaximo = precos.length > 0 ? Math.max(...precos) : 0

      return {
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: formatarData(new Date(evento.data)),
        horario: `${evento.hora_inicio} - ${evento.hora_fim}`,
        local: evento.local,
        endereco: evento.endereco,
        cidade: evento.cidade,
        estado: evento.estado,
        categoria: evento.categoria,
        imagem: evento.imagem,
        organizador: evento.organizador?.nome || "Organizador",
        preco: {
          inteira: evento.tiposIngresso.find((tipo) => tipo.nome === "Inteira")?.preco || 0,
          meia: evento.tiposIngresso.find((tipo) => tipo.nome === "Meia-entrada")?.preco || 0,
          vip: evento.tiposIngresso.find((tipo) => tipo.nome === "VIP")?.preco || 0,
        },
        precoMinimo,
        precoMaximo,
        ingressosDisponiveis: evento.tiposIngresso.reduce((total, tipo) => total + tipo.quantidade, 0),
      }
    })

    // Aplicar filtro por faixa de preço
    if (precoMin || precoMax) {
      eventosFormatados = eventosFormatados.filter((evento) => {
        const min = precoMin ? Number.parseFloat(precoMin) : 0
        const max = precoMax ? Number.parseFloat(precoMax) : Number.POSITIVE_INFINITY
        return evento.precoMinimo >= min && evento.precoMaximo <= max
      })
    }

    // Aplicar ordenação por preço (se necessário)
    if (ordenacao === "preco") {
      eventosFormatados.sort((a, b) => a.precoMinimo - b.precoMinimo)
    } else if (ordenacao === "preco-desc") {
      eventosFormatados.sort((a, b) => b.precoMinimo - a.precoMinimo)
    }

    return NextResponse.json({ success: true, eventos: eventosFormatados })
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar eventos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      titulo,
      descricao,
      data,
      horaInicio,
      horaFim,
      local,
      endereco,
      cidade,
      estado,
      cep,
      categoria,
      imagem,
      informacoesAdicionais,
      // --- ALTERADO: Tipagem explícita para os tipos de ingresso ---
      tiposIngresso,
      organizadorId,
    }: { tiposIngresso: TipoIngresso[] } & Record<string, any> = body // Adiciona tipagem

    // Inserir evento no Supabase
    const { data: eventoData, error: eventoError } = await supabase
      .from("eventos")
      .insert([
        {
          titulo,
          descricao,
          data: new Date(data).toISOString(),
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          local,
          endereco,
          cidade,
          estado,
          cep,
          categoria,
          imagem,
          informacoes_adicionais: informacoesAdicionais,
          organizador_id: organizadorId,
        },
      ])
      .select()
      .single() // Usar .single() se você espera apenas um resultado

    if (eventoError || !eventoData) {
      throw eventoError || new Error("Erro ao criar evento")
    }

    const eventoId = eventoData.id

    // Inserir tipos de ingresso
    // --- CORRIGIDO: Não é mais necessário usar 'any' ---
    const tiposIngressoFormatados = tiposIngresso.map((tipo) => ({
      nome: tipo.nome,
      preco: tipo.preco,
      quantidade: tipo.quantidade,
      evento_id: eventoId,
    }))

    const { error: tiposError } = await supabase.from("tipos_ingresso").insert(tiposIngressoFormatados)

    if (tiposError) {
      // Opcional: deletar o evento criado se a inserção de ingressos falhar
      await supabase.from("eventos").delete().eq("id", eventoId)
      throw tiposError
    }

    return NextResponse.json({ success: true, evento: eventoData })
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar evento" }, { status: 500 })
  }
}*/}

// ARQUIVO: app/api/eventos/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// --- Interfaces ---
interface TipoIngresso {
  nome: string;
  preco: number;
  quantidade: number;
}

// --- Função GET (Simplificada e Corrigida) ---
// Responde a requisições para buscar a lista de eventos
// --- Interfaces ---
// Interface para descrever EXATAMENTE como os dados vêm do Supabase
interface EventoFromSupabase {
  id: string;
  titulo: string;
  data: string;
  cidade: string | null;
  local: string | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  categoria: string | null;
  imagem: string | null;
  tipos_ingresso: {
    preco: number;
  }[];
}

// --- Função GET (Com Tipagem Corrigida) ---
export async function GET(request: Request) {
  console.log("API: Recebida requisição GET para /api/events");
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // A sua busca no Supabase continua a mesma
    const { data: eventos, error } = await supabase
      .from("eventos")
      .select(`
        id, titulo, data, cidade, local, hora_inicio, hora_fim, categoria, imagem,
        tipos_ingresso ( preco )
      `)
      .order("data", { ascending: true });

    if (error) {
      console.error("Erro no Supabase (GET):", error);
      throw new Error(error.message);
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // Avisamos ao TypeScript que cada 'evento' terá a estrutura de 'EventoFromSupabase'
    const eventosFormatados = (eventos as EventoFromSupabase[]).map(evento => {
      const precos = evento.tipos_ingresso?.map(t => t.preco) || [];
      const precoMinimo = precos.length > 0 ? Math.min(...precos) : 0;
      
      const dataFormatada = new Date(evento.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: 'UTC',
      });

      // A lógica para criar a string de horário agora não dará mais erro
      const horario = (evento.hora_inicio && evento.hora_fim) 
        ? `${evento.hora_inicio.slice(0, 5)} - ${evento.hora_fim.slice(0, 5)}`
        : "Horário a definir";

      return {
        id: evento.id,
        titulo: evento.titulo,
        imagem: evento.imagem,
        categoria: evento.categoria,
        cidade: evento.cidade,
        local: evento.local,
        data: dataFormatada,
        horario: horario,
        precoMinimo: precoMinimo
      };
    });

    console.log("API: Eventos buscados e formatados com sucesso.");
    return NextResponse.json({ success: true, eventos: eventosFormatados });

  } catch (err: any) {
    console.error("ERRO CRÍTICO NA FUNÇÃO GET:", err);
    return NextResponse.json(
      { success: false, message: `Erro no servidor: ${err.message}` },
      { status: 500 }
    );
  }
}

// --- Função POST (Com Mais Logs) ---
// Responde a requisições para criar um novo evento
export async function POST(request: Request) {
  console.log("API: Recebida requisição POST para /api/events");
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Obter usuário de forma segura
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Erro de autenticação:", userError);
      return NextResponse.json({ success: false, message: "Acesso não autorizado." }, { status: 401 });
    }
    console.log("API: Usuário autenticado:", user.id);

    // 2. Obter dados do corpo da requisição
    const body = await request.json();
    console.log("API: Corpo da requisição recebido:", body);
    
    const {
      // ... extraia todos os seus campos do body
      titulo, descricao, data, horaInicio, horaFim, local, endereco, cidade, estado, cep, categoria, imagem, informacoesAdicionais, tiposIngresso
    }: { tiposIngresso: TipoIngresso[] } & Record<string, any> = body;
    
    // 3. Inserir o evento principal
    console.log("API: Inserindo evento no banco de dados...");
    const { data: eventoData, error: eventoError } = await supabase
      .from("eventos")
      .insert([{
        // ... todos os campos para inserir
        titulo, descricao, data: new Date(data).toISOString(), hora_inicio: horaInicio, hora_fim: horaFim, local, endereco, cidade, estado, cep, categoria, imagem, informacoes_adicionais: informacoesAdicionais,
        organizador_id: user.id,
      }])
      .select()
      .single();

    if (eventoError) {
      console.error("Erro do Supabase ao inserir evento:", eventoError);
      throw new Error(`Erro ao criar o registro do evento: ${eventoError.message}`);
    }
    console.log("API: Evento inserido com sucesso, ID:", eventoData.id);

    const eventoId = eventoData.id;

    // 4. Inserir os tipos de ingresso
    const tiposIngressoFormatados = tiposIngresso.map(tipo => ({
      nome: tipo.nome,
      preco: tipo.preco,
      quantidade: tipo.quantidade,
      evento_id: eventoId,
    }));

    console.log("API: Inserindo tipos de ingresso:", tiposIngressoFormatados);
    const { error: tiposError } = await supabase.from("tipos_ingresso").insert(tiposIngressoFormatados);

    if (tiposError) {
      console.error("Erro do Supabase ao inserir ingressos:", tiposError);
      // Rollback: deleta o evento criado se a inserção de ingressos falhar
      await supabase.from("eventos").delete().eq("id", eventoId);
      console.log("API: Rollback do evento", eventoId);
      throw new Error(`Erro ao criar os ingressos: ${tiposError.message}`);
    }
    console.log("API: Ingressos inseridos com sucesso.");

    return NextResponse.json({ success: true, evento: eventoData });

  } catch (err: any) {
    console.error("ERRO CRÍTICO NA FUNÇÃO POST:", err);
    return NextResponse.json(
      { success: false, message: `Erro no servidor: ${err.message}` },
      { status: 500 }
    );
  }
}