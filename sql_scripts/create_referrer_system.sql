-- SISTEMA "HAZTE REFERENTE" - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Agregar campos de referente a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_referrer BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referrer_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS successful_referrals INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referrer_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referrer_rank TEXT DEFAULT NULL;

-- Paso 2: Crear tabla de referencias
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  opportunity_id UUID, -- Para futuras ofertas/plazas
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'accepted', 'rejected')),
  referral_date TIMESTAMPTZ DEFAULT now(),
  success_date TIMESTAMPTZ,
  notes TEXT
);

-- Paso 3: Habilitar RLS en referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para referrals
CREATE POLICY "Referrers can view their own referrals" 
  ON referrals FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "Referrers can create referrals" 
  ON referrals FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Referrers can update their referrals" 
  ON referrals FOR UPDATE 
  USING (auth.uid() = referrer_id);

-- Paso 4: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_code ON profiles(referrer_code);
CREATE INDEX IF NOT EXISTS idx_profiles_is_referrer ON profiles(is_referrer);

-- Paso 5: Función para generar código único de referente
CREATE OR REPLACE FUNCTION generate_referrer_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Genera un código alfanumérico de 8 caracteres
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Verifica si ya existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referrer_code = new_code) INTO exists_code;
    
    -- Si no existe, sal del loop
    EXIT WHEN NOT exists_code;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Paso 6: Función para actualizar estadísticas del referente
CREATE OR REPLACE FUNCTION update_referrer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas cuando cambia el status de la referencia
  IF OLD.status != NEW.status THEN
    UPDATE profiles
    SET 
      total_referrals = (
        SELECT COUNT(*) 
        FROM referrals 
        WHERE referrer_id = NEW.referrer_id
      ),
      successful_referrals = (
        SELECT COUNT(*) 
        FROM referrals 
        WHERE referrer_id = NEW.referrer_id 
        AND status = 'accepted'
      ),
      referrer_points = (
        SELECT 
          COUNT(*) * 10 + -- 10 puntos por cada referencia
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) * 50 -- 50 puntos por éxito
        FROM referrals 
        WHERE referrer_id = NEW.referrer_id
      )
    WHERE id = NEW.referrer_id;
    
    -- Actualizar el rank del referente basado en puntos
    UPDATE profiles
    SET referrer_rank = CASE
      WHEN referrer_points >= 1000 THEN 'legend'
      WHEN referrer_points >= 500 THEN 'expert'
      WHEN referrer_points >= 250 THEN 'pro'
      WHEN referrer_points >= 100 THEN 'rising'
      WHEN referrer_points >= 50 THEN 'starter'
      ELSE NULL
    END
    WHERE id = NEW.referrer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 7: Crear trigger para actualizar stats automáticamente
DROP TRIGGER IF EXISTS update_referrer_stats ON referrals;
CREATE TRIGGER update_referrer_stats
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrer_stats();

-- Paso 8: Función para convertir usuario en referente
CREATE OR REPLACE FUNCTION become_referrer(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
BEGIN
  -- Generar código único
  ref_code := generate_referrer_code();
  
  -- Activar modo referente
  UPDATE profiles
  SET 
    is_referrer = TRUE,
    referrer_code = ref_code,
    badge_type = CASE 
      WHEN verified THEN 'referrer_verified'
      ELSE 'referrer'
    END
  WHERE id = user_id;
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Verificar estructura
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%referrer%'
ORDER BY ordinal_position;

SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'referrals';


