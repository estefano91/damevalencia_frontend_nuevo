import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import logoDame from "@/assets/1.png";

const RegisterPopup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  // Inicializar desde localStorage inmediatamente
  const [hasSeenPopup, setHasSeenPopup] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("registerPopupDismissed");
    }
    return false;
  });
  const [shouldShow, setShouldShow] = useState(false);

  // No mostrar en páginas de auth o register
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    // No mostrar si está cargando
    if (loading) {
      return;
    }

    // No mostrar en páginas de auth
    if (isAuthPage) {
      setShouldShow(false);
      return;
    }

    // No mostrar si el usuario está logueado
    if (user) {
      setShouldShow(false);
      return;
    }

    // Verificar si el usuario ya cerró el popup anteriormente (ya está en el estado inicial)
    if (hasSeenPopup) {
      setShouldShow(false);
      return;
    }

    // Si llegamos aquí, podemos mostrar el popup
    setShouldShow(true);
    
    // Esperar 2.5 segundos antes de mostrar el popup (no intrusivo)
    const timer = setTimeout(() => {
      // Verificar nuevamente antes de abrir (por si cambió algo durante el delay)
      const stillDismissed = localStorage.getItem("registerPopupDismissed");
      const currentUser = user; // Capturar el valor actual
      const currentIsAuthPage = location.pathname === "/auth" || location.pathname === "/login" || location.pathname === "/register";
      
      if (!stillDismissed && !currentUser && !currentIsAuthPage) {
        setOpen(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, loading, hasSeenPopup, isAuthPage, location.pathname]);

  const handleClose = () => {
    setOpen(false);
    // Recordar que el usuario cerró el popup
    localStorage.setItem("registerPopupDismissed", "true");
    setHasSeenPopup(true);
    setShouldShow(false);
  };

  const handleRegister = () => {
    handleClose();
    navigate("/register");
  };

  // No renderizar si no debería mostrarse
  // Pero siempre renderizar el Dialog (aunque esté cerrado) para evitar problemas de montaje
  if (user || isAuthPage || loading) {
    return null;
  }

  // Si ya cerró el popup, no renderizar
  if (hasSeenPopup && !shouldShow) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
      <DialogContent 
        className="max-w-md bg-white dark:bg-gray-800 border-0 shadow-2xl p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full rounded-lg"
        onInteractOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onEscapeKeyDown={handleClose}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent pointer-events-none rounded-lg" />

        <div className="relative p-3 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
          {/* Logo */}
          <div className="flex justify-center mb-0.5 sm:mb-1 md:mb-2">
            <img 
              src={logoDame} 
              alt="DAME Logo" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <DialogHeader className="text-center space-y-1 sm:space-y-1.5 md:space-y-2">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent px-1 sm:px-2 leading-tight">
              {i18n.language === 'en' 
                ? 'Join DAME Valencia!' 
                : '¡Únete a DAME Valencia!'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 pt-0.5 sm:pt-1 md:pt-2 px-1 sm:px-2 leading-relaxed">
              {i18n.language === 'en' ? (
                <>
                  Discover amazing events, connect with thousands of people, and be part of the best community in Valencia.
                </>
              ) : (
                <>
                  Descubre eventos increíbles, conéctate con miles de personas y sé parte de la mejor comunidad en Valencia.
                </>
              )}
            </DialogDescription>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium pt-0.5 sm:pt-1 px-1 sm:px-2">
              {i18n.language === 'en' 
                ? 'New here? Create an account. Already a member? Log in.' 
                : '¿Nuevo? Crea una cuenta. ¿Ya eres miembro? Inicia sesión.'}
            </p>
          </DialogHeader>

          {/* Features */}
          <div className="space-y-1 sm:space-y-1.5 md:space-y-2 py-0.5 sm:py-1 md:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-purple-600 flex-shrink-0" />
              <span className="leading-snug">
                {i18n.language === 'en' 
                  ? 'Access to exclusive events' 
                  : 'Acceso a eventos exclusivos'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-pink-600 flex-shrink-0" />
              <span className="leading-snug">
                {i18n.language === 'en' 
                  ? 'Connect with the community' 
                  : 'Conéctate con la comunidad'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-purple-600 flex-shrink-0" />
              <span className="leading-snug">
                {i18n.language === 'en' 
                  ? 'Free registration' 
                  : 'Registro gratuito'}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-0.5 sm:pt-1 md:pt-2 space-y-1.5 sm:space-y-2 md:space-y-3">
            <Button
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 py-4 sm:py-5 md:py-6 text-xs sm:text-sm md:text-base group"
              size="lg"
            >
              <span className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap">
                {i18n.language === 'en' ? (
                  <>
                    <span>Create Account</span>
                    <span className="text-white/80">/</span>
                    <span>Login</span>
                  </>
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <span className="text-white/80">/</span>
                    <span>Loguear</span>
                  </>
                )}
              </span>
              <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Optional: Skip link */}
            <div className="text-center pb-1 sm:pb-0">
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
              >
                {i18n.language === 'en' ? 'Maybe later' : 'Quizás más tarde'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPopup;

