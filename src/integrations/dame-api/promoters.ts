// Servicio API para promotores DAME
// GET /api/promoters/user/is-promoter/
// GET /api/promoters/user/events/
// GET /api/promoters/user/events/{event_id}/sales/

import type {
  IsPromoterResponse,
  PromoterEventsResponse,
  PromoterEventSalesResponse,
} from '@/types/promoters';

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('dame_access_token') || localStorage.getItem('dame_auth_token');
};

export class DamePromotersAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || data.detail || `HTTP ${response.status}`,
        };
      }
      return { success: true, data: data as T };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Verificar si el usuario autenticado es promotor.
   * GET /api/promoters/user/is-promoter/
   */
  async getIsPromoter(): Promise<ApiResponse<IsPromoterResponse>> {
    return this.makeRequest<IsPromoterResponse>('/promoters/user/is-promoter/');
  }

  /**
   * Listar eventos donde el usuario es promotor.
   * GET /api/promoters/user/events/?event_status=...&payment_status=...
   */
  async getUserEvents(params?: {
    event_status?: string;
    payment_status?: string;
  }): Promise<ApiResponse<PromoterEventsResponse>> {
    const query = new URLSearchParams();
    if (params?.event_status) query.set('event_status', params.event_status);
    if (params?.payment_status) query.set('payment_status', params.payment_status);
    const qs = query.toString();
    return this.makeRequest<PromoterEventsResponse>(
      `/promoters/user/events/${qs ? `?${qs}` : ''}`
    );
  }

  /**
   * Listar ventas del promotor en un evento.
   * GET /api/promoters/user/events/{event_id}/sales/
   */
  async getEventSales(eventId: number): Promise<ApiResponse<PromoterEventSalesResponse>> {
    return this.makeRequest<PromoterEventSalesResponse>(
      `/promoters/user/events/${eventId}/sales/`
    );
  }
}

export const damePromotersAPI = new DamePromotersAPI();
