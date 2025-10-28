# 🔄 Sistema de Eventos Recurrentes Refactorizado - DAME Valencia

## 🎯 **Cambio Implementado**

**ANTES**: Eventos recurrentes se mostraban en sección separada  
**AHORA**: Eventos recurrentes se muestran UNA SOLA VEZ en sus categorías normales con selección de fechas específicas dentro de la vista detallada

Este enfoque es mucho más intuitivo y permite una gestión clara de las reservas por fecha específica.

---

## ✅ **NUEVA FUNCIONALIDAD:**

### **📅 Vista de Lista**
- **Una sola aparición**: Cada evento recurrente aparece UNA vez en su categoría
- **Badge "Semanal"**: Indicador visual de que es recurrente
- **Texto informativo**: "Se repite semanalmente" bajo la fecha
- **Integración perfecta**: Mezclado con eventos únicos sin separación artificial

### **📋 Vista Detallada**
- **Sección "Fechas disponibles"**: Lista de próximas 6 fechas
- **Selección interactiva**: Click para seleccionar fecha específica
- **Estado visual**: Disponible, seleccionada, o completa
- **Reserva específica**: WhatsApp con fecha exacta incluida
- **Información contextual**: Horario semanal, total de sesiones

---

## 🔧 **ARCHIVOS ACTUALIZADOS:**

### **1. `src/integrations/dame-api/events.ts`**
- ✅ **Tipos nuevos**: `EventDate`, `RecurringEventInfo`
- ✅ **Campo agregado**: `recurring_info?: RecurringEventInfo` en `DameEventDetail`
- ✅ **Helpers nuevos**: `generateRecurringDates()`, `formatRecurringSchedule()`
- ✅ **Datos demo**: 2 eventos detallados con fechas recurrentes

### **2. `src/components/EventsSection.tsx`**
- ✅ **Lógica simplificada**: Remoción de separación artificial
- ✅ **Una sola sección**: Todos los eventos en sus categorías naturales
- ✅ **Badges mejorados**: Indicador "Semanal" en eventos recurrentes
- ✅ **Limpieza código**: Eliminación de `RecurringEventCard`

### **3. `src/components/EventDetail.tsx`**
- ✅ **Sección nueva**: "Fechas disponibles" para eventos recurrentes
- ✅ **Selección interactiva**: Grid de fechas clickeables
- ✅ **Reserva inteligente**: WhatsApp incluye fecha seleccionada
- ✅ **Sidebar adaptativo**: Muestra horario semanal vs fecha específica
- ✅ **Estados visuales**: Disponible, seleccionada, completa

---

## 🎨 **EXPERIENCIA DE USUARIO MEJORADA:**

### **🔍 Navegación Natural**
1. **Homepage**: Ve "Taller de Bachata" una sola vez en categoría Baile
2. **Badge visual**: Reconoce que es semanal por el badge azul
3. **Click evento**: Navega a vista detallada
4. **Fechas disponibles**: Ve próximas 6 fechas del taller
5. **Selecciona fecha**: Click en fecha específica que le conviene
6. **Reserva**: WhatsApp con fecha exacta pre-llenado

### **📱 Interfaz Intuitiva**
- **Grid responsive**: 2 columnas en móvil, más en desktop
- **Estados claros**: Verde=seleccionada, rojo=completa, gris=disponible
- **Información completa**: Plazas disponibles, deadline de inscripción
- **Feedback inmediato**: Confirmación visual de selección

---

## 🎭 **EVENTOS DEMO DISPONIBLES:**

### **💃 Taller de Bachata para Principiantes**
- **URL**: `/eventos/taller-bachata-principiantes`
- **Horario**: Todos los domingo 18:00h
- **Precio**: 20.00€
- **Duración**: 90 minutos
- **Fechas**: 6 próximas fechas disponibles
- **Total sesiones**: 12 (3 meses)

### **🧘‍♀️ Clase de Yoga en el Parque**
- **URL**: `/eventos/clase-yoga-parque`
- **Horario**: Todos los lunes 08:00h
- **Precio**: Gratuito
- **Duración**: 60 minutos
- **Fechas**: 6 próximas fechas disponibles
- **Total sesiones**: 8 (2 meses)

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA:**

### **Nuevos Tipos TypeScript**
```typescript
export interface EventDate {
  id: string;
  date: string; // ISO fecha específica
  available_spots: number;
  is_full: boolean;
  registration_deadline?: string;
}

export interface RecurringEventInfo {
  next_dates: EventDate[]; // Próximas fechas
  total_sessions?: number; // Sesiones totales
  schedule_info: string; // "Todos los lunes 08:00h"
}

export interface DameEventDetail {
  // ... campos existentes
  recurring_info?: RecurringEventInfo; // Solo eventos recurrentes
}
```

### **Generación de Fechas**
```typescript
export const generateRecurringDates = (baseDate: string, weeksCount: number = 8): EventDate[] => {
  const dates: EventDate[] = [];
  const startDate = new Date(baseDate);
  
  for (let i = 0; i < weeksCount; i++) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + (i * 7)); // +7 días
    
    if (nextDate > new Date()) { // Solo fechas futuras
      dates.push({
        id: nextDate.toISOString().split('T')[0],
        date: nextDate.toISOString(),
        available_spots: Math.floor(Math.random() * 10) + 5,
        is_full: Math.random() < 0.1, // 10% probabilidad
        registration_deadline: new Date(nextDate.getTime() - 24*60*60*1000).toISOString()
      });
    }
  }
  
  return dates.slice(0, 6); // Máximo 6 fechas
};
```

### **Interfaz de Selección**
```typescript
const [selectedRecurringDate, setSelectedRecurringDate] = useState<string | null>(null);

// Grid de fechas clickeables
{event.recurring_info?.next_dates.map((eventDate) => (
  <div
    key={eventDate.id}
    className={`cursor-pointer border-2 ${
      selectedRecurringDate === eventDate.id
        ? 'border-blue-500 bg-blue-50' // Seleccionada
        : eventDate.is_full
        ? 'border-gray-200 bg-gray-50 cursor-not-allowed' // Completa
        : 'border-gray-200 hover:border-blue-300' // Disponible
    }`}
    onClick={() => !eventDate.is_full && setSelectedRecurringDate(eventDate.id)}
  >
    <div className="flex justify-between">
      <span>{formatDateTime(eventDate.date)}</span>
      <Badge>{eventDate.available_spots} plazas</Badge>
    </div>
    
    {selectedRecurringDate === eventDate.id && (
      <Button onClick={reservarFechaEspecifica}>
        Reservar esta fecha
      </Button>
    )}
  </div>
))}
```

### **Reserva con Fecha Específica**
```typescript
const message = `Hola, me gustaría reservar para "${event.title_es}" el ${formatDateTime(selectedDate.date)}`;

window.open(
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
  '_blank'
);
```

---

## 🌐 **ESTRUCTURA API REQUERIDA:**

### **Endpoint de Listado** (`/api/events/by-category/`)
```json
{
  "events": [
    {
      "event_slug": "taller-bachata-principiantes",
      "title_es": "Taller de Bachata para Principiantes",
      "start": "2025-11-10T18:00:00+01:00",
      "is_recurring_weekly": true,
      "main_photo_url": "https://organizaciondame.org/storage/events/taller-bachata-principiantes.jpg"
    }
  ]
}
```

### **Endpoint Detallado** (`/api/events/{slug}/`)
```json
{
  "id": 2,
  "title_es": "Taller de Bachata para Principiantes",
  "start_datetime": "2025-11-10T18:00:00+01:00",
  "is_recurring_weekly": true,
  "recurring_info": {
    "next_dates": [
      {
        "id": "2025-11-10",
        "date": "2025-11-10T18:00:00+01:00",
        "available_spots": 12,
        "is_full": false,
        "registration_deadline": "2025-11-09T18:00:00+01:00"
      },
      {
        "id": "2025-11-17", 
        "date": "2025-11-17T18:00:00+01:00",
        "available_spots": 15,
        "is_full": false,
        "registration_deadline": "2025-11-16T18:00:00+01:00"
      }
    ],
    "schedule_info": "Todos los domingo a las 18:00",
    "total_sessions": 12
  }
}
```

---

## 📊 **VENTAJAS DEL NUEVO SISTEMA:**

### **✅ Para Usuarios**
- **Menos confusión**: Un evento = una entrada en la lista
- **Selección clara**: Elige fecha exacta que le conviene
- **Información completa**: Ve todas las fechas disponibles de una vez
- **Reserva precisa**: WhatsApp incluye fecha específica automáticamente

### **✅ Para DAME Valencia**
- **Gestión simple**: Un evento recurrente = una entrada administrativa
- **Reservas claras**: Saben exactamente qué fecha reservó cada usuario
- **Capacidad específica**: Control de plazas por sesión individual
- **Comunicación directa**: WhatsApp con fecha específica facilita organización

### **✅ Para Desarrollo**
- **Código limpio**: Eliminación de lógica de separación artificial
- **Mantenimiento fácil**: Un solo flujo para eventos únicos y recurrentes
- **Escalabilidad**: Sistema preparado para muchos tipos de recurrencia
- **Type-safe**: TypeScript previene errores de fechas

---

## 🎯 **COMPARACIÓN CON VERSIÓN ANTERIOR:**

| **Aspecto** | **❌ Versión Anterior** | **✅ Versión Nueva** |
|-------------|-------------------------|----------------------|
| **Visualización** | Sección separada "Actividades Semanales" | Integrado en categorías normales |
| **Repetición** | Evento mostrado múltiples veces | Una sola aparición por evento |
| **Reservas** | Genérica "reservar evento" | Específica "reservar fecha X" |
| **Selección** | No había selección de fecha | Grid interactivo de fechas |
| **Información** | Horario general solamente | Fechas específicas + horario general |
| **WhatsApp** | Mensaje genérico | Mensaje con fecha específica |
| **Gestión** | Confuso para administradores | Claro: un evento, múltiples sesiones |

---

## 🚀 **IMPLEMENTACIÓN EN PRODUCCIÓN:**

### **Backend Checklist**
- [ ] **Campo `recurring_info`**: Agregar a tabla events y respuesta API
- [ ] **Generación de fechas**: Lógica server-side para next_dates
- [ ] **Gestión de plazas**: Control de capacidad por sesión específica
- [ ] **Admin interface**: Panel para gestionar eventos recurrentes

### **Frontend Ready**
- ✅ **Interfaces completas**: Todos los tipos TypeScript definidos
- ✅ **UI interactiva**: Selección y reserva de fechas específicas
- ✅ **Fallbacks**: Funciona si recurring_info no existe
- ✅ **Responsive**: Optimizado para todos los dispositivos

---

## 📱 **CASOS DE USO REALES:**

### **🎭 Usuario María (Principiante)**
1. **Ve homepage**: "Taller de Bachata" en sección Baile
2. **Nota badge**: "Semanal" - entiende que es recurrente
3. **Click evento**: Va a vista detallada
4. **Ve fechas**: 6 domingos disponibles
5. **Selecciona**: Domingo 17 noviembre (le viene bien)
6. **Reserva**: WhatsApp "quiero reservar Bachata el 17 noviembre 18:00h"

### **🧘‍♀️ Usuario Carlos (Regular)**
1. **Busca yoga**: Ve "Clase de Yoga en el Parque" 
2. **Reconoce**: Badge "Semanal" + "Gratuito"
3. **Entra a detalle**: Ve próximos 6 lunes disponibles
4. **Selecciona múltiples**: Puede reservar varias fechas seguidas
5. **WhatsApp**: Mensaje específico por cada fecha

### **📋 Administrador DAME**
1. **Crea evento**: "Taller X" con `is_recurring_weekly: true`
2. **Sistema genera**: Próximas 6-8 fechas automáticamente  
3. **Recibe reservas**: WhatsApp con fechas específicas
4. **Gestiona plazas**: Por sesión individual, no general
5. **Actualiza**: Capacidad o cancelaciones por fecha específica

---

## 🔮 **FUTURAS MEJORAS:**

### **📅 Más Tipos de Recurrencia**
```typescript
export interface RecurrencePattern {
  type: 'weekly' | 'biweekly' | 'monthly';
  days_of_week?: number[]; // [1,3,5] = lunes, miércoles, viernes
  interval: number; // Cada X semanas/meses
  end_date?: string; // Fecha fin de la serie
}
```

### **🎯 Funciones Avanzadas**
- **Calendario personal**: Integración con Google Calendar
- **Reserva múltiple**: Seleccionar varias fechas a la vez
- **Lista de espera**: Cuando sesión específica está llena
- **Notificaciones**: Recordatorios automáticos por fecha

---

## 📞 **URLs DE PRUEBA:**

### **Homepage Refactorizada**
- **URL**: http://localhost:8080/
- **Comportamiento**: Eventos recurrentes aparecen UNA vez en sus categorías
- **Indicadores**: Badges "Semanal" + texto "Se repite semanalmente"

### **Eventos Detallados con Fechas**
- **Bachata**: http://localhost:8080/eventos/taller-bachata-principiantes
- **Yoga**: http://localhost:8080/eventos/clase-yoga-parque
- **Funcionalidad**: Seleccionar fechas específicas + reserva con WhatsApp

---

## 📝 **DOCUMENTACIÓN TÉCNICA:**

### **Funciones Helper**
1. **generateRecurringDates()**: Crea fechas futuras automáticamente
2. **formatRecurringSchedule()**: "Todos los lunes a las 08:00"
3. **Date selection**: Estado local para fecha seleccionada
4. **WhatsApp integration**: Mensaje con fecha específica

### **Estados UI**
1. **No selección**: Grid normal de fechas disponibles
2. **Fecha seleccionada**: Highlight azul + botón "Reservar esta fecha"
3. **Fecha completa**: Gris + "Completo" badge + no clickeable
4. **Loading**: Skeleton mientras carga fechas

---

**🔄 ¡Sistema de eventos recurrentes completamente refactorizado y mejorado!**

**Ahora los eventos recurrentes se comportan de manera más intuitiva: una sola aparición en la lista con selección de fechas específicas dentro de la vista detallada.**

**Ve a http://localhost:8080/ y prueba hacer click en cualquier evento con badge "Semanal" para ver la nueva funcionalidad de selección de fechas.**

---

**📞 Contacto**: admin@organizaciondame.org  
**💬 WhatsApp**: (+34) 658 236 665
