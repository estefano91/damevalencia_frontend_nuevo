# 🔥 Configuración del Nuevo Proyecto Firebase: DameValenciaNuevo

## 📋 Pasos para Crear el Nuevo Proyecto

### Paso 1: Crear el Proyecto en Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Haz click en **"Crear un proyecto"** o **"Add project"**
3. **Nombre del proyecto**: `DameValenciaNuevo`
   - ⚠️ El Project ID será: `damevalencia-nuevo` (Firebase lo genera automáticamente en minúsculas)
4. Opcional: Desactiva Google Analytics (no es necesario para hosting estático)
5. Click en **"Crear proyecto"**

### Paso 2: Activar Firebase Hosting

1. En la consola de Firebase, en el menú lateral:
   - Click en **"Hosting"**
   - Click en **"Empezar"** o **"Get started"**
   - Sigue el asistente (puedes saltarte los pasos ya que la configuración está hecha)

### Paso 3: Verificar Configuración Local

Ya hemos actualizado estos archivos:
- ✅ `.firebaserc` → apunta a `damevalencia-nuevo`
- ✅ `firebase.json` → configurado correctamente
- ✅ `deploy-firebase.ps1` → actualizado con nuevo nombre

### Paso 4: Vincular el Proyecto Local

Ejecuta desde la terminal en el directorio del proyecto:

```powershell
cd "C:\Users\estef\Desktop\DAMEVALENCIA VERSION 2\damevalencia_frontend_nuevo"
firebase use damevalencia-nuevo
```

Esto vinculará tu proyecto local con el nuevo proyecto de Firebase.

### Paso 5: Hacer el Primer Deploy

Ejecuta el script de deploy:

```powershell
.\deploy-firebase.ps1
```

O manualmente:

```powershell
npm run build:production
firebase deploy --only hosting
```

## ✅ URLs del Nuevo Proyecto

Una vez desplegado, tu aplicación estará disponible en:
- **URL Principal**: https://damevalencia-nuevo.web.app
- **URL Alternativa**: https://damevalencia-nuevo.firebaseapp.com
- **Dashboard**: https://console.firebase.google.com/project/damevalencia-nuevo

## 🔄 Migración desde el Proyecto Anterior

Este proyecto **NO** está vinculado al proyecto anterior `aura-sports-app`. Es completamente independiente.

### Si necesitas migrar datos:
- Los datos de eventos vienen de la API de DAME (`https://organizaciondame.org/api`)
- No hay dependencia del proyecto anterior
- Solo necesitas configurar las variables de entorno si son diferentes

## 📝 Variables de Entorno para Producción

Si necesitas crear `.env.production`, debe contener:

```env
VITE_DAME_API_URL=https://organizaciondame.org/api
VITE_DAME_WEBSITE_URL=https://organizaciondame.org
VITE_APP_NAME=DAME Valencia Frontend
VITE_APP_VERSION=2.0.0
VITE_SUPPORTED_LANGUAGES=es,en,fr,pt
VITE_DEFAULT_CITY=Valencia
VITE_DEFAULT_COUNTRY=España
VITE_DEFAULT_TIMEZONE=Europe/Madrid
VITE_DEV_MODE=false
VITE_API_TIMEOUT=30000
VITE_CONTACT_EMAIL=admin@organizaciondame.org
VITE_CONTACT_PHONE=+34644070282
```

## 🎯 Comandos Útiles

```powershell
# Ver proyectos disponibles
firebase projects:list

# Cambiar de proyecto activo
firebase use damevalencia-nuevo

# Ver configuración actual
firebase projects:list

# Deploy completo
.\deploy-firebase.ps1

# Deploy rápido (después del primer build)
firebase deploy --only hosting
```

## 🚨 Si el Project ID es Diferente

Si Firebase genera un ID diferente (por ejemplo, `damevalencia-nuevo-1234`):
1. Actualiza `.firebaserc` con el ID correcto
2. Ejecuta: `firebase use [tu-project-id]`
3. Verifica: `firebase projects:list`

## ✅ Lista de Verificación

- [ ] Proyecto creado en Firebase Console
- [ ] Firebase Hosting activado
- [ ] `.firebaserc` actualizado (ya hecho)
- [ ] Proyecto vinculado: `firebase use damevalencia-nuevo`
- [ ] Variables de entorno configuradas (si es necesario)
- [ ] Primer deploy ejecutado: `.\deploy-firebase.ps1`

## 🎉 ¡Listo!

Una vez completado, tendrás:
- ✅ Nuevo proyecto independiente en Firebase
- ✅ Aplicación desplegada en producción
- ✅ URL pública funcionando
- ✅ Sin dependencia del proyecto anterior



















