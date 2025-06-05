-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'produtor')),
  telefone TEXT,
  cpf TEXT UNIQUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  local TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  categoria TEXT NOT NULL,
  imagem TEXT,
  organizador_id UUID NOT NULL REFERENCES usuarios(id),
  informacoes_adicionais TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tipos de Ingresso
CREATE TABLE IF NOT EXISTS tipos_ingresso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  quantidade INTEGER NOT NULL,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE
);

-- Tabela de Compras
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'aguardando_pagamento', 'confirmado', 'cancelado')),
  total DECIMAL(10, 2) NOT NULL,
  preferencia_id TEXT,
  pagamento_id TEXT,
  pagamento_status TEXT,
  pagamento_metodo TEXT,
  pagamento_detalhes JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Compra
CREATE TABLE IF NOT EXISTS itens_compra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  tipo_ingresso_id UUID NOT NULL REFERENCES tipos_ingresso(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  codigo TEXT NOT NULL UNIQUE
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondida BOOLEAN DEFAULT FALSE
);

-- Funções e Triggers para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_eventos_updated_at
BEFORE UPDATE ON eventos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_compras_updated_at
BEFORE UPDATE ON compras
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de Segurança RLS (Row Level Security)
-- Ative o RLS para todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_ingresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY IF NOT EXISTS "Usuários podem ver seus próprios dados" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Políticas para eventos
CREATE POLICY IF NOT EXISTS "Qualquer um pode ver eventos" ON eventos
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Produtores podem criar eventos" ON eventos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND tipo = 'produtor'
    )
  );

CREATE POLICY IF NOT EXISTS "Produtores podem atualizar seus próprios eventos" ON eventos
  FOR UPDATE USING (organizador_id = auth.uid());

-- Políticas para tipos de ingresso
CREATE POLICY IF NOT EXISTS "Qualquer um pode ver tipos de ingresso" ON tipos_ingresso
  FOR SELECT USING (true);

-- Políticas para compras
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias compras" ON compras
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias compras" ON compras
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias compras" ON compras
  FOR UPDATE USING (usuario_id = auth.uid());

-- Políticas para itens de compra
CREATE POLICY IF NOT EXISTS "Usuários podem ver seus próprios itens de compra" ON itens_compra
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compras
      WHERE compras.id = itens_compra.compra_id AND compras.usuario_id = auth.uid()
    )
  );

-- Políticas para mensagens
CREATE POLICY IF NOT EXISTS "Qualquer um pode criar mensagens" ON mensagens
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias mensagens" ON mensagens
  FOR SELECT USING (usuario_id = auth.uid() OR usuario_id IS NULL);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_compras_preferencia_id ON compras(preferencia_id);
CREATE INDEX IF NOT EXISTS idx_compras_pagamento_id ON compras(pagamento_id);
CREATE INDEX IF NOT EXISTS idx_compras_status ON compras(status);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id) -- Um usuário só pode avaliar um evento uma vez
);

-- Políticas para avaliações
CREATE POLICY IF NOT EXISTS "Qualquer um pode ver avaliações" ON avaliacoes
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias avaliações" ON avaliacoes
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Índices para avaliações
CREATE INDEX IF NOT EXISTS idx_avaliacoes_evento_id ON avaliacoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario_id ON avaliacoes(usuario_id);

-- Índices para melhorar performance
