import type { PromoterPricingResponse, PromoterPricingTicketRow } from '@/types/tickets';

/**
 * Enlace de promotor: detectar ?promoter=CODE o ?ref=CODE en la URL,
 * guardar en sessionStorage para usarlo en el checkout y asignar comisión al promotor.
 */
const STORAGE_KEY = 'dame_promoter_code';
const URL_PARAM_PROMOTER = 'promoter';
const URL_PARAM_REF = 'ref';

export function getStoredPromoterCode(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setStoredPromoterCode(code: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, code.trim());
}

export function clearStoredPromoterCode(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Lee el código de promotor de la URL (?promoter=XXX o ?ref=XXX).
 * Si existe, lo guarda en sessionStorage y devuelve el código.
 * Opcionalmente limpia el parámetro de la URL con replaceState.
 */
export function capturePromoterCodeFromUrl(cleanUrl = true): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code =
    params.get(URL_PARAM_PROMOTER)?.trim() ||
    params.get(URL_PARAM_REF)?.trim() ||
    null;
  if (code) {
    setStoredPromoterCode(code);
    if (cleanUrl) {
      params.delete(URL_PARAM_PROMOTER);
      params.delete(URL_PARAM_REF);
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    return code;
  }
  return null;
}

/**
 * Genera el enlace que el promotor puede compartir.
 * @param promoterCode Código del promotor (ej. PROMO2024)
 * @param eventSlug Opcional: slug del evento para enlace directo a ese evento
 */
export function buildPromoterLink(promoterCode: string, eventSlug?: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const path = eventSlug ? `/eventos/${eventSlug}` : '';
  return `${base}${path}?promoter=${encodeURIComponent(promoterCode.trim())}`;
}

/** Índice por ID de tipo de entrada para GET …/promoter-pricing/ */
export function mapPromoterPricingByTicketTypeId(
  data: PromoterPricingResponse | undefined | null
): Map<number, PromoterPricingTicketRow> {
  const map = new Map<number, PromoterPricingTicketRow>();
  if (!data?.ticket_types?.length) return map;
  for (const row of data.ticket_types) {
    const tid = row.ticket_type_id ?? row.id;
    if (typeof tid === 'number' && Number.isFinite(tid)) {
      map.set(tid, row);
    }
  }
  return map;
}
