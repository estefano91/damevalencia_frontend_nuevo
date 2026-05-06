// Servicio API para tickets de DAME
// Documentación: https://organizaciondame.org/docs/apps/tickets/

import type {
  TicketTypeDetail,
  TicketTypesResponse,
  PurchaseTicketRequest,
  PurchaseTicketAtDoorRequest,
  PurchaseTicketResponse,
  ReserveTicketRequest,
  ReserveTicketResponse,
  Ticket,
  TicketsResponse,
  TicketDetailResponse,
  TicketStatusResponse,
  TicketHashLookupResponse,
  StripeCheckoutRequest,
  StripeCheckoutResponse,
  PaymentStatusResponse,
  BuyerPhotoUploadResponse,
  PromoterPricingResponse,
} from '@/types/tickets';

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Obtener token de autenticación del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('dame_access_token') || localStorage.getItem('dame_auth_token');
};

// Clase para manejar las peticiones API de tickets
export class DameTicketsAPI {
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
        const fullErrorString = JSON.stringify(errorData, null, 2);
        
        console.error(`❌ API Error [${response.status}]:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          fullError: fullErrorString
        });
        
        // Log detallado del error
        if (errorData.errors) {
          console.error('📋 Errores detallados del API:', errorData.errors);
          Object.keys(errorData.errors).forEach(field => {
            console.error(`  - ${field}:`, errorData.errors[field]);
          });
        }
        
        // Log del body que se envió si es una request POST/PUT
        if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
          console.error('📤 Request body enviado:', options.body);
        }
        
        // Si es 403 o 401, probablemente requiere autenticación de admin
        if (response.status === 403 || response.status === 401) {
          return {
            success: false,
            error: `Autenticación requerida (${response.status}). Este endpoint requiere permisos de administrador.`,
            errorDetails: errorData,
          };
        }
        
        // Construir mensaje de error más detallado
        let errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`;
        
        // Si hay errores de campos específicos, incluirlos en el mensaje
        if (errorData.errors && typeof errorData.errors === 'object') {
          const fieldErrors: string[] = [];
          Object.keys(errorData.errors).forEach(field => {
            const fieldError = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field].join(', ') 
              : String(errorData.errors[field]);
            fieldErrors.push(`${field}: ${fieldError}`);
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(' | ');
          }
        }
        
        return {
          success: false,
          error: errorMessage,
          errorDetails: errorData, // Incluir detalles completos del error
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
   * Obtener tipos de entrada para un evento (endpoint público)
   * Endpoint: GET /api/tickets/events/{event_id}/ticket-types/
   * No requiere autenticación - devuelve solo tickets visibles
   */
  async getTicketTypes(eventId: number, params?: {
    ticket_type?: string;
    is_visible?: boolean;
  }): Promise<ApiResponse<TicketTypesResponse>> {
    // Usar el endpoint público: /api/tickets/events/{event_id}/ticket-types/
    const queryParams = new URLSearchParams();
    
    if (params?.ticket_type) {
      queryParams.append('ticket_type', params.ticket_type);
    }
    
    // Nota: El endpoint público ya devuelve solo tickets visibles por defecto
    const queryString = queryParams.toString();
    const url = `/tickets/events/${eventId}/ticket-types/${queryString ? `?${queryString}` : ''}`;
    
    // Para el endpoint público, hacer la petición sin autenticación
    return this.makePublicRequest<TicketTypesResponse>(url);
  }

  /**
   * Precios por tipo de entrada con código de promotor (público).
   * GET /api/tickets/events/{event_id}/promoter-pricing/?code={codigo}
   */
  async getPromoterPricing(
    eventId: number,
    code: string
  ): Promise<ApiResponse<PromoterPricingResponse>> {
    const trimmed = code.trim();
    if (!trimmed) {
      return { success: false, error: 'Missing promoter code' };
    }
    const qs = new URLSearchParams({ code: trimmed });
    const path = `/tickets/events/${eventId}/promoter-pricing/?${qs.toString()}`;
    return this.makePublicRequest<PromoterPricingResponse>(path);
  }

  /**
   * Realizar petición pública (sin autenticación)
   * Para endpoints que no requieren autenticación
   */
  private async makePublicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // No agregar token de autenticación para endpoints públicos
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Public API Error [${response.status}]:`, {
          status: response.status,
          errorData,
          url
        });
        return {
          success: false,
          error: errorData.message || errorData.error || errorData.detail || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('❌ Public API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Comprar tickets online (requiere autenticación)
   */
  async purchaseTicket(request: PurchaseTicketRequest): Promise<ApiResponse<PurchaseTicketResponse>> {
    return this.makeRequest<PurchaseTicketResponse>('/tickets/purchase/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Comprar tickets EN_PUERTA (requiere autenticación)
   * Formato diferente: usa ticket_type_id y attendee_data como array
   */
  async purchaseTicketAtDoor(request: PurchaseTicketAtDoorRequest): Promise<ApiResponse<PurchaseTicketResponse>> {
    return this.makeRequest<PurchaseTicketResponse>('/tickets/purchase/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Reservar ticket sin pago (requiere autenticación)
   */
  async reserveTicket(request: ReserveTicketRequest): Promise<ApiResponse<ReserveTicketResponse>> {
    return this.makeRequest<ReserveTicketResponse>('/tickets/reserve/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Obtener tickets futuros/actuales del usuario autenticado
   */
  async getMyCurrentTickets(page: number = 1): Promise<ApiResponse<TicketsResponse>> {
    return this.makeRequest<TicketsResponse>(`/tickets/my-tickets/current/?page=${page}`);
  }

  /**
   * Obtener tickets pasados del usuario autenticado
   */
  async getMyPastTickets(page: number = 1): Promise<ApiResponse<TicketsResponse>> {
    return this.makeRequest<TicketsResponse>(`/tickets/my-tickets/past/?page=${page}`);
  }

  /**
   * Obtener detalle de un ticket del usuario autenticado
   */
  async getMyTicketDetail(ticketId: number): Promise<ApiResponse<TicketDetailResponse>> {
    return this.makeRequest<TicketDetailResponse>(`/tickets/my-tickets/${ticketId}/`);
  }

  /**
   * Verificar estado de un ticket por código (público, no requiere autenticación)
   * Endpoint: GET /api/tickets/status/{ticket_code}/
   */
  async getTicketStatus(ticketCode: string): Promise<ApiResponse<TicketStatusResponse>> {
    return this.makePublicRequest<TicketStatusResponse>(`/tickets/status/${ticketCode}/`);
  }

  /**
   * Consultar ticket público por hash (público, no requiere autenticación)
   * Endpoint: GET /api/tickets/hash/{hash}/
   */
  async getTicketByHash(hash: string): Promise<ApiResponse<TicketHashLookupResponse>> {
    return this.makePublicRequest<TicketHashLookupResponse>(`/tickets/hash/${hash}/`);
  }

  /**
   * Iniciar checkout con Stripe
   * Endpoint: POST /api/tickets/online/checkout/
   * Requiere autenticación.
   */
  /**
   * Subir foto del comprador (multipart). Requiere autenticación.
   * POST /api/tickets/buyer-photo/ campo image_file
   */
  async uploadBuyerPhoto(imageFile: File): Promise<ApiResponse<BuyerPhotoUploadResponse>> {
    const url = `${API_BASE_URL}/tickets/buyer-photo/`;
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as BuyerPhotoUploadResponse;

      if (!response.ok) {
        const msg =
          data.detail ||
          data.error ||
          `HTTP ${response.status}`;
        return { success: false, error: msg };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Borrar foto subida del comprador. Requiere autenticación.
   * DELETE /api/tickets/buyer-photo/<image_id>/
   */
  async deleteBuyerPhoto(imageId: string): Promise<ApiResponse<void>> {
    const url = `${API_BASE_URL}/tickets/buyer-photo/${imageId}/`;
    const token = getAuthToken();
    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          (errorData as { detail?: string }).detail ||
          (errorData as { error?: string }).error ||
          `HTTP ${response.status}`;
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async initiateStripeCheckout(request: StripeCheckoutRequest): Promise<ApiResponse<StripeCheckoutResponse>> {
    const body = JSON.stringify(request);
    
    console.log('🌐 API Request Details:');
    console.log('  - Endpoint: /tickets/online/checkout/');
    console.log('  - Method: POST');
    console.log('  - Headers: Content-Type: application/json, Authorization: Bearer [token]');
    
    const response = await this.makeRequest<StripeCheckoutResponse>('/tickets/online/checkout/', {
      method: 'POST',
      body: body,
    });
    
    console.log('🌐 API Response Details:');
    console.log('  - Status: HTTP Response recibido');
    console.log('  - Success:', response.success);
    
    return response;
  }

  /**
   * Consultar estado del pago (endpoint público)
   * Endpoint: GET /api/tickets/payment-status/{order_id}/
   */
  async getPaymentStatus(orderId: number): Promise<ApiResponse<PaymentStatusResponse>> {
    return this.makePublicRequest<PaymentStatusResponse>(`/tickets/payment-status/${orderId}/`);
  }
}

// Instancia singleton
export const dameTicketsAPI = new DameTicketsAPI();
