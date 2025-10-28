# Setup de Base de Datos para AURA Sports

## Situación Actual

Lovable gestiona tu Supabase internamente, por lo que necesitas crear tu propio proyecto de Supabase para trabajar localmente.

## Opciones para Configurar la Base de Datos

### Opción 1: Crear Nuevo Proyecto de Supabase (Recomendado)

#### Paso 1: Crear cuenta y proyecto en Supabase
1. Ve a: https://supabase.com
2. Crea una cuenta (es gratis)
3. Click en "New Project"
4. Nombre: "aura-sports" (o el que prefieras)
5. Ingresa una contraseña para la base de datos
6. Selecciona una región cercana
7. Click en "Create new project"

#### Paso 2: Obtener Credenciales
1. En tu proyecto, ve a **Settings → API**
2. Copia las siguientes credenciales:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **Project API keys → anon public**: Una clave que empieza con `eyJ...`

#### Paso 3: Ejecutar Migraciones
1. Desde la terminal, en el directorio del proyecto:
```bash
# Login en Supabase
npx supabase login

# Vincular tu proyecto local con Supabase
npx supabase link --project-ref xxxxx

# Ejecutar migraciones para crear las tablas
npx supabase db push
```

#### Paso 4: Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
```

### Opción 2: Obtener Credenciales desde Lovable

Si quieres seguir usando el backend de Lovable:

1. Ve a tu proyecto en Lovable: https://lovable.dev/projects/ac665166-daf8-44b8-8900-efd46306aa49
2. Busca en la configuración del proyecto (Settings o Backend)
3. Deberías ver las credenciales de Supabase
4. Copia la URL y la anon key

### Opción 3: Usar Supabase Local

1. Instalar Supabase CLI:
```bash
npm install supabase --save-dev
```

2. Iniciar Supabase localmente:
```bash
npx supabase start
```

3. Ejecutar migraciones:
```bash
npx supabase db reset
```

4. Las credenciales para desarrollo local serán:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Estructura de Tablas

Una vez configurado, tendrás estas tablas:

1. **profiles** - Perfiles de usuarios (player, coach, club, agent, sponsor, investor)
2. **connections** - Conexiones entre usuarios
3. **posts** - Publicaciones de usuarios

Las migraciones están en: `supabase/migrations/`

## Verificación

Para verificar que todo está funcionando:

```bash
# Ejecutar el servidor de desarrollo
npm run dev
```

La aplicación debería abrir en http://localhost:8080

## Troubleshooting

Si encuentras errores de autenticación:
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que el archivo `.env.local` no esté en `.gitignore` (lo cual es correcto)
- En caso de problemas con RLS (Row Level Security), verifica las políticas en el dashboard de Supabase


