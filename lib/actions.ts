"use server"

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "./supabase"
import { hash } from "bcrypt"
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

    const supabase = createServerSupabaseClient()

    // Verificar se o email já existe
    const { data: usuarioExistente, error: checkError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .single()

    if (usuarioExistente) {
      return { success: false, message: "Este email já está em uso" }
    }

    // Registrar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError || !authData.user) {
      return { success: false, message: authError?.message || "Erro ao criar usuário" }
    }

    // Criptografar a senha para armazenamento adicional (opcional, já que o Supabase Auth já faz isso)
    const senhaHash = await hash(senha, 10)

    // Inserir dados adicionais do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: authData.user.id,
          nome,
          email,
          senha: senhaHash, // Armazenamos uma cópia da senha hash para uso interno
          tipo,
          telefone,
          cpf,
        },
      ])
      .select()

    if (userError) {
      // Tentar limpar o usuário criado no Auth se houver erro
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: userError.message }
    }

    // Criar token JWT
    const token = sign({ id: authData.user.id, email: authData.user.email, tipo }, JWT_SECRET, {
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

    const supabase = createServerSupabaseClient()

    // Autenticar com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (authError || !authData.user) {
      return { success: false, message: "Email ou senha incorretos" }
    }

    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      return { success: false, message: "Erro ao buscar dados do usuário" }
    }

    // Criar token JWT
    const token = sign({ id: authData.user.id, email: authData.user.email, tipo: userData.tipo }, JWT_SECRET, {
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
    const supabase = createServerSupabaseClient()

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, tipo, telefone, cpf")
      .eq("id", decoded.id)
      .single()

    if (error) throw error
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

    const supabase = createServerSupabaseClient()

    // Criar evento
    const { data: eventoResult, error: eventoError } = await supabase
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
          organizador_id: usuario.id,
        },
      ])
      .select()

    if (eventoError || !eventoResult || eventoResult.length === 0) {
      throw eventoError || new Error("Erro ao criar evento")
    }

    const eventoId = eventoResult[0].id

    // Criar tipos de ingresso
    const tiposIngressoFormatados = tiposIngressoData.map((tipo) => ({
      nome: tipo.nome,
      preco: tipo.preco,
      quantidade: tipo.quantidade,
      evento_id: eventoId,
    }))

    const { error: tiposError } = await supabase.from("tipos_ingresso").insert(tiposIngressoFormatados)

    if (tiposError) {
      throw tiposError
    }

    revalidatePath("/eventos")
    //redirect(`/eventos/${eventoId}`)
    return { success: true, event: eventoResult[0] }
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
    const totalIngressos = tiposIngresso.reduce((total: number, tipo: any) => total + tipo.quantidade, 0)

    if (totalIngressos === 0) {
      return { success: false, message: "Selecione pelo menos um ingresso" }
    }

    // --- MUDANÇA PRINCIPAL: Usar Admin para garantir a gravação ---
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    // -----------------------------------------------------------

    // 1. Buscar ou criar carrinho (Usando Admin)
    const { data: compraExistente, error: compraError } = await supabaseAdmin
      .from("compras")
      .select("id")
      .eq("usuario_id", usuario.id)
      .eq("status", "pendente")
      .maybeSingle() // Mais seguro que .single()

    if (compraError) {
      console.error("Erro ao buscar compra:", compraError);
      throw compraError
    }

    let compraId: string

    if (compraExistente) {
      compraId = compraExistente.id
    } else {
      // Criar nova compra (Agora com permissão de Admin!)
      const { data: novaCompra, error: novaCompraError } = await supabaseAdmin
        .from("compras")
        .insert([
          {
            usuario_id: usuario.id,
            status: "pendente",
            total: 0,
            // O banco deve preencher criado_em automaticamente
          },
        ])
        .select()

      if (novaCompraError || !novaCompra || novaCompra.length === 0) {
        console.error("Erro ao criar compra:", novaCompraError);
        throw novaCompraError || new Error("Erro ao criar compra")
      }

      compraId = novaCompra[0].id
    }

    // 2. Adicionar itens ao carrinho
    let total = 0

    for (const tipo of tiposIngresso) {
      if (tipo.quantidade > 0) {
        // Buscar dados do ingresso (Admin para garantir leitura)
        const { data: tipoIngresso } = await supabaseAdmin
          .from("tipos_ingresso")
          .select("*")
          .eq("id", tipo.id)
          .single()

        if (!tipoIngresso) continue

        // Verificar disponibilidade
        if (tipo.quantidade > tipoIngresso.quantidade) {
          return {
            success: false,
            message: `Apenas ${tipoIngresso.quantidade} ingressos disponíveis`,
          }
        }

        const codigo = `${eventoId.substring(0, 6)}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`

        // Inserir Item (Admin)
        const { error: itemError } = await supabaseAdmin.from("itens_compra").insert([
          {
            compra_id: compraId,
            tipo_ingresso_id: tipo.id,
            quantidade: tipo.quantidade,
            preco_unitario: tipoIngresso.preco,
            codigo,
            usuario_id: usuario.id, // Importante para a permissão de remover depois
          },
        ])

        if (itemError) throw itemError

        total += tipo.quantidade * tipoIngresso.preco
      }
    }

    // Atualizar total
    await supabaseAdmin.from("compras").update({ total }).eq("id", compraId)

    revalidatePath("/carrinho")
    redirect("/carrinho")
    
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return { success: false, message: "Erro ao adicionar ao carrinho" }
  }
}

export async function removerDoCarrinho(itemId: string) {
  try {
    const supabase = createServerSupabaseClient();
    
    // 1. Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    // 2. Buscar o item e tentar achar a compra pai
    const { data: item, error: findError } = await supabase
      .from("itens_compra")
      .select(`
        id,
        compra_id,
        compras (
          usuario_id,
          status
        )
      `)
      .eq("id", itemId)
      .single();

    if (findError || !item) {
      return { success: false, message: "Item já removido ou não encontrado." };
    }

    // 3. Lógica de Segurança Inteligente
    const compra = item.compras as any;

    // CENÁRIO A: Item Fantasma (A compra pai foi deletada, sobrou só o item)
    if (!compra) {
      // PERMITIR DELETAR! É lixo de banco de dados e precisa sair.
      console.log(`🗑️ Removendo item fantasma: ${itemId}`);
    }
    // CENÁRIO B: Item Normal (Tem compra pai)
    else {
      // Verificar se o dono da compra é o usuário logado
      if (compra.usuario_id !== user.id) {
        return { success: false, message: "Você não tem permissão para remover este item." };
      }
      // Bloquear se já estiver pago
      if (compra.status === 'confirmado') {
        return { success: false, message: "Não é possível remover itens de uma compra finalizada." };
      }
    }

    // 4. Deletar o item
    const { error: deleteError } = await supabase
      .from("itens_compra")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      throw deleteError;
    }

    revalidatePath("/carrinho");
    return { success: true };

  } catch (error) {
    console.error("Erro ao remover:", error);
    return { success: false, message: "Erro ao processar a remoção." };
  }
}

export async function finalizarCompra() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  try {
    const supabase = createServerSupabaseClient()

    // Buscar carrinho
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .select("*")
      .eq("usuario_id", usuario.id)
      .eq("status", "pendente")
      .single()

    if (compraError || !compra) {
      return { success: false, message: "Carrinho vazio" }
    }

    // Buscar itens da compra
    const { data: itens, error: itensError } = await supabase
      .from("itens_compra")
      .select(`
        *,
        tipoIngresso:tipos_ingresso(*)
      `)
      .eq("compra_id", compra.id)

    if (itensError) {
      throw itensError
    }

    if (!itens || itens.length === 0) {
      return { success: false, message: "Carrinho vazio" }
    }

    // Atualizar estoque de ingressos
    for (const item of itens) {
      const { error: updateError } = await supabase
        .from("tipos_ingresso")
        .update({
          quantidade: item.tipoIngresso.quantidade - item.quantidade,
        })
        .eq("id", item.tipo_ingresso_id)

      if (updateError) {
        throw updateError
      }
    }

    // Confirmar compra
    const { error: updateCompraError } = await supabase
      .from("compras")
      .update({ status: "confirmado" })
      .eq("id", compra.id)

    if (updateCompraError) {
      throw updateCompraError
    }

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
    const supabase = createServerSupabaseClient()

    // Criar mensagem
    const { error } = await supabase.from("mensagens").insert([
      {
        nome: data.nome,
        email: data.email,
        assunto: data.assunto,
        mensagem: data.mensagem,
        usuario_id: usuario?.id,
      },
    ])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: "Erro ao enviar mensagem" }
  }
}
