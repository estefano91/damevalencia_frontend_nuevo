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
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 dame-text-gradient">
                  Uso de Cookies
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. 
                  Al hacer clic en "Aceptar todas", aceptas el uso de todas las cookies según nuestra{' '}
                  <a href="/cookies" className="text-purple-600 hover:underline font-medium">
                    Política de Cookies
                  </a>
                  .
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAcceptAll} className="dame-gradient">
                    Aceptar todas las cookies
                  </Button>
                  <Button onClick={handleRejectAll} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    Rechazar todas
                  </Button>
                  <Button onClick={handleOpenSettings} variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <Settings className="mr-2 h-4 w-4" />
                    Personalizar
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 absolute top-2 right-2"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dame-text-gradient">
              <Settings className="h-5 w-5" />
              Configuración de Cookies
            </DialogTitle>
            <DialogDescription>
              Personaliza tu experiencia eligiendo qué tipos de cookies permitir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">Cookies Necesarias</h4>
                  <p className="text-sm text-muted-foreground">
                    Esenciales para el funcionamiento del sitio
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Siempre activas
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Estas cookies permiten funciones básicas como la navegación segura y el acceso a áreas seguras del sitio web.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="p-4 rounded-lg border-2 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">Cookies de Análisis</h4>
                  <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                Recolectan información anónima sobre el uso del sitio para mejorarlo.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="p-4 rounded-lg border-2 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">Cookies de Marketing</h4>
                  <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                Rastrean tu actividad para mostrar anuncios relevantes en otras plataformas.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreferences} className="dame-gradient">
              Guardar preferencias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieBanner;

