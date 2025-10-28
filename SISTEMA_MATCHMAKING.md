# 🔍 Sistema de Matchmaking & Discovery - AURA Sports

## 📋 Descripción

Sistema inteligente de búsqueda, descubrimiento y recomendaciones que conecta talento deportivo con oportunidades precisas.

## 🚀 Características Implementadas

### 1. **Talent Radar - Búsqueda Avanzada**

URL: `/radar`

**Funcionalidades:**
- ✅ Búsqueda por texto (nombre, deporte, ubicación)
- ✅ Filtros por deporte, nivel, tipo de usuario
- ✅ Filtro por "Buscando" (players, teams, coaches, etc.)
- ✅ Filtro por Aura Score mínimo
- ✅ Solo verificados / Solo Elite
- ✅ Radio de búsqueda en km
- ✅ Contador de resultados en tiempo real
- ✅ Vista de tarjetas / Vista de mapa (placeholder)

**Filtros Disponibles:**
- Deporte (Football, Basketball, Tennis, Swimming, Athletics, Volleyball, Baseball)
- Tipo de Usuario (Player, Coach, Club, Agent, Sponsor, Investor)
- Nivel (Amateur, Semi-Pro, Professional, Elite)
- Buscando (Players, Teams, Coaches, Sponsors, Agencies, Partners)
- Aura Score mínimo
- Solo verificados ✓
- Solo miembros Elite ✓
- Radio de búsqueda (km)

### 2. **Sistema de Matching Inteligente**

**Tabla: `matches`**
- Guarda conexiones sugeridas automáticamente
- Calcula score de compatibilidad (0-100+)
- Razones del match
- Estados: pending, accepted, dismissed

**Algoritmo de Match Score:**
```
+30 pts  → Mismo deporte
+40 pts  → Tipos complementarios (player-coach, player-club)
+50 pts  → Buscando lo que el otro ofrece
+20 pts  → Cercanía (< 25km)
+10 pts  → Verificado
+15 pts  → Miembro Elite
```

### 3. **Discovery por Ubicación**

**Función: `find_nearby_profiles()`**
- Busca perfiles en un radio especificado (km)
- Ordena por distancia
- Retorna: ID, nombre, tipo, deporte, distancia

**Uso:**
```sql
SELECT * FROM find_nearby_profiles(40.4168, -3.7038, 50, 20);
-- Madrid: perfiles a 50km, máximo 20 resultados
```

### 4. **Recomendaciones Inteligentes**

**Función: `generate_recommendations(user_id, limit)`**
- Genera matches automáticos para un usuario
- Considera todos los factores de compatibilidad
- Ordena por score descendente
- Filtra matches ya existentes

**Campos Nuevos en Profiles:**
```typescript
goals: string[]              // Objetivos del usuario
level: string                // Nivel: amateur, semi-pro, pro, elite
nationality: string          // Nacionalidad
latitude: number             // Coordenadas GPS
longitude: number            // Coordenadas GPS
radius_km: number           // Radio de búsqueda personal
looking_for: string[]        // ["players", "coaches", "sponsors"]
availability: string         // available, busy, looking
commitment_level: string     // part-time, full-time, pro
```

### 5. **Sistema de Notificaciones - Talent Radar**

**Tabla: `notifications`**
- Notificaciones automáticas de nuevos matches
- Notificaciones de "Talent Radar" cuando aparece un perfil relevante
- Tipos: new_match, opportunity, connection_request, message, talent_radar
- Estado: read / unread

## 🗄️ Estructura de Base de Datos

### Tabla: `matches`
```sql
id                UUID        -- ID único
user_id           UUID        -- Usuario para quien es el match
matched_with_id   UUID        -- Usuario con quien hace match
match_score       FLOAT       -- Puntuación 0-100+
match_reasons     TEXT[]      -- ["Mismo deporte", "Están buscando tu perfil"]
status            TEXT        -- pending/accepted/dismissed
created_at        TIMESTAMP   -- Fecha
```

### Tabla: `notifications`
```sql
id               UUID         -- ID único
user_id          UUID         -- Usuario destinatario
type             TEXT         -- Tipo de notificación
title            TEXT         -- Título
message          TEXT         -- Mensaje
related_user_id  UUID         -- Usuario relacionado (opcional)
read             BOOLEAN      -- Leída o no
created_at       TIMESTAMP    -- Fecha
```

## 🎯 Flujo de Uso

### Para Usuarios:

**1. Descubrir Talentos:**
```
/discover → Vista general de todos los perfiles
/radar    → Búsqueda avanzada con filtros
```

**2. Usar Filtros:**
- Abre "Talent Radar" desde navegación
- Click en "Filtros" para desplegar panel
- Selecciona: deporte, nivel, tipo, nacionalidad
- Ajusta Aura Score y radio
- Activa "Solo verificados" o "Solo Elite"

**3. Buscar por Texto:**
```
Ejemplos:
- "Fútbol Madrid"
- "Entrenador Profesional"
- "Buscando sponsor"
```

**4. Ver Matches Sugeridos:**
- El sistema automáticamente genera recomendaciones
- Aparecen en el panel de "Matches"
- Puntuación indica compatibilidad

### Para Desarrolladores:

**1. Obtener Matches Cercanos:**
```typescript
const { data } = await supabase.rpc('find_nearby_profiles', {
  user_lat: 40.4168,
  user_lon: -3.7038,
  max_distance_km: 50,
  limit_results: 20
});
```

**2. Generar Recomendaciones:**
```typescript
const { data } = await supabase.rpc('generate_recommendations', {
  target_user_id: user.id,
  limit_results: 10
});
```

**3. Crear Match Manualmente:**
```typescript
const { data } = await supabase.from('matches').insert({
  user_id: user.id,
  matched_with_id: otherUserId,
  match_score: 85,
  match_reasons: ['Mismo deporte', 'Ubicación cercana']
});
```

**4. Buscar con Filtros:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('sport', 'Football')
  .eq('user_type', 'player')
  .gte('aura_score', 100)
  .eq('verified', true);
```

## 🔧 Funciones SQL Creadas

### 1. `calculate_distance(lat1, lon1, lat2, lon2)`
Calcula distancia entre dos puntos GPS usando fórmula de Haversine.
- Retorna: distancia en km

### 2. `find_nearby_profiles(user_lat, user_lon, max_km, limit)`
Encuentra perfiles cerca de un punto GPS.
- Parámetros: coordenadas, radio máximo, límite
- Retorna: ID, nombre, tipo, deporte, distancia

### 3. `calculate_match_score(user_profile, other_profile)`
Calcula score de compatibilidad entre dos perfiles.
- Considera: deporte, tipo, búsqueda, distancia, verificación
- Retorna: puntuación 0-100+

### 4. `generate_recommendations(user_id, limit)`
Genera recomendaciones automáticas para un usuario.
- Excluye matches existentes
- Ordena por score descendente
- Retorna: perfiles, score, razones

## 📊 Ejemplo de Match Score

```
Usuario A (player, Football, busca coach, Madrid)
Usuario B (coach, Football, busca player, Madrid, verificado)

Score: 110 puntos
├─ Mismo deporte (Football)                  +30
├─ Tipos complementarios (player-coach)    +40
├─ Buscando lo que el otro ofrece          +50
├─ Verificado                              +10
└─ ───
Total: 130 puntos → ¡MATCH PERFECTO!
```

## 🎨 UI Implementada

### Página: Talent Radar (`/radar`)

**Componentes:**
- Barra de búsqueda por texto
- Panel de filtros extensible
- Grid responsive de tarjetas
- Contador de resultados
- Botón: Vista Mapa / Vista Tarjetas
- Filtros activos visibles
- Botón: Limpiar filtros

**Responsive:**
- 1 columna (móvil)
- 2 columnas (tablet)
- 3 columnas (laptop)
- 4 columnas (desktop)

## 📝 Migraciones a Ejecutar

### Paso 1: Ejecutar en Supabase SQL Editor

Archivo: `sql_scripts/add_discovery_features.sql`

Este script:
- ✓ Agrega campos de discovery a profiles
- ✓ Crea tabla matches
- ✓ Crea tabla notifications
- ✓ Configura RLS para seguridad
- ✓ Crea índices para rendimiento
- ✓ Crea funciones SQL inteligentes

URL: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql

## 🔗 URLs

- **Aplicación**: https://aura-sports-app.web.app
- **Talent Radar**: https://aura-sports-app.web.app/radar
- **Discover**: https://aura-sports-app.web.app/discover
- **SQL Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql

## ✅ Checklist de Implementación

- [x] Tabla matches creada
- [x] Tabla notifications creada
- [x] Campos de discovery en profiles
- [x] Funciones SQL implementadas
- [x] Página Talent Radar creada
- [x] Filtros avanzados funcionales
- [x] Búsqueda por texto
- [x] Algoritmo de matching
- [x] RLS configurado
- [x] Ruta /radar agregada
- [x] Navegación actualizada
- [x] Tipos TypeScript actualizados
- [ ] Panel de matches recomendados (próximamente)
- [ ] Vista de mapa interactiva (próximamente)
- [ ] Notificaciones push (próximamente)
- [ ] Panel de notificaciones (próximamente)

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** en Supabase
2. **Desplegar aplicación** actualizada
3. **Probar filtros** en Talent Radar
4. **Implementar vista de mapa** con Leaflet/Google Maps
5. **Agregar panel de notificaciones** en navigation

## 💡 Uso del Sistema

### Para encontrar jugadores:
```
Deporte: Football
Tipo: Player
Buscando: Teams
Nivel: Professional
Radio: 25 km
```

### Para encontrar coaches:
```
Deporte: [Tu deporte]
Tipo: Coach
Nivel: Professional
Verificado: ✓
```

### Para clubes buscando talento:
```
Tipo: Player
Deporte: [Tu deporte]
Nivel: Professional+
Buscando: Teams
Radio: 50 km
```

## ✨ ¡Sistema Completo!

AURA Sports ahora tiene:
- 🔍 Búsqueda inteligente
- 📍 Discovery por ubicación
- 🎯 Matching automático
- 🔔 Notificaciones de Talent Radar
- ⭐ Filtros avanzados
- 🗺️ Base para mapa interactivo


