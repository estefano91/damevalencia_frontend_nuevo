-- SISTEMA DE PREMIUM Y MONETIZACIÓN - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de planes premium
CREATE TABLE IF NOT EXISTS premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'professional', 'elite')),
  
  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Features
  features JSONB NOT NULL, -- {visibility_boost, analytics, verified_aura, etc}
  visibility_boost_multiplier DECIMAL(5,2) DEFAULT 1.0,
  
  -- Limits
  max_boosts_per_month INTEGER DEFAULT 0,
  max_connects_per_month INTEGER DEFAULT 999,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Crear tabla de suscripciones premium
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES premium_plans(id),
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- Billing
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Payment
  payment_method TEXT,
  billing_email TEXT,
  
  -- Metadata
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id) -- One active subscription per user
);

-- Paso 3: Crear tabla de sistema de créditos Auras
CREATE TABLE IF NOT EXISTS aura_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  balance DECIMAL(10,2) DEFAULT 0.00,
  
  -- Transaction history
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Paso 4: Crear tabla de transacciones de créditos
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'purchase', 'reward')),
  amount DECIMAL(10,2) NOT NULL,
  
  -- Context
  source TEXT, -- 'referral', 'boost', 'partnership', 'purchase'
  related_entity_id UUID, -- ID of related post, referral, etc
  description TEXT,
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Paso 5: Crear tabla de paquetes de patrocinio
CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Targeting
  target_audience TEXT[] NOT NULL,
  target_sports TEXT[],
  target_countries TEXT[],
  target_levels TEXT[],
  
  -- Package details
  package_type TEXT NOT NULL CHECK (package_type IN ('feed_ad', 'profile_boost', 'event_sponsor', 'exclusive_partnership')),
  duration_days INTEGER NOT NULL,
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Content
  banner_url TEXT,
  video_url TEXT,
  landing_page_url TEXT,
  promo_code TEXT,
  
  -- Metrics
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 6: Crear tabla de affiliate rewards
CREATE TABLE IF NOT EXISTS affiliate_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reward source
  reward_type TEXT NOT NULL CHECK (reward_type IN ('referral', 'partnership', 'subscription', 'boost')),
  source_id UUID, -- referral_id, partnership_id, etc
  
  -- Reward amount
  credits_earned DECIMAL(10,2) NOT NULL,
  cash_value DECIMAL(10,2),
  bonus_type TEXT, -- 'instant', 'milestone', 'bonus'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  claimed_at TIMESTAMPTZ,
  
  -- Metadata
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Paso 7: Habilitar RLS
ALTER TABLE premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para premium_plans
DROP POLICY IF EXISTS "Everyone can view active plans" ON premium_plans;
CREATE POLICY "Everyone can view active plans" 
  ON premium_plans FOR SELECT 
  USING (is_active = TRUE);

-- Políticas para premium_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON premium_subscriptions;
CREATE POLICY "Users can view own subscription" 
  ON premium_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create subscriptions" ON premium_subscriptions;
CREATE POLICY "System can create subscriptions" 
  ON premium_subscriptions FOR INSERT 
  WITH CHECK (true);

-- Políticas para aura_credits
DROP POLICY IF EXISTS "Users can view own credits" ON aura_credits;
CREATE POLICY "Users can view own credits" 
  ON aura_credits FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas para credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" 
  ON credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create transactions" ON credit_transactions;
CREATE POLICY "System can create transactions" 
  ON credit_transactions FOR INSERT 
  WITH CHECK (true);

-- Políticas para sponsorship_packages
DROP POLICY IF EXISTS "Everyone can view active packages" ON sponsorship_packages;
CREATE POLICY "Everyone can view active packages" 
  ON sponsorship_packages FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "Brands can create packages" ON sponsorship_packages;
CREATE POLICY "Brands can create packages" 
  ON sponsorship_packages FOR INSERT 
  WITH CHECK (
    auth.uid() = brand_id
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('sponsor', 'investor', 'brand')
    )
  );

-- Políticas para affiliate_rewards
DROP POLICY IF EXISTS "Users can view own rewards" ON affiliate_rewards;
CREATE POLICY "Users can view own rewards" 
  ON affiliate_rewards FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create rewards" ON affiliate_rewards;
CREATE POLICY "System can create rewards" 
  ON affiliate_rewards FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can claim rewards" ON affiliate_rewards;
CREATE POLICY "Users can claim rewards" 
  ON affiliate_rewards FOR UPDATE 
  USING (auth.uid() = user_id);

-- Paso 8: Crear índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_credits_user ON aura_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON credit_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sponsorship_brand ON sponsorship_packages(brand_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_status ON sponsorship_packages(status);
CREATE INDEX IF NOT EXISTS idx_rewards_user ON affiliate_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON affiliate_rewards(status);

-- Paso 9: Función para agregar créditos (earn)
CREATE OR REPLACE FUNCTION add_aura_credits(
  p_user_id UUID,
  p_amount DECIMAL,
  p_source TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update user's credit balance
  INSERT INTO aura_credits (user_id, balance, total_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    balance = aura_credits.balance + p_amount,
    total_earned = aura_credits.total_earned + p_amount,
    updated_at = now();

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    source,
    related_entity_id,
    description
  )
  VALUES (
    p_user_id,
    'earn',
    p_amount,
    p_source,
    p_related_entity_id,
    p_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Función para gastar créditos
CREATE OR REPLACE FUNCTION spend_aura_credits(
  p_user_id UUID,
  p_amount DECIMAL,
  p_source TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  -- Check current balance
  SELECT balance INTO v_balance
  FROM aura_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE aura_credits
  SET 
    balance = balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    source,
    related_entity_id,
    description
  )
  VALUES (
    p_user_id,
    'spend',
    -p_amount,
    p_source,
    p_related_entity_id,
    p_description
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 11: Función para verificar si usuario es premium
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 12: Función para recompensar afiliado
CREATE OR REPLACE FUNCTION reward_affiliate(
  p_user_id UUID,
  p_reward_type TEXT,
  p_credits DECIMAL,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_reward_id UUID;
BEGIN
  INSERT INTO affiliate_rewards (
    user_id,
    reward_type,
    source_id,
    credits_earned,
    description
  )
  VALUES (
    p_user_id,
    p_reward_type,
    p_source_id,
    p_credits,
    p_description
  )
  RETURNING id INTO v_reward_id;

  -- Add credits to user
  PERFORM add_aura_credits(
    p_user_id,
    p_credits,
    'reward',
    p_description,
    p_source_id
  );

  RETURN v_reward_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 13: Trigger para actualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_premium_subscription_timestamp
  BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_timestamp();

-- Paso 14: Datos iniciales - Crear planes premium
INSERT INTO premium_plans (name, tier, monthly_price, yearly_price, features, max_boosts_per_month, advanced_analytics) VALUES
('Basic', 'basic', 9.99, 99.99, '{"verified_aura": true, "basic_analytics": true}', 5, false)
ON CONFLICT DO NOTHING;

INSERT INTO premium_plans (name, tier, monthly_price, yearly_price, features, max_boosts_per_month, advanced_analytics) VALUES
('Professional', 'professional', 29.99, 299.99, '{"verified_aura": true, "advanced_analytics": true, "priority_support": true}', 20, true)
ON CONFLICT DO NOTHING;

INSERT INTO premium_plans (name, tier, monthly_price, yearly_price, features, max_boosts_per_month, advanced_analytics) VALUES
('Elite', 'elite', 99.99, 999.99, '{"verified_aura": true, "advanced_analytics": true, "concierge_support": true, "exclusive_events": true}', 999, true)
ON CONFLICT DO NOTHING;

-- Paso 15: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('premium_plans', 'premium_subscriptions', 'aura_credits', 'credit_transactions', 'sponsorship_packages', 'affiliate_rewards')
ORDER BY table_name;


