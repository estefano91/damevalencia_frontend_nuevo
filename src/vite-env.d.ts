/// <reference types="vite/client" />

declare global {
  interface Window {
    __APP_ENV__?: {
      VITE_DAME_API_URL?: string;
      VITE_DAME_WEBSITE_URL?: string;
      VITE_GOOGLE_CLIENT_ID?: string;
    };
  }
}