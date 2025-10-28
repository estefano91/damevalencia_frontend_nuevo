-- SISTEMA DE COMUNICACIÓN Y NETWORKING - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de chats
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'group')),
  name TEXT, -- Para grupos
  description TEXT, -- Para grupos
  sport TEXT, -- Para grupos filtrados por deporte
  country TEXT, -- Para grupos filtrados por país
  opportunity_type TEXT, -- Para grupos filtrados por tipo de oportunidad
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Tabla de participantes en chats
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(chat_id, user_id)
);

-- Paso 3: Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  translated_content JSONB, -- Contenido traducido por idioma
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'video', 'image', 'file', 'system')),
  read_by JSONB DEFAULT '[]'::jsonb, -- Array de user_ids que han leído
  translated BOOLEAN DEFAULT FALSE,
  original_language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 4: Tabla de llamadas
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE, -- Para llamadas grupales
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connected', 'ended', 'missed', 'declined')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 5: Tabla de Quick Connect (swipe/desechos)
CREATE TABLE IF NOT EXISTS quick_connects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('connect', 'pass')),
  context TEXT, -- 'sport', 'country', 'opportunity'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Paso 6: Habilitar RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_connects ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Users can view their own chats" 
  ON chats FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = chats.id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" 
  ON chats FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Políticas para chat_members
CREATE POLICY "Users can view their chat memberships" 
  ON chat_members FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join chats" 
  ON chat_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para messages
CREATE POLICY "Users can view messages in their chats" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" 
  ON messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

-- Políticas para calls
CREATE POLICY "Users can view their calls" 
  ON calls FOR SELECT 
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create calls" 
  ON calls FOR INSERT 
  WITH CHECK (auth.uid() = caller_id);

-- Políticas para quick_connects
CREATE POLICY "Users can view their quick connections" 
  ON quick_connects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quick connections" 
  ON quick_connects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Paso 7: Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_id ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_quick_connects_user_id ON quick_connects(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_connects_target_id ON quick_connects(target_user_id);

-- Paso 8: Función para crear chat privado entre dos usuarios
CREATE OR REPLACE FUNCTION create_private_chat(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_chat_id UUID;
  existing_chat_id UUID;
BEGIN
  -- Verificar si ya existe un chat entre estos usuarios
  SELECT chat_id INTO existing_chat_id
  FROM chat_members cm1
  INNER JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
  WHERE cm1.user_id = user1_id AND cm2.user_id = user2_id
    AND (SELECT type FROM chats WHERE id = cm1.chat_id) = 'private'
  LIMIT 1;
  
  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;
  
  -- Crear nuevo chat privado
  INSERT INTO chats (type, created_by)
  VALUES ('private', user1_id)
  RETURNING id INTO new_chat_id;
  
  -- Agregar ambos usuarios como miembros
  INSERT INTO chat_members (chat_id, user_id) VALUES (new_chat_id, user1_id);
  INSERT INTO chat_members (chat_id, user_id) VALUES (new_chat_id, user2_id);
  
  RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION mark_message_read(
  message_id UUID,
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read_by = read_by || jsonb_build_array(user_id::text)
  WHERE id = message_id
    AND NOT (read_by @> jsonb_build_array(user_id::text));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Función para traducir mensaje
CREATE OR REPLACE FUNCTION translate_message_content(
  message_id UUID,
  target_language TEXT,
  translated_text TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET 
    translated_content = COALESCE(translated_content, '{}'::jsonb) || 
                         jsonb_build_object(target_language, translated_text),
    translated = TRUE
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 11: Trigger para actualizar updated_at en chats
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_timestamp
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_updated_at();

-- Paso 12: Función para obtener chats con último mensaje
CREATE OR REPLACE FUNCTION get_user_chats_with_last_message(user_id_param UUID)
RETURNS TABLE (
  chat_id UUID,
  chat_name TEXT,
  chat_type TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT,
  other_participants JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH user_chats AS (
    SELECT DISTINCT cm.chat_id
    FROM chat_members cm
    WHERE cm.user_id = user_id_param
  ),
  last_messages AS (
    SELECT DISTINCT ON (m.chat_id)
      m.chat_id,
      m.content as last_message,
      m.created_at as last_message_time
    FROM messages m
    INNER JOIN user_chats uc ON m.chat_id = uc.chat_id
    ORDER BY m.chat_id, m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      m.chat_id,
      COUNT(*) as unread
    FROM messages m
    INNER JOIN user_chats uc ON m.chat_id = uc.chat_id
    WHERE NOT (m.read_by @> jsonb_build_array(user_id_param::text))
      AND m.sender_id != user_id_param
    GROUP BY m.chat_id
  ),
  participants AS (
    SELECT 
      cm.chat_id,
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.full_name,
          'avatar', p.avatar_url,
          'type', p.user_type
        )
      ) FILTER (WHERE cm.user_id != user_id_param) as others
    FROM chat_members cm
    INNER JOIN profiles p ON cm.user_id = p.id
    WHERE EXISTS (SELECT 1 FROM user_chats uc WHERE uc.chat_id = cm.chat_id)
    GROUP BY cm.chat_id
  )
  SELECT 
    c.id as chat_id,
    c.name as chat_name,
    c.type as chat_type,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread, 0) as unread_count,
    COALESCE(p.others, '[]'::jsonb) as other_participants
  FROM chats c
  INNER JOIN user_chats ucc ON c.id = ucc.chat_id
  LEFT JOIN last_messages lm ON c.id = lm.chat_id
  LEFT JOIN unread_counts uc ON c.id = uc.chat_id
  LEFT JOIN participants p ON c.id = p.chat_id
  ORDER BY lm.last_message_time DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 13: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('chats', 'chat_members', 'messages', 'calls', 'quick_connects')
ORDER BY table_name;


