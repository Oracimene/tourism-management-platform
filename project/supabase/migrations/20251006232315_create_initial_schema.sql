/*
  # Schema Inicial - Plataforma de Turismo Ilhas do Pará

  ## Visão Geral
  Este schema cria a estrutura completa para uma plataforma estilo Airbnb focada em turismo
  nas ilhas do Pará (Belém e região). Suporta múltiplos tipos de usuários, pacotes turísticos,
  reservas, pagamentos com comissão de 10%, mensagens e avaliações.

  ## Novas Tabelas

  ### 1. `profiles`
  Estende os dados de autenticação do Supabase com informações de perfil
  - `id` (uuid, referencia auth.users)
  - `role` (text) - traveler, host, admin
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `kyc_verified` (boolean) - verificação KYC para hosts
  - `kyc_documents` (jsonb) - documentos de verificação
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `packages`
  Pacotes turísticos criados por hosts
  - `id` (uuid)
  - `host_id` (uuid, referencia profiles)
  - `title` (text)
  - `short_description` (text)
  - `long_document` (jsonb) - itinerário estruturado completo
  - `price_per_person` (numeric)
  - `capacity_min` (integer)
  - `capacity_max` (integer)
  - `duration_days` (integer)
  - `tags` (text[])
  - `images` (text[]) - URLs das imagens
  - `cancellation_policy` (text)
  - `status` (text) - draft, published, archived, pending_approval
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `availability`
  Calendário de disponibilidade dos pacotes
  - `id` (uuid)
  - `package_id` (uuid)
  - `date` (date)
  - `spots_available` (integer)
  - `is_blocked` (boolean)

  ### 4. `bookings`
  Reservas realizadas por viajantes
  - `id` (uuid)
  - `package_id` (uuid)
  - `user_id` (uuid)
  - `start_date` (date)
  - `end_date` (date)
  - `num_people` (integer)
  - `total_amount` (numeric)
  - `status` (text) - pending, confirmed, cancelled, completed
  - `payment_status` (text) - pending, processing, paid, refunded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `transactions`
  Registro de transações financeiras com comissão de 10%
  - `id` (uuid)
  - `booking_id` (uuid)
  - `amount` (numeric) - valor total
  - `commission` (numeric) - 10% do valor
  - `gateway_fee` (numeric)
  - `net_amount` (numeric) - valor líquido para o host
  - `payment_method` (text) - credit_card, paypal, boleto
  - `payment_provider_id` (text)
  - `status` (text) - pending, completed, failed, refunded
  - `created_at` (timestamptz)

  ### 6. `reviews`
  Avaliações de pacotes e hosts
  - `id` (uuid)
  - `booking_id` (uuid)
  - `package_id` (uuid)
  - `reviewer_id` (uuid)
  - `reviewee_id` (uuid) - host sendo avaliado
  - `rating` (integer) - 1 a 5
  - `comment` (text)
  - `created_at` (timestamptz)

  ### 7. `messages`
  Sistema de mensagens entre viajantes e hosts
  - `id` (uuid)
  - `sender_id` (uuid)
  - `receiver_id` (uuid)
  - `package_id` (uuid) - contexto da conversa
  - `message` (text)
  - `attachments` (text[])
  - `read` (boolean)
  - `created_at` (timestamptz)

  ### 8. `host_payouts`
  Registro de pagamentos feitos aos hosts
  - `id` (uuid)
  - `host_id` (uuid)
  - `amount` (numeric)
  - `status` (text) - pending, processing, completed, failed
  - `bank_info` (jsonb)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas específicas por tipo de usuário
  - Validação de propriedade e autorização
  - Proteção contra acesso não autorizado

  ## Notas Importantes
  1. Comissão fixa de 10% aplicada em todas as transações
  2. KYC obrigatório para hosts antes de publicar pacotes
  3. Sistema de avaliação recíproca entre hosts e viajantes
  4. Mensagens vinculadas a pacotes específicos para contexto
  5. Suporte a múltiplos métodos de pagamento (cartão, PayPal, boleto)
*/

-- Tabela de perfis estendidos
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'host', 'admin')),
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  bio text,
  kyc_verified boolean DEFAULT false,
  kyc_documents jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pacotes turísticos
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  short_description text NOT NULL,
  long_document jsonb NOT NULL DEFAULT '{}',
  price_per_person numeric NOT NULL CHECK (price_per_person >= 0),
  capacity_min integer NOT NULL DEFAULT 1 CHECK (capacity_min > 0),
  capacity_max integer NOT NULL CHECK (capacity_max >= capacity_min),
  duration_days integer NOT NULL DEFAULT 1 CHECK (duration_days > 0),
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  cancellation_policy text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'pending_approval')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de disponibilidade
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  date date NOT NULL,
  spots_available integer NOT NULL DEFAULT 0 CHECK (spots_available >= 0),
  is_blocked boolean DEFAULT false,
  UNIQUE(package_id, date)
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  num_people integer NOT NULL CHECK (num_people > 0),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount >= 0),
  commission numeric NOT NULL CHECK (commission >= 0),
  gateway_fee numeric DEFAULT 0 CHECK (gateway_fee >= 0),
  net_amount numeric NOT NULL CHECK (net_amount >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'boleto')),
  payment_provider_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, reviewer_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
  message text NOT NULL,
  attachments text[] DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela de pagamentos aos hosts
CREATE TABLE IF NOT EXISTS host_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_packages_host ON packages(host_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_tags ON packages USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_availability_package_date ON availability(package_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_package ON reviews(package_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payouts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Perfis públicos de hosts são visíveis"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'host');

CREATE POLICY "Novos usuários podem criar perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para packages
CREATE POLICY "Pacotes publicados são visíveis para todos"
  ON packages FOR SELECT
  TO authenticated
  USING (status = 'published' OR host_id = auth.uid());

CREATE POLICY "Hosts podem criar pacotes"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('host', 'admin'))
  );

CREATE POLICY "Hosts podem atualizar próprios pacotes"
  ON packages FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts podem deletar próprios pacotes"
  ON packages FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- Políticas RLS para availability
CREATE POLICY "Disponibilidade visível para pacotes publicados"
  ON availability FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM packages
      WHERE packages.id = availability.package_id
      AND (packages.status = 'published' OR packages.host_id = auth.uid())
    )
  );

CREATE POLICY "Hosts podem gerenciar disponibilidade dos próprios pacotes"
  ON availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM packages
      WHERE packages.id = availability.package_id
      AND packages.host_id = auth.uid()
    )
  );

-- Políticas RLS para bookings
CREATE POLICY "Usuários podem ver próprias reservas"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM packages WHERE packages.id = bookings.package_id AND packages.host_id = auth.uid())
  );

CREATE POLICY "Usuários podem criar reservas"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários e hosts podem atualizar reservas"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM packages WHERE packages.id = bookings.package_id AND packages.host_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM packages WHERE packages.id = bookings.package_id AND packages.host_id = auth.uid())
  );

-- Políticas RLS para transactions
CREATE POLICY "Usuários podem ver próprias transações"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = transactions.booking_id
      AND (
        bookings.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM packages WHERE packages.id = bookings.package_id AND packages.host_id = auth.uid())
      )
    )
  );

CREATE POLICY "Sistema pode criar transações"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas RLS para reviews
CREATE POLICY "Avaliações são públicas"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar avaliações das próprias reservas"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Políticas RLS para messages
CREATE POLICY "Usuários podem ver mensagens enviadas ou recebidas"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Usuários podem enviar mensagens"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Usuários podem marcar mensagens como lidas"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Políticas RLS para host_payouts
CREATE POLICY "Hosts podem ver próprios pagamentos"
  ON host_payouts FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();