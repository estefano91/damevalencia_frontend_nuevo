import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { ThemeProvider } from "./providers/ThemeProvider";

if (import.meta.env.PROD) {
  window.__APP_ENV__ = {
    VITE_DAME_API_URL: import.meta.env.VITE_DAME_API_URL,
    VITE_DAME_WEBSITE_URL: import.meta.env.VITE_DAME_WEBSITE_URL,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  };
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
