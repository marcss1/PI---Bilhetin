import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

export async function initializeDatabase() {
  console.log("Verificando se o banco de dados precisa ser inicializado...")

  // Verificar se já existem usuários
  const usuariosCount = await prisma.usuario.count()

  if (usuariosCount > 0) {
    console.log("Banco de dados já inicializado.")
    return
  }

  console.log("Inicializando banco de dados com dados iniciais...")

  // Criar usuários
  const senhaHash = await hash("senha123", 10)

  const cliente = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "cliente@exemplo.com",
      senha: senhaHash,
      tipo: "cliente",
      telefone: "(11) 98765-4321",
      cpf: "123.456.789-00",
    },
  })

  const produtor = await prisma.usuario.create({
    data: {
      nome: "Maria Oliveira",
      email: "produtor@exemplo.com",
      senha: senhaHash,
      tipo: "produtor",
      telefone: "(11) 91234-5678",
      cpf: "987.654.321-00",
    },
  })

  console.log("Usuários criados")

  // Criar eventos
  const evento1 = await prisma.evento.create({
    data: {
      titulo: "Festival de Música Brasileira",
      descricao:
        "O maior festival de música brasileira com os melhores artistas nacionais. Uma experiência única para os amantes da música brasileira, com shows de MPB, samba, rock nacional e muito mais.",
      data: new Date("2025-06-15"),
      horaInicio: "16:00",
      horaFim: "23:00",
      local: "Parque Ibirapuera",
      endereco: "Av. Pedro Álvares Cabral - Vila Mariana",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04094-050",
      categoria: "musica",
      imagem: "/placeholder.svg?height=600&width=1200",
      organizadorId: produtor.id,
      informacoesAdicionais:
        "Proibida a entrada de bebidas e alimentos\nPermitida a entrada de água em garrafas transparentes\nEvento para todas as idades\nEstacionamento no local (R$ 40,00)",
    },
  })

  const evento2 = await prisma.evento.create({
    data: {
      titulo: "Stand-Up Comedy Night",
      descricao:
        "Uma noite de muitas risadas com os melhores comediantes do Brasil. Venha se divertir com stand-up comedy de primeira qualidade.",
      data: new Date("2025-06-22"),
      horaInicio: "20:00",
      horaFim: "22:30",
      local: "Teatro Municipal",
      endereco: "Praça Ramos de Azevedo, s/n - República",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "01037-010",
      categoria: "teatro",
      imagem: "/placeholder.svg?height=600&width=1200",
      organizadorId: produtor.id,
      informacoesAdicionais:
        "Classificação indicativa: 16 anos\nProibido o uso de celulares durante o espetáculo\nChegue com 30 minutos de antecedência",
    },
  })

  const evento3 = await prisma.evento.create({
    data: {
      titulo: "Exposição de Arte Contemporânea",
      descricao:
        "Uma exposição com obras de artistas contemporâneos brasileiros e internacionais. Uma oportunidade única para apreciar a arte moderna e contemporânea.",
      data: new Date("2025-07-10"),
      horaInicio: "09:00",
      horaFim: "19:00",
      local: "MASP",
      endereco: "Av. Paulista, 1578 - Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-200",
      categoria: "arte",
      imagem: "/placeholder.svg?height=600&width=1200",
      organizadorId: produtor.id,
      informacoesAdicionais:
        "Entrada gratuita para estudantes e professores\nVisitas guiadas às 10h, 14h e 16h\nFotografias sem flash são permitidas",
    },
  })

  const evento4 = await prisma.evento.create({
    data: {
      titulo: "Campeonato Brasileiro de Futebol",
      descricao:
        "Partida decisiva do Campeonato Brasileiro de Futebol. Venha torcer pelo seu time e vivenciar a emoção do futebol brasileiro.",
      data: new Date("2025-07-05"),
      horaInicio: "16:00",
      horaFim: "18:00",
      local: "Estádio do Morumbi",
      endereco: "Praça Roberto Gomes Pedrosa, 1 - Morumbi",
      cidade: "São Paulo",
      estado: "SP",
      cep: "05653-070",
      categoria: "esportes",
      imagem: "/placeholder.svg?height=600&width=1200",
      organizadorId: produtor.id,
      informacoesAdicionais:
        "Proibida a entrada com objetos cortantes ou perfurantes\nBandeiras sem mastro são permitidas\nChegue com antecedência para evitar filas",
    },
  })

  console.log("Eventos criados")

  // Criar tipos de ingresso
  await prisma.tipoIngresso.createMany({
    data: [
      {
        nome: "Inteira",
        preco: 120,
        quantidade: 1000,
        eventoId: evento1.id,
      },
      {
        nome: "Meia-entrada",
        preco: 60,
        quantidade: 500,
        eventoId: evento1.id,
      },
      {
        nome: "VIP",
        preco: 250,
        quantidade: 200,
        eventoId: evento1.id,
      },
      {
        nome: "Inteira",
        preco: 80,
        quantidade: 300,
        eventoId: evento2.id,
      },
      {
        nome: "Meia-entrada",
        preco: 40,
        quantidade: 150,
        eventoId: evento2.id,
      },
      {
        nome: "Inteira",
        preco: 50,
        quantidade: 500,
        eventoId: evento3.id,
      },
      {
        nome: "Meia-entrada",
        preco: 25,
        quantidade: 250,
        eventoId: evento3.id,
      },
      {
        nome: "Inteira",
        preco: 100,
        quantidade: 20000,
        eventoId: evento4.id,
      },
      {
        nome: "Meia-entrada",
        preco: 50,
        quantidade: 10000,
        eventoId: evento4.id,
      },
      {
        nome: "Camarote",
        preco: 300,
        quantidade: 500,
        eventoId: evento4.id,
      },
    ],
  })

  console.log("Tipos de ingresso criados")
  console.log("Inicialização do banco de dados concluída com sucesso!")
}
