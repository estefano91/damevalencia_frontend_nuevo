# 🚀 Guía de Despliegue en Firebase Hosting

## 📋 Requisitos Previos

- Node.js y npm instalados
- Cuenta de Google
- Proyecto AURA Sports configurado

## 🔧 Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

O si prefieres usar npx (sin instalación global):

```bash
npx firebase-tools login
```

## 🔐 Paso 2: Iniciar Sesión en Firebase

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Google.

## 🏗️ Paso 3: Crear Proyecto en Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Haz click en "Crear un proyecto"
3. Nombre: `aura-sports-app` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Click en "Crear proyecto"

## 🔗 Paso 4: Inicializar Firebase en el Proyecto

```bash
cd "C:\Users\estef\Desktop\AURA SPORTS\aurasports"
firebase init hosting
```

Durante la configuración:
- ¿Qué directorio usar? → `dist`
- ¿Configurar una app web? → `No` (ya está configurado)
- ¿Configurar como SPA? → `Yes`
- ¿Archivo existente dist/index.html? → `Yes`

## ✅ Paso 5: Configurar Variables de Entorno de Producción

Crea un archivo `.env.production` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://heshwhpxnmpfjnxosdxg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlc2h3aHB4bm1wZmpueG9zZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Njc3MzUsImV4cCI6MjA3NzA0MzczNX0.bYf2PLuaZBy1aWjuu2ruYiOEhg2q4DS52oYMOsLn9ow
```

**Importante**: Estas son tus credenciales actuales de Supabase. Asegúrate de que sean correctas.

## 🔨 Paso 6: Build del Proyecto

```bash
npm run build
```

Esto creará una carpeta `dist/` con los archivos optimizados para producción.

## 🚀 Paso 7: Desplegar a Firebase

```bash
firebase deploy --only hosting
```

## 📍 Paso 8: Ver Tu Aplicación

Después del deploy, verás una URL como:
```
https://aura-sports-app.web.app
```

O personalizada:
```
https://aura-sports-app.firebaseapp.com
```

## 🔄 Actualizar la Aplicación

Cada vez que hagas cambios:

```bash
npm run build
firebase deploy --only hosting
```

## 🎨 Configurar Dominio Personalizado (Opcional)

1. Ve a Firebase Console → Tu proyecto → Hosting
2. Click en "Agregar dominio personalizado"
3. Ingresa tu dominio
4. Sigue las instrucciones para verificar

## 📝 Notas Importantes

### Variables de Entorno

Firebase Hosting soporta variables de entorno en el build. Las variables `VITE_*` se inyectan durante el build, así que:

1. Crea `.env.production` con las variables
2. Ejecuta `npm run build`
3. El build contendrá las variables correctas

### Actualizar Firebase Project ID

Si cambias el ID del proyecto, edita `.firebaserc`:

```json
{
  "projects": {
    "default": "tu-nuevo-project-id"
  }
}
```

### Scripts Útiles

Agrega estos scripts a `package.json` para facilitar el deploy:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

## ⚠️ Troubleshooting

### Error: "Project not found"
- Verifica que el project ID en `.firebaserc` sea correcto
- Ejecuta `firebase projects:list` para ver tus proyectos

### Error: "Permission denied"
- Asegúrate de estar autenticado: `firebase login`
- Verifica que tienes permisos en el proyecto

### Error: "Build failed"
- Revisa que `.env.production` exista
- Verifica que las variables de Supabase sean correctas
- Ejecuta `npm run build` localmente antes de deployar

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
- **URL**: https://aura-sports-app.web.app
- **Dashboard**: https://console.firebase.google.com/

## 📞 Soporte

Si tienes problemas:
- Firebase Docs: https://firebase.google.com/docs/hosting
- Supabase Docs: https://supabase.com/docs


