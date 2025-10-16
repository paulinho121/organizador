-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE
-- Organizador Diário
-- =====================================================

-- Criar tabela de perfis (profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security) para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política RLS para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- Criar tabela de clientes (clients)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_info TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clients
CREATE POLICY "Usuários podem ver apenas seus próprios clientes" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios clientes" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios clientes" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Criar tabela de reuniões (meetings)
-- =====================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  pauta TEXT, -- Campo para a pauta da reunião
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para meetings
CREATE POLICY "Usuários podem ver apenas suas próprias reuniões" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias reuniões" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias reuniões" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias reuniões" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Criar tabela de vendas (sales)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients ON DELETE SET NULL,
  product_service TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2) NOT NULL,
  commission_value DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sales
CREATE POLICY "Usuários podem ver apenas suas próprias vendas" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias vendas" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias vendas" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias vendas" ON sales
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Criar tabela de lembretes (reminders)
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reminders
CREATE POLICY "Usuários podem ver apenas seus próprios lembretes" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios lembretes" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios lembretes" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios lembretes" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Criar tabela de orçamentos (quotes)
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    product_service TEXT NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente', -- (pendente, aceito, recusado)
    quote_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para quotes
CREATE POLICY "Usuários podem ver apenas seus próprios orçamentos" ON quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios orçamentos" ON quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios orçamentos" ON quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios orçamentos" ON quotes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Criar índices para melhorar performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
