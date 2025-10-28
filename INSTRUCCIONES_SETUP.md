# 🚀 Instrucciones para Configurar la Base de Datos

## ✅ Lo que ya está hecho:
- ✅ Proyecto clonado de GitHub
- ✅ Dependencias instaladas
- ✅ Variables de entorno configuradas en `.env.local`

## 📋 Lo que necesitas hacer ahora:

### Paso 1: Ejecutar las Migraciones en Supabase

1. **Accede a tu Dashboard de Supabase**:
   - Ve a: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg
   - Inicia sesión con tu cuenta

2. **Abre el SQL Editor**:
   - En el menú lateral, haz click en "SQL Editor"
   - Haz click en "New query"

3. **Copia y ejecuta el script**:
   - Abre el archivo `setup_database.sql` en este proyecto
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase
   - Haz click en "Run" o presiona Ctrl+Enter

4. **Verifica que las tablas se crearon**:
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver 3 tablas:
     - `profiles`
     - `connections`
     - `posts`

### Paso 2: Ejecutar la Aplicación

1. **Verifica que estás en el directorio correcto**:
```powershell
cd "C:\Users\estef\Desktop\AURA SPORTS\aurasports"
```

2. **Ejecuta el servidor de desarrollo**:
```powershell
npm run dev
```

3. **Abre tu navegador**:
   - Ve a: http://localhost:8080
   - ¡Tu aplicación debería funcionar!

## 🎯 URLs Importantes:

- **Dashboard de Supabase**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg
- **Table Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/editor
- **SQL Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql
- **Configuración API**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/settings/api

## 📊 Tablas que se crearán:

1. **profiles** - Perfiles de usuarios
   - Tipos: player, coach, club, agent, sponsor, investor
   - Incluye: avatar, bio, location, sport, aura_score, etc.

2. **connections** - Conexiones entre usuarios
   - Estados: pending, accepted, rejected
   - Relación entre requester y receiver

3. **posts** - Publicaciones de usuarios
   - Content, tags, author_id, created_at

## 🔒 Seguridad (RLS):

Todas las tablas tienen Row Level Security configurado:
- **profiles**: Visibles por todos, actualizables solo por el dueño
- **connections**: Visibles solo por los usuarios involucrados
- **posts**: Visibles por todos, pero solo el autor puede crear/actualizar/eliminar

## ❓ ¿Problemas?

Si encuentras algún error:

1. **Error al ejecutar el SQL**:
   - Asegúrate de copiar TODO el script
   - Verifica que estás en el SQL Editor correcto
   - Si una tabla ya existe, el script intentará eliminarla primero

2. **Error de conexión en la app**:
   - Verifica que `.env.local` tiene las credenciales correctas
   - Asegúrate de que el archivo existe en `aurasports/.env.local`

3. **Las tablas no aparecen**:
   - Refresca la página del dashboard
   - Verifica los logs en el SQL Editor

## 🎉 ¡Listo!

Una vez que ejecutes el script SQL y ejecutes `npm run dev`, tu aplicación AURA Sports estará completamente funcional con tu propia base de datos de Supabase.


