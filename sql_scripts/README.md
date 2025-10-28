# Scripts SQL para AURA Sports

## Archivos

- **setup_database.sql** - Script para crear la estructura inicial de la base de datos (tablas, tipos, políticas RLS)

## Cómo insertar perfiles de prueba

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Abre el SQL Editor: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql

2. Ejecuta estos pasos en orden:

#### Paso 1: Desactivar constraints
```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

#### Paso 2: Insertar perfiles
```sql
-- 3 Players
INSERT INTO profiles (id, user_type, full_name, bio, location, sport, aura_score, verified) VALUES
('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'player', 'Cristian Messi', 'Mediocampista creativo. Busco oportunidades.', 'Buenos Aires, Argentina', 'Fútbol', 850, true),
('aaaaaaaa-2222-2222-2222-222222222222'::uuid, 'player', 'Sofia Hernández', 'Tenis profesional.', 'Madrid, España', 'Tenis', 920, true),
('aaaaaaaa-3333-3333-3333-333333333333'::uuid, 'player', 'Isabella Garcia', 'Nadadora olímpica.', 'Valencia, España', 'Natación', 950, true)
ON CONFLICT (id) DO NOTHING;

-- 2 Coaches
INSERT INTO profiles (id, user_type, full_name, bio, location, sport, aura_score, verified) VALUES
('bbbbbbbb-1111-1111-1111-111111111111'::uuid, 'coach', 'Carlos Ruiz', 'Entrenador con 15 años de experiencia.', 'Madrid, España', 'Fútbol', 980, true),
('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'coach', 'Elena Fernández', 'Entrenadora de natación olímpica.', 'Valencia, España', 'Natación', 995, true)
ON CONFLICT (id) DO NOTHING;

-- 2 Clubs
INSERT INTO profiles (id, user_type, full_name, bio, location, sport, aura_score, verified) VALUES
('cccccccc-1111-1111-1111-111111111111'::uuid, 'club', 'FC Barcelona Juvenil', 'Club con tradición de 50 años.', 'Barcelona, España', 'Fútbol', 990, true),
('cccccccc-2222-2222-2222-222222222222'::uuid, 'club', 'Madrid Tennis Academy', 'Academia de tenis de élite.', 'Madrid, España', 'Tenis', 950, true)
ON CONFLICT (id) DO NOTHING;

-- 2 Agents
INSERT INTO profiles (id, user_type, full_name, bio, location, sport, aura_score, verified) VALUES
('dddddddd-1111-1111-1111-111111111111'::uuid, 'agent', 'Juan Pérez', 'Agente especializado. 50+ contratos.', 'Madrid, España', 'Fútbol', 970, true),
('dddddddd-2222-2222-2222-222222222222'::uuid, 'agent', 'María López', 'Agente con 25 atletas profesionales.', 'Barcelona, España', 'Multi-deporte', 960, true)
ON CONFLICT (id) DO NOTHING;

-- 1 Sponsor
INSERT INTO profiles (id, user_type, full_name, bio, location, sport, aura_score, verified) VALUES
('eeeeeeee-1111-1111-1111-111111111111'::uuid, 'sponsor', 'Sports Brand Global', 'Material deportivo líder. 500+ patrocinados.', 'Madrid, España', 'Multi-deporte', 995, true)
ON CONFLICT (id) DO NOTHING;
```

#### Paso 3: Verificar
```sql
SELECT user_type, COUNT(*) as total FROM profiles GROUP BY user_type;
```

### Opción 2: Desde la Aplicación

Cuando los usuarios se registren en la app, sus perfiles se crearán automáticamente.

## Enlaces útiles

- **Dashboard**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg
- **Table Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor
- **SQL Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql
- **API Settings**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/settings/api


