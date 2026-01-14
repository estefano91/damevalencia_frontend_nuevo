import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Cookie, Eye, Target, BarChart3 } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cookie className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold dame-text-gradient">
              Política de Cookies
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            DAME Valencia
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Información General */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              En DAME Valencia (en adelante, "nosotros", "nuestro" o "el sitio"), respetamos tu privacidad y estamos comprometidos con la protección de tus datos personales. Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en nuestro sitio web y cómo puedes gestionar tus preferencias.
            </p>
            <p className="text-muted-foreground">
              Al utilizar nuestro sitio web, aceptas el uso de cookies de acuerdo con esta política, a menos que las hayas deshabilitado en tu navegador.
            </p>
          </CardContent>
        </Card>

        {/* ¿Qué son las cookies? */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>¿Qué son las cookies?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas un sitio web. Permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, por lo que no tienes que volver a introducirlas cada vez que regresas al sitio o navegas de una página a otra.
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                Las cookies no contienen información que te identifique personalmente, pero la información personal que almacenamos sobre ti puede estar vinculada a la información almacenada y obtenida de las cookies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de cookies que utilizamos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Tipos de cookies que utilizamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Cookies Necesarias */}
            <div className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
              <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Cookies Necesarias
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus funciones. Sin estas cookies, los servicios que has solicitado no pueden ser proporcionados.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>Cookies utilizadas:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Sesión de usuario y autenticación</li>
                  <li>Preferencias de cookies</li>
                  <li>Seguridad y prevención de fraude</li>
                </ul>
              </div>
              <div className="mt-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                  No se pueden desactivar
                </span>
              </div>
            </div>

            {/* Cookies de Análisis */}
            <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
              <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                2. Cookies de Análisis (Opcionales)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Estas cookies nos permiten contar las visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y ver cómo los visitantes se mueven por el sitio.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>Cookies utilizadas:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Google Analytics (si está habilitado)</li>
                  <li>Análisis de rendimiento del sitio</li>
                  <li>Estadísticas de uso anónimas</li>
                </ul>
              </div>
              <div className="mt-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                  Puedes desactivarlas
                </span>
              </div>
            </div>

            {/* Cookies de Marketing */}
            <div className="p-4 rounded-lg border-2 border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/10">
              <h3 className="font-bold text-lg mb-2 text-pink-700 dark:text-pink-300 flex items-center gap-2">
                <Target className="h-5 w-5" />
                3. Cookies de Marketing (Opcionales)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Estas cookies pueden establecerse a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para crear un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>Cookies utilizadas:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Facebook Pixel (si está habilitado)</li>
                  <li>Publicidad personalizada</li>
                  <li>Seguimiento de conversiones</li>
                </ul>
              </div>
              <div className="mt-2">
                <span className="px-2 py-1 bg-pink-600 text-white text-xs rounded-full font-medium">
                  Puedes desactivarlas
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Duración de las cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Duración de las cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-1 text-sm">Cookies de sesión</h4>
                <p className="text-sm text-muted-foreground">
                  Se eliminan automáticamente cuando cierras tu navegador.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-1 text-sm">Cookies persistentes</h4>
                <p className="text-sm text-muted-foreground">
                  Permanecen en tu dispositivo hasta su fecha de expiración o hasta que las elimines manualmente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Puedes gestionar tus preferencias de cookies de las siguientes maneras:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2">1. Panel de configuración en nuestro sitio</h4>
                <p className="text-sm text-muted-foreground">
                  Puedes cambiar tus preferencias de cookies en cualquier momento utilizando el botón "Personalizar" que aparece en el banner de cookies o visitando tu perfil de usuario.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2">2. Configuración del navegador</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  La mayoría de los navegadores te permiten rechazar o aceptar cookies. Para más información, visita las páginas de ayuda de tu navegador:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Microsoft Edge</a></li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                ⚠️ Ten en cuenta que deshabilitar las cookies puede afectar la funcionalidad de nuestro sitio web y limitar tu experiencia de usuario.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Derechos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Tus derechos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              De acuerdo con el RGPD y la legislación aplicable, tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Acceder a tus datos personales y saber cómo los procesamos</li>
              <li>Rectificar datos personales inexactos o incompletos</li>
              <li>Solicitar la eliminación de tus datos personales</li>
              <li>Oponerte al procesamiento de tus datos personales</li>
              <li>Solicitar la limitación del procesamiento de tus datos</li>
              <li>Obtener tus datos en un formato estructurado y de uso común</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Para ejercer estos derechos, puedes contactarnos en:{" "}
              <a href="mailto:admin@organizaciondame.org" className="text-purple-600 hover:underline font-medium">
                admin@organizaciondame.org
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Cambios en la política */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cambios en esta política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Podemos actualizar esta Política de Cookies de vez en cuando. Te recomendamos que revises esta página periódicamente para mantenerte informado de cualquier cambio. La fecha de "Última actualización" al principio de esta página indica cuándo se realizó la última revisión.
            </p>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Si tienes alguna pregunta sobre nuestra Política de Cookies, puedes contactarnos:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong>{" "}
                <a href="mailto:admin@organizaciondame.org" className="text-purple-600 hover:underline">
                  admin@organizaciondame.org
                </a>
              </p>
              <p><strong>Sitio web:</strong>{" "}
                <a href="/" className="text-purple-600 hover:underline">
                  damevalencia.es
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} DAME Valencia. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="/" className="text-purple-600 hover:underline">
              Inicio
            </a>
            <span>•</span>
            <a href="/privacy" className="text-purple-600 hover:underline">
              Política de Privacidad
            </a>
            <span>•</span>
            <a href="/terms" className="text-purple-600 hover:underline">
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;



















