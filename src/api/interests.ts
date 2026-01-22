import type { ApiRequestResult } from "@types/auth";
import type {
  GetInterestsResponse,
  AddInterestPayload,
  AddInterestResponse,
  UpdateInterestsPayload,
  UpdateInterestsResponse,
  DeleteInterestResponse,
  GetAvailableTagsResponse,
} from "@types/interests";

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || "https://organizaciondame.org/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | string | undefined;
};

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const extractErrorMessage = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    return "Error desconocido";
  }

  const errorPayload = payload as Record<string, unknown>;

  if (typeof errorPayload.message === "string" && errorPayload.message.trim().length > 0) {
    return errorPayload.message;
  }

  if (typeof errorPayload.detail === "string" && errorPayload.detail.trim().length > 0) {
    return errorPayload.detail;
  }

  if (Array.isArray(errorPayload.non_field_errors) && errorPayload.non_field_errors.length > 0) {
    return errorPayload.non_field_errors[0] as string;
  }

  if (errorPayload.errors && typeof errorPayload.errors === "object") {
    const errors = errorPayload.errors as Record<string, unknown>;
    const firstError = Object.values(errors).flat()[0];
    if (typeof firstError === "string" && firstError.trim().length > 0) {
      return firstError;
    }
  }

  return "Error al procesar la solicitud";
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
      error: extractErrorMessage(payload),
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

export const interestsApi = {
  // GET /api/users/interests/
  getInterests: (accessToken: string) =>
    request<GetInterestsResponse>("/users/interests/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  // POST /api/users/interests/add/
  addInterest: (accessToken: string, payload: AddInterestPayload) =>
    request<AddInterestResponse>("/users/interests/add/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    }),

  // PUT /api/users/interests/update/
  updateInterests: (accessToken: string, payload: UpdateInterestsPayload) =>
    request<UpdateInterestsResponse>("/users/interests/update/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload,
    }),

  // DELETE /api/users/interests/delete/{id}/
  deleteInterest: (accessToken: string, interestId: number) =>
    request<DeleteInterestResponse>(`/users/interests/delete/${interestId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  // GET /api/users/interests/available-tags/
  getAvailableTags: (accessToken: string) =>
    request<GetAvailableTagsResponse>("/users/interests/available-tags/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};

