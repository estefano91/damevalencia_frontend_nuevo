// Cliente API para la Asociación DAME
// Conecta con https://organizaciondame.org/

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  full_name: string;
  user_type: DameUserType;
}

export class DameApiClient {
  private authToken: string | null = null;

  constructor() {
    // Recuperar token del localStorage al inicializar
    this.authToken = localStorage.getItem('dame_auth_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token de autenticación si existe
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      localStorage.setItem('dame_auth_token', response.data.token);
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      localStorage.setItem('dame_auth_token', response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.authToken = null;
    localStorage.removeItem('dame_auth_token');
  }

  async getCurrentUser(): Promise<ApiResponse<DameProfile>> {
    return this.makeRequest<DameProfile>('/auth/me');
  }

  // Métodos de perfiles
  async getProfiles(filters?: ProfileFilters): Promise<ApiResponse<DameProfile[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    return this.makeRequest<DameProfile[]>(`/profiles${queryParams}`);
  }

  async getProfile(id: string): Promise<ApiResponse<DameProfile>> {
    return this.makeRequest<DameProfile>(`/profiles/${id}`);
  }

  async updateProfile(id: string, data: Partial<DameProfile>): Promise<ApiResponse<DameProfile>> {
    return this.makeRequest<DameProfile>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Métodos de conexiones
  async getConnections(): Promise<ApiResponse<DameConnection[]>> {
    return this.makeRequest<DameConnection[]>('/connections');
  }

  async sendConnectionRequest(receiverId: string): Promise<ApiResponse<DameConnection>> {
    return this.makeRequest<DameConnection>('/connections', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    });
  }

  async respondToConnection(
    connectionId: string, 
    status: 'accepted' | 'rejected'
  ): Promise<ApiResponse<DameConnection>> {
    return this.makeRequest<DameConnection>(`/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Métodos de posts
  async getPosts(): Promise<ApiResponse<DamePost[]>> {
    return this.makeRequest<DamePost[]>('/posts');
  }

  async createPost(data: CreatePostData): Promise<ApiResponse<DamePost>> {
    return this.makeRequest<DamePost>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos de eventos
  async getEvents(): Promise<ApiResponse<DameEvent[]>> {
    return this.makeRequest<DameEvent[]>('/events');
  }

  async registerForEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  // Métodos de proyectos DAME
  async getDameProjects(): Promise<ApiResponse<DameProject[]>> {
    return this.makeRequest<DameProject[]>('/projects');
  }

  async getProjectDetails(projectId: string): Promise<ApiResponse<DameProject>> {
    return this.makeRequest<DameProject>(`/projects/${projectId}`);
  }

  // Métodos de clases y talleres
  async getClasses(filters?: ClassFilters): Promise<ApiResponse<DameClass[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    return this.makeRequest<DameClass[]>(`/classes${queryParams}`);
  }

  async enrollInClass(classId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/classes/${classId}/enroll`, {
      method: 'POST',
    });
  }

  // Verificar si el token es válido
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}

// Instancia singleton del cliente API
export const dameApi = new DameApiClient();

// Tipos específicos de DAME
export type DameUserType = 
  | 'participant'    // Participante en actividades
  | 'instructor'     // Instructor de baile, música, arte, etc.
  | 'artist'         // Artista o creador
  | 'volunteer'      // Voluntario en la organización
  | 'coordinator'    // Coordinador de proyectos
  | 'sponsor';       // Patrocinador o colaborador

export interface AuthResponse {
  token: string;
  user: DameProfile;
}

export interface DameProfile {
  id: string;
  user_type: DameUserType;
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  
  // Específico para DAME
  projects: string[]; // Proyectos en los que participa (DAME CASINO, BACHATA, etc.)
  skills: string[];   // Habilidades artísticas
  interests: string[]; // Intereses (música, baile, arte, etc.)
  languages: string[]; // Idiomas que habla
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Campos sociales
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
  
  // Metadata
  verified: boolean;
  active: boolean;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export interface DameConnection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester?: DameProfile;
  receiver?: DameProfile;
}

export interface DamePost {
  id: string;
  author_id: string;
  content: string;
  post_type: 'general' | 'event' | 'class' | 'project' | 'achievement';
  tags: string[];
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: DameProfile;
}

export interface DameEvent {
  id: string;
  title: string;
  description: string;
  project_type: 'casino' | 'bachata' | 'fit' | 'arte' | 'musica' | 'apoyo';
  start_time: string;
  end_time: string;
  location: string;
  instructor_id?: string;
  max_participants?: number;
  current_participants: number;
  price?: number;
  is_free: boolean;
  requirements?: string[];
  created_at: string;
  instructor?: DameProfile;
}

export interface DameProject {
  id: string;
  name: string;
  type: 'casino' | 'bachata' | 'fit' | 'arte' | 'musica' | 'apoyo';
  description: string;
  objectives: string[];
  coordinator_id: string;
  participants_count: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  coordinator?: DameProfile;
}

export interface DameClass {
  id: string;
  title: string;
  description: string;
  project_type: 'casino' | 'bachata' | 'fit' | 'arte' | 'musica';
  instructor_id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  schedule: string; // Días y horarios
  duration_weeks: number;
  price: number;
  is_free: boolean;
  max_students: number;
  current_students: number;
  location: string;
  requirements?: string[];
  created_at: string;
  instructor?: DameProfile;
}

export interface ProfileFilters {
  user_type?: DameUserType;
  project?: string;
  skill?: string;
  location?: string;
  experience_level?: string;
}

export interface ClassFilters {
  project_type?: string;
  level?: string;
  is_free?: boolean;
  location?: string;
}

export interface CreatePostData {
  content: string;
  post_type: 'general' | 'event' | 'class' | 'project' | 'achievement';
  tags?: string[];
  media_urls?: string[];
}
