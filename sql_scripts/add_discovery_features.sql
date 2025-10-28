-- SISTEMA DE DISCOVERY Y MATCHMAKING - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Agregar campos de discovery a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS radius_km INTEGER DEFAULT 50; -- Radio de búsqueda en km
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[]; -- ["sponsor", "team", "players", "coach"]
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available'; -- available, busy, looking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commitment_level TEXT; -- part-time, full-time, pro

-- Paso 2: Crear tabla de matching
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_with_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score FLOAT NOT NULL DEFAULT 0,
  match_reasons TEXT[], -- Por qué son match
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, matched_with_id)
);

-- Habilitar RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas para matches
CREATE POLICY "Users can view their own matches" 
  ON matches FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = matched_with_id);

CREATE POLICY "Users can create matches" 
  ON matches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their matches" 
  ON matches FOR UPDATE 
  USING (auth.uid() = user_id);

-- Paso 3: Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_match', 'opportunity', 'connection_request', 'message', 'talent_radar')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES profiles(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Paso 4: Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_sport ON profiles(sport);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_profiles_location_coords ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON profiles USING GIN(goals);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN(looking_for);

-- Paso 5: Función para calcular distancia entre dos puntos (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) *
      cos(radians(lat2)) *
      cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) *
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Paso 6: Función para encontrar matches cercanos
CREATE OR REPLACE FUNCTION find_nearby_profiles(
  user_lat DECIMAL,
  user_lon DECIMAL,
  max_distance_km INTEGER DEFAULT 50,
  limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  user_type TEXT,
  sport TEXT,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.sport,
    calculate_distance(user_lat, user_lon, p.latitude, p.longitude)::DECIMAL(10, 2) as distance
  FROM profiles p
  WHERE 
    p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY distance
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 7: Función para calcular match score
CREATE OR REPLACE FUNCTION calculate_match_score(
  user_profile profiles,
  other_profile profiles
)
RETURNS FLOAT AS $$
DECLARE
  score FLOAT := 0;
BEGIN
  -- Mismo deporte: +30
  IF user_profile.sport = other_profile.sport THEN
    score := score + 30;
  END IF;
  
  -- Tipos complementarios (player-coach, player-club, etc)
  IF (user_profile.user_type = 'player' AND other_profile.user_type IN ('coach', 'club', 'agent')) OR
     (user_profile.user_type IN ('coach', 'club') AND other_profile.user_type = 'player') THEN
    score := score + 40;
  END IF;
  
  -- Buscando lo que el otro ofrece
  IF array_length(user_profile.looking_for, 1) > 0 AND 
     other_profile.user_type = ANY(user_profile.looking_for) THEN
    score := score + 50;
  END IF;
  
  -- Distancia cercana (menos de 25km)
  IF user_profile.latitude IS NOT NULL AND other_profile.latitude IS NOT NULL THEN
    DECLARE
      dist DECIMAL;
    BEGIN
      dist := calculate_distance(
        user_profile.latitude, user_profile.longitude,
        other_profile.latitude, other_profile.longitude
      );
      IF dist <= 25 THEN
        score := score + 20;
      ELSIF dist <= 50 THEN
        score := score + 10;
      END IF;
    END;
  END IF;
  
  -- Verificado: +10
  IF other_profile.verified THEN
    score := score + 10;
  END IF;
  
  -- Elite member: +15
  IF other_profile.elite_member THEN
    score := score + 15;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Paso 8: Función para generar recomendaciones
CREATE OR REPLACE FUNCTION generate_recommendations(
  target_user_id UUID,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  profile_data profiles,
  match_score FLOAT,
  match_reasons TEXT[]
) AS $$
DECLARE
  target_profile profiles;
BEGIN
  -- Obtener perfil del usuario
  SELECT * INTO target_profile FROM profiles WHERE id = target_user_id;
  
  IF target_profile IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH scored_profiles AS (
    SELECT 
      p.*,
      calculate_match_score(target_profile, p) as score,
      ARRAY[
        CASE WHEN p.sport = target_profile.sport THEN 'Mismo deporte' END,
        CASE WHEN array_length(p.looking_for, 1) > 0 AND target_profile.user_type = ANY(p.looking_for) 
             THEN 'Están buscando tu perfil' END,
        CASE WHEN p.verified THEN 'Verificado' END,
        CASE WHEN p.elite_member THEN 'Miembro Elite' END
      ]::TEXT[] as reasons
    FROM profiles p
    WHERE p.id != target_user_id
      AND p.id NOT IN (SELECT matched_with_id FROM matches WHERE user_id = target_user_id)
  )
  SELECT sp.*, sp.score, sp.reasons
  FROM scored_profiles sp
  WHERE sp.score > 50
  ORDER BY sp.score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Verificar estructura
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('goals', 'level', 'nationality', 'latitude', 'longitude', 'looking_for')
ORDER BY ordinal_position;

SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('matches', 'notifications')
ORDER BY table_name;


