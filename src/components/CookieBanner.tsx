import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const COOKIE_CONSENT_KEY = 'dame_cookie_consent';
const COOKIE_ANALYTICS_KEY = 'dame_cookie_analytics';
const COOKIE_MARKETING_KEY = 'dame_cookie_marketing';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const analytics = localStorage.getItem(COOKIE_ANALYTICS_KEY) === 'true';
      const marketing = localStorage.getItem(COOKIE_MARKETING_KEY) === 'true';
      setPreferences({ necessary: true, analytics, marketing });
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(newPreferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const newPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(newPreferences);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_ANALYTICS_KEY, prefs.analytics ? 'true' : 'false');
    localStorage.setItem(COOKIE_MARKETING_KEY, prefs.marketing ? 'true' : 'false');

    // Initialize analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      // TODO: Initialize Google Analytics or other analytics
      console.log('✅ Analytics cookies enabled');
    }

    if (prefs.marketing) {
      // TODO: Initialize marketing pixels or similar
      console.log('✅ Marketing cookies enabled');
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // Don't show banner if user has already consented
  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner - Discreto y optimizado para móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 md:p-4">
        <Card className="max-w-2xl mx-auto shadow-lg border border-purple-200/50 dark:border-purple-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                <Cookie className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia.{' '}
                  <a href="/cookies" className="text-purple-600 hover:underline font-medium text-xs sm:text-sm">
                    Más info
                  </a>
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button 
                    onClick={handleAcceptAll} 
                    className="dame-gradient text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
                    size="sm"
                  >
                    Aceptar
                  </Button>
                  <Button 
                    onClick={handleRejectAll} 
                    variant="outline" 
                    className="border-purple-600/50 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
                    size="sm"
                  >
                    Rechazar
                  </Button>
                  <Button 
                    onClick={handleOpenSettings} 
                    variant="ghost" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Personalizar</span>
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0 -mt-1 -mr-1"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-0 w-[calc(100vw-2rem)] sm:w-auto mx-4 rounded-lg">
          <DialogHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 dame-text-gradient text-base sm:text-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              Configuración de Cookies
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Personaliza tu experiencia eligiendo qué tipos de cookies permitir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 px-4 sm:px-5 md:px-6 py-2 sm:py-3 overflow-y-auto flex-1 min-h-0">
            {/* Necessary Cookies */}
            <div className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Cookies Necesarias</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Esenciales para el funcionamiento del sitio
                  </p>
                </div>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ml-2">
                  Siempre activas
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Estas cookies permiten funciones básicas como la navegación segura y el acceso a áreas seguras del sitio web.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="p-3 sm:p-4 rounded-lg border-2 transition-all">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Cookies de Análisis</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Nos ayudan a entender cómo los visitantes usan el sitio
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Recolectan información anónima sobre el uso del sitio para mejorarlo.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="p-3 sm:p-4 rounded-lg border-2 transition-all">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Cookies de Marketing</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Personalizan la publicidad según tus intereses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Rastrean tu actividad para mostrar anuncios relevantes en otras plataformas.
              </p>
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 pt-3 border-t flex-shrink-0 gap-2 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(false)}
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              size="sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePreferences} 
              className="dame-gradient text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              size="sm"
            >
              Guardar preferencias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieBanner;

