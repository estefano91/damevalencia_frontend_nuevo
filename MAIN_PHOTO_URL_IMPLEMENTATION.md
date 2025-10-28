# 📸 Implementación de main_photo_url - DAME Valencia

## 🎯 **Cambio Implementado**

**ANTES**: Usábamos `image_url` para las imágenes de eventos  
**AHORA**: Usamos `main_photo_url` para las imágenes principales de eventos

Este campo viene directamente desde la API `/api/events/by-category/` y `/api/events/{slug}/` de organizaciondame.org

---

## ✅ **ARCHIVOS ACTUALIZADOS:**

### **1. `src/integrations/dame-api/events.ts`**
- ✅ **Interface DameEvent**: `image_url` → `main_photo_url`
- ✅ **Interface DameEventDetail**: Ya tenía `main_photo_url` correctamente  
- ✅ **Datos demo**: Todos los 11 eventos ahora usan `main_photo_url`
- ✅ **Comentarios**: Actualizados para reflejar el cambio

### **2. `src/components/EventsSection.tsx`**
- ✅ **EventCard**: Usa `event.main_photo_url` en lugar de `event.image_url`
- ✅ **Comentarios**: Clarificado que es imagen principal desde API
- ✅ **Fallbacks**: Mantienen la funcionalidad completa

### **3. Documentación actualizada**
- ✅ **INTEGRACION_API_IMAGENES.md**: Ejemplos actualizados
- ✅ **Comentarios código**: Reflejan el nuevo campo

---

## 🔗 **ESTRUCTURA API ESPERADA:**

### **Listado de Eventos** (`/api/events/by-category/`)
```json
{
  "events": [
    {
      "event_slug": "concierto-jazz-valencia",
      "title_es": "Concierto de Jazz en Valencia",
      "start": "2025-11-15T20:00:00+02:00",
      "price": "25.00",
      "place": {"id": 1, "name": "Palau de la Música"},
      "description_es": "Una noche mágica...",
      "main_photo_url": "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg",
      "capacity": 200,
      "registered_count": 45
    }
  ]
}
```

### **Evento Detallado** (`/api/events/{slug}/`)
```json
{
  "id": 34,
  "title_es": "Concierto de Jazz en Valencia",
  "main_photo_url": "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg",
  "photos": [
    {
      "image_url": "https://organizaciondame.org/storage/events/concierto-jazz-valencia-2.jpg"
    }
  ]
}
```

---

## 🎭 **DÓNDE SE USA main_photo_url:**

### **📱 1. Cards del Inicio (Homepage)**
- **Ubicación**: `EventsSection.tsx` → `EventCard` component
- **Uso**: Imagen principal de cada card de evento
- **Tamaño**: 500x300px (ratio 5:3)
- **Fallback**: Placeholder DAME si no carga

### **🖼️ 2. Vista Detallada del Evento**
- **Ubicación**: `EventDetail.tsx` → Hero section
- **Uso**: Imagen principal grande del evento
- **Tamaño**: Hero section completo responsive
- **Fallback**: Placeholder con iconos DAME

### **🖼️ 3. Galería Adicional**
- **Ubicación**: `EventDetail.tsx` → Photos array
- **Uso**: Campo separado `photos[].image_url`
- **Múltiples**: Varias fotos por evento

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA:**

### **TypeScript Interfaces**
```typescript
// Para listados
export interface DameEvent {
  main_photo_url?: string; // ← Imagen principal
  // ... otros campos
}

// Para vista detallada  
export interface DameEventDetail {
  main_photo_url?: string; // ← Imagen principal
  photos: EventPhoto[];    // ← Galería adicional
}

export interface EventPhoto {
  image_url: string;       // ← Fotos adicionales
  caption_es?: string;
}
```

### **Componente EventCard**
```typescript
// Cards del inicio usan main_photo_url
{event.main_photo_url ? (
  <img 
    src={event.main_photo_url} 
    alt={event.title_es}
    className="w-full h-full object-cover"
    onError={handleImageError}
  />
) : (
  <PlaceholderDAME />
)}
```

### **Componente EventDetail**
```typescript
// Vista detallada usa main_photo_url para hero
{event.main_photo_url ? (
  <img 
    src={event.main_photo_url}
    alt={event.title_es}
    className="w-full h-full object-cover"
  />
) : (
  <PlaceholderHero />
)}

// Galería adicional usa photos[].image_url
{event.photos.map(photo => (
  <img src={photo.image_url} alt={photo.caption_es} />
))}
```

---

## 📊 **DATOS DEMO ACTUALIZADOS:**

### **🎵 Eventos de Música**
- `concierto-jazz-valencia.jpg` → **main_photo_url**
- `recital-piano-dame.jpg` → **main_photo_url**

### **💃 Eventos de Baile**  
- `taller-bachata-principiantes.jpg` → **main_photo_url**
- `noche-casino-cubano.jpg` → **main_photo_url**
- `workshop-salsa-avanzado.jpg` → **main_photo_url**

### **🎨 Eventos de Arte**
- `exposicion-arte-local.jpg` → **main_photo_url**
- `taller-pintura-acuarela.jpg` → **main_photo_url**

### **💪 Eventos de Fitness**
- `clase-yoga-parque.jpg` → **main_photo_url**
- `entrenamiento-funcional-dame.jpg` → **main_photo_url**

### **🧠 Eventos de Apoyo**
- `taller-mindfulness.jpg` → **main_photo_url**
- `grupo-apoyo-migrantes.jpg` → **main_photo_url**

---

## 🎯 **VENTAJAS DEL CAMBIO:**

### **✅ Consistencia API**
- Usa el mismo campo que el backend real
- Estructura idéntica a la especificación original
- Preparado para integración directa

### **✅ Semántica Clara**
- `main_photo_url` = Imagen principal del evento
- `photos[].image_url` = Galería adicional
- Separación clara de responsabilidades

### **✅ Compatibilidad**
- Funciona tanto en cards como en vista detallada
- Fallbacks mantienen experiencia consistente
- TypeScript detecta errores automáticamente

---

## 🚀 **ACTIVACIÓN EN PRODUCCIÓN:**

### **Backend Checklist**
- ✅ **Campo correcto**: Usar `main_photo_url` en respuesta API
- ✅ **Estructura**: JSON coincide exactamente con interfaces
- ✅ **URLs**: Apuntar a `organizaciondame.org/storage/events/`
- ✅ **Fallbacks**: Servidor maneja cuando imagen no existe

### **Frontend Ready**
- ✅ **Interfaces**: TypeScript actualizado  
- ✅ **Componentes**: EventCard y EventDetail listos
- ✅ **Fallbacks**: Sistema robusto de placeholders
- ✅ **Datos demo**: 11 eventos con URLs correctas

---

## 🧪 **TESTING REALIZADO:**

### **✅ Cards del Inicio**
- Imágenes se muestran desde `main_photo_url`
- Placeholders funcionan si imagen falla
- Hover effects mantienen funcionalidad
- Click navega a vista detallada

### **✅ Vista Detallada**
- Hero section usa `main_photo_url`
- Galería usa `photos[].image_url` (separado)
- Fallbacks apropiados en ambos casos
- Responsive en todos los dispositivos

### **✅ API Integration**
- Datos demo simulan estructura real
- Fallback automático si API no disponible
- Logs claros en consola del navegador

---

## 🎉 **RESULTADO FINAL:**

### **🌐 URLs de Prueba**
- **Homepage**: http://localhost:8080/ *(Cards con main_photo_url)*
- **Jazz**: http://localhost:8080/eventos/concierto-jazz-valencia *(Hero + galería)*
- **Bachata**: http://localhost:8080/eventos/taller-bachata-principiantes *(Todas las imágenes)*

### **📸 Sistema Completo**
1. **Cards**: `main_photo_url` desde API
2. **Hero**: Misma `main_photo_url` en vista detallada  
3. **Galería**: Array separado `photos[]`
4. **Fallbacks**: Placeholders DAME elegantes
5. **Performance**: Carga optimizada con error handling

---

## 📞 **Para Implementación Backend**

### **Campos Requeridos en API**
```json
// /api/events/by-category/
{
  "events": [{
    "main_photo_url": "https://organizaciondame.org/storage/events/[slug].jpg"
  }]
}

// /api/events/{slug}/  
{
  "main_photo_url": "https://organizaciondame.org/storage/events/[slug].jpg",
  "photos": [
    {"image_url": "https://organizaciondame.org/storage/events/[slug]-2.jpg"}
  ]
}
```

### **Estructura de Archivos en Servidor**
```
organizaciondame.org/storage/events/
├── concierto-jazz-valencia.jpg      # main_photo_url
├── concierto-jazz-valencia-2.jpg    # photos[] adicionales  
├── taller-bachata-principiantes.jpg # main_photo_url
└── [otros-eventos].jpg              # main_photo_url
```

---

**🎭 ¡Sistema de main_photo_url completamente implementado y funcionando!**

**El frontend está 100% preparado para recibir el campo `main_photo_url` desde la API real de organizaciondame.org**

---

**📞 Contacto**: admin@organizaciondame.org  
**💬 WhatsApp**: (+34) 658 236 665
