import { prisma } from "./prisma"
import { formatarData } from "./utils"

// Funções para Eventos
export async function getEventos(categoria?: string) {
  try {
    const eventos = await prisma.evento.findMany({
      where: categoria ? { categoria: { equals: categoria } } : undefined,
      include: {
        tiposIngresso: true,
        organizador: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data: "asc",
      },
    })

    return eventos.map((evento) => ({
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: formatarData(evento.data),
      horario: `${evento.horaInicio} - ${evento.horaFim}`,
      local: evento.local,
      endereco: evento.endereco,
      cidade: evento.cidade,
      estado: evento.estado,
      categoria: evento.categoria,
      imagem: evento.imagem,
      organizador: evento.organizador.nome,
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
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        tiposIngresso: true,
        organizador: {
          select: {
            nome: true,
          },
        },
      },
    })

    if (!evento) return null

    return {
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: formatarData(evento.data),
      horario: `${evento.horaInicio} - ${evento.horaFim}`,
      local: evento.local,
      endereco: evento.endereco,
      cidade: evento.cidade,
      estado: evento.estado,
      categoria: evento.categoria,
      imagem: evento.imagem,
      organizador: evento.organizador.nome,
      preco: {
        inteira: evento.tiposIngresso.find((tipo) => tipo.nome === "Inteira")?.preco || 0,
        meia: evento.tiposIngresso.find((tipo) => tipo.nome === "Meia-entrada")?.preco || 0,
        vip: evento.tiposIngresso.find((tipo) => tipo.nome === "VIP")?.preco || 0,
      },
      ingressosDisponiveis: evento.tiposIngresso.reduce((total, tipo) => total + tipo.quantidade, 0),
      informacoesAdicionais: evento.informacoesAdicionais
        ? evento.informacoesAdicionais.split("\n")
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
    return await prisma.usuario.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error)
    return null
  }
}

export async function getIngressosDoUsuario(usuarioId: string) {
  try {
    const compras = await prisma.compra.findMany({
      where: {
        usuarioId,
        status: "confirmado",
      },
      include: {
        itens: {
          include: {
            tipoIngresso: {
              include: {
                evento: true,
              },
            },
          },
        },
      },
    })

    return compras.flatMap((compra) =>
      compra.itens.map((item) => ({
        id: item.id,
        evento: {
          id: item.tipoIngresso.evento.id,
          titulo: item.tipoIngresso.evento.titulo,
          data: formatarData(item.tipoIngresso.evento.data),
          local: item.tipoIngresso.evento.local,
          horario: `${item.tipoIngresso.evento.horaInicio} - ${item.tipoIngresso.evento.horaFim}`,
          imagem: item.tipoIngresso.evento.imagem,
        },
        tipo: item.tipoIngresso.nome,
        quantidade: item.quantidade,
        codigo: item.codigo,
        status: compra.status,
      })),
    )
  } catch (error) {
    console.error("Erro ao buscar ingressos do usuário:", error)
    return []
  }
}

// Funções para o carrinho
export async function getCarrinhoDoUsuario(usuarioId: string) {
  try {
    const compra = await prisma.compra.findFirst({
      where: {
        usuarioId,
        status: "pendente",
      },
      include: {
        itens: {
          include: {
            tipoIngresso: {
              include: {
                evento: true,
              },
            },
          },
        },
      },
    })

    if (!compra) return []

    return compra.itens.map((item) => ({
      id: item.id,
      evento: {
        id: item.tipoIngresso.evento.id,
        titulo: item.tipoIngresso.evento.titulo,
        data: formatarData(item.tipoIngresso.evento.data),
        local: item.tipoIngresso.evento.local,
        imagem: item.tipoIngresso.evento.imagem,
      },
      ingressos: [
        {
          tipo: item.tipoIngresso.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        },
      ],
    }))
  } catch (error) {
    console.error("Erro ao buscar carrinho do usuário:", error)
    return []
  }
}
