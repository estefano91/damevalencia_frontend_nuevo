-- SISTEMA DE SEGUIMIENTO Y VALIDACIÓN DE REFERENCIAS - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de oportunidades (club offers)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  position TEXT,
  contract_type TEXT CHECK (contract_type IN ('trial', 'permanent', 'temporary')),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'filled')),
  requirements TEXT[],
  location TEXT,
  salary_range TEXT,
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Crear tabla de registros de referencia
CREATE TABLE IF NOT EXISTS referral_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  referral_code TEXT,
  referral_date TIMESTAMPTZ DEFAULT now(),
  interaction_status TEXT DEFAULT 'viewed' CHECK (interaction_status IN ('viewed', 'contacted', 'trial', 'contracted')),
  validation_state TEXT DEFAULT 'unconfirmed' CHECK (validation_state IN ('unconfirmed', 'confirmed_by_club', 'confirmed_by_player', 'community_verified', 'pending_validation')),
  evidence_links TEXT[],
  club_confirmed_at TIMESTAMPTZ,
  player_confirmed_at TIMESTAMPTZ,
  community_verified_at TIMESTAMPTZ,
  verified_by TEXT[] DEFAULT ARRAY[]::TEXT[], -- User IDs who verified
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 3: Crear tabla de validaciones comunitarias
CREATE TABLE IF NOT EXISTS community_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_record_id UUID NOT NULL REFERENCES referral_records(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  validator_role TEXT CHECK (validator_role IN ('club_rep', 'other_player', 'admin')),
  validation_type TEXT CHECK (validation_type IN ('confirm', 'dispute')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referral_record_id, validator_id)
);

-- Paso 4: Habilitar RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_validations ENABLE ROW LEVEL SECURITY;

-- Políticas para opportunities
CREATE POLICY "Everyone can view active opportunities" 
  ON opportunities FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Clubs can create their own opportunities" 
  ON opportunities FOR INSERT 
  WITH CHECK (auth.uid() = club_id);

CREATE POLICY "Clubs can update their own opportunities" 
  ON opportunities FOR UPDATE 
  USING (auth.uid() = club_id);

-- Políticas para referral_records
CREATE POLICY "Users can view their own referral records" 
  ON referral_records FOR SELECT 
  USING (
    auth.uid() = referrer_id 
    OR auth.uid() = player_id 
    OR auth.uid() = club_id
  );

CREATE POLICY "System can create referral records" 
  ON referral_records FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own referral records" 
  ON referral_records FOR UPDATE 
  USING (
    auth.uid() = referrer_id 
    OR auth.uid() = player_id 
    OR auth.uid() = club_id
  );

-- Políticas para community_validations
CREATE POLICY "Users can view validations for their referral records" 
  ON community_validations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM referral_records 
      WHERE referral_records.id = community_validations.referral_record_id
      AND (
        referral_records.referrer_id = auth.uid()
        OR referral_records.player_id = auth.uid()
        OR referral_records.club_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create validations" 
  ON community_validations FOR INSERT 
  WITH CHECK (auth.uid() = validator_id);

-- Paso 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_referral_records_referrer ON referral_records(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_records_player ON referral_records(player_id);
CREATE INDEX IF NOT EXISTS idx_referral_records_club ON referral_records(club_id);
CREATE INDEX IF NOT EXISTS idx_referral_records_status ON referral_records(interaction_status);
CREATE INDEX IF NOT EXISTS idx_referral_records_validation ON referral_records(validation_state);
CREATE INDEX IF NOT EXISTS idx_opportunities_club ON opportunities(club_id);
CREATE INDEX IF NOT EXISTS idx_community_validations_referral ON community_validations(referral_record_id);

-- Paso 6: Función para registrar referencia automáticamente
CREATE OR REPLACE FUNCTION register_referral(
  p_referrer_id UUID,
  p_player_id UUID,
  p_club_id UUID,
  p_opportunity_id UUID DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_record_id UUID;
BEGIN
  INSERT INTO referral_records (
    referrer_id,
    player_id,
    club_id,
    opportunity_id,
    referral_code
  )
  VALUES (
    p_referrer_id,
    p_player_id,
    p_club_id,
    p_opportunity_id,
    p_referral_code
  )
  RETURNING id INTO new_record_id;
  
  RETURN new_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 7: Función para que club confirme contratación
CREATE OR REPLACE FUNCTION confirm_hire_by_club(
  p_referral_id UUID,
  p_status TEXT DEFAULT 'contracted'
)
RETURNS VOID AS $$
BEGIN
  UPDATE referral_records
  SET 
    interaction_status = p_status,
    validation_state = 'confirmed_by_club',
    club_confirmed_at = now(),
    updated_at = now()
  WHERE id = p_referral_id
    AND club_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 8: Función para que jugador se auto-confirme
CREATE OR REPLACE FUNCTION self_confirm_by_player(
  p_referral_id UUID,
  p_evidence_links TEXT[] DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE referral_records
  SET 
    interaction_status = 'contracted',
    validation_state = 'confirmed_by_player',
    player_confirmed_at = now(),
    evidence_links = COALESCE(p_evidence_links, evidence_links),
    updated_at = now()
  WHERE id = p_referral_id
    AND player_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Función para que referente haga reclamo
CREATE OR REPLACE FUNCTION submit_recognition_claim(
  p_referral_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE referral_records
  SET 
    validation_state = 'pending_validation',
    updated_at = now()
  WHERE id = p_referral_id
    AND referrer_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Función para validación comunitaria
CREATE OR REPLACE FUNCTION submit_community_validation(
  p_referral_id UUID,
  p_validator_role TEXT,
  p_validation_type TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  validation_count INTEGER;
  v_validator_id UUID;
BEGIN
  v_validator_id := auth.uid();
  
  -- Insertar validación
  INSERT INTO community_validations (
    referral_record_id,
    validator_id,
    validator_role,
    validation_type,
    notes
  )
  VALUES (
    p_referral_id,
    v_validator_id,
    p_validator_role,
    p_validation_type,
    p_notes
  );
  
  -- Contar validaciones confirmatorias
  SELECT COUNT(*) INTO validation_count
  FROM community_validations
  WHERE referral_record_id = p_referral_id
    AND validation_type = 'confirm';
  
  -- Si hay 2+ validaciones confirmatorias, actualizar estado
  IF validation_count >= 2 THEN
    UPDATE referral_records
    SET 
      validation_state = 'community_verified',
      community_verified_at = now(),
      verified_by = ARRAY(
        SELECT validator_id::TEXT
        FROM community_validations
        WHERE referral_record_id = p_referral_id
          AND validation_type = 'confirm'
      ),
      updated_at = now()
    WHERE id = p_referral_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 11: Función para obtener stats del referente
CREATE OR REPLACE FUNCTION get_referrer_stats(p_referrer_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  confirmed_hires BIGINT,
  community_verified BIGINT,
  pending_validation BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_referrals,
    COUNT(*) FILTER (WHERE validation_state IN ('confirmed_by_club', 'confirmed_by_player'))::BIGINT as confirmed_hires,
    COUNT(*) FILTER (WHERE validation_state = 'community_verified')::BIGINT as community_verified,
    COUNT(*) FILTER (WHERE validation_state = 'pending_validation')::BIGINT as pending_validation
  FROM referral_records
  WHERE referrer_id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 12: Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_referral_record_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_record_timestamp
  BEFORE UPDATE ON referral_records
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_record_timestamp();

-- Paso 13: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('opportunities', 'referral_records', 'community_validations')
ORDER BY table_name;

SELECT routine_name 
FROM information_schema.routines
WHERE routine_name LIKE '%referral%' OR routine_name LIKE '%confirm%'
ORDER BY routine_name;


