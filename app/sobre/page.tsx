import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SobrePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Sobre o <span className="text-primary">Bilhetin</span>
              </h1>
              <p className="text-lg mb-6">
                Conectando pessoas a experiências incríveis desde 2025. Somos a plataforma mais promissora em venda de ingressos
                para eventos no Brasil.
              </p>
            </div>
            <div className="hidden md:block">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Sobre o Bilhetin"
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Nossa História</h2>
            <div className="space-y-6 text-lg">
              <p>
                O Bilhetin nasceu da paixão por eventos e da necessidade de simplificar o processo de compra e venda de
                ingressos no Brasil. Fundado em 2025 por um grupo de universitários de tecnologia e amantes de eventos
                culturais, o Bilhetin promete se tornar referência no mercado.
              </p>
              <p>
                Nossa jornada começou com a missão de facilitar o acesso a eventos, tornando o processo mais
                transparente, seguro e acessível tanto para produtores quanto para o público. Desde então, temos
                trabalhado incansavelmente para aprimorar nossa plataforma e oferecer a melhor experiência possível para você.
              </p>
              <p>
                Hoje, o Bilhetin visa concetar milhares de pessoas a eventos de todos os tipos em todo o Brasil, desde
                pequenos shows locais até grandes festivais nacionais. Estamos orgulhosos do caminho percorrido e
                animados com as possibilidades que o futuro reserva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Confiança</h3>
              <p>
                Construímos relacionamentos baseados em transparência e segurança, garantindo que cada transação seja
                protegida e que as informações dos usuários estejam sempre seguras.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Inovação</h3>
              <p>
                Buscamos constantemente novas formas de melhorar nossa plataforma, implementando tecnologias avançadas
                para oferecer a melhor experiência possível aos nossos usuários.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Acessibilidade</h3>
              <p>
                Acreditamos que a cultura e o entretenimento devem ser acessíveis a todos. Trabalhamos para democratizar
                o acesso a eventos e facilitar a compra de ingressos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Nossa Equipe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                nome: "Eduardo Oliveira",
                cargo: "Idealizador do projeto, designer",
                foto: "/placeholder.svg?height=300&width=300",
              },
              {
                nome: "Giovanna Martins",
                cargo: "Desenvolvedora do projeto",
                foto: "/placeholder.svg?height=300&width=300",
              },
              {
                nome: "João Augusto Bassul",
                cargo: "Documentarista",
                foto: "/placeholder.svg?height=300&width=300",
              },
              {
                nome: "Marcones Queiroz",
                cargo: "Desenvolvedor do projeto",
                foto: "/placeholder.svg?height=300&width=300",
              },
            ].map((membro, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image src={membro.foto || "/placeholder.svg"} alt={membro.nome} fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold">{membro.nome}</h3>
                <p className="text-gray-600">{membro.cargo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Bilhetin em Números</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { numero: "500+", texto: "Eventos Realizados" },
              { numero: "100k+", texto: "Ingressos Vendidos" },
              { numero: "50+", texto: "Cidades Atendidas" },
              { numero: "98%", texto: "Clientes Satisfeitos" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{item.numero}</p>
                <p className="text-lg">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Faça Parte da Nossa História</h2>
            <p className="text-lg mb-8">
              Seja como cliente ou produtor de eventos, junte-se a nós e faça parte dessa jornada incrível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro">
                <Button className="bg-primary text-secondary hover:bg-primary/90 w-full sm:w-auto">Criar Conta</Button>
              </Link>
              <Link href="/contato">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-secondary w-full sm:w-auto"
                >
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
