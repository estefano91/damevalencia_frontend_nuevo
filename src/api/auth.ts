import type {
  ApiRequestResult,
  AuthErrorPayload,
  AuthSuccessPayload,
  CreateMemberPayload,
  CreateMemberResponse,
  GetMemberResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  UpdateMemberPayload,
  UpdateMemberResponse,
  UserProfileResponse,
  UserStatsResponse,
} from "@types/auth";

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || "https://organizaciondame.org/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | string | undefined;
};

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const extractErrorMessage = (payload?: AuthErrorPayload | null) => {
  if (!payload) return "Error desconocido en la autenticación";

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

  if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
    return payload.detail;
  }

  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length > 0) {
    return payload.non_field_errors[0];
  }

  if (payload.errors) {
    const firstError = Object.values(payload.errors).flat()[0];
    if (typeof firstError === "string" && firstError.trim().length > 0) {
      return firstError;
    }
  }

  // Buscar cualquier string dentro de las propiedades restantes
  for (const value of Object.values(payload)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      return value[0];
    }
  }

  return "No se pudo completar la autenticación";
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<ApiRequestResult<T>> => {
  try {
    const { body, headers, ...rest } = options;

    const preparedBody =
      typeof body === "string" || body === undefined ? body : JSON.stringify(body);

    const response = await fetch(buildUrl(path), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: preparedBody,
    });

    const payload = await response
      .json()
      .catch(() => null);

    if (response.ok) {
      return {
        ok: true,
        data: (payload ?? undefined) as T,
        status: response.status,
        raw: payload ?? undefined,
      };
    }

    return {
      ok: false,
      error: extractErrorMessage(payload as AuthErrorPayload | null),
      status: response.status,
      raw: payload ?? undefined,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      status: 0,
    };
  }
};

export const authApi = {
  login: (credentials: LoginPayload) =>
    request<AuthSuccessPayload>("/users/auth/login/", {
      method: "POST",
      body: credentials,
    }),

  register: (data: RegisterPayload) =>
    request<AuthSuccessPayload>("/users/auth/register/", {
      method: "POST",
      body: data,
    }),

  loginWithGoogle: (payload: GoogleLoginPayload) =>
    request<AuthSuccessPayload>("/users/auth/google/", {
      method: "POST",
      body: payload,
    }),

  me: (accessToken: string) =>
    request<UserProfileResponse>("/users/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  createMember: (accessToken: string, payload: CreateMemberPayload) =>
    request<CreateMemberResponse>("/users/member/create/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    }),

  getMember: (accessToken: string) =>
    request<GetMemberResponse>("/users/member/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  updateMember: (accessToken: string, payload: UpdateMemberPayload) =>
    request<UpdateMemberResponse>("/users/member/update/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    }),

  getUserStats: (accessToken: string) =>
    request<UserStatsResponse>("/users/stats/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};

