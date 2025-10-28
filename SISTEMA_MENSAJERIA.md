# 💬 Sistema de Mensajería Privada - AURA Sports

## 📋 Descripción

Sistema completo de mensajería en tiempo real que permite a usuarios comunicarse de forma segura dentro de la plataforma AURA Sports, manteniendo la neutralidad legal de la plataforma como canal de comunicación.

## 🎯 Objetivos

1. **Comunicación Segura**: Mensajes privados entre usuarios
2. **Tiempo Real**: Actualizaciones instantáneas usando Supabase Realtime
3. **Multi-Chat**: Soporte para chats 1:1 y grupales
4. **Neutralidad Legal**: AURA actúa solo como canal de comunicación
5. **Read Receipts**: Indicadores de estado de lectura
6. **UI Intuitiva**: Diseño limpio y moderno

## 🗄️ Estructura de Base de Datos

### Tabla: `chats`
Almacena información de las conversaciones

```sql
id                  UUID        -- ID único del chat
type                TEXT        -- 'private' | 'group'
name                TEXT        -- Nombre del chat (para grupos)
description         TEXT        -- Descripción (para grupos)
sport               TEXT        -- Filtro por deporte
country             TEXT        -- Filtro por país
opportunity_type    TEXT        -- Filtro por tipo de oportunidad
created_by          UUID        -- Usuario que creó el chat
created_at          TIMESTAMP   -- Fecha de creación
updated_at          TIMESTAMP   -- Última actualización
```

### Tabla: `chat_members`
Gestiona los participantes de cada chat

```sql
id                UUID        -- ID único
chat_id           UUID        -- Chat al que pertenece
user_id           UUID        -- Usuario participante
role              TEXT        -- 'admin' | 'member'
joined_at         TIMESTAMP   -- Fecha de unión
last_read_at      TIMESTAMP   -- Última lectura
```

### Tabla: `messages`
Almacena los mensajes individuales

```sql
id                    UUID        -- ID único
chat_id               UUID        -- Chat al que pertenece
sender_id              UUID        -- Quien envió
content                TEXT        -- Contenido del mensaje
translated_content     JSONB       -- Contenido traducido {lang: text}
message_type           TEXT        -- 'text' | 'voice' | 'video' | 'image' | 'file' | 'system'
read_by                JSONB       -- Array de user_ids que han leído
translated              BOOLEAN     -- Si está traducido
original_language       TEXT        -- Idioma original
created_at              TIMESTAMP   -- Fecha de envío
updated_at              TIMESTAMP   -- Última actualización
```

## 🎨 UI Implementada

### Página: Messages (`/messages`)

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Back]  Messages                       │
├───────────────┬─────────────────────────┤
│  Chat List    │  Chat Area             │
│               │                         │
│  • Chat 1 (2) │  ┌───────────────────┐ │
│  • Chat 2     │  │  Header            │ │
│  • Chat 3     │  ├───────────────────┤ │
│               │  │                   │ │
│  [Search]     │  │  Messages         │ │
│               │  │  Area            │ │
│               │  │                   │ │
│               │  ├───────────────────┤ │
│               │  │  [📎] [Input] [→] │ │
│               │  └───────────────────┘ │
└───────────────┴─────────────────────────┘
```

**Features:**
- ✅ Sidebar con lista de chats
- ✅ Último mensaje visible
- ✅ Contador de no leídos
- ✅ Timestamps relativos
- ✅ Búsqueda de chats
- ✅ Ventana principal de chat
- ✅ Lista de mensajes scrollable
- ✅ Input con soporte Enter para enviar
- ✅ Read receipts (✓ sent, ✓✓ read)
- ✅ Distinción visual propio vs otros
- ✅ Realtime con Supabase
- ✅ Auto-scroll al final
- ✅ Botones para attachment/emoji (UI ready)

### Entry Points (Puntos de Entrada)

**1. Desde ProfileCard:**
```typescript
// Botón "Message" en cada perfil
<Button onClick={handleSendMessage}>
  <MessageSquare /> Message
</Button>
```

**2. Desde Navigation:**
```typescript
// Botón "Messages" en navegación principal
<Button onClick={() => navigate('/messages')}>
  <MessageSquare /> Messages
</Button>
```

**3. URL Directa:**
```typescript
// /messages?chat=chat_id
navigate(`/messages?chat=${chatId}`);
```

## 🔄 Flujo de Mensajería

### 1. Iniciar Chat

```typescript
// Usuario hace click en "Message" en un ProfileCard
const handleSendMessage = async () => {
  // 1. Buscar si ya existe un chat entre estos usuarios
  const existingChat = await findExistingChat(userId, otherUserId);
  
  if (existingChat) {
    // 2a. Si existe, navegar al chat existente
    navigate(`/messages?chat=${existingChat}`);
  } else {
    // 2b. Si no existe, crear nuevo chat
    const newChatId = await supabase.rpc('create_private_chat', {
      user1_id: userId,
      user2_id: otherUserId
    });
    
    // 3. Navegar al nuevo chat
    navigate(`/messages?chat=${newChatId}`);
  }
};
```

### 2. Enviar Mensaje

```typescript
// Usuario escribe y presiona Enter o click Send
const handleSendMessage = async () => {
  await supabase.from('messages').insert({
    chat_id: selectedChat,
    sender_id: user.id,
    content: messageInput,
    message_type: 'text',
    read_by: [] // Array vacío inicialmente
  });
};
```

### 3. Realtime Updates

```typescript
// Suscripción a cambios en tiempo real
const setupRealtimeSubscription = () => {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
    }, (payload) => {
      // Recargar mensajes cuando llega uno nuevo
      loadMessages();
    })
    .subscribe();
};
```

### 4. Read Receipts

```typescript
// Marcar mensajes como leídos
const markMessagesAsRead = async () => {
  const { data } = await supabase.rpc('mark_message_read', {
    message_id: messageId,
    user_id: currentUserId
  });
};

// Estado del mensaje:
// - No read_by: Enviado (✓)
// - Incluye currentUserId: Leído (✓✓)
```

## 🎨 Componentes UI

### Chat List Sidebar
- Lista de todos los chats del usuario
- Último mensaje visible
- Timestamp relativo (hoy, ayer, fecha)
- Badge con contador de no leídos
- Click para seleccionar chat

### Chat Area
- Header con info del chat
- Lista de mensajes con scroll
- Burbujas diferenciadas (propio vs otros)
- Timestamp en cada mensaje
- Read receipts visibles
- Input bar con botones

### Message Bubbles
- Mensajes propios: derecha, fondo primary
- Mensajes de otros: izquierda, fondo card
- Nombre del sender en mensajes de otros
- Timestamp formateado
- Checkmarks para estado

## ⚖️ Neutralidad Legal

**Todo chat muestra disclaimer:**
> "AURA acts only as a communication channel. All agreements and contracts must be handled privately between users."

**En UI:**
```tsx
<div className="bg-yellow-50 border-yellow-200 rounded p-4 mb-4">
  <p className="text-sm">
    <strong>Disclaimer:</strong> AURA does not validate or mediate content shared in chats. 
    Users are responsible for all communications and agreements.
  </p>
</div>
```

## 🔧 Funciones SQL Implementadas

### 1. `create_private_chat(user1_id, user2_id)`
- Crea chat privado entre dos usuarios
- Retorna chat_id existente si ya existe
- Agrega ambos como miembros automáticamente

### 2. `get_user_chats_with_last_message(user_id)`
- Obtiene todos los chats del usuario
- Incluye último mensaje
- Contador de no leídos
- Información de participantes
- Ordenado por último mensaje

### 3. `mark_message_read(message_id, user_id)`
- Marca un mensaje como leído
- Actualiza array `read_by`

### 4. `translate_message_content(...)`
- Almacena traducciones (preparado para futuro)
- Soporte multilingüe

## 🎯 Estados de Mensajes

| Estado | Icono | Descripción |
|--------|-------|-------------|
| Sent | ✓ | Mensaje enviado, sin leer |
| Delivered | ✓✓ | Mensaje entregado |
| Read | ✓✓ (azul) | Mensaje leído |

## 📱 Responsive Design

**Mobile:**
- Sidebar ocultable
- Lista de chats compacta
- Input sticky bottom

**Desktop:**
- Layout 2 columnas
- Sidebar siempre visible
- Chat area expandida

## 🔔 Notificaciones

**Push (futuro):**
- Notificación cuando llega mensaje
- Badge con contador
- Deep link al chat

**Actual:**
- Toast en tiempo real
- Contador de no leídos en sidebar

## 🚀 Deploy

**URL**: https://aura-sports-app.web.app/messages

**Navegación:**
```
[Discover] [Talent Radar] [Quick Connect] [Messages] [Connections] ...
```

## ✅ Checklist

- [x] Tabla chats creada
- [x] Tabla chat_members creada  
- [x] Tabla messages creada
- [x] RLS configurado
- [x] Funciones SQL implementadas
- [x] Página Messages completa
- [x] Sidebar con lista de chats
- [x] Chat area principal
- [x] Envío de mensajes
- [x] Realtime funcionando
- [x] Read receipts
- [x] Entry points (ProfileCard, Nav)
- [x] Auto-scroll al final
- [x] Timestamps relativos
- [x] Contador de no leídos
- [x] Responsive design
- [ ] Typing indicators (futuro)
- [ ] Attachments (futuro)
- [ ] Voice messages (futuro)
- [ ] Video calls (futuro)
- [ ] Group chats UI (futuro)
- [ ] Notificaciones push (futuro)

## 📝 Ejemplo de Uso

```typescript
// 1. Usuario A hace click en "Message" del ProfileCard de Usuario B
handleSendMessage();

// 2. Sistema busca chat existente
const existingChat = await findExistingChat(userA_id, userB_id);

// 3a. Si existe, navega al chat
navigate(`/messages?chat=${existingChat}`);

// 3b. Si no existe, crea chat
const newChatId = await supabase.rpc('create_private_chat', {
  user1_id: userA_id,
  user2_id: userB_id
});
navigate(`/messages?chat=${newChatId}`);

// 4. Usuario escribe mensaje y envía
await supabase.from('messages').insert({
  chat_id: selectedChat,
  sender_id: userA_id,
  content: message,
  read_by: []
});

// 5. Usuario B recibe en tiempo real
// Supabase Realtime actualiza automáticamente

// 6. Usuario B lee el mensaje
await supabase.rpc('mark_message_read', {
  message_id: messageId,
  user_id: userB_id
});

// 7. Usuario A ve ✓✓ (mensaje leído)
```

## 🎨 Visual Features

**Message Bubbles:**
```
┌─ Other User ─────────────────┐
│ ┌──────────────┐             │
│ │ Hey there!   │             │
│ │ 10:30 AM     │ ◯           │
│ └──────────────┘             │
└───────────────────────────────┘

┌───────────────────────────────┐
│              ┌──────────────┐ │
│       ✓✓     │ Hi, how are │ │
│              │ you?        │ │
│              │ 10:31 AM    │ ◯
│              └──────────────┘ │
└─ You ─────────────────────────┘
```

## ⚡ Funcionalidades Avanzadas

### Auto-scroll
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### Realtime Subscriptions
```typescript
const channel = supabase.channel(`chat:${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'messages',
    filter: `chat_id=eq.${chatId}`
  }, handleNewMessage)
  .subscribe();
```

### Read Tracking
```typescript
// Track cuándo usuario lee mensajes
const markMessagesAsRead = async () => {
  const unreadMessages = await getUnreadMessages();
  for (const msg of unreadMessages) {
    await supabase.rpc('mark_message_read', {
      message_id: msg.id,
      user_id: currentUserId
    });
  }
};
```

## 🔐 Security & Privacy

**RLS Políticas:**
- ✅ Usuarios solo ven sus propios chats
- ✅ Solo miembros pueden enviar mensajes
- ✅ Solo miembros pueden leer mensajes
- ✅ No se puede acceder a chats privados de otros

**Data Privacy:**
- ✅ Contenido no moderado por AURA
- ✅ Usuarios responsables de información compartida
- ✅ No almacenamiento de datos sensibles
- ✅ Disclaimer visible en UI

## 🎉 ¡Sistema Completo!

El sistema de mensajería está **100% funcional** con:
- ✅ Base de datos completa
- ✅ UI moderna y responsive
- ✅ Tiempo real con Supabase
- ✅ Read receipts
- ✅ Entry points múltiples
- ✅ Seguridad RLS
- ✅ Neutralidad legal

**Próximas mejoras sugeridas:**
- Typing indicators
- Adjuntos de archivos
- Mensajes de voz
- Llamadas VOIP
- Notificaciones push
- Traducción automática

## 📞 Support

Para preguntas o issues con el sistema de mensajería:
- Ver documentación en `/SISTEMA_MENSAJERIA.md`
- Revisar SQL en `sql_scripts/create_communication_system.sql`
- Contactar support en la app


