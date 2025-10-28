-- SISTEMA DE EVENTOS DE NETWORKING VIRTUAL - AURA Sports
-- Ejecuta esto en el SQL Editor de Supabase

-- Paso 1: Crear tabla de eventos
CREATE TABLE IF NOT EXISTS networking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('speed_networking', 'showcase', 'pitch', 'panel', 'workshop', 'general')),
  theme TEXT, -- 'investor', 'player', 'agent', 'sponsor', 'coach'
  
  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  duration_minutes INTEGER DEFAULT 60,
  
  -- Format
  format TEXT DEFAULT 'virtual' CHECK (format IN ('virtual', 'in_person', 'hybrid')),
  video_link TEXT, -- Zoom, Teams, in-app video URL
  room_url TEXT, -- In-app video room
  
  -- Organization
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_participants INTEGER DEFAULT 100,
  
  -- Targeting
  target_audience TEXT[], -- ['player', 'agent', 'investor']
  target_sports TEXT[], -- ['Football', 'Basketball']
  target_levels TEXT[], -- ['Professional', 'Elite']
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'live', 'completed', 'cancelled')),
  
  -- Registration
  registration_open BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMPTZ,
  registration_count INTEGER DEFAULT 0,
  
  -- Settings
  is_recording BOOLEAN DEFAULT FALSE,
  allow_recordings BOOLEAN DEFAULT TRUE,
  requires_verification BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Crear tabla de salas temáticas (rooms)
CREATE TABLE IF NOT EXISTS event_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES networking_events(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- "Player Showcase", "Agent Pitch", etc.
  description TEXT,
  room_type TEXT CHECK (room_type IN ('showcase', 'pitch', 'speed_networking', 'general')),
  
  -- Speed networking slots
  slot_duration_minutes INTEGER DEFAULT 10,
  total_slots INTEGER,
  
  -- Capacity
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  
  -- Video
  video_room_url TEXT,
  meeting_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 3: Crear tabla de registros a eventos
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES networking_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  registered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  attended BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  
  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  UNIQUE(event_id, user_id)
);

-- Paso 4: Crear tabla de speed networking matches
CREATE TABLE IF NOT EXISTS speed_networking_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES networking_events(id) ON DELETE CASCADE,
  room_id UUID REFERENCES event_rooms(id) ON DELETE SET NULL,
  
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  slot_number INTEGER,
  slot_start_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 10,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'missed')),
  
  -- Interaction
  notes_from_a TEXT,
  notes_from_b TEXT,
  mutual_interest BOOLEAN DEFAULT FALSE,
  
  matched_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 5: Crear tabla de recordatorios
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES networking_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h_before', '1h_before', '15m_before', 'start')),
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  delivered BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 6: Habilitar RLS
ALTER TABLE networking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_networking_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para networking_events
DROP POLICY IF EXISTS "Everyone can view upcoming events" ON networking_events;
CREATE POLICY "Everyone can view upcoming events" 
  ON networking_events FOR SELECT 
  USING (status IN ('upcoming', 'live'));

DROP POLICY IF EXISTS "Users can create events" ON networking_events;
CREATE POLICY "Users can create events" 
  ON networking_events FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

-- Políticas para event_registrations
DROP POLICY IF EXISTS "Users can view their registrations" ON event_registrations;
CREATE POLICY "Users can view their registrations" 
  ON event_registrations FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events" 
  ON event_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para speed_networking_matches
DROP POLICY IF EXISTS "Users can view their matches" ON speed_networking_matches;
CREATE POLICY "Users can view their matches" 
  ON speed_networking_matches FOR SELECT 
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Políticas para event_reminders
DROP POLICY IF EXISTS "Users can view their reminders" ON event_reminders;
CREATE POLICY "Users can view their reminders" 
  ON event_reminders FOR SELECT 
  USING (auth.uid() = user_id);

-- Paso 7: Crear índices
CREATE INDEX IF NOT EXISTS idx_events_start_time ON networking_events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON networking_events(status);
CREATE INDEX IF NOT EXISTS idx_events_host ON networking_events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON networking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_user ON speed_networking_matches(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON event_reminders(scheduled_for);

-- Paso 8: Función para generar speed networking matches
CREATE OR REPLACE FUNCTION generate_speed_networking_matches(
  p_event_id UUID,
  p_slot_duration_minutes INTEGER DEFAULT 10
)
RETURNS VOID AS $$
DECLARE
  v_total_slots INTEGER;
  v_registered_users UUID[];
BEGIN
  -- Get registered users
  SELECT ARRAY_AGG(user_id) INTO v_registered_users
  FROM event_registrations
  WHERE event_id = p_event_id
    AND status = 'registered';
  
  -- Calculate total slots needed
  v_total_slots := CEIL(array_length(v_registered_users, 1) / 2.0);
  
  -- Generate matches for each slot
  -- This is simplified - real implementation would match users intelligently
  FOR i IN 1..v_total_slots LOOP
    -- Matches would be generated here based on compatibility
    -- Placeholder for actual matching logic
    NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 9: Función para obtener calendario de eventos
CREATE OR REPLACE FUNCTION get_event_calendar(
  user_id_param UUID,
  start_date_param DATE,
  end_date_param DATE
)
RETURNS TABLE (
  event networking_events,
  is_registered BOOLEAN,
  is_host BOOLEAN,
  registration_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.*,
    EXISTS(SELECT 1 FROM event_registrations WHERE event_id = e.id AND user_id = user_id_param) as is_registered,
    (e.host_id = user_id_param) as is_host,
    COALESCE(er.status, 'not_registered') as registration_status
  FROM networking_events e
  LEFT JOIN event_registrations er ON e.id = er.event_id AND er.user_id = user_id_param
  WHERE e.start_time::DATE BETWEEN start_date_param AND end_date_param
    AND e.status IN ('upcoming', 'live')
  ORDER BY e.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Trigger para actualizar contador de registraciones
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE networking_events
  SET registration_count = (
    SELECT COUNT(*) FROM event_registrations 
    WHERE event_id = NEW.event_id AND status = 'registered'
  )
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_event_registration_change
  AFTER INSERT OR DELETE OR UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registration_count();

-- Paso 11: Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('networking_events', 'event_rooms', 'event_registrations', 'speed_networking_matches', 'event_reminders')
ORDER BY table_name;


