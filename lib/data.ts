import { supabase } from "./supabase"
import { formatarData } from "./utils"

// Funções para Eventos
export async function getEventos(categoria?: string) {
  try {
    // Construir a query base
    let query = supabase
      .from("eventos")
      .select(`
        *,
        tiposIngresso:tipos_ingresso(*),
        organizador:usuarios!organizador_id(nome)
      `)
      .order("data", { ascending: true })

    // Adicionar filtro por categoria se fornecido
    if (categoria) {
      query = query.eq("categoria", categoria)
    }

    // Executar a query
    const { data: eventos, error } = await query

    if (error) {
      throw error
    }

    // Formatar os dados para o formato esperado pelo frontend
    return eventos.map((evento) => ({
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
      ingressosDisponiveis: evento.tiposIngresso.reduce((total, tipo) => total + tipo.quantidade, 0),
    }))
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return []
  }
}

export async function getEventoPorId(id: string) {
  try {
    const { data: evento, error } = await supabase
      .from("eventos")
      .select(`
        *,
        tiposIngresso:tipos_ingresso(*),
        organizador:usuarios!organizador_id(nome)
      `)
      .eq("id", id)
      .single()

    if (error || !evento) return null

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
      ingressosDisponiveis: evento.tiposIngresso.reduce((total, tipo) => total + tipo.quantidade, 0),
      informacoesAdicionais: evento.informacoes_adicionais
        ? evento.informacoes_adicionais.split("\n")
        : ["Proibida a entrada de bebidas e alimentos", "Permitida a entrada de água em garrafas transparentes"],
      tiposIngresso: evento.tiposIngresso.map((tipo) => ({
        id: tipo.id,
        nome: tipo.nome,
        preco: tipo.preco,
        quantidade: tipo.quantidade,
      })),
    }
  } catch (error) {
    console.error("Erro ao buscar evento por ID:", error)
    return null
  }
}

// Funções para Usuários
export async function getUsuarioPorEmail(email: string) {
  try {
    const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error)
    return null
  }
}

export async function getIngressosDoUsuario(usuarioId: string) {
  try {
    // Buscar compras confirmadas do usuário
    const { data: compras, error: comprasError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("status", "confirmado")

    if (comprasError) throw comprasError

    if (!compras || compras.length === 0) {
      return []
    }

    // Buscar itens das compras
    const compraIds = compras.map((compra) => compra.id)

    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        compra:compras(*),
        tipoIngresso:tipos_ingresso(
          *,
          evento:eventos(*)
        )
      `)
      .in("compra_id", compraIds)

    if (itensError) throw itensError

    return itens.map((item) => ({
      id: item.id,
      evento: {
        id: item.tipoIngresso.evento.id,
        titulo: item.tipoIngresso.evento.titulo,
        data: formatarData(new Date(item.tipoIngresso.evento.data)),
        local: item.tipoIngresso.evento.local,
        horario: `${item.tipoIngresso.evento.hora_inicio} - ${item.tipoIngresso.evento.hora_fim}`,
        imagem: item.tipoIngresso.evento.imagem,
      },
      tipo: item.tipoIngresso.nome,
      quantidade: item.quantidade,
      codigo: item.codigo,
      status: item.compra.status,
    }))
  } catch (error) {
    console.error("Erro ao buscar ingressos do usuário:", error)
    return []
  }
}

// Funções para o carrinho
export async function getCarrinhoDoUsuario(usuarioId: string) {
  try {
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("status", "pendente")
      .single()

    if (compraError) return []

    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(
          *,
          evento:eventos(*)
        )
      `)
      .eq("compra_id", compra.id)

    if (itensError) throw itensError

    return itens.map((item) => ({
      id: item.id,
      evento: {
        id: item.tipoIngresso.evento.id,
        titulo: item.tipoIngresso.evento.titulo,
        data: formatarData(new Date(item.tipoIngresso.evento.data)),
        local: item.tipoIngresso.evento.local,
        imagem: item.tipoIngresso.evento.imagem,
      },
      ingressos: [
        {
          tipo: item.tipoIngresso.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
        },
      ],
    }))
  } catch (error) {
    console.error("Erro ao buscar carrinho do usuário:", error)
    return []
  }
}
