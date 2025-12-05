// Tipos para el sistema de tickets de DAME
// Basado en la documentación de: https://organizaciondame.org/docs/apps/tickets/

export type TicketType = 'EN_PUERTA' | 'RESERVA' | 'ONLINE';
export type PricingType = 'FIXED' | 'DATE_SCALED' | 'SALES_SCALED';
export type PaymentGateway = 'NONE' | 'STRIPE';
export type TicketStatus = 'PURCHASED' | 'RESERVED' | 'CANCELLED' | 'REDEEMED';

export interface PriceScale {
  id: number;
  scale_type: 'DATE_SCALED' | 'SALES_SCALED';
  until_date: string | null; // ISO date string
  until_sales_count: number | null;
  price: string; // Decimal as string
  order: number;
  created_at: string;
}

export interface EventBasic {
  id: number;
  title_es: string;
  start_datetime: string;
  slug: string;
}

export interface TicketTypeDetail {
  id: number;
  event: EventBasic;
  title_es: string;
  title_en?: string;
  description_es?: string;
  description_en?: string;
  ticket_type: TicketType;
  payment_gateway: PaymentGateway;
  stripe_config?: number;
  base_price: string; // Decimal as string
  currency: string; // e.g., 'EUR'
  pricing_type: PricingType;
  stock: number;
  is_visible: boolean;
  attendees_per_ticket: number;
  require_full_name: boolean;
  require_email: boolean;
  require_phone: boolean;
  require_gender?: boolean;
  require_role?: boolean;
  require_document?: boolean;
  require_country?: boolean;
  require_city?: boolean;
  price_scales?: PriceScale[];
  is_on_sale: boolean;
  tickets_sold_count: number;
  available_stock: number;
  current_price: string; // Decimal as string
  sale_start_date?: string; // ISO date string
  sale_end_date?: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface TicketTypesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TicketTypeDetail[];
}

export interface PurchaseTicketRequest {
  ticket_type: number; // ID del tipo de ticket
  quantity: number;
  full_name: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  role?: 'LEADER' | 'FOLLOWER';
  id_document?: string;
  country?: string;
  city?: string;
  additional_notes?: string;
}

// Request específico para tickets EN_PUERTA
export interface PurchaseTicketAtDoorRequest {
  ticket_type_id: number; // ID del tipo de ticket
  quantity: number; // Cantidad de tickets (igual al número de asistentes)
  attendee_data: Array<{
    full_name: string;
    email: string;
    phone?: string;
    gender?: 'M' | 'F' | 'O';
    role?: 'LEADER' | 'FOLLOWER';
    id_document?: string;
    country?: string;
    city?: string;
    additional_notes?: string;
  }>;
}

export interface ReserveTicketRequest {
  ticket_type: number; // ID del tipo de ticket
  full_name: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  role?: 'LEADER' | 'FOLLOWER';
  id_document?: string;
  country?: string;
  city?: string;
  additional_notes?: string;
}

export interface TicketMetadata {
  ticket_title: string;
  ticket_title_en?: string;
  event_title: string;
  event_date: string;
  event_place?: string;
  pricing_type: PricingType;
  base_price: string;
  hash?: string;
  ticket_hash?: string;
}

export interface Ticket {
  id: number;
  ticket_type: number;
  ticket_type_title: string;
  event_title: string;
  event_date: string;
  event_slug?: string; // Slug del evento para poder obtener su imagen
  event_id?: number; // ID del evento como alternativa
  status: TicketStatus;
  full_name: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  role?: 'LEADER' | 'FOLLOWER';
  id_document?: string;
  country?: string;
  city?: string;
  purchase_price: string; // Decimal as string
  purchase_currency: string;
  purchase_date: string;
  ticket_code: string;
  hash?: string;
  ticket_hash?: string;
  ticket_metadata?: TicketMetadata;
  is_manual: boolean;
  referral_code?: string;
  created_at: string;
  updated_at: string;
  redeemed_at?: string | null;
}

export interface TicketsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ticket[];
}

export interface TicketDetailResponse {
  success: boolean;
  ticket?: Ticket;
  error?: string;
}

export interface TicketHashLookupResponse {
  success: boolean;
  ticket?: Ticket & { hash?: string };
  error?: string;
}

export interface PurchaseTicketResponse {
  success: boolean;
  tickets?: Ticket[];
  payment_intent_id?: string; // Para Stripe
  checkout_url?: string; // URL de checkout para pago
  error?: string;
}

export interface ReserveTicketResponse {
  success: boolean;
  ticket?: Ticket;
  error?: string;
}

export interface TicketStatusResponse {
  success: boolean;
  ticket?: {
    ticket_code: string;
    full_name: string;
    status: TicketStatus;
    event_title: string;
    event_date: string;
    purchase_date: string;
  };
  error?: string;
}

// Tipos para checkout de Stripe
export interface StripeCheckoutRequest {
  ticket_type_id: number;
  quantity: number;
  attendee_data: Array<{
    full_name: string;
    email: string;
    phone?: string;
    gender?: 'M' | 'F' | 'O';
    role?: 'LEADER' | 'FOLLOWER';
    id_document?: string;
    country?: string;
    city?: string;
    additional_notes?: string;
  }>;
  referral_code?: string;
}

export interface StripeCheckoutResponse {
  success: boolean;
  order_id: number;
  payment_intent_id: string;
  client_secret: string;
  publishable_key: string;
  amount: string;
  currency: string;
  message?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  order: {
    id: number;
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    amount: string;
    currency: string;
    quantity: number;
    ticket_type_title: string;
    event_title: string;
    customer_email: string;
    stripe_payment_intent_id: string;
    created_at: string;
    updated_at: string;
    tickets?: Ticket[];
    error_message?: string;
  };
  error?: string;
}
