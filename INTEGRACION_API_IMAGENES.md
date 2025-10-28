# 📸 Integración de Imágenes desde API DAME

## 🎯 Objetivo

Las imágenes principales de los eventos (`main_photo_url`) ahora vienen directamente desde la API de `organizaciondame.org`, proporcionando una experiencia más dinámica y actualizada tanto en los cards del inicio como en la vista detallada.

## 🔗 Integración con API Real

### Endpoint Principal
```
GET https://organizaciondame.org/api/events/by-category/
```

### Estructura de Respuesta Esperada
```json
[
  {
    "category": {
      "id": 1,
      "name_es": "Música",
      "name_en": "Music", 
      "icon": "music_note"
    },
    "events": [
      {
        "event_slug": "concierto-jazz-valencia",
        "title_es": "Concierto de Jazz en Valencia",
        "start": "2025-11-15T20:00:00+01:00",
        "price": "25.00",
        "place": {
          "id": 1,
          "name": "Palau de la Música"
        },
        "description_es": "Una noche mágica...",
        "main_photo_url": "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg",
        "capacity": 200,
        "registered_count": 45
      }
    ],
    "total_events": 1
  }
]
```

## 📸 Sistema de Imágenes

### 🗂️ Estructura de Almacenamiento Recomendada
```
https://organizaciondame.org/storage/events/
├── concierto-jazz-valencia.jpg
├── recital-piano-dame.jpg
├── taller-bachata-principiantes.jpg
├── noche-casino-cubano.jpg
├── workshop-salsa-avanzado.jpg
├── exposicion-arte-local.jpg
├── taller-pintura-acuarela.jpg
├── clase-yoga-parque.jpg
├── entrenamiento-funcional-dame.jpg
├── taller-mindfulness.jpg
└── grupo-apoyo-migrantes.jpg
```

### 📏 Especificaciones Técnicas
- **Formato**: JPG, PNG, WebP
- **Tamaño recomendado**: 800x480px (ratio 5:3)
- **Peso máximo**: 500KB por imagen
- **Calidad**: 80-85% para JPG

## 🛡️ Manejo de Errores

### ✅ Casos Manejados
1. **API no disponible**: Fallback a datos demo
2. **Imagen no existe**: Placeholder SVG con marca DAME
3. **Error de carga**: Placeholder elegante
4. **Sin image_url**: Icono temático 🎭

### 🔄 Fallback System
```typescript
// 1. Intenta cargar imagen de API
src={event.image_url}

// 2. Si falla, muestra placeholder DAME
onError={(e) => {
  e.currentTarget.src = 'data:image/svg+xml;base64,PLACEHOLDER_DAME';
}}

// 3. Si no hay image_url, muestra icono
{!event.image_url && <PlaceholderIcon />}
```

## 🚀 Activación en Producción

### Paso 1: Verificar API
```bash
curl -X GET https://organizaciondame.org/api/events/by-category/
```

### Paso 2: Subir Imágenes
Subir archivos al directorio `/storage/events/` del servidor DAME.

### Paso 3: Actualizar Variables
```env
VITE_DAME_API_URL=https://organizaciondame.org/api
```

### Paso 4: Deploy Frontend
```bash
npm run build:production
npm run deploy
```

## 🧪 Testing

### Verificaciones Necesarias
- [ ] API responde correctamente
- [ ] Imágenes cargan sin errores
- [ ] Fallbacks funcionan apropiadamente
- [ ] Performance es adecuada
- [ ] Responsive en todos los dispositivos

### Comandos de Prueba
```bash
# Verificar API
npm run test:api

# Verificar imágenes
npm run test:images

# Verificar fallbacks
npm run test:fallbacks
```

## 📱 Frontend Components

### EventCard con Imágenes Principales
```typescript
// Componente preparado para API real - usa main_photo_url
<img 
  src={event.main_photo_url}  // ← Campo principal desde organizaciondame.org
  alt={event.title_es}
  onError={handleImageError}
/>
```

### EventsSection API Integration
```typescript
// Carga automática desde API
const response = await dameEventsAPI.getEventsByCategory();
// ↓
// events[].main_photo_url disponibles automáticamente en cards del inicio
```

## 🔍 Monitoreo

### Métricas a Monitorear
- **Tiempo de carga** de imágenes
- **Tasa de error** de carga
- **Uso de fallbacks** (debe ser mínimo)
- **Performance general** de EventsSection

### Logs Esperados
```
🔗 Fetching events from DAME API: https://organizaciondame.org/api/events/by-category/
✅ Events loaded from DAME API with images: 11
```

## 💡 Beneficios del Sistema

### ✅ Ventajas
- **Dinámico**: Imágenes actualizadas desde CMS
- **Escalable**: Fácil agregar nuevos eventos
- **Performante**: Optimizado para web
- **Robusto**: Múltiples fallbacks

### 🎯 Casos de Uso
- **Administradores**: Subir imágenes desde panel
- **Usuarios**: Ver imágenes actualizadas automáticamente
- **Desarrolladores**: API lista para usar

## 📞 Soporte

### Contacto Técnico
- **Email**: admin@organizaciondame.org
- **WhatsApp**: (+34) 658 236 665
- **Documentación**: Esta guía

---

**🎭 ¡El sistema está listo para recibir imágenes reales de la API de DAME Valencia!**
