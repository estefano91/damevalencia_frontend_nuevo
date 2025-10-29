# 🎭 DAME Valencia Frontend - Nuevo

## 📝 Descripción

Este es el frontend actualizado para la **Asociación DAME** (Asociación de Arte, Cultura y Bienestar de Valencia). El proyecto ha sido migrado de Supabase a una API personalizada que se conecta directamente con los servicios de https://organizaciondame.org/.

## 🎨 Acerca de DAME

La **Asociación DAME** es una comunidad vibrante y diversa en Valencia, España, unida por el amor al arte, la cultura y el movimiento. A través de talleres, eventos y proyectos innovadores, busca fomentar la creatividad, la inclusión y el bienestar de todos sus miembros.

### 🌟 Nuestros Proyectos

- **🎺 DAME CASINO**: Promoción y difusión de la música cubana en Valencia
- **💃 DAME BACHATA**: Propuesta pedagógica para promover la bachata
- **💪 DAME FIT**: Programa de actividad física para mejorar la calidad de vida
- **🎨 DAME ARTE**: Fomento del desarrollo artístico y cultural de la comunidad
- **🎵 DAME MÚSICA**: Fomento de la creación y difusión musical en Valencia
- **🤝 DAME APOYO**: Iniciativa social para salud mental y apoyo a migrantes

## 🚀 Características del Frontend

### ✨ Nuevas Funcionalidades

- **Autenticación personalizada** con la API de DAME
- **Perfiles adaptados** para roles específicos de DAME (participantes, instructores, artistas, voluntarios, coordinadores, patrocinadores)
- **Interfaz actualizada** con los colores y estilo de DAME
- **Multiidioma** (Español, Inglés, Francés, Portugués)
- **Gestión de eventos** específica para clases de baile, música y arte
- **Sistema de proyectos** para los diferentes programas de DAME

### 🎯 Roles de Usuario

1. **🎭 Participante**: Usuarios que quieren aprender y disfrutar
2. **👨‍🏫 Instructor/a**: Enseñan baile, música o arte
3. **🎨 Artista**: Creadores y performers
4. **🤝 Voluntario/a**: Colaboran con la organización
5. **📋 Coordinador/a**: Organizan actividades y proyectos
6. **💼 Patrocinador/a**: Apoyan económicamente la organización

## 🛠️ Configuración Técnica

### Cambios Principales Realizados

1. **❌ Eliminación de Supabase**
   - Removida la dependencia `@supabase/supabase-js`
   - Eliminados todos los archivos relacionados con Supabase

2. **✅ Nueva API DAME**
   - Cliente API personalizado en `src/integrations/dame-api/`
   - Tipos TypeScript específicos para DAME
   - Autenticación con JWT tokens

3. **🎨 Interfaz Actualizada**
   - Colores y branding de DAME
   - Formularios adaptados para los proyectos de DAME
   - Iconos y elementos visuales relacionados con arte y cultura

### 📂 Estructura del Proyecto

```
src/
├── integrations/
│   └── dame-api/
│       ├── client.ts        # Cliente API principal
│       └── types.ts         # Tipos TypeScript para DAME
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticación actualizado
├── pages/
│   └── Auth.tsx            # Página de login/registro actualizada
└── ...
```

### 🔧 Variables de Entorno

Crea un archivo `.env.local` basado en `env.example`:

```env
# URL base de la API de DAME
VITE_DAME_API_URL=https://organizaciondame.org/api

# URL del sitio web de DAME
VITE_DAME_WEBSITE_URL=https://organizaciondame.org

# Configuración de la aplicación
VITE_APP_NAME=DAME Valencia Frontend
VITE_APP_VERSION=2.0.0

# Idiomas soportados
VITE_SUPPORTED_LANGUAGES=es,en,fr,pt

# Configuración de Valencia
VITE_DEFAULT_CITY=Valencia
VITE_DEFAULT_COUNTRY=España
VITE_DEFAULT_TIMEZONE=Europe/Madrid
```

### 🏃‍♂️ Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp env.example .env.local
   # Edita .env.local con tus configuraciones
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Compilar para producción**:
   ```bash
   npm run build:production
   ```

### 📡 API Endpoints

La aplicación se conecta con los siguientes endpoints de la API de DAME:

- **Autenticación**:
  - `POST /auth/login` - Iniciar sesión
  - `POST /auth/register` - Registrar usuario
  - `GET /auth/me` - Obtener usuario actual

- **Perfiles**:
  - `GET /profiles` - Listar perfiles
  - `GET /profiles/:id` - Obtener perfil específico
  - `PUT /profiles/:id` - Actualizar perfil

- **Eventos y Clases**:
  - `GET /events` - Listar eventos
  - `POST /events/:id/register` - Registrarse a evento
  - `GET /classes` - Listar clases
  - `POST /classes/:id/enroll` - Inscribirse a clase

- **Proyectos DAME**:
  - `GET /projects` - Listar proyectos
  - `GET /projects/:id` - Detalles del proyecto

### 🎨 Personalización del UI

El proyecto utiliza:
- **Colores principales**: Púrpura (`#7C3AED`) y Rosa (`#EC4899`)
- **Tipografía**: Sistema de fuentes moderno
- **Iconos**: Lucide React con iconos de arte (🎨), música (🎵) y corazón (❤️)
- **Componentes**: Radix UI + shadcn/ui

### 🌐 Internacionalización

El proyecto soporta múltiples idiomas:
- **Español** (predeterminado)
- **Inglés**
- **Francés**
- **Portugués**

Los archivos de traducción están en `src/i18n/locales/`.

## 📞 Contacto

- **Email**: admin@organizaciondame.org
- **Teléfono**: (+34) 64 40 70 282
- **Website**: https://organizaciondame.org
- **Ubicación**: Valencia, España

---

## 🔄 Migración desde Supabase

### Cambios Realizados

1. **Cliente API**: Reemplazado `supabase.from()` por `dameApi.method()`
2. **Autenticación**: Cambio de `supabase.auth` a sistema JWT personalizado
3. **Tipos**: Adaptados de tipos SQL a tipos específicos de DAME
4. **Estados**: Simplificación del manejo de estado de autenticación

### Ejemplo de Migración

**Antes (Supabase)**:
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_type', 'player');
```

**Después (DAME API)**:
```typescript
const response = await dameApi.getProfiles({ 
  user_type: 'participant' 
});
if (response.success) {
  const profiles = response.data;
}
```

---

**Desarrollado con ❤️ para la comunidad de DAME Valencia**

