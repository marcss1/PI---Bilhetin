// app/layout.tsx

// SUAS IMPORTAÇÕES EXISTENTES
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";

// ADICIONE ESTAS DUAS NOVAS IMPORTAÇÕES
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bilhetin - Venda de Ingressos",
  description: "Compre ingressos para os melhores eventos do Brasil",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Este console.log agora não terá mais erro
  console.log(
    "--- [SERVIDOR - layout.tsx] Renderizando layout. Sessão no servidor:",
    session ? session.user.id : null
  );

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}