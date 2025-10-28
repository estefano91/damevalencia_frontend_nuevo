# 🔄 Sistema de Eventos Recurrentes - DAME Valencia

## 🎯 **Funcionalidad Implementada**

**NUEVO**: Sistema completo de agrupamiento y visualización de eventos recurrentes con indicadores visuales distintivos y sección dedicada.

Los eventos ahora se clasifican automáticamente en:
- **🔄 Actividades Semanales**: Eventos que se repiten cada semana
- **📅 Eventos Únicos**: Eventos programados para fechas específicas

---

## ✅ **ARCHIVOS ACTUALIZADOS:**

### **1. `src/integrations/dame-api/events.ts`**
- ✅ **Interface DameEvent**: Agregado campo `is_recurring_weekly?: boolean`
- ✅ **Datos demo**: 5 eventos marcados como recurrentes
- ✅ **Tipos**: Compatible con API real de organizaciondame.org

### **2. `src/components/EventsSection.tsx`**
- ✅ **Separación automática**: Lógica para separar eventos recurrentes
- ✅ **Sección especial**: "Actividades Semanales" con diseño único
- ✅ **RecurringEventCard**: Componente especializado
- ✅ **Badges**: Indicadores visuales en cards normales

---

## 🎭 **EVENTOS RECURRENTES DEMO:**

### **💃 Baile**
- **Taller de Bachata para Principiantes** 
  - Todos los viernes 18:00h
  - Escuela de Baile DAME
  - 20.00€ - 30 plazas

- **Workshop de Salsa Nivel Avanzado**
  - Todos los domingos 17:00h  
  - Escuela de Baile DAME
  - 30.00€ - 20 plazas

### **💪 Fitness**
- **Clase de Yoga en el Parque**
  - Todos los lunes 08:00h
  - Parque de la Ciudadela
  - Gratuito - 25 plazas

- **Entrenamiento Funcional DAME Fit**
  - Todos los sábados 19:00h
  - Centro Deportivo DAME
  - 10.00€ - 20 plazas

### **🧠 Bienestar**
- **Taller de Mindfulness**
  - Todos los miércoles 18:00h
  - Centro DAME Apoyo
  - Gratuito - 12 plazas

---

## 🎨 **DISEÑO Y UX:**

### **🔄 Sección "Actividades Semanales"**
- **Ubicación**: Después del header, antes de categorías normales
- **Fondo**: Gradient azul-púrpura suave
- **Iconos**: `RefreshCw` animados indicando repetición
- **Badge sección**: "Semanales" con icono `Repeat`
- **Descripción**: "¡Perfecto para crear rutinas y conocer gente nueva!"

### **📱 RecurringEventCard**
- **Diseño distintivo**: Border azul, gradient background
- **Badge animado**: "Semanal" con `animate-pulse`
- **Información temporal**: "Todos los [día] a las [hora]"
- **Hover effects**: `hover:scale-105` y `hover:shadow-xl`
- **Botones**: Gradient azul-púrpura

### **🏷️ Badges en EventCards Normales**
- **Badge "Semanal"**: Si evento es recurrente
- **Texto adicional**: "Se repite semanalmente"
- **Iconos**: `Repeat` para consistencia visual

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA:**

### **TypeScript Interface**
```typescript
export interface DameEvent {
  // ... otros campos
  is_recurring_weekly?: boolean; // Indica evento recurrente
}
```

### **Separación de Eventos**
```typescript
const loadEvents = async () => {
  const response = await dameEventsAPI.getEventsByCategory();
  
  // Separar eventos recurrentes de únicos
  const recurring: DameEvent[] = [];
  const nonRecurringCategories: EventsByCategory[] = [];
  
  response.data.forEach(categoryData => {
    const recurringEventsInCategory = categoryData.events.filter(
      event => event.is_recurring_weekly
    );
    const nonRecurringEventsInCategory = categoryData.events.filter(
      event => !event.is_recurring_weekly
    );
    
    recurring.push(...recurringEventsInCategory);
    
    if (nonRecurringEventsInCategory.length > 0) {
      nonRecurringCategories.push({
        ...categoryData,
        events: nonRecurringEventsInCategory,
        total_events: nonRecurringEventsInCategory.length
      });
    }
  });
  
  setEventsByCategory(nonRecurringCategories);
  setRecurringEvents(recurring);
};
```

### **Componente RecurringEventCard**
```typescript
const RecurringEventCard = ({ event }: RecurringEventCardProps) => {
  // Helpers para días y horarios semanales
  const getWeekDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const getTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
      {/* Badge "Semanal" animado */}
      <Badge className="bg-blue-600 text-white animate-pulse">
        <Repeat className="mr-1 h-3 w-3" />
        Semanal
      </Badge>
      
      {/* Información temporal específica */}
      <div className="bg-blue-50 p-2 rounded-lg">
        <p className="font-medium text-blue-800">
          Todos los {getWeekDay(event.start)}
        </p>
        <p className="text-xs text-blue-600">
          a las {getTimeOnly(event.start)}
        </p>
      </div>
    </Card>
  );
};
```

---

## 🌐 **ESTRUCTURA API ESPERADA:**

### **Campo Adicional en Respuesta**
```json
{
  "events": [
    {
      "event_slug": "taller-bachata-principiantes",
      "title_es": "Taller de Bachata para Principiantes",
      "start": "2025-11-10T18:00:00+01:00",
      "is_recurring_weekly": true,
      "main_photo_url": "https://organizaciondame.org/storage/events/taller-bachata-principiantes.jpg",
      "price": "20.00",
      "capacity": 30
    }
  ]
}
```

### **Backend Implementation**
El campo `is_recurring_weekly` debe venir desde la base de datos:
```sql
-- Ejemplo de estructura de tabla
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title_es VARCHAR(255),
    start_datetime TIMESTAMP,
    is_recurring_weekly BOOLEAN DEFAULT FALSE,
    -- otros campos...
);
```

---

## 🎨 **EXPERIENCIA DE USUARIO:**

### **🔍 Navegación**
1. **Homepage**: Sección "Actividades Semanales" prominente
2. **Identificación**: Badges y iconos claros de recurrencia  
3. **Información**: Horarios semanales fáciles de entender
4. **Interacción**: Click lleva a vista detallada normal

### **📱 Responsive Design**
- **Mobile**: Grid 1 columna para eventos recurrentes
- **Tablet**: Grid 2 columnas 
- **Desktop**: Grid 3 columnas
- **Badges**: Siempre visibles en todos los tamaños

### **🎯 Casos de Uso**
- **Usuario nuevo**: Ve fácilmente qué actividades son regulares
- **Usuario regular**: Identifica rápidamente sus clases habituales
- **Planificación**: Sabe qué eventos crear rutinas semanales
- **Reservas**: Entiende compromiso semanal vs único

---

## 📊 **MÉTRICAS Y ANALYTICS:**

### **Datos Actuales Demo**
- **Total eventos**: 11 eventos
- **Recurrentes**: 5 eventos (45%)
- **Únicos**: 6 eventos (55%)
- **Categorías afectadas**: Baile, Fitness, Bienestar

### **Distribución por Categoría**
- **Música**: 0 recurrentes, 2 únicos
- **Baile**: 2 recurrentes, 1 único  
- **Arte**: 0 recurrentes, 2 únicos
- **Fitness**: 2 recurrentes, 0 únicos
- **Bienestar**: 1 recurrente, 1 único

---

## 🚀 **ACTIVACIÓN EN PRODUCCIÓN:**

### **Backend Checklist**
- [ ] **Campo `is_recurring_weekly`**: Agregar a tabla events
- [ ] **API endpoints**: Incluir campo en `/api/events/by-category/`
- [ ] **API eventos individuales**: Incluir en `/api/events/{slug}/`
- [ ] **Admin panel**: Checkbox para marcar eventos como recurrentes

### **Frontend Ready**
- ✅ **Interfaces TypeScript**: Campo agregado
- ✅ **Componentes**: RecurringEventCard y badges
- ✅ **Lógica separación**: Automática en loadEvents
- ✅ **Diseño responsive**: Todos los dispositivos
- ✅ **Fallbacks**: Funciona si campo no existe

---

## 🎉 **BENEFICIOS DEL SISTEMA:**

### **✅ Para Usuarios**
- **Claridad**: Saben qué eventos son regulares
- **Planificación**: Pueden crear rutinas semanales
- **Compromiso**: Entiendes el compromiso temporal
- **Descubrimiento**: Fácil encontrar clases regulares

### **✅ Para DAME Valencia**
- **Organización**: Separación clara de tipos de evento
- **Marketing**: Promoción específica de actividades regulares
- **Gestión**: Identificación rápida de compromisos semanales
- **Análisis**: Métricas separadas por tipo de evento

### **✅ Para Desarrollo**
- **Escalable**: Sistema preparado para muchos eventos
- **Mantenible**: Código separado y bien organizado
- **Extensible**: Fácil agregar más tipos de recurrencia
- **Type-safe**: TypeScript previene errores

---

## 🔮 **FUTURAS MEJORAS POSIBLES:**

### **📅 Más Tipos de Recurrencia**
```typescript
// Extensión futura del sistema
export interface RecurrencePattern {
  type: 'weekly' | 'biweekly' | 'monthly' | 'daily';
  interval: number;
  days_of_week?: number[];
  end_date?: string;
}
```

### **🎯 Funcionalidades Adicionales**
- **Suscripción semanal**: Auto-registro a serie completa
- **Calendario personal**: Integración con eventos recurrentes
- **Notificaciones**: Recordatorios automáticos semanales
- **Progreso**: Tracking de asistencia a actividades regulares

---

## 📱 **URLs DE PRUEBA:**

### **Homepage con Eventos Recurrentes**
- **URL**: http://localhost:8080/
- **Sección**: "Actividades Semanales" después del header
- **Eventos**: 5 eventos recurrentes en diseño especial

### **Eventos con Badges**
- **Bachata**: Aparece en sección recurrente Y con badge si está en categoría
- **Yoga**: Gratis + recurrente - combinación de badges
- **Mindfulness**: Bienestar recurrente con horario específico

---

## 📞 **DOCUMENTACIÓN TÉCNICA:**

### **Componentes Creados**
1. **RecurringEventCard**: Diseño especializado para eventos semanales
2. **Badge system**: Indicadores visuales de recurrencia
3. **Event separation logic**: Separación automática en loadEvents

### **Funciones Helper**
1. **getWeekDay()**: Extrae día de la semana en español
2. **getTimeOnly()**: Formatea hora sin fecha
3. **Event filtering**: Separación por `is_recurring_weekly`

---

**🔄 ¡Sistema de eventos recurrentes completamente funcional!**

**Los eventos recurrentes ahora tienen su propia sección prominente, badges distintivos, y información temporal clara para una mejor experiencia de usuario.**

**Ve a http://localhost:8080/ para ver la nueva sección "Actividades Semanales" en acción con 5 eventos recurrentes organizados visualmente.**

---

**📞 Contacto**: admin@organizaciondame.org  
**💬 WhatsApp**: (+34) 658 236 665
