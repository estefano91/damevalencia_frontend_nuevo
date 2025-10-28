// Tipos específicos para la API de la Asociación DAME
// Reemplaza los tipos de Supabase con tipos adaptados para DAME

export type DameUserType = 
  | 'participant'    // Participante en actividades
  | 'instructor'     // Instructor de baile, música, arte, etc.
  | 'artist'         // Artista o creador
  | 'volunteer'      // Voluntario en la organización
  | 'coordinator'    // Coordinador de proyectos
  | 'sponsor';       // Patrocinador o colaborador

export type DameProjectType = 
  | 'casino'   // DAME CASINO - música cubana
  | 'bachata'  // DAME BACHATA
  | 'fit'      // DAME FIT - actividad física
  | 'arte'     // DAME ARTE
  | 'musica'   // DAME MÚSICA
  | 'apoyo';   // DAME APOYO - salud mental y migración

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export type PostType = 'general' | 'event' | 'class' | 'project' | 'achievement';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type ClassStatus = 'open' | 'full' | 'in_progress' | 'completed';

// Interfaces principales
export interface DameProfile {
  id: string;
  user_type: DameUserType;
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  
  // Específico para DAME
  projects: DameProjectType[]; // Proyectos en los que participa
  skills: string[];   // Habilidades artísticas (baile, canto, pintura, etc.)
  interests: string[]; // Intereses generales
  languages: string[]; // Idiomas que habla
  experience_level: ExperienceLevel;
  
  // Información de contacto y redes sociales
  phone?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
  
  // Información académica/profesional
  education?: string;
  profession?: string;
  certifications?: string[];
  
  // Preferencias
  preferred_schedule?: string; // 'morning' | 'afternoon' | 'evening' | 'weekend'
  availability?: string; // Texto libre sobre disponibilidad
  goals?: string[]; // Objetivos personales
  
  // Configuración
  notifications_enabled: boolean;
  public_profile: boolean;
  
  // Metadata del sistema
  verified: boolean;
  active: boolean;
  member_since: string;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface DameConnection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  message?: string; // Mensaje opcional al enviar solicitud
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  requester?: DameProfile;
  receiver?: DameProfile;
}

export interface DamePost {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  project_type?: DameProjectType; // Si está relacionado con un proyecto
  tags: string[];
  media_urls: string[]; // URLs de imágenes, videos, etc.
  
  // Engagement
  likes_count: number;
  comments_count: number;
  shares_count: number;
  
  // Metainformación
  location?: string;
  event_date?: string; // Para posts de tipo 'event'
  
  // Timestamps
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  author?: DameProfile;
  liked_by_user?: boolean; // Si el usuario actual le dio like
}

export interface DameEvent {
  id: string;
  title: string;
  description: string;
  project_type: DameProjectType;
  
  // Programación
  start_time: string;
  end_time: string;
  timezone: string;
  recurring?: 'weekly' | 'biweekly' | 'monthly'; // Para clases regulares
  
  // Ubicación
  location: string;
  address?: string;
  is_online: boolean;
  meeting_link?: string;
  
  // Organización
  organizer_id: string;
  instructor_id?: string;
  
  // Participación
  max_participants?: number;
  current_participants: number;
  registration_required: boolean;
  registration_deadline?: string;
  
  // Costo
  price?: number;
  currency: string;
  is_free: boolean;
  
  // Requisitos
  requirements?: string[];
  target_level?: ExperienceLevel;
  age_group?: string; // 'children' | 'youth' | 'adults' | 'seniors' | 'all'
  
  // Estado
  status: EventStatus;
  
  // Metadata
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  organizer?: DameProfile;
  instructor?: DameProfile;
  user_registered?: boolean; // Si el usuario actual está registrado
}

export interface DameProject {
  id: string;
  name: string;
  type: DameProjectType;
  description: string;
  objectives: string[];
  
  // Organización
  coordinator_id: string;
  team_members?: string[]; // IDs de miembros del equipo
  
  // Participación
  participants_count: number;
  max_participants?: number;
  open_to_new_members: boolean;
  
  // Programación
  start_date?: string;
  end_date?: string;
  meeting_schedule?: string;
  
  // Ubicación
  primary_location?: string;
  
  // Estado
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Recursos
  budget?: number;
  required_resources?: string[];
  
  // Metadata
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  coordinator?: DameProfile;
  team?: DameProfile[];
  user_participating?: boolean; // Si el usuario actual participa
}

export interface DameClass {
  id: string;
  title: string;
  description: string;
  project_type: DameProjectType;
  
  // Instructor
  instructor_id: string;
  assistant_instructors?: string[];
  
  // Nivel y duración
  level: ExperienceLevel;
  duration_weeks: number;
  sessions_per_week: number;
  duration_per_session: number; // minutos
  
  // Programación
  schedule: DameClassSchedule[];
  start_date: string;
  end_date: string;
  
  // Costo
  price: number;
  currency: string;
  is_free: boolean;
  payment_options?: string[];
  
  // Participación
  max_students: number;
  current_students: number;
  waiting_list_count?: number;
  
  // Ubicación
  location: string;
  address?: string;
  room?: string;
  
  // Requisitos
  requirements?: string[];
  materials_needed?: string[];
  
  // Estado
  status: ClassStatus;
  
  // Metadata
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  instructor?: DameProfile;
  assistants?: DameProfile[];
  user_enrolled?: boolean; // Si el usuario actual está inscrito
}

export interface DameClassSchedule {
  day_of_week: number; // 0 = Domingo, 1 = Lunes, etc.
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
}

export interface DameNotification {
  id: string;
  user_id: string;
  type: 'connection_request' | 'event_reminder' | 'class_update' | 'project_invitation' | 'general';
  title: string;
  message: string;
  related_entity_id?: string; // ID del evento, clase, proyecto, etc.
  related_entity_type?: 'event' | 'class' | 'project' | 'connection' | 'post';
  read: boolean;
  action_url?: string; // URL para navegar cuando se hace click
  created_at: string;
}

export interface DameMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'location' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  read_by: string[]; // IDs de usuarios que han leído el mensaje
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  sender?: DameProfile;
}

export interface DameConversation {
  id: string;
  type: 'private' | 'group' | 'project_group';
  name?: string; // Para conversaciones grupales
  description?: string;
  participants: string[]; // IDs de participantes
  admin_ids?: string[]; // Para grupos, quiénes son admin
  project_id?: string; // Si está relacionado con un proyecto
  
  // Estado
  active: boolean;
  muted_by?: string[]; // Usuarios que han silenciado la conversación
  
  // Último mensaje
  last_message_id?: string;
  last_message_time?: string;
  
  created_at: string;
  updated_at?: string;
  
  // Datos poblados
  participants_data?: DameProfile[];
  last_message?: DameMessage;
  unread_count?: number; // Para el usuario actual
}

// Tipos de respuesta de la API
export interface AuthResponse {
  token: string;
  user: DameProfile;
  expires_in: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Tipos para filtros y búsquedas
export interface ProfileFilters {
  user_type?: DameUserType;
  projects?: DameProjectType[];
  skills?: string[];
  location?: string;
  experience_level?: ExperienceLevel;
  search?: string; // Búsqueda por nombre
  verified_only?: boolean;
}

export interface EventFilters {
  project_type?: DameProjectType;
  date_from?: string;
  date_to?: string;
  location?: string;
  is_free?: boolean;
  target_level?: ExperienceLevel;
  search?: string;
}

export interface ClassFilters {
  project_type?: DameProjectType;
  level?: ExperienceLevel;
  is_free?: boolean;
  location?: string;
  available_spots?: boolean; // Solo clases con espacios disponibles
  search?: string;
}

export interface PostFilters {
  post_type?: PostType;
  project_type?: DameProjectType;
  author_id?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

// Tipos para creación/actualización
export interface CreatePostData {
  content: string;
  post_type: PostType;
  project_type?: DameProjectType;
  tags?: string[];
  media_urls?: string[];
  location?: string;
  event_date?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  projects?: DameProjectType[];
  skills?: string[];
  interests?: string[];
  languages?: string[];
  experience_level?: ExperienceLevel;
  phone?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
  education?: string;
  profession?: string;
  certifications?: string[];
  preferred_schedule?: string;
  availability?: string;
  goals?: string[];
  notifications_enabled?: boolean;
  public_profile?: boolean;
}

export interface CreateEventData {
  title: string;
  description: string;
  project_type: DameProjectType;
  start_time: string;
  end_time: string;
  timezone: string;
  location: string;
  address?: string;
  is_online: boolean;
  meeting_link?: string;
  instructor_id?: string;
  max_participants?: number;
  registration_required: boolean;
  registration_deadline?: string;
  price?: number;
  currency?: string;
  is_free: boolean;
  requirements?: string[];
  target_level?: ExperienceLevel;
  age_group?: string;
  tags?: string[];
  image_url?: string;
}

// Constantes útiles
export const DAME_PROJECT_NAMES = {
  casino: 'DAME CASINO',
  bachata: 'DAME BACHATA', 
  fit: 'DAME FIT',
  arte: 'DAME ARTE',
  musica: 'DAME MÚSICA',
  apoyo: 'DAME APOYO'
} as const;

export const USER_TYPE_LABELS = {
  participant: 'Participante',
  instructor: 'Instructor/a',
  artist: 'Artista',
  volunteer: 'Voluntario/a',
  coordinator: 'Coordinador/a',
  sponsor: 'Patrocinador/a'
} as const;

export const EXPERIENCE_LEVEL_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
} as const;
