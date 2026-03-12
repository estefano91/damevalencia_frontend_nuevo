import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capturePromoterCodeFromUrl } from '@/lib/promoterLink';

/**
 * Al cargar o navegar, detecta ?promoter= o ?ref= en la URL,
 * guarda el código en sessionStorage para usarlo en el checkout.
 */
export function PromoterLinkHandler() {
  const { search } = useLocation();

  useEffect(() => {
    capturePromoterCodeFromUrl(true);
  }, [search]);

  return null;
}
