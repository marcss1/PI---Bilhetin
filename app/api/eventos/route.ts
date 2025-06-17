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
  console.log("API: Recebida requisição POST para /api/eventos")
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Obter usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 })
    }
    console.log("API: Usuário autenticado:", user.id)

    // 2. Obter dados do formulário
    const formData = await request.formData()

    const titulo = formData.get('titulo') as string
    const descricao = formData.get('descricao') as string
    const data = formData.get('data') as string
    const horaInicio = formData.get('horaInicio') as string
    const horaFim = formData.get('horaFim') as string
    const local = formData.get('local') as string
    const endereco = formData.get('endereco') as string
    const cidade = formData.get('cidade') as string
    const estado = formData.get('estado') as string
    const cep = formData.get('cep') as string
    const categoria = formData.get('categoria') as string
    const imagemFile = formData.get('imagem') as File | null
    const tiposIngressoString = formData.get('tiposIngresso') as string
    const tiposIngresso: TipoIngresso[] = JSON.parse(tiposIngressoString)

    let imageUrl: string | null = null

    // 3. Fazer upload da imagem para o Supabase Storage (se existir)
    if (imagemFile) {
      console.log("API: Imagem encontrada, iniciando upload...")
      console.log("API: Nome do arquivo:", imagemFile.name)
      console.log("API: Tamanho do arquivo:", imagemFile.size)
      
      // GERANDO UUID MANUALMENTE PARA DEBUG
      const uuid = crypto.randomUUID() // Alternativa nativa do Node.js
      const nomeArquivo = `${uuid}-${imagemFile.name}`
      
      console.log("API: Nome do arquivo gerado:", nomeArquivo)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imagens-eventos')
        .upload(nomeArquivo, imagemFile)

      if (uploadError) {
        console.error("Erro no upload para o Supabase Storage:", uploadError)
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`)
      }

      // 4. Obter a URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('imagens-eventos')
        .getPublicUrl(uploadData.path)

      imageUrl = publicUrlData.publicUrl
      console.log("API: Upload concluído. URL da imagem:", imageUrl)
    }

    // 5. Inserir o evento principal
    console.log("API: Inserindo evento no banco de dados...")
    const { data: eventoData, error: eventoError } = await supabase
      .from("eventos")
      .insert([{
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
        imagem: imageUrl,
        organizador_id: user.id,
      }])
      .select()
      .single()

    if (eventoError) {
      throw new Error(`Erro ao criar o evento: ${eventoError.message}`)
    }
    console.log("API: Evento inserido com sucesso, ID:", eventoData.id)

    const eventoId = eventoData.id

    // 6. Inserir os tipos de ingresso
    const tiposIngressoFormatados = tiposIngresso.map(tipo => ({
      ...tipo,
      evento_id: eventoId,
    }))
    console.log("API: Inserindo tipos de ingresso:", tiposIngressoFormatados)
    const { error: tiposError } = await supabase.from("tipos_ingresso").insert(tiposIngressoFormatados)

    if (tiposError) {
      await supabase.from("eventos").delete().eq("id", eventoId)
      throw new Error(`Erro ao criar ingressos: ${tiposError.message}`)
    }
    console.log("API: Ingressos inseridos com sucesso.")

    return NextResponse.json({ success: true, evento: eventoData })

  } catch (err: any) {
    console.error("ERRO CRÍTICO NA FUNÇÃO POST:", err)
    return NextResponse.json({ message: `Erro no servidor: ${err.message}` }, { status: 500 })
  }
}