# 🌟 Sistema "Hazte Referente" - AURA Sports

## 📋 Descripción

"Hazte Referente" es la funcionalidad que permite a cualquier usuario de AURA Sports convertirse en una figura activa dentro del ecosistema, conectando talento con oportunidades y recibiendo beneficios cuando sus contactos consiguen resultados.

## 🚀 Características Implementadas

### 1. **Activación del Modo Referente**
- Botón "Hazte Referente" en la navegación principal
- Función SQL que genera código único automáticamente
- Cambio de badge automático (referrer / referrer_verified)

### 2. **Código de Referencia Único**
- Generación automática de código alfanumérico de 8 caracteres
- Único por usuario
- Mostrado en el perfil del referente

### 3. **Sistema de Tracking**
- Tabla `referrals` para rastrear todas las referencias
- Estados: pending, applied, accepted, rejected
- Referencias vinculadas con usuarios y oportunidades futuras

### 4. **Estadísticas en Tiempo Real**
- Total de referidos
- Referidos exitosos
- Puntos de referente
- Rank del referente (Starter, Rising, Pro, Expert, Legend)

### 5. **Gamificación**
- Sistema de puntos:
  - 10 puntos por cada referencia
  - 50 puntos por referencia exitosa
- Ranking de referentes con 5 niveles
- Badges exclusivos de referente

### 6. **Triggers Automáticos**
- Actualización automática de estadísticas
- Cálculo automático de puntos
- Asignación automática de rank

## 🗄️ Estructura de Base de Datos

### Tabla: `profiles` (campos agregados)
```sql
is_referrer          BOOLEAN     -- Si es referente activo
referrer_code        TEXT        -- Código único de referencia
total_referrals      INTEGER     -- Total de personas referidas
successful_referrals INTEGER     -- Referidos con éxito
referrer_points      INTEGER     -- Puntos acumulados
referrer_rank        TEXT        -- Rank: starter/rising/pro/expert/legend
```

### Tabla: `referrals` (nueva)
```sql
id                UUID        -- ID único
referrer_id       UUID        -- Quien hace la referencia
referred_user_id  UUID        -- Usuario referido
opportunity_id    UUID        -- Oportunidad (futuro)
status            TEXT        -- pending/applied/accepted/rejected
referral_date     TIMESTAMP   -- Fecha de referencia
success_date      TIMESTAMP   -- Fecha de éxito
notes             TEXT        -- Notas adicionales
```

## 📊 Rangos del Sistema

| Rank | Puntos | Color | Badge |
|------|--------|-------|-------|
| Starter | 50+ | Gris | 🌱 |
| Rising | 100+ | Azul | 📈 |
| Pro | 250+ | Verde | 💼 |
| Expert | 500+ | Morado | ⭐ |
| Legend | 1000+ | Dorado | 👑 |

## 🔧 Funciones SQL Creadas

### 1. `generate_referrer_code()`
Genera un código único alfanumérico de 8 caracteres.

### 2. `become_referrer(user_id)`
Activa el modo referente para un usuario:
- Genera código único
- Activa `is_referrer`
- Asigna badge apropiado

### 3. `update_referrer_stats()`
Actualiza automáticamente las estadísticas cuando cambia una referencia.

### 4. `calculate_aura_score()`
Incluye puntos de referente en el Aura Score.

## 🎯 Flujo de Uso

### Para Activar el Modo Referente

1. Usuario hace click en "Hazte Referente" en la navegación
2. Ve la página de beneficios y sistema de rangos
3. Hace click en "Convertirme en Referente"
4. Se genera código único automáticamente
5. Usuario ahora puede:
   - Ver su código
   - Compartir oportunidades
   - Ver sus estadísticas
   - Aparecer en rankings

### Para Referir a Alguien

1. Referente encuentra una oportunidad
2. Comparte oportunidad con su código
3. Persona referida se registra con el código
4. Sistema registra la referencia en tabla `referrals`
5. Se actualizan estadísticas automáticamente
6. Si la persona consigue la plaza:
   - Referente gana puntos adicionales
   - Contador de éxitos aumenta
   - Rank puede subir automáticamente

## 📝 Migraciones a Ejecutar

### Paso 1: Ejecutar en Supabase SQL Editor

Ejecuta el archivo: `sql_scripts/create_referrer_system.sql`

Este script:
- ✓ Agrega campos de referente a profiles
- ✓ Crea tabla referrals
- ✓ Crea índices para rendimiento
- ✓ Crea funciones SQL (generate_referrer_code, become_referrer)
- ✓ Crea triggers automáticos
- ✓ Configura RLS (Row Level Security)

## 🎨 UI Implementada

### 1. **Página: BecomeReferrer** (`/referrer`)
- Hero con icono y título
- Grid de beneficios visual
- "Cómo Funciona" paso a paso
- Tabla de rangos con colores
- Botón de activación
- Muestra código después de activar

### 2. **Navegación Actualizada**
- Botón "Hazte Referente" con ícono Star
- Visible en todas las páginas
- Badge especial dorado/orange

### 3. **Próximos Pasos** (Por implementar)
- Panel de estadísticas en perfil
- Lista de referidos
- Rankings de la comunidad
- Compartir código con QR

## 📊 Ejemplo de Uso

```typescript
// Activar modo referente
const { data } = await supabase.rpc('become_referrer', {
  user_id: user.id
});

// Ver código de referencia
const { data: profile } = await supabase
  .from('profiles')
  .select('referrer_code, is_referrer, referrer_points, referrer_rank')
  .eq('id', user.id)
  .single();

// Ver estadísticas
console.log(`Referidos: ${profile.total_referrals}`);
console.log(`Exitosos: ${profile.successful_referrals}`);
console.log(`Puntos: ${profile.referrer_points}`);
console.log(`Rank: ${profile.referrer_rank}`);
```

## 🔗 URLs

- **Aplicación**: https://aura-sports-app.web.app
- **Página Referente**: https://aura-sports-app.web.app/referrer
- **SQL Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql

## ✅ Checklist de Implementación

- [x] Tabla referrals creada
- [x] Campos de referente en profiles
- [x] Funciones SQL implementadas
- [x] Triggers automáticos
- [x] RLS configurado
- [x] Página BecomeReferrer creada
- [x] Ruta /referrer agregada
- [x] Botón en Navigation
- [x] Tipos TypeScript actualizados
- [ ] Panel de estadísticas (próximamente)
- [ ] Rankings globales (próximamente)
- [ ] Compartir con QR (próximamente)


