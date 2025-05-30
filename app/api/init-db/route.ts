import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: "Banco de dados inicializado com sucesso" })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao inicializar banco de dados", error: String(error) },
      { status: 500 },
    )
  }
}
