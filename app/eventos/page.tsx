import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getEventos } from "@/lib/data"

export default async function EventosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categoria = typeof searchParams.categoria === "string" ? searchParams.categoria : undefined
  const eventos = await getEventos(categoria)

  const categorias = [
    { nome: "Todos", slug: "" },
    { nome: "Música", slug: "musica" },
    { nome: "Esportes", slug: "esportes" },
    { nome: "Teatro", slug: "teatro" },
    { nome: "Cinema", slug: "cinema" },
    { nome: "Arte", slug: "arte" },
    { nome: "Gastronomia", slug: "gastronomia" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Eventos</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Buscar</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar eventos" className="pl-8" />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Categorias</h3>
              <div className="space-y-2">
                {categorias.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.slug ? `/eventos?categoria=${cat.slug}` : "/eventos"}
                    className={`block px-3 py-2 rounded-md ${
                      categoria === cat.slug || (!categoria && cat.slug === "")
                        ? "bg-primary text-secondary font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat.nome}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Data</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="hoje" name="data" className="mr-2" />
                  <label htmlFor="hoje">Hoje</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="amanha" name="data" className="mr-2" />
                  <label htmlFor="amanha">Amanhã</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="esta-semana" name="data" className="mr-2" />
                  <label htmlFor="esta-semana">Esta semana</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="este-mes" name="data" className="mr-2" />
                  <label htmlFor="este-mes">Este mês</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="personalizado" name="data" className="mr-2" />
                  <label htmlFor="personalizado">Personalizado</label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Local</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="sao-paulo" className="mr-2" />
                  <label htmlFor="sao-paulo">São Paulo</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="rio-de-janeiro" className="mr-2" />
                  <label htmlFor="rio-de-janeiro">Rio de Janeiro</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="belo-horizonte" className="mr-2" />
                  <label htmlFor="belo-horizonte">Belo Horizonte</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="brasilia" className="mr-2" />
                  <label htmlFor="brasilia">Brasília</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {categoria
                ? `Eventos de ${categorias.find((c) => c.slug === categoria)?.nome || categoria}`
                : "Todos os eventos"}
            </h2>
            <div className="text-sm text-gray-500">{eventos.length} eventos encontrados</div>
          </div>

          {eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <Link href={`/eventos/${evento.id}`} key={evento.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="relative h-48">
                      <Image
                        src={evento.imagem || "/placeholder.svg?height=400&width=600"}
                        alt={evento.titulo}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-secondary px-2 py-1 rounded text-xs font-medium">
                        {evento.categoria}
                      </div>
                    </div>
                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2">{evento.titulo}</h3>
                      <div className="space-y-2 text-sm text-gray-600 flex-1">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          {evento.data}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {evento.local}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {evento.horario}
                        </div>
                      </div>
                      <Button className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Comprar Ingresso
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="Nenhum evento encontrado"
                  width={100}
                  height={100}
                  className="mx-auto opacity-50"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500 mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
              <Link href="/eventos">
                <Button className="bg-primary text-secondary hover:bg-primary/90">Ver Todos os Eventos</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
