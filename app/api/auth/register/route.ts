import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Schema de validação (sem alterações)
const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  tipo: z.enum(["cliente", "produtor"]),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validação com Zod
    const result = usuarioSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, senha, confirmarSenha } = result.data;

    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
      return NextResponse.json(
        { success: false, message: "As senhas não coincidem" },
        { status: 400 },
      );
    }

    // Etapa 1: Registrar o usuário no Supabase Auth.
    // O Gatilho (Trigger) no banco de dados cuidará da criação do perfil na tabela "usuarios" automaticamente.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      // Você pode passar dados adicionais aqui que o gatilho pode usar se precisar
      options: {
        data: {
            nome: result.data.nome,
            tipo: result.data.tipo,
            telefone: result.data.telefone,
            cpf: result.data.cpf
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 400 },
      );
    }

    // Verificação de segurança para garantir que o usuário foi criado antes de prosseguir
    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: "Erro ao criar usuário, tente novamente." },
        { status: 500 },
      );
    }

    // A resposta de sucesso agora informa ao frontend que o próximo passo é a confirmação do e-mail.
    return NextResponse.json({
      success: true,
      message: "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.",
    }, { status: 201 });

  } catch (error) {
    console.error("Erro inesperado ao cadastrar usuário:", error);
    return NextResponse.json(
      { success: false, message: "Ocorreu um erro no servidor." },
      { status: 500 },
    );
  }
}
