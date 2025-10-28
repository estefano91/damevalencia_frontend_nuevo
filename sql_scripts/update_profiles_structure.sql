-- AÑADIR CAMPOS MEJORADOS A LA TABLA PROFILES
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Añadir nuevas columnas a la tabla profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS endorsement_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS elite_member BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badge_type TEXT DEFAULT NULL;

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_aura_score ON profiles(aura_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_elite ON profiles(elite_member);

-- Paso 3: Crear función para calcular Aura Score dinámicamente
CREATE OR REPLACE FUNCTION calculate_aura_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el aura_score basado en:
    -- - Puntuación base según user_type
    -- - Número de endorsements
    -- - Puntuación de engagement
    -- - Verificación
    -- - Membresía elite
    
    NEW.aura_score := (
        CASE 
            WHEN NEW.verified THEN 100 ELSE 0
        END
        + NEW.endorsement_count * 10
        + NEW.engagement_score
        + CASE WHEN NEW.elite_member THEN 50 ELSE 0 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 4: Crear trigger para actualizar aura_score automáticamente
DROP TRIGGER IF EXISTS update_aura_score ON profiles;
CREATE TRIGGER update_aura_score
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_aura_score();

-- Paso 5: Actualizar perfiles existentes con datos de ejemplo
UPDATE profiles SET
    media_urls = ARRAY['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    certifications = ARRAY['Certificado Profesional', 'Licencia Internacional'],
    portfolio_url = 'https://portfolio.example.com/' || id::text,
    social_links = '{"linkedin": "https://linkedin.com/in/user", "twitter": "https://twitter.com/user"}'::jsonb,
    achievements = ARRAY['Campeonato Nacional 2023', 'Mejor Deportista 2022'],
    skills = ARRAY['Liderazgo', 'Comunicación', 'Entrenamiento'],
    endorsement_count = floor(random() * 50 + 10),
    engagement_score = floor(random() * 100 + 50),
    elite_member = verified,
    badge_type = CASE 
        WHEN verified THEN 'verified'
        WHEN aura_score > 800 THEN 'elite'
        ELSE NULL
    END
WHERE media_urls IS NULL;

-- Paso 6: Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 7: Ver algunos perfiles actualizados
SELECT 
    id,
    user_type,
    full_name,
    aura_score,
    verified,
    elite_member,
    badge_type,
    endorsement_count,
    engagement_score,
    array_length(achievements, 1) as total_achievements
FROM profiles 
LIMIT 5;


