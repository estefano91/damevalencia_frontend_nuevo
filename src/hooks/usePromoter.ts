import { useState, useEffect, useCallback } from 'react';
import { damePromotersAPI } from '@/integrations/dame-api/promoters';
import type { Promoter } from '@/types/promoters';

export function usePromoter() {
  const [isPromoter, setIsPromoter] = useState<boolean | null>(null);
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIsPromoter = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await damePromotersAPI.getIsPromoter();
    setLoading(false);
    if (!response.success) {
      setError(response.error ?? null);
      setIsPromoter(false);
      setPromoter(null);
      return;
    }
    const data = response.data;
    setIsPromoter(!!data?.is_promoter);
    setPromoter(data?.promoter ?? null);
  }, []);

  useEffect(() => {
    fetchIsPromoter();
  }, [fetchIsPromoter]);

  return { isPromoter, promoter, loading, error, refetch: fetchIsPromoter };
}
