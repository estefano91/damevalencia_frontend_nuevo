// Servicio API para promociones de DAME
// Documentación: https://organizaciondame.org/docs/apps/promotions/

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}

// Obtener token de autenticación del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('dame_access_token') || localStorage.getItem('dame_auth_token');
};

// Tipos para las promociones
export interface PromotionSegment {
  id: number;
  name: string;
  description: string;
  price: string;
  is_default: boolean;
  members_count: number;
}

export interface PromotionEvent {
  id: number;
  title_es: string;
  title_en: string;
  slug: string;
  main_photo_url: string | null;
}

export interface Promotion {
  id: number;
  title_es: string;
  title_en?: string; // Opcional según docs
  description_es?: string; // Opcional según docs
  description_en?: string; // Opcional según docs
  image_url?: string | null; // Opcional según docs
  // La API puede devolver event_id o event expandido (objeto completo)
  event_id?: number | null; // ID del evento según docs
  event?: PromotionEvent | null; // Objeto expandido cuando la API lo incluye
  discount_type: 'PERCENTAGE' | 'AMOUNT'; // Solo estos dos según docs
  discount_value: string; // decimal según docs
  max_discount_amount?: string | null; // Opcional según docs
  actual_price?: string | null; // Opcional según docs
  terms_and_conditions_es?: string; // Opcional según docs
  terms_and_conditions_en?: string; // Opcional según docs
  how_to_use_es?: string; // Opcional según docs
  how_to_use_en?: string; // Opcional según docs
  is_active?: boolean; // Según docs (default: true)
  is_valid?: boolean; // Alias para compatibilidad con código existente
  stock?: number | null; // Según docs (default: 0)
  available_stock?: number | null; // Alias para compatibilidad
  applies_to_all_segments: boolean;
  segments_ids?: number[]; // IDs según docs (solo si applies_to_all_segments=false)
  segments?: PromotionSegment[]; // Objetos expandidos cuando la API los incluye
  start_date: string; // datetime ISO 8601 según docs
  end_date: string; // datetime ISO 8601 según docs
  max_uses?: number | null; // Opcional según docs (default: 1)
  created_at?: string;
  updated_at?: string;
}

export interface PromotionsListResponse {
  success: boolean;
  promotions: Promotion[];
  count: number;
}

export interface PromotionDetailResponse {
  success: boolean;
  promotion: Promotion;
}

// Clase para manejar las peticiones API de promociones
export class DamePromotionsAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // Agregar token de autenticación si existe
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        console.error(`❌ API Error [${response.status}]:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
        });
        
        if (response.status === 403 || response.status === 401) {
          return {
            success: false,
            error: `Autenticación requerida (${response.status}). Este endpoint requiere autenticación.`,
            errorDetails: errorData,
          };
        }
        
        const errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
        
        return {
          success: false,
          error: errorMessage,
          errorDetails: errorData,
        };
      }

      const data = await response.json();
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

  /**
   * Obtiene todas las promociones válidas disponibles para el usuario autenticado
   * GET /api/promotions/public/
   */
  async getPublicPromotions(): Promise<ApiResponse<PromotionsListResponse>> {
    return this.makeRequest<PromotionsListResponse>('/promotions/public/');
  }

  /**
   * Obtiene el detalle completo de una promoción específica
   * GET /api/promotions/public/{id}/
   */
  async getPromotionDetail(id: number): Promise<ApiResponse<PromotionDetailResponse>> {
    return this.makeRequest<PromotionDetailResponse>(`/promotions/public/${id}/`);
  }
}

// Instancia singleton para usar en la aplicación
export const damePromotionsAPI = new DamePromotionsAPI();





