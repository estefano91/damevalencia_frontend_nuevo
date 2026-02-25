// API para DameCoins wallet
// GET /api/users/profile/ → wallet en member
// GET /api/users/wallet/history/ → historial paginado

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || "https://organizaciondame.org/api";

const buildUrl = (path: string, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
};

export interface WalletTransaction {
  id: number;
  amount: string;
  transaction_type: "ADD" | "SUBTRACT";
  transaction_type_display: string;
  reason: string;
  created_at: string;
}

export interface WalletHistoryResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: WalletTransaction[];
}

interface ApiRequestResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

const getAuthToken = (): string | null =>
  localStorage.getItem("dame_access_token") || localStorage.getItem("dame_auth_token");

export const walletApi = {
  getHistory: async (page?: number): Promise<ApiRequestResult<WalletHistoryResponse>> => {
    const token = getAuthToken();
    if (!token) {
      return { ok: false, error: "No autenticado", status: 401 };
    }

    try {
      const params = page ? { page: String(page) } : undefined;
      const url = buildUrl("/users/wallet/history/", params);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.detail || payload?.message || "Error al cargar historial",
          status: response.status,
        };
      }

      return {
        ok: true,
        data: payload as WalletHistoryResponse,
        status: response.status,
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error de conexión",
        status: 0,
      };
    }
  },
};
