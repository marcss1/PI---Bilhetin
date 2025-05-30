/*
Este é um script de referência para atualizar as tabelas no Supabase.
Você pode executar estas queries no SQL Editor do Supabase.

IMPORTANTE: Execute estas queries na ordem apresentada para evitar erros.
*/

/*
-- 1. ADICIONAR NOVOS CAMPOS À TABELA DE COMPRAS
-- Estes campos armazenam informações sobre o pagamento no Mercado Pago

ALTER TABLE compras 
ADD COLUMN preferencia_id TEXT,        -- ID da preferência criada no Mercado Pago
ADD COLUMN pagamento_id TEXT,          -- ID do pagamento processado no Mercado Pago
ADD COLUMN pagamento_status TEXT,      -- Status original do pagamento no Mercado Pago
ADD COLUMN pagamento_metodo TEXT,      -- Método de pagamento usado (cartão, boleto, pix, etc.)
ADD COLUMN pagamento_detalhes JSONB;   -- Dados completos do pagamento em formato JSON

-- 2. ATUALIZAR OS VALORES POSSÍVEIS PARA O STATUS DA COMPRA
-- Remove a constraint antiga se existir
ALTER TABLE compras 
DROP CONSTRAINT IF EXISTS compras_status_check;

-- Adiciona nova constraint com os status atualizados
ALTER TABLE compras 
ADD CONSTRAINT compras_status_check 
CHECK (status IN (
  'pendente',              -- Carrinho ainda não finalizado
  'aguardando_pagamento',  -- Pagamento sendo processado no Mercado Pago
  'confirmado',            -- Pagamento aprovado e ingressos liberados
  'cancelado'              -- Pagamento rejeitado ou cancelado
));

-- 3. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
-- Índice para buscar compras por preferência do Mercado Pago
CREATE INDEX IF NOT EXISTS idx_compras_preferencia_id 
ON compras(preferencia_id);

-- Índice para buscar compras por ID do pagamento
CREATE INDEX IF NOT EXISTS idx_compras_pagamento_id 
ON compras(pagamento_id);

-- Índice para buscar compras por status
CREATE INDEX IF NOT EXISTS idx_compras_status 
ON compras(status);

-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN compras.preferencia_id IS 'ID da preferência de pagamento criada no Mercado Pago';
COMMENT ON COLUMN compras.pagamento_id IS 'ID do pagamento processado no Mercado Pago';
COMMENT ON COLUMN compras.pagamento_status IS 'Status original do pagamento retornado pelo Mercado Pago';
COMMENT ON COLUMN compras.pagamento_metodo IS 'Método de pagamento utilizado (credit_card, debit_card, ticket, etc.)';
COMMENT ON COLUMN compras.pagamento_detalhes IS 'Dados completos do pagamento em formato JSON para auditoria';
*/
