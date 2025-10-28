# Guía de Acceso a la Base de Datos - AURA Sports

## 📊 Estructura de la Base de Datos

Tu proyecto usa **Supabase** como backend. La base de datos tiene las siguientes tablas:

### Tablas principales:

1. **`profiles`** - Perfiles de usuario
   - `id` (UUID, referenciando auth.users)
   - `user_type` (ENUM: player, coach, club, agent, sponsor, investor)
   - `full_name` (TEXT)
   - `bio` (TEXT)
   - `location` (TEXT)
   - `aura_score` (INTEGER, default 100)
   - `avatar_url` (TEXT)
   - `cover_url` (TEXT)
   - `sport` (TEXT)
   - `verified` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`connections`** - Conexiones entre usuarios
   - `id` (UUID)
   - `requester_id` (UUID, referencia a profiles)
   - `receiver_id` (UUID, referencia a profiles)
   - `status` (pending, accepted, rejected)
   - `created_at` (TIMESTAMPTZ)

3. **`posts`** - Publicaciones de usuarios
   - `id` (UUID)
   - `author_id` (UUID, referencia a profiles)
   - `content` (TEXT)
   - `tags` (TEXT[])
   - `created_at` (TIMESTAMPTZ)

## 🔑 Obtener Credenciales de Supabase

### Opción 1: Desde Lovable (Recomendado)
1. Ve a tu proyecto: https://lovable.dev/projects/ac665166-daf8-44b8-8900-efd46306aa49
2. Navega a la sección de configuración o backend
3. Copia las credenciales de Supabase

### Opción 2: Desde Supabase Dashboard
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto con ID: `xubkhfxqcnwxmdmlejho`
4. Ve a **Settings → API**
5. Copia:
   - **URL del proyecto**: `https://xubkhfxqcnwxmdmlejho.supabase.co`
   - **Anon/Public Key**: Una clave que comienza con `eyJ...`

## ⚙️ Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://xubkhfxqcnwxmdmlejho.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_anon_aqui
```

2. Reemplaza `tu_clave_anon_aqui` con la clave pública de tu proyecto

## 🗄️ Acceder a la Base de Datos

### Opción 1: Supabase Dashboard
- Ve a: https://supabase.com/dashboard/project/xubkhfxqcnwxmdmlejho
- Navega a **Table Editor** para ver y editar datos
- Ve a **SQL Editor** para ejecutar consultas SQL
- Ve a **Auth** para gestionar usuarios

### Opción 2: Desde tu aplicación
La aplicación ya está configurada para conectarse a Supabase. Solo necesitas:
1. Configurar las variables de entorno (ver arriba)
2. Ejecutar `npm run dev`
3. La aplicación se conectará automáticamente

### Opción 3: SQL en Supabase Dashboard
```sql
-- Ver todos los perfiles
SELECT * FROM profiles;

-- Ver conexiones aceptadas
SELECT * FROM connections WHERE status = 'accepted';

-- Ver posts con información del autor
SELECT p.*, pr.full_name, pr.user_type 
FROM posts p 
JOIN profiles pr ON p.author_id = pr.id;
```

## 🔒 Seguridad (RLS - Row Level Security)

El proyecto tiene políticas RLS configuradas:

- **profiles**: Visibles para todos, actualizables solo por el dueño
- **connections**: Visibles solo para los usuarios involucrados
- **posts**: Visibles para todos, pero solo el autor puede crear/actualizar/eliminar

## 🚀 Ejecutar el Proyecto

1. Instala dependencias (ya está hecho):
   ```bash
   npm install
   ```

2. Configura las variables de entorno (ver arriba)

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. La aplicación estará disponible en: http://localhost:8080

## 📝 Notas Importantes

- El proyecto ID de Supabase es: `xubkhfxqcnwxmdmlejho`
- Las migraciones están en: `supabase/migrations/`
- El cliente de Supabase se importa desde: `@/integrations/supabase/client`
- Las credenciales se manejan automáticamente en Lovable


