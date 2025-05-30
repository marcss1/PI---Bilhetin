import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-super-secreto"

// Rotas que requerem autenticação
const protectedRoutes = ["/perfil", "/carrinho", "/checkout"]

// Rotas que requerem ser produtor
const producerRoutes = ["/eventos/cadastrar"]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isProducerRoute = producerRoutes.some((route) => path.startsWith(route))

  if (!isProtectedRoute && !isProducerRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  // Se não houver token, redirecionar para login
  if (!token) {
    const url = new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
    return NextResponse.redirect(url)
  }

  try {
    // Verificar token
    const decoded = verify(token, JWT_SECRET) as { id: string; tipo: string }

    // Verificar se é uma rota de produtor e o usuário é produtor
    if (isProducerRoute && decoded.tipo !== "produtor") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    const response = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url))
    response.cookies.delete("auth_token")
    return response
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
