import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options?: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onToken: (idToken: string) => void;
  onError?: (message: string) => void;
  className?: string;
}

const GOOGLE_SCRIPT_ID = "google-identity-services-sdk";

const GoogleSignInButton = ({ disabled, onToken, onError, className }: GoogleSignInButtonProps) => {
  // Solo consideramos "ready" cuando realmente existe google.accounts.id,
  // no simplemente cuando window.google está definido (p.ej. por Google Maps)
  const [scriptReady, setScriptReady] = useState<boolean>(
    typeof window !== "undefined" && Boolean(window.google?.accounts?.id)
  );
  const [buttonRendered, setButtonRendered] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleLoaded = () => {
      // Solo marcamos como listo si google.accounts.id existe realmente
      if (window.google?.accounts?.id) {
        setScriptReady(true);
      }
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === "true" && window.google?.accounts?.id) {
        setScriptReady(true);
      } else {
        existingScript.addEventListener("load", handleLoaded);
      }
      return () => existingScript.removeEventListener("load", handleLoaded);
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      if (window.google?.accounts?.id) {
        setScriptReady(true);
      }
    };
    script.onerror = () => {
      onError?.("No se pudo cargar Google Sign-In. Revisa tu conexión.");
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [onError, scriptReady]);

  useEffect(() => {
    const googleAccounts = window.google?.accounts;

    if (!scriptReady || !googleAccounts?.id || !buttonRef.current || !clientId || buttonRendered) {
      return;
    }

    googleAccounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onToken(response.credential);
        } else {
          onError?.("No se recibió el token de Google. Intenta nuevamente.");
        }
      },
    });

    googleAccounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "filled_blue",
      size: "large",
      text: "continue_with",
      width: "100%",
    });

    setButtonRendered(true);
  }, [buttonRendered, clientId, onError, onToken, scriptReady]);

  if (!clientId) {
    return (
      <Button className="w-full" variant="outline" disabled>
        Configura VITE_GOOGLE_CLIENT_ID para activar Google Sign-In
      </Button>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {!buttonRendered && (
        <Button className="w-full mb-2" variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparando Google...
        </Button>
      )}
      <div
        ref={buttonRef}
        className={cn(
          "flex justify-center w-full",
          (disabled || !scriptReady) && "pointer-events-none opacity-60"
        )}
      />
    </div>
  );
};

export default GoogleSignInButton;

