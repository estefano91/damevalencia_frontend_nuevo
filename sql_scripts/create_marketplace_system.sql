-- SISTEMA DE MARKETPLACE - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de contract templates (plantillas estandarizadas)
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('player_contract', 'sponsor_deal', 'coach_contract', 'partnership', 'endorsement')),
  sport TEXT,
  template_content JSONB NOT NULL, -- Estructura del contrato
  default_terms JSONB, -- Términos por defecto
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Crear tabla de contracts (contratos activos)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('player', 'coach', 'sponsor', 'partnership', 'endorsement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Parties
  party_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  party_a_type TEXT, -- club, player, agent, sponsor, investor
  party_b_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  party_b_type TEXT,
  
  -- Terms
  terms JSONB NOT NULL, -- All terms as JSON
  salary_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  duration_months INTEGER,
  start_date DATE,
  end_date DATE,
  
  -- Signatures
  party_a_signed BOOLEAN DEFAULT FALSE,
  party_a_signed_at TIMESTAMPTZ,
  party_a_signature_data JSONB, -- signature data
  party_b_signed BOOLEAN DEFAULT FALSE,
  party_b_signed_at TIMESTAMPTZ,
  party_b_signature_data JSONB,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'counter_offer', 'signed', 'active', 'completed', 'terminated')),
  negotiation_notes TEXT[],
  
  -- Visibility
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'verified_only')),
  visible_to_verified_agents BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 3: Crear tabla de partnerships (sugerencias inteligentes)
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsored_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Match details
  match_score INTEGER NOT NULL, -- 0-100
  match_reasons TEXT[] NOT NULL,
  
  -- Categories
  partnership_type TEXT CHECK (partnership_type IN ('sponsorship', 'endorsement', 'collaboration', 'investment')),
  sport TEXT,
  target_audience TEXT,
  budget_range TEXT,
  
  -- Status
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'interested', 'negotiating', 'active', 'declined')),
  
  -- Metadata
  suggested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(sponsor_id, sponsored_id, partnership_type)
);

-- Paso 4: Crear tabla de digital signatures
CREATE TABLE IF NOT EXISTS digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  signature_data JSONB NOT NULL, -- Signature canvas data
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Compliance
  consent_text TEXT,
  terms_version INTEGER DEFAULT 1
);

-- Paso 5: Habilitar RLS
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas para contract_templates
DROP POLICY IF EXISTS "Everyone can view public templates" ON contract_templates;
CREATE POLICY "Everyone can view public templates" 
  ON contract_templates FOR SELECT 
  USING (is_public = TRUE OR created_by = auth.uid());

DROP POLICY IF EXISTS "Verified agents can create templates" ON contract_templates;
CREATE POLICY "Verified agents can create templates" 
  ON contract_templates FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (user_type IN ('agent', 'club') AND verified = TRUE)
    )
  );

-- Políticas para contracts
DROP POLICY IF EXISTS "Users can view their own contracts" ON contracts;
CREATE POLICY "Users can view their own contracts" 
  ON contracts FOR SELECT 
  USING (
    auth.uid() = party_a_id 
    OR auth.uid() = party_b_id
    OR (
      visibility = 'public'
      OR (visibility = 'verified_only' AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'agent' AND verified = TRUE
      ))
    )
  );

DROP POLICY IF EXISTS "Users can create contracts" ON contracts;
CREATE POLICY "Users can create contracts" 
  ON contracts FOR INSERT 
  WITH CHECK (auth.uid() = party_a_id);

DROP POLICY IF EXISTS "Contract parties can update contracts" ON contracts;
CREATE POLICY "Contract parties can update contracts" 
  ON contracts FOR UPDATE 
  USING (auth.uid() = party_a_id OR auth.uid() = party_b_id);

-- Políticas para partnerships
DROP POLICY IF EXISTS "Users can view partnership suggestions" ON partnerships;
CREATE POLICY "Users can view partnership suggestions" 
  ON partnerships FOR SELECT 
  USING (
    auth.uid() = sponsor_id 
    OR auth.uid() = sponsored_id
  );

DROP POLICY IF EXISTS "System can create partnerships" ON partnerships;
CREATE POLICY "System can create partnerships" 
  ON partnerships FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Parties can update partnerships" ON partnerships;
CREATE POLICY "Parties can update partnerships" 
  ON partnerships FOR UPDATE 
  USING (auth.uid() = sponsor_id OR auth.uid() = sponsored_id);

-- Políticas para digital_signatures
DROP POLICY IF EXISTS "Contract parties can view signatures" ON digital_signatures;
CREATE POLICY "Contract parties can view signatures" 
  ON digital_signatures FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE id = digital_signatures.contract_id
      AND (party_a_id = auth.uid() OR party_b_id = auth.uid())
    )
    OR signer_id = auth.uid()
  );

DROP POLICY IF EXISTS "Authorized users can create signatures" ON digital_signatures;
CREATE POLICY "Authorized users can create signatures" 
  ON digital_signatures FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE id = contract_id
      AND (party_a_id = auth.uid() OR party_b_id = auth.uid())
    )
    AND signer_id = auth.uid()
  );

-- Paso 6: Crear índices
CREATE INDEX IF NOT EXISTS idx_contracts_party_a ON contracts(party_a_id);
CREATE INDEX IF NOT EXISTS idx_contracts_party_b ON contracts(party_b_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_visibility ON contracts(visibility);
CREATE INDEX IF NOT EXISTS idx_contract_templates_category ON contract_templates(category);
CREATE INDEX IF NOT EXISTS idx_partnerships_sponsor ON partnerships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_sponsored ON partnerships(sponsored_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_match_score ON partnerships(match_score DESC);

-- Paso 7: Función para generar sugerencias de partnerships
CREATE OR REPLACE FUNCTION generate_partnership_suggestions(
  target_profile_id UUID,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggested_partner profiles,
  match_score INTEGER,
  match_reasons TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH target AS (
    SELECT * FROM profiles WHERE id = target_profile_id
  ),
  candidates AS (
    SELECT p.*
    FROM profiles p
    WHERE p.id != target_profile_id
      AND p.verified = TRUE
      AND p.user_type IN ('sponsor', 'investor')
  )
  SELECT 
    c.*,
    (
      -- Match scoring algorithm
      (CASE WHEN t.sport = c.sport THEN 30 ELSE 0 END) +
      (CASE WHEN t.country = c.country THEN 25 ELSE 0 END) +
      (CASE WHEN c.verified THEN 20 ELSE 0 END) +
      (CASE WHEN c.elite_member THEN 15 ELSE 0 END) +
      (CASE WHEN t.aura_score > 700 AND c.aura_score > 700 THEN 10 ELSE 0 END)
    ) as score,
    ARRAY[
      CASE WHEN t.sport = c.sport THEN 'Same sport' ELSE NULL END,
      CASE WHEN c.verified THEN 'Verified partner' ELSE NULL END,
      CASE WHEN c.elite_member THEN 'Elite member' ELSE NULL END
    ] FILTER (WHERE it IS NOT NULL) as reasons
  FROM target t
  CROSS JOIN candidates c
  WHERE (
    -- Match scoring algorithm
    (CASE WHEN t.sport = c.sport THEN 30 ELSE 0 END) +
    (CASE WHEN c.verified THEN 20 ELSE 0 END) +
    (CASE WHEN c.elite_member THEN 15 ELSE 0 END)
  ) > 0
  ORDER BY score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 8: Función para firmar contrato digitalmente
CREATE OR REPLACE FUNCTION sign_contract(
  p_contract_id UUID,
  p_signer_id UUID,
  p_signature_data JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Insert signature record
  INSERT INTO digital_signatures (
    contract_id,
    signer_id,
    signature_data
  )
  VALUES (
    p_contract_id,
    p_signer_id,
    p_signature_data
  );

  -- Update contract status
  UPDATE contracts
  SET 
    party_a_signed = CASE WHEN party_a_id = p_signer_id THEN TRUE ELSE party_a_signed END,
    party_a_signed_at = CASE WHEN party_a_id = p_signer_id THEN now() ELSE party_a_signed_at END,
    party_a_signature_data = CASE WHEN party_a_id = p_signer_id THEN p_signature_data ELSE party_a_signature_data END,
    party_b_signed = CASE WHEN party_b_id = p_signer_id THEN TRUE ELSE party_b_signed END,
    party_b_signed_at = CASE WHEN party_b_id = p_signer_id THEN now() ELSE party_b_signed_at END,
    party_b_signature_data = CASE WHEN party_b_id = p_signer_id THEN p_signature_data ELSE party_b_signature_data END,
    status = CASE 
      WHEN (party_a_id = p_signer_id OR party_a_signed = TRUE) 
        AND (party_b_id = p_signer_id OR party_b_signed = TRUE)
      THEN 'signed'
      ELSE status
    END
  WHERE id = p_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Trigger para actualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_contracts_timestamp
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_timestamp();

-- Paso 10: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('contract_templates', 'contracts', 'partnerships', 'digital_signatures')
ORDER BY table_name;


