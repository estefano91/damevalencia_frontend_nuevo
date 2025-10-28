# 🎯 Sistema de Seguimiento y Validación de Referencias - AURA Sports

## 📋 Descripción

Sistema completo para rastrear, validar y reconocer referencias exitosas entre referentes, jugadores y clubes, manteniendo la neutralidad legal de AURA Sports como plataforma de intermediación.

## 🎯 Objetivos

1. **Transparencia**: Permitir que clubs, players y referrers interactúen transparentemente
2. **Neutralidad Legal**: AURA no gestiona pagos ni hace cumplir acuerdos
3. **Reconocimiento**: Dar crédito a referentes por sus referencias exitosas
4. **Validación Multi-Nivel**: Club, player, y validación comunitaria
5. **Analytics**: Métricas y leaderboards para referentes

## 🗄️ Estructura de Base de Datos

### Tabla: `opportunities`
**Propósito**: Ofertas de trabajo/contratación de clubes

```sql
id                    UUID        -- ID único
club_id              UUID        -- Club que publica
title                TEXT         -- Título de la oferta
description          TEXT         -- Descripción
sport                 TEXT         -- Deporte
position              TEXT         -- Posición
contract_type         TEXT         -- trial/permanent/temporary
status                TEXT         -- draft/active/closed/filled
requirements          TEXT[]       -- Requisitos
location              TEXT         -- Ubicación
salary_range          TEXT         -- Rango salarial
application_deadline  TIMESTAMP    -- Fecha límite
```

### Tabla: `referral_records`
**Propósito**: Registro principal de referencias

```sql
id                    UUID        -- ID único
referrer_id           UUID        -- Quien hizo la referencia
player_id             UUID        -- Jugador referido
club_id               UUID        -- Club destinatario
opportunity_id        UUID        -- Oferta específica (opcional)
referral_code         TEXT         -- Código de referencia
referral_date         TIMESTAMP    -- Fecha de referencia
interaction_status    TEXT         -- viewed/contacted/trial/contracted
validation_state      TEXT         -- unconfirmed/confirmed_by_club/confirmed_by_player/
                                    -- community_verified/pending_validation
evidence_links        TEXT[]       -- Links de evidencia (opcional)
club_confirmed_at     TIMESTAMP    -- Cuándo confirmó el club
player_confirmed_at   TIMESTAMP    -- Cuándo se auto-confirmó el jugador
community_verified_at TIMESTAMP    -- Cuándo fue verificado por comunidad
verified_by           TEXT[]       -- IDs de quienes verificaron
```

### Tabla: `community_validations`
**Propósito**: Validaciones comunitarias

```sql
id                    UUID        -- ID único
referral_record_id    UUID        -- Referencia a validar
validator_id          UUID        -- Usuario que valida
validator_role        TEXT         -- club_rep/other_player/admin
validation_type       TEXT         -- confirm/dispute
notes                 TEXT         -- Notas opcionales
```

## 🔄 Flujo de Trabajo Completo

### 1️⃣ Registro Automático de Referencia

**Cuando**: Un jugador se registra con código de referencia y aplica a un club

**Qué pasa**:
```typescript
// Se llama automáticamente cuando el jugador aplica
await supabase.rpc('register_referral', {
  p_referrer_id: referrerId,
  p_player_id: playerId,
  p_club_id: clubId,
  p_opportunity_id: opportunityId,
  p_referral_code: referralCode
});

// Crea registro con:
// - interaction_status: 'viewed'
// - validation_state: 'unconfirmed'
// - referral_date: now()
```

**UI Display**: 
> "Application made via referral by [Referrer Name]"

### 2️⃣ Confirmación por Club

**Cuándo**: El club confirma que contrató al jugador

**UI**: Botón "Confirm Hiring" en el dashboard del club

**Qué pasa**:
```typescript
await supabase.rpc('confirm_hire_by_club', {
  p_referral_id: referralId,
  p_status: 'contracted' // o 'trial'
});

// Actualiza:
// - interaction_status: 'contracted'
// - validation_state: 'confirmed_by_club'
// - club_confirmed_at: now()
```

**Notificación al Referente**:
> "Your referred player [X] has been officially confirmed by [Club Name]."

**Badge/Score**: El referente recibe puntos y badge de reconocimiento

### 3️⃣ Auto-Confirmación del Jugador

**Cuándo**: El club no confirma, pero el jugador fue contratado

**UI**: Botón "Report Successful Contract" en perfil del jugador

**Qué pasa**:
```typescript
await supabase.rpc('self_confirm_by_player', {
  p_referral_id: referralId,
  p_evidence_links: ['https://example.com/contract'] // opcional
});

// Actualiza:
// - interaction_status: 'contracted'
// - validation_state: 'confirmed_by_player'
// - player_confirmed_at: now()
// - evidence_links: ['...']
```

**⚠️ Disclaimer mostrado**:
> "This confirmation is user-declared and not verified by Aura. Aura does not validate contracts or financial agreements."

### 4️⃣ Reclamo de Reconocimiento por Referente

**Cuándo**: El referente sabe que su referido fue contratado pero no hay confirmación

**UI**: Botón "Submit Recognition Claim" en dashboard del referente

**Qué pasa**:
```typescript
await supabase.rpc('submit_recognition_claim', {
  p_referral_id: referralId,
  p_notes: 'My referred player informed me...' // opcional
});

// Actualiza:
// - validation_state: 'pending_validation'
```

**Estado**: "Pending Validation" - esperando confirmación comunitaria

### 5️⃣ Validación Comunitaria

**Cuándo**: Al menos 2 usuarios conectados confirman el reporte

**UI**: Botón "Verify This Success" en detalles de referencia

**Qué pasa**:
```typescript
await supabase.rpc('submit_community_validation', {
  p_referral_id: referralId,
  p_validator_role: 'club_rep' | 'other_player' | 'admin',
  p_validation_type: 'confirm', // o 'dispute'
  p_notes: 'I can confirm this is true' // opcional
});

// Si ≥ 2 confirmaciones:
// - validation_state: 'community_verified'
// - community_verified_at: now()
// - verified_by: [validator_ids]
```

**Badge Especial**:
> "Community Verified Success"
> 
> "This success was validated by multiple users in Aura."

### 6️⃣ Capa de Analytics y Reputación

**Función**: `get_referrer_stats(referrer_id)`

**Retorna**:
```typescript
{
  total_referrals: number,        // Total de referencias hechas
  confirmed_hires: number,        // Contrataciones confirmadas
  community_verified: number,     // Verificadas por comunidad
  pending_validation: number     // Esperando validación
}
```

**UI Dashboard**:
- Métricas en cards grandes
- Leaderboard de "Top Referrers"
- Timeline de referencias
- Estados visuales (badges, colors)

## ⚖️ Cláusulas Legales y Neutralidad

### Cada UI debe mostrar:

#### Dashboard de Referente:
> "Aura acts only as a digital connection platform. All agreements, contracts, and compensations occur privately between users."

#### Dashboard de Club (al confirmar):
> "By confirming this hire, you acknowledge that Aura does not validate or mediate financial transactions. This confirmation is for community recognition purposes only."

#### Auto-Confirmación del Jugador:
> "Aura does not validate contracts or financial agreements. User-reported information may not be verified."

#### Validación Comunitaria:
> "Community verification reflects user consensus, not AURA's endorsement. Aura does not independently verify employment contracts or financial terms."

## 🔧 Funciones SQL Implementadas

### 1. `register_referral()` 
Crea registro automático de referencia

### 2. `confirm_hire_by_club()`
Club confirma contratación

### 3. `self_confirm_by_player()`
Jugador se auto-confirma con evidencia opcional

### 4. `submit_recognition_claim()`
Referente reclama reconocimiento

### 5. `submit_community_validation()`
Validación comunitaria (retorna true si alcanza threshold)

### 6. `get_referrer_stats()`
Obtiene métricas del referente

## 📊 Estados de Validación

| Estado | Descripción | Quien lo establece |
|--------|-------------|-------------------|
| `unconfirmed` | Solo creado, sin validación | Sistema automáticamente |
| `confirmed_by_club` | Club confirmó contratación | Club oficialmente |
| `confirmed_by_player` | Jugador se auto-confirmó | Jugador (user-declared) |
| `pending_validation` | Referente hizo reclamo | Referente |
| `community_verified` | 2+ usuarios validaron | Comañía |

## 🎨 UI Components a Crear

### Por Crear:

1. **Club Dashboard** (`/club/manage-referrals`)
   - Lista de aplicaciones con referencias
   - Botón "Confirm Hiring" por cada uno
   - Métricas de contrataciones

2. **Player Self-Report** (en profile)
   - Botón "Report Successful Contract"
   - Upload de evidencia (links)
   - Disclaimer visible

3. **Referrer Analytics Dashboard** (mejorar `/referrer/dashboard`)
   - Stats usando `get_referrer_stats()`
   - Lista de referencias por estado
   - Botón "Submit Recognition Claim" para cada una

4. **Community Validation Page** (`/community/validations`)
   - Lista de "Pending Validation"
   - Botón "Verify" con rol selector
   - Vista de validaciones existentes

## 📝 Notas Importantes

### Qué SÍ hace AURA:
✅ Rastrea referencias automáticamente
✅ Muestra quién refirió a quién
✅ Proporciona badges y reconocimiento
✅ Facilita validación comunitaria
✅ Genera analytics y leaderboards

### Qué NO hace AURA:
❌ No valida contratos
❌ No gestiona pagos
❌ No hace cumplir acuerdos
❌ No media disputas financieras
❌ No garantiza información de usuarios

## 🔗 Ejecutar Migración

**URL SQL Editor**: https://supabase.com/dashboard/project/heshwhpxnmpfjnxosdxg/sql

**Archivo**: `sql_scripts/create_referral_tracking_system.sql`

## ✅ Checklist de Implementación

- [x] Tabla `opportunities` creada
- [x] Tabla `referral_records` creada
- [x] Tabla `community_validations` creada
- [x] RLS configurado para todas las tablas
- [x] Función `register_referral()` implementada
- [x] Función `confirm_hire_by_club()` implementada
- [x] Función `self_confirm_by_player()` implementada
- [x] Función `submit_recognition_claim()` implementada
- [x] Función `submit_community_validation()` implementada
- [x] Función `get_referrer_stats()` implementada
- [x] Índices para rendimiento
- [x] Triggers automáticos
- [x] Tipos TypeScript actualizados
- [ ] UI de Club Dashboard (próximamente)
- [ ] UI de Player Self-Report (próximamente)
- [ ] UI de Community Validation (próximamente)
- [ ] Notificaciones automáticas (próximamente)

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** en Supabase
2. **Crear UI components** para cada flujo
3. **Agregar notificaciones** automáticas
4. **Implementar analytics dashboard**
5. **Crear leaderboard** de referentes

## 📖 Ejemplo de Uso

```typescript
// 1. Registrar referencia automáticamente
const referralId = await supabase.rpc('register_referral', {
  p_referrer_id: 'referrer-uuid',
  p_player_id: 'player-uuid',
  p_club_id: 'club-uuid',
  p_opportunity_id: 'opportunity-uuid',
  p_referral_code: 'REF123'
});

// 2. Club confirma
await supabase.rpc('confirm_hire_by_club', {
  p_referral_id: referralId,
  p_status: 'contracted'
});

// 3. Obtener stats del referente
const stats = await supabase.rpc('get_referrer_stats', {
  p_referrer_id: 'referrer-uuid'
});
// Retorna: { total_referrals, confirmed_hires, community_verified, pending_validation }

// 4. Validación comunitaria
const verified = await supabase.rpc('submit_community_validation', {
  p_referral_id: referralId,
  p_validator_role: 'club_rep',
  p_validation_type: 'confirm',
  p_notes: 'I worked with this player and can confirm'
});
```

## ✨ ¡Sistema Completo!

El sistema de seguimiento de referencias está implementado a nivel de base de datos con todas las funciones necesarias. Solo falta crear las interfaces de usuario para cada flujo.


