export interface ApiMember {
  id: number;
  document_type: string;
  document_number: string;
  birth_date: string;
  age: number;
  is_active: boolean;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  is_blocked: boolean;
  is_google_user?: boolean;
  status: string;
  member?: ApiMember | null;
  date_joined: string;
}

export interface AuthTokens {
  refresh: string;
  access: string;
}

export interface AuthSuccessPayload {
  success: true;
  message: string;
  user: ApiUser;
  tokens: AuthTokens;
  is_new_user?: boolean;
}

export interface AuthErrorPayload {
  success: false;
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
  [key: string]: unknown;
}

export interface UserProfileResponse {
  success: boolean;
  user?: ApiUser;
  message?: string;
  detail?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_confirm: string;
}

export interface GoogleLoginPayload {
  id_token: string;
}

export interface ApiRequestResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
  raw?: unknown;
}

