// Tipos para la API de promotores DAME
// GET /api/promoters/user/is-promoter/
// GET /api/promoters/user/events/
// GET /api/promoters/user/events/{event_id}/sales/

export interface Promoter {
  id: number;
  email: string;
  code: string;
  user: number;
  user_username: string;
  user_email: string;
  total_commission: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export interface IsPromoterResponse {
  success: boolean;
  is_promoter: boolean;
  promoter?: Promoter;
}

export interface PromoterEvent {
  event_id: number;
  event_promoter_id: number;
  event_title: string;
  event_date: string;
  sales_count: number;
  total_commission: string;
  payment_status: string;
  discount: string;
  commission_per_sale: string;
}

export interface PromoterEventsResponse {
  success: boolean;
  count: number;
  results: PromoterEvent[];
}

export interface PromoterSale {
  ticket_id: number;
  ticket_name: string;
  commission: string;
  purchase_date: string;
}

export interface PromoterEventSalesResponse {
  success: boolean;
  count: number;
  results: PromoterSale[];
}
