"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, X, LogOut, Plus } from "lucide-react"
import { useAuth } from "./auth-provider"


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { usuario, logout } = useAuth()

  return (
    <header className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/*<Link href="/" className="text-2xl font-bold text-primary"> // Caso a gente queira só o nome, sem a logo em imagem
            Bilhetin
          </Link>*/}
          <Link href="/"><img src="/logo_nome.png" alt="Logo da marca" className="h-8 w-auto" /></Link>

          {/* Menu para desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/eventos" className="hover:text-primary transition-colors">
              Eventos
            </Link>
            <Link href="/sobre" className="hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link href="/contato" className="hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/carrinho">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary hover:bg-secondary-foreground/10"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Carrinho</span>
              </Button>
            </Link>

            {usuario ? (
              <div className="flex items-center space-x-4">
                {usuario.tipo === "produtor" && (
                  <Link href="/eventos/cadastrar">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary hover:bg-secondary-foreground/10"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="sr-only">Cadastrar Evento</span>
                    </Button>
                  </Link>
                )}
                <Link href="/perfil">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary hover:bg-secondary-foreground/10"
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">Perfil</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary hover:bg-secondary-foreground/10"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sair</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-secondary"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-primary text-secondary hover:bg-primary/90">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Botão de menu para mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Início
              </Link>
              <Link
                href="/eventos"
                className="hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link
                href="/sobre"
                className="hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="flex space-x-4 pt-2">
                <Link href="/carrinho" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="icon" className="text-primary">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Carrinho</span>
                  </Button>
                </Link>
                {usuario && (
                  <>
                    {usuario.tipo === "produtor" && (
                      <Link href="/eventos/cadastrar" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Plus className="h-5 w-5" />
                          <span className="sr-only">Cadastrar Evento</span>
                        </Button>
                      </Link>
                    )}
                    <Link href="/perfil" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="icon" className="text-primary">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Perfil</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex flex-col space-y-2 pt-2">
                {usuario ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary hover:bg-secondary-foreground/10"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sair</span>
                  </Button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-primary text-primary">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/cadastro" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary text-secondary">Cadastrar</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
