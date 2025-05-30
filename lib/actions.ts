"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { hash, compare } from "bcrypt"
import { z } from "zod"
import { cookies } from "next/headers"
import { sign, verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

// Schemas de validação
const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  tipo: z.enum(["cliente", "produtor"]),
})

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

const eventoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  data: z.string(),
  horaInicio: z.string(),
  horaFim: z.string(),
  local: z.string().min(3, "Local deve ter pelo menos 3 caracteres"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  cep: z.string().min(8, "CEP deve ter pelo menos 8 caracteres"),
  categoria: z.string(),
  imagem: z.string().optional(),
  informacoesAdicionais: z.string().optional(),
  tiposIngresso: z.array(
    z.object({
      nome: z.string().min(1, "Nome do ingresso é obrigatório"),
      preco: z.number().min(0, "Preço não pode ser negativo"),
      quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
    }),
  ),
})

const mensagemSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
})

// Funções de autenticação
export async function cadastrarUsuario(formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const senha = formData.get("senha") as string
  const confirmarSenha = formData.get("confirmarSenha") as string
  const tipo = formData.get("tipo") as "cliente" | "produtor"
  const telefone = formData.get("telefone") as string | null
  const cpf = formData.get("cpf") as string | null

  // Validação básica
  if (senha !== confirmarSenha) {
    return { success: false, message: "As senhas não coincidem" }
  }

  try {
    // Validação com Zod
    usuarioSchema.parse({ nome, email, senha, tipo })

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      return { success: false, message: "Este email já está em uso" }
    }

    // Criptografar a senha
    const senhaHash = await hash(senha, 10)

    // Criar o usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo,
        telefone,
        cpf,
      },
    })

    // Criar token JWT
    const token = sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: "7d",
    })

    // Salvar token em cookie
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: "Erro ao cadastrar usuário" }
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const senha = formData.get("senha") as string

  try {
    // Validação com Zod
    loginSchema.parse({ email, senha })

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return { success: false, message: "Email ou senha incorretos" }
    }

    // Verificar senha
    const senhaCorreta = await compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return { success: false, message: "Email ou senha incorretos" }
    }

    // Criar token JWT
    const token = sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: "7d",
    })

    // Salvar token em cookie
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: "Erro ao fazer login" }
  }
}

export async function logout() {
  cookies().delete("auth_token")
  revalidatePath("/")
  redirect("/")
}

export async function getUsuarioLogado() {
  const token = cookies().get("auth_token")?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { id: string; email: string; tipo: string }
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        cpf: true,
      },
    })

    return usuario
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    cookies().delete("auth_token")
    return null
  }
}

// Funções para eventos
export async function cadastrarEvento(formData: FormData) {
  const usuario = await getUsuarioLogado()

  if (!usuario || usuario.tipo !== "produtor") {
    return { success: false, message: "Você não tem permissão para cadastrar eventos" }
  }

  try {
    const titulo = formData.get("titulo") as string
    const descricao = formData.get("descricao") as string
    const data = formData.get("data") as string
    const horaInicio = formData.get("horaInicio") as string
    const horaFim = formData.get("horaFim") as string
    const local = formData.get("local") as string
    const endereco = formData.get("endereco") as string
    const cidade = formData.get("cidade") as string
    const estado = formData.get("estado") as string
    const cep = formData.get("cep") as string
    const categoria = formData.get("categoria") as string
    const imagem = formData.get("imagem") as string
    const informacoesAdicionais = formData.get("informacoesAdicionais") as string

    // Processar tipos de ingresso
    const tiposIngressoData = []
    const tiposIngressoCount = Number.parseInt(formData.get("tiposIngressoCount") as string, 10)

    for (let i = 0; i < tiposIngressoCount; i++) {
      const nome = formData.get(`tipoNome_${i}`) as string
      const preco = Number.parseFloat(formData.get(`tipoPreco_${i}`) as string)
      const quantidade = Number.parseInt(formData.get(`tipoQuantidade_${i}`) as string, 10)

      tiposIngressoData.push({ nome, preco, quantidade })
    }

    // Validar dados
    const eventoData = {
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
      tiposIngresso: tiposIngressoData,
    }

    eventoSchema.parse(eventoData)

    // Criar evento
    const evento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        data: new Date(data),
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
        organizadorId: usuario.id,
        tiposIngresso: {
          create: tiposIngressoData,
        },
      },
    })

    revalidatePath("/eventos")
    redirect(`/eventos/${evento.id}`)
  } catch (error) {
    console.error("Erro ao cadastrar evento:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: "Erro ao cadastrar evento" }
  }
}

// Funções para o carrinho
export async function adicionarAoCarrinho(formData: FormData) {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  const eventoId = formData.get("eventoId") as string
  const tiposIngresso = JSON.parse(formData.get("tiposIngresso") as string)

  try {
    // Verificar se há ingressos selecionados
    const totalIngressos = tiposIngresso.reduce((total: number, tipo: any) => total + tipo.quantidade, 0)

    if (totalIngressos === 0) {
      return { success: false, message: "Selecione pelo menos um ingresso" }
    }

    // Buscar ou criar carrinho (compra pendente)
    let compra = await prisma.compra.findFirst({
      where: {
        usuarioId: usuario.id,
        status: "pendente",
      },
    })

    if (!compra) {
      compra = await prisma.compra.create({
        data: {
          usuarioId: usuario.id,
          status: "pendente",
          total: 0,
        },
      })
    }

    // Adicionar itens ao carrinho
    let total = 0

    for (const tipo of tiposIngresso) {
      if (tipo.quantidade > 0) {
        const tipoIngresso = await prisma.tipoIngresso.findUnique({
          where: { id: tipo.id },
        })

        if (!tipoIngresso) continue

        // Verificar disponibilidade
        if (tipo.quantidade > tipoIngresso.quantidade) {
          return {
            success: false,
            message: `Apenas ${tipoIngresso.quantidade} ingressos do tipo ${tipoIngresso.nome} disponíveis`,
          }
        }

        // Gerar código único para o ingresso
        const codigo = `${eventoId.substring(0, 6)}-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .substring(2, 7)}`

        // Adicionar ao carrinho
        await prisma.itemCompra.create({
          data: {
            compraId: compra.id,
            tipoIngressoId: tipo.id,
            quantidade: tipo.quantidade,
            precoUnitario: tipoIngresso.preco,
            codigo,
          },
        })

        total += tipo.quantidade * tipoIngresso.preco
      }
    }

    // Atualizar total da compra
    await prisma.compra.update({
      where: { id: compra.id },
      data: { total },
    })

    revalidatePath("/carrinho")
    redirect("/carrinho")
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return { success: false, message: "Erro ao adicionar ao carrinho" }
  }
}

export async function removerDoCarrinho(itemId: string) {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  try {
    // Verificar se o item pertence ao usuário
    const item = await prisma.itemCompra.findUnique({
      where: { id: itemId },
      include: {
        compra: true,
      },
    })

    if (!item || item.compra.usuarioId !== usuario.id) {
      return { success: false, message: "Item não encontrado" }
    }

    // Remover item
    await prisma.itemCompra.delete({
      where: { id: itemId },
    })

    // Recalcular total da compra
    const itensRestantes = await prisma.itemCompra.findMany({
      where: { compraId: item.compraId },
      include: {
        tipoIngresso: true,
      },
    })

    const novoTotal = itensRestantes.reduce((total, item) => total + item.quantidade * item.precoUnitario, 0)

    await prisma.compra.update({
      where: { id: item.compraId },
      data: { total: novoTotal },
    })

    revalidatePath("/carrinho")
    return { success: true }
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error)
    return { success: false, message: "Erro ao remover do carrinho" }
  }
}

export async function finalizarCompra() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  try {
    // Buscar carrinho
    const compra = await prisma.compra.findFirst({
      where: {
        usuarioId: usuario.id,
        status: "pendente",
      },
      include: {
        itens: {
          include: {
            tipoIngresso: true,
          },
        },
      },
    })

    if (!compra || compra.itens.length === 0) {
      return { success: false, message: "Carrinho vazio" }
    }

    // Atualizar estoque de ingressos
    for (const item of compra.itens) {
      await prisma.tipoIngresso.update({
        where: { id: item.tipoIngressoId },
        data: {
          quantidade: {
            decrement: item.quantidade,
          },
        },
      })
    }

    // Confirmar compra
    await prisma.compra.update({
      where: { id: compra.id },
      data: {
        status: "confirmado",
      },
    })

    revalidatePath("/perfil")
    redirect("/perfil?tab=ingressos")
  } catch (error) {
    console.error("Erro ao finalizar compra:", error)
    return { success: false, message: "Erro ao finalizar compra" }
  }
}

// Função para enviar mensagem de contato
export async function enviarMensagem(data: { nome: string; email: string; assunto: string; mensagem: string }) {
  try {
    // Validar dados
    mensagemSchema.parse(data)

    const usuario = await getUsuarioLogado()

    // Criar mensagem
    await prisma.mensagem.create({
      data: {
        nome: data.nome,
        email: data.email,
        assunto: data.assunto,
        mensagem: data.mensagem,
        usuarioId: usuario?.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: "Erro ao enviar mensagem" }
  }
}
