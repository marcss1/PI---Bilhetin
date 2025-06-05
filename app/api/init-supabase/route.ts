import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"


async function initializeDatabase() {
  console.log("Verificando se o banco de dados precisa ser inicializado...")
  const supabase = createServerSupabaseClient()

  // verificação se já existem usuários
  const { count, error: countError } = await supabase.from("usuarios").select("*", { count: "exact", head: true })

  if (countError) {
    throw countError
  }

  if (count && count > 0) {
    console.log("Banco de dados já inicializado.")
    return { message: "Banco de dados já inicializado." }
  }

  console.log("Inicializando banco de dados com dados iniciais...")

  // comando para criar usuário cliente no Auth
  const { data: clienteAuth, error: clienteAuthError } = await supabase.auth.admin.createUser({
    email: "cliente@exemplo.com",
    password: "senha123", // Supabase Auth faz o hash e armazena de forma segura
    email_confirm: true,
  })

  if (clienteAuthError) {
    console.error("Erro ao criar clienteAuth:", clienteAuthError) 
    throw clienteAuthError
  }
  if (!clienteAuth || !clienteAuth.user) { // Verificação adicional
      throw new Error("Falha ao criar usuário cliente no Auth ou usuário não retornado.");
  }


  // crioação de usuário produtor no Auth
  const { data: produtorAuth, error: produtorAuthError } = await supabase.auth.admin.createUser({
    email: "produtor@exemplo.com",
    password: "senha123", // Supabase Auth faz o hash e armazena de forma segura
    email_confirm: true,
  })

  if (produtorAuthError) {
    console.error("Erro ao criar produtorAuth:", produtorAuthError) 
    throw produtorAuthError
  }
  if (!produtorAuth || !produtorAuth.user) { // Verificação adicional
      throw new Error("Falha ao criar usuário produtor no Auth ou usuário não retornado.");
  }

  // comando de inserir dados adicionais dos usuários
  const { error: usuariosError } = await supabase.from("usuarios").insert([
    {
      id: clienteAuth.user.id,
      nome: "João Silva",
      email: "cliente@exemplo.com",
     
      tipo: "cliente",
      telefone: "(11) 98765-4321",
      cpf: "123.456.789-00",
    },
    {
      id: produtorAuth.user.id,
      nome: "Maria Oliveira",
      email: "produtor@exemplo.com",
    
      tipo: "produtor",
      telefone: "(11) 91234-5678",
      cpf: "987.654.321-00",
    },
  ])

  if (usuariosError) {
    console.error("Erro ao inserir em usuarios:", usuariosError) 
    throw usuariosError
  }

  console.log("Usuários (perfis) criados")



  // comando de criação de eventos
  const { data: evento1, error: evento1Error } = await supabase
    .from("eventos")
    .insert([
      {
        titulo: "Festival de Música Brasileira",
        descricao:
          "O maior festival de música brasileira com os melhores artistas nacionais. Uma experiência única para os amantes da música brasileira, com shows de MPB, samba, rock nacional e muito mais.",
        data: new Date("2025-08-15").toISOString(), 
        hora_inicio: "16:00",
        hora_fim: "23:00",
        local: "Parque Ibirapuera",
        endereco: "Av. Pedro Álvares Cabral - Vila Mariana",
        cidade: "São Paulo",
        estado: "SP",
        cep: "04094-050",
        categoria: "musica",
        imagem: "/placeholder.svg?height=600&width=1200",
        organizador_id: produtorAuth.user.id,
        informacoes_adicionais:
          "Proibida a entrada de bebidas e alimentos\nPermitida a entrada de água em garrafas transparentes\nEvento para todas as idades\nEstacionamento no local (R$ 40,00)",
      },
    ])
    .select()
    .single() 

  if (evento1Error || !evento1) { 
    console.error("Erro ao criar evento 1:", evento1Error);
    throw evento1Error || new Error("Erro ao criar evento 1 ou evento não retornado");
  }

  const { data: evento2, error: evento2Error } = await supabase
    .from("eventos")
    .insert([
      {
        titulo: "Stand-Up Comedy Night",
        descricao:
          "Uma noite de muitas risadas com os melhores comediantes do Brasil. Venha se divertir com stand-up comedy de primeira qualidade.",
        data: new Date("2025-08-22").toISOString(),
        hora_inicio: "20:00",
        hora_fim: "22:30",
        local: "Teatro Municipal",
        endereco: "Praça Ramos de Azevedo, s/n - República",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        cep: "01037-010",
        categoria: "teatro",
        imagem: "/placeholder.svg?height=600&width=1200",
        organizador_id: produtorAuth.user.id,
        informacoes_adicionais:
          "Classificação indicativa: 16 anos\nProibido o uso de celulares durante o espetáculo\nChegue com 30 minutos de antecedência",
      },
    ])
    .select()
    .single()

  if (evento2Error || !evento2) {
    console.error("Erro ao criar evento 2:", evento2Error);
    throw evento2Error || new Error("Erro ao criar evento 2 ou evento não retornado");
  }

  // (Adapte evento3 e evento4 da mesma forma com .single() e logs se necessário)
   const { data: evento3, error: evento3Error } = await supabase
    .from("eventos")
    .insert([
      {
        titulo: "Exposição de Arte Contemporânea",
        descricao:
          "Uma exposição com obras de artistas contemporâneos brasileiros e internacionais. Uma oportunidade única para apreciar a arte moderna e contemporânea.",
        data: new Date("2025-09-10").toISOString(), 
        hora_inicio: "09:00",
        hora_fim: "19:00",
        local: "MASP",
        endereco: "Av. Paulista, 1578 - Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310-200",
        categoria: "arte",
        imagem: "/placeholder.svg?height=600&width=1200",
        organizador_id: produtorAuth.user.id,
        informacoes_adicionais:
          "Entrada gratuita para estudantes e professores\nVisitas guiadas às 10h, 14h e 16h\nFotografias sem flash são permitidas",
      },
    ])
    .select()
    .single();

  if (evento3Error || !evento3) {
    console.error("Erro ao criar evento 3:", evento3Error);
    throw evento3Error || new Error("Erro ao criar evento 3 ou evento não retornado");
  }

  const { data: evento4, error: evento4Error } = await supabase
    .from("eventos")
    .insert([
      {
        titulo: "Campeonato Brasileiro de Futebol",
        descricao:
          "Partida decisiva do Campeonato Brasileiro de Futebol. Venha torcer pelo seu time e vivenciar a emoção do futebol brasileiro.",
        data: new Date("2025-09-05").toISOString(), 
        hora_inicio: "16:00",
        hora_fim: "18:00",
        local: "Estádio do Morumbi",
        endereco: "Praça Roberto Gomes Pedrosa, 1 - Morumbi",
        cidade: "São Paulo",
        estado: "SP",
        cep: "05653-070",
        categoria: "esportes",
        imagem: "/placeholder.svg?height=600&width=1200",
        organizador_id: produtorAuth.user.id,
        informacoes_adicionais:
          "Proibida a entrada com objetos cortantes ou perfurantes\nBandeiras sem mastro são permitidas\nChegue com antecedência para evitar filas",
      },
    ])
    .select()
    .single();

  if (evento4Error || !evento4) {
    console.error("Erro ao criar evento 4:", evento4Error);
    throw evento4Error || new Error("Erro ao criar evento 4 ou evento não retornado");
  }


  console.log("Eventos criados")

  // Criar os tipos de ingresso
  // Certifique-se que evento1.id, evento2.id etc. estão corretos após usar .single()
  const { error: tiposError } = await supabase.from("tipos_ingresso").insert([
    { nome: "Inteira", preco: 120, quantidade: 1000, evento_id: evento1.id },
    { nome: "Meia-entrada", preco: 60, quantidade: 500, evento_id: evento1.id },
    { nome: "VIP", preco: 250, quantidade: 200, evento_id: evento1.id },
    { nome: "Inteira", preco: 80, quantidade: 300, evento_id: evento2.id },
    { nome: "Meia-entrada", preco: 40, quantidade: 150, evento_id: evento2.id },
    { nome: "Inteira", preco: 50, quantidade: 500, evento_id: evento3.id },
    { nome: "Meia-entrada", preco: 25, quantidade: 250, evento_id: evento3.id },
    { nome: "Inteira", preco: 100, quantidade: 20000, evento_id: evento4.id },
    { nome: "Meia-entrada", preco: 50, quantidade: 10000, evento_id: evento4.id },
    { nome: "Camarote", preco: 300, quantidade: 500, evento_id: evento4.id },
  ])

  if (tiposError) {
    console.error("Erro ao criar tipos de ingresso:", tiposError) 
    throw tiposError
  }

  console.log("Tipos de ingresso criados")
  console.log("Inicialização do banco de dados concluída com sucesso!")

  return { message: "Banco de dados inicializado com sucesso!" }
}

export async function GET() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) { // Especificar 'any' ou um tipo de erro mais específico
    console.error("Erro detalhado ao inicializar banco de dados:", error) // Log completo do objeto de erro
    return NextResponse.json(
      { success: false, message: error.message || "Erro ao inicializar banco de dados", error: error.details || String(error) }, // Tenta usar error.message e error.details
      { status: 500 },
    )
  }
}