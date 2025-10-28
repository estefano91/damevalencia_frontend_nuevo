-- SISTEMA DE TRUST & VERIFICATION - Aura Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de documentos de verificación
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Documento
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'passport', 'business_license', 'corporate_certificate', 'tax_id', 'proof_of_address', 'bank_statement', 'other')),
  document_number TEXT,
  
  -- Archivos
  front_url TEXT,
  back_url TEXT,
  additional_files TEXT[],
  
  -- Metadata
  country TEXT,
  issued_date DATE,
  expiry_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
  rejection_reason TEXT,
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Crear tabla de verificaciones (badges)
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'business', 'professional', 'elite', 'legacy')),
  verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'intermediate', 'advanced', 'elite')),
  
  -- Badge info
  badge_name TEXT,
  badge_icon TEXT,
  badge_color TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended', 'revoked')),
  verified_at TIMESTAMPTZ,
  
  -- Reviewer
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  expires_at TIMESTAMPTZ,
  renewal_required BOOLEAN DEFAULT FALSE,
  renewal_reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 3: Crear tabla de sistema anti-fraude (reputación)
CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN ('fake_profile', 'scam', 'harassment', 'spam', 'inappropriate_content', 'identity_theft', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Evidence
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  chat_message_ids TEXT[],
  post_ids TEXT[],
  
  -- AI Analysis
  ai_confidence_score DECIMAL(5,2),
  ai_moderation_notes TEXT,
  automated_action TEXT, -- 'none', 'flag_for_review', 'temporary_suspend', 'permanent_ban'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed', 'escalated')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(reported_user_id, reporter_id, report_type) -- One report per type per user
);

-- Paso 4: Crear tabla de reviews/ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  -- Categories
  categories JSONB, -- {professionalism: 5, communication: 4, reliability: 5}
  
  -- Metadata
  context TEXT, -- 'connection', 'referral', 'contract', 'event'
  related_entity_id UUID, -- ID of connection, referral, etc
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'hidden', 'deleted')),
  flagged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  flagged_reason TEXT,
  
  -- AI Moderation
  ai_moderation_score DECIMAL(5,2),
  ai_moderation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(reviewed_user_id, reviewer_id, related_entity_id) -- One review per entity
);

-- Paso 5: Crear tabla de reputación
CREATE TABLE IF NOT EXISTS reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Scores
  overall_score DECIMAL(5,2) DEFAULT 100.0,
  trust_score DECIMAL(5,2) DEFAULT 100.0,
  reliability_score DECIMAL(5,2) DEFAULT 100.0,
  professionalism_score DECIMAL(5,2) DEFAULT 100.0,
  
  -- Counts
  total_reviews INTEGER DEFAULT 0,
  positive_reviews INTEGER DEFAULT 0,
  negative_reviews INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  -- History
  score_history JSONB[], -- [{timestamp, score, reason}]
  
  -- Flags
  is_verified BOOLEAN DEFAULT FALSE,
  is_trusted BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_end_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Paso 6: Habilitar RLS
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;

-- Políticas para verification_documents
DROP POLICY IF EXISTS "Users can view own documents" ON verification_documents;
CREATE POLICY "Users can view own documents" 
  ON verification_documents FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own documents" ON verification_documents;
CREATE POLICY "Users can create own documents" 
  ON verification_documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can review documents" ON verification_documents;
CREATE POLICY "System can review documents" 
  ON verification_documents FOR UPDATE 
  USING (true);

-- Políticas para verifications
DROP POLICY IF EXISTS "Everyone can view verifications" ON verifications;
CREATE POLICY "Everyone can view verifications" 
  ON verifications FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can create verifications" ON verifications;
CREATE POLICY "System can create verifications" 
  ON verifications FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update verifications" ON verifications;
CREATE POLICY "System can update verifications" 
  ON verifications FOR UPDATE 
  USING (true);

-- Políticas para fraud_reports
DROP POLICY IF EXISTS "Users can view own reports" ON fraud_reports;
CREATE POLICY "Users can view own reports" 
  ON fraud_reports FOR SELECT 
  USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

DROP POLICY IF EXISTS "Users can create reports" ON fraud_reports;
CREATE POLICY "Users can create reports" 
  ON fraud_reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Políticas para reviews
DROP POLICY IF EXISTS "Everyone can view active reviews" ON reviews;
CREATE POLICY "Everyone can view active reviews" 
  ON reviews FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
CREATE POLICY "Users can create own reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

-- Políticas para reputation_scores
DROP POLICY IF EXISTS "Everyone can view reputation" ON reputation_scores;
CREATE POLICY "Everyone can view reputation" 
  ON reputation_scores FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can update reputation" ON reputation_scores;
CREATE POLICY "System can update reputation" 
  ON reputation_scores FOR ALL 
  USING (true);

-- Paso 7: Crear índices
CREATE INDEX IF NOT EXISTS idx_documents_user ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON fraud_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_scores(user_id);

-- Paso 8: Función para calcular reputación
CREATE OR REPLACE FUNCTION calculate_reputation_score(user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
  v_positive DECIMAL;
  v_negative DECIMAL;
  v_reports DECIMAL;
BEGIN
  -- Get positive/negative counts
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE rating >= 4), 0),
    COALESCE(COUNT(*) FILTER (WHERE rating <= 2), 0),
    COALESCE(COUNT(*) FILTER (WHERE report_type IN ('scam', 'fake_profile')), 0)
  INTO v_positive, v_negative, v_reports
  FROM reviews
  WHERE reviewed_user_id = user_id AND status = 'active';

  -- Calculate score (100 base, + for positive, - for negative and reports)
  v_score := 100.0 + (v_positive * 2.0) - (v_negative * 5.0) - (v_reports * 10.0);
  
  -- Ensure score is between 0 and 200
  v_score := GREATEST(0, LEAST(200, v_score));
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Función para solicitar verificación
CREATE OR REPLACE FUNCTION request_verification(
  p_user_id UUID,
  p_verification_type TEXT,
  p_document_type TEXT,
  p_front_url TEXT,
  p_back_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_doc_id UUID;
  v_verification_id UUID;
BEGIN
  -- Create document entry
  INSERT INTO verification_documents (
    user_id,
    document_type,
    front_url,
    back_url,
    status
  )
  VALUES (
    p_user_id,
    p_document_type,
    p_front_url,
    p_back_url,
    'pending'
  )
  RETURNING id INTO v_doc_id;

  -- Create verification request
  INSERT INTO verifications (
    user_id,
    verification_type,
    status,
    badge_name
  )
  VALUES (
    p_user_id,
    p_verification_type,
    'pending',
    CASE p_verification_type
      WHEN 'identity' THEN 'Verified Identity'
      WHEN 'business' THEN 'Verified Business'
      WHEN 'professional' THEN 'Verified Professional'
      WHEN 'elite' THEN 'Elite Member'
      ELSE 'Verified'
    END
  )
  RETURNING id INTO v_verification_id;

  RETURN v_verification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Función para aprobar verificación
CREATE OR REPLACE FUNCTION approve_verification(
  p_verification_id UUID,
  p_reviewer_id UUID,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE verifications
  SET 
    status = 'verified',
    verified_at = now(),
    reviewed_by = p_reviewer_id,
    reviewed_at = now(),
    expires_at = p_expires_at
  WHERE id = p_verification_id;

  -- Update profile to show verified badge
  UPDATE profiles p
  SET verified = TRUE
  FROM verifications v
  WHERE v.id = p_verification_id
    AND v.user_id = p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 11: Función para reportar fraude
CREATE OR REPLACE FUNCTION report_fraud(
  p_reported_user_id UUID,
  p_reporter_id UUID,
  p_report_type TEXT,
  p_description TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
  v_confidence_score DECIMAL;
BEGIN
  -- Simple AI confidence scoring based on report type and description
  SELECT 
    CASE 
      WHEN p_report_type IN ('scam', 'fake_profile') THEN 0.8
      WHEN p_report_type = 'harassment' THEN 0.6
      ELSE 0.4
    END
  INTO v_confidence_score;

  -- Create report
  INSERT INTO fraud_reports (
    reported_user_id,
    reporter_id,
    report_type,
    severity,
    description,
    evidence_urls,
    ai_confidence_score,
    automated_action
  )
  VALUES (
    p_reported_user_id,
    p_reporter_id,
    p_report_type,
    p_severity,
    p_description,
    p_evidence_urls,
    v_confidence_score,
    CASE 
      WHEN v_confidence_score > 0.7 AND p_severity IN ('high', 'critical') THEN 'flag_for_review'
      ELSE 'none'
    END
  )
  RETURNING id INTO v_report_id;

  -- If high confidence, auto-update reputation
  IF v_confidence_score > 0.7 THEN
    UPDATE reputation_scores
    SET 
      report_count = report_count + 1,
      overall_score = overall_score - 10.0,
      updated_at = now()
    WHERE user_id = p_reported_user_id;
  END IF;

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 12: Trigger para actualizar reputación cuando se crea review
CREATE OR REPLACE FUNCTION update_reputation_on_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update reputation score
  INSERT INTO reputation_scores (user_id, overall_score)
  VALUES (NEW.reviewed_user_id, NEW.rating * 20.0)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_reviews = reputation_scores.total_reviews + 1,
    positive_reviews = reputation_scores.positive_reviews + CASE WHEN NEW.rating >= 4 THEN 1 ELSE 0 END,
    negative_reviews = reputation_scores.negative_reviews + CASE WHEN NEW.rating <= 2 THEN 1 ELSE 0 END,
    overall_score = calculate_reputation_score(NEW.reviewed_user_id),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reputation_on_review ON reviews;
CREATE TRIGGER trigger_update_reputation_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reputation_on_review();

-- Paso 13: Datos iniciales
INSERT INTO reputation_scores (user_id, overall_score, trust_score, reliability_score, professionalism_score)
SELECT id, 100.0, 100.0, 100.0, 100.0
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM reputation_scores WHERE user_id = profiles.id
)
ON CONFLICT DO NOTHING;

-- Paso 14: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('verification_documents', 'verifications', 'fraud_reports', 'reviews', 'reputation_scores')
ORDER BY table_name;


