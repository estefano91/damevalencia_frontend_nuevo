-- SISTEMA DE FEED Y OPORTUNIDADES - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de posts (feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agregar columnas faltantes si no existen
DO $$ 
BEGIN
  -- post_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='post_type') THEN
    ALTER TABLE posts ADD COLUMN post_type TEXT NOT NULL DEFAULT 'general';
    ALTER TABLE posts ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('general', 'achievement', 'opportunity', 'open_call', 'sponsorship', 'event', 'training', 'investment'));
  END IF;

  -- tags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='tags') THEN
    ALTER TABLE posts ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- media_urls
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='media_urls') THEN
    ALTER TABLE posts ADD COLUMN media_urls TEXT[];
  END IF;

  -- is_boosted
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_boosted') THEN
    ALTER TABLE posts ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE;
  END IF;

  -- boost_expires_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='boost_expires_at') THEN
    ALTER TABLE posts ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;

  -- boost_amount
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='boost_amount') THEN
    ALTER TABLE posts ADD COLUMN boost_amount INTEGER DEFAULT 0;
  END IF;

  -- target_audience
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='target_audience') THEN
    ALTER TABLE posts ADD COLUMN target_audience TEXT;
  END IF;

  -- target_sport
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='target_sport') THEN
    ALTER TABLE posts ADD COLUMN target_sport TEXT;
  END IF;

  -- target_country
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='target_country') THEN
    ALTER TABLE posts ADD COLUMN target_country TEXT;
  END IF;

  -- target_level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='target_level') THEN
    ALTER TABLE posts ADD COLUMN target_level TEXT;
  END IF;

  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='location') THEN
    ALTER TABLE posts ADD COLUMN location TEXT;
  END IF;

  -- start_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='start_date') THEN
    ALTER TABLE posts ADD COLUMN start_date TIMESTAMPTZ;
  END IF;

  -- end_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='end_date') THEN
    ALTER TABLE posts ADD COLUMN end_date TIMESTAMPTZ;
  END IF;

  -- contact_email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='contact_email') THEN
    ALTER TABLE posts ADD COLUMN contact_email TEXT;
  END IF;

  -- contact_phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='contact_phone') THEN
    ALTER TABLE posts ADD COLUMN contact_phone TEXT;
  END IF;

  -- application_deadline
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='application_deadline') THEN
    ALTER TABLE posts ADD COLUMN application_deadline TIMESTAMPTZ;
  END IF;

  -- budget_range
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='budget_range') THEN
    ALTER TABLE posts ADD COLUMN budget_range TEXT;
  END IF;

  -- requirements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='requirements') THEN
    ALTER TABLE posts ADD COLUMN requirements TEXT[];
  END IF;

  -- likes_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='likes_count') THEN
    ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;

  -- comments_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='comments_count') THEN
    ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;

  -- shares_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='shares_count') THEN
    ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;

  -- views_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='views_count') THEN
    ALTER TABLE posts ADD COLUMN views_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Paso 2: Crear tabla de open calls
CREATE TABLE IF NOT EXISTS open_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('player', 'coach', 'staff', 'sponsor')),
  sport TEXT NOT NULL,
  position TEXT,
  level_required TEXT,
  location TEXT,
  contract_type TEXT,
  salary_range TEXT,
  deadline TIMESTAMPTZ,
  requirements TEXT[],
  benefits TEXT[],
  how_to_apply TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'filled')),
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 3: Crear tabla de boosts
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type TEXT DEFAULT 'credit' CHECK (boost_type IN ('credit', 'premium')),
  amount_spent INTEGER NOT NULL,
  duration_hours INTEGER DEFAULT 24,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Paso 4: Crear tabla de likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Paso 5: Crear tabla de comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 6: Crear tabla de aplicaciones a open calls
CREATE TABLE IF NOT EXISTS call_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES open_calls(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(call_id, applicant_id)
);

-- Paso 7: Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para posts
DROP POLICY IF EXISTS "Everyone can view posts" ON posts;
CREATE POLICY "Everyone can view posts" 
  ON posts FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = author_id);

-- Políticas para open_calls
DROP POLICY IF EXISTS "Everyone can view active open calls" ON open_calls;
CREATE POLICY "Everyone can view active open calls" 
  ON open_calls FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "Clubs and agents can create open calls" ON open_calls;
CREATE POLICY "Clubs and agents can create open calls" 
  ON open_calls FOR INSERT 
  WITH CHECK (
    auth.uid() = posted_by AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('club', 'agent')
    )
  );

DROP POLICY IF EXISTS "Users can apply to open calls" ON call_applications;
CREATE POLICY "Users can apply to open calls" 
  ON call_applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

-- Políticas para boosts
DROP POLICY IF EXISTS "Everyone can view boosts" ON boosts;
CREATE POLICY "Everyone can view boosts" 
  ON boosts FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create boosts for their posts" ON boosts;
CREATE POLICY "Users can create boosts for their posts" 
  ON boosts FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND author_id = auth.uid()
    )
  );

-- Políticas para post_likes
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;
CREATE POLICY "Users can view likes" 
  ON post_likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" 
  ON post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts" 
  ON post_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para post_comments
DROP POLICY IF EXISTS "Everyone can view comments" ON post_comments;
CREATE POLICY "Everyone can view comments" 
  ON post_comments FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
CREATE POLICY "Users can create comments" 
  ON post_comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments" 
  ON post_comments FOR UPDATE 
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments" 
  ON post_comments FOR DELETE 
  USING (auth.uid() = author_id);

-- Políticas para call_applications
DROP POLICY IF EXISTS "Users can view their applications" ON call_applications;
CREATE POLICY "Users can view their applications" 
  ON call_applications FOR SELECT 
  USING (
    auth.uid() = applicant_id
    OR EXISTS (
      SELECT 1 FROM open_calls 
      WHERE open_calls.id = call_applications.call_id 
      AND open_calls.posted_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create applications" ON call_applications;
CREATE POLICY "Users can create applications" 
  ON call_applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Users can update own applications" ON call_applications;
CREATE POLICY "Users can update own applications" 
  ON call_applications FOR UPDATE 
  USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Call posters can update applications" ON call_applications;
CREATE POLICY "Call posters can update applications" 
  ON call_applications FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM open_calls 
      WHERE open_calls.id = call_applications.call_id 
      AND open_calls.posted_by = auth.uid()
    )
  );

-- Paso 8: Crear índices
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON posts(is_boosted) WHERE is_boosted = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_open_calls_posted_by ON open_calls(posted_by);
CREATE INDEX IF NOT EXISTS idx_open_calls_sport ON open_calls(sport);
CREATE INDEX IF NOT EXISTS idx_open_calls_status ON open_calls(status);

-- Paso 9: Función para incrementar contador de likes
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

-- Paso 10: Función para decrementar likes al quitarlos
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_removed
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();

-- Paso 11: Función para verificar boost expirado
CREATE OR REPLACE FUNCTION update_expired_boosts()
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET 
    is_boosted = FALSE,
    boost_expires_at = NULL
  WHERE is_boosted = TRUE
    AND boost_expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Paso 12: Función para obtener feed personalizado
CREATE OR REPLACE FUNCTION get_personalized_feed(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  post posts,
  author_full_name TEXT,
  author_user_type TEXT,
  author_avatar TEXT,
  user_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    pr.full_name,
    pr.user_type,
    pr.avatar_url,
    EXISTS(
      SELECT 1 FROM post_likes 
      WHERE post_id = p.id AND user_id = user_id_param
    ) as user_liked
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE 
    p.is_boosted = TRUE 
    OR p.created_at > now() - INTERVAL '7 days'
  ORDER BY 
    p.is_boosted DESC,
    p.likes_count DESC,
    p.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 13: Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_timestamp
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_timestamp();

-- Paso 14: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('posts', 'open_calls', 'boosts', 'post_likes', 'post_comments', 'call_applications')
ORDER BY table_name;

SELECT routine_name 
FROM information_schema.routines
WHERE routine_name LIKE '%boost%' OR routine_name LIKE '%feed%'
ORDER BY routine_name;

