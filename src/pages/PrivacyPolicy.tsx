import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, User, Mail, MessageCircle, Users, Calendar, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold dame-text-gradient">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            DAME Valencia - Asociación de Diversidad e Integración Cultural
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {isEnglish
              ? `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        {/* Introducción */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Introducción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              En DAME Valencia ("nosotros", "nuestra", "la Asociación"), nos comprometemos con la protección de tu privacidad y el tratamiento adecuado de tus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos tu información personal.
            </p>
            <p className="text-muted-foreground">
              DAME Valencia es una asociación sin ánimo de lucro dedicada a promover la diversidad, integración cultural y bienestar de la comunidad internacional en Valencia. Tu privacidad es importante para nosotros y tratamos tus datos con el máximo cuidado y respeto.
            </p>
            <p className="text-muted-foreground">
              Al utilizar nuestros servicios (sitio web, eventos, actividades comunitarias, grupos de WhatsApp), aceptas las prácticas descritas en esta política.
            </p>
          </CardContent>
        </Card>

        {/* Responsable del tratamiento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Responsable del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-semibold mb-1">DAME Valencia</p>
                <p className="text-sm text-muted-foreground">Asociación de Diversidad e Integración Cultural</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Email de contacto</p>
                    <a href="mailto:admin@organizaciondame.org" className="text-sm text-purple-600 hover:underline">
                      admin@organizaciondame.org
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <a href="tel:+34644070282" className="text-sm text-purple-600 hover:underline">
                      (+34) 64 40 70 282
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">CIF</p>
                    <p className="text-sm text-muted-foreground">G56138217</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">Valencia, España</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos personales que recopilamos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Datos Personales que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                1. Información de Registro y Cuenta
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono (opcional)</li>
                <li>Contraseña (encriptada)</li>
                <li>Foto de perfil (opcional)</li>
                <li>País de origen</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                2. Información sobre Participación en Eventos
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Eventos en los que te has inscrito</li>
                <li>Historial de asistencia</li>
                <li>Preferencias de categorías de eventos (arte, deporte, baile, etc.)</li>
                <li>Valoraciones y comentarios sobre eventos</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                3. Información de Comunicación
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Mensajes enviados a través de nuestra plataforma</li>
                <li>Comentarios en eventos</li>
                <li>Interacciones con organizadores</li>
                <li>Datos de WhatsApp (si nos contactas por WhatsApp)</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                4. Información Técnica
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Dirección IP</li>
                <li>Tipo de navegador</li>
                <li>Dispositivo utilizado</li>
                <li>Sistema operativo</li>
                <li>Cookies y tecnologías similares</li>
                <li>Datos de uso del sitio web</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                5. Información sobre Organizadores
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Si eres organizador de eventos, también recopilamos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Información del evento (título, descripción, ubicación, fecha)</li>
                <li>Fotografías e imágenes del evento</li>
                <li>Información de contacto del organizador</li>
                <li>Datos de facturación/pago (si aplica)</li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* Cómo recopilamos tus datos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cómo Recopilamos tus Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                <h4 className="font-semibold mb-1 text-sm">Directamente de ti</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando te registras, te inscribes en eventos, o nos contactas
                </p>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                <h4 className="font-semibold mb-1 text-sm">Automáticamente</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando utilizas nuestro sitio web (cookies, logs, etc.)
                </p>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                <h4 className="font-semibold mb-1 text-sm">De terceros</h4>
                <p className="text-sm text-muted-foreground">
                  Servicios de autenticación (Google, Facebook) si eliges usarlos
                </p>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                <h4 className="font-semibold mb-1 text-sm">De otros miembros</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando otros usuarios te etiquetan en eventos o comentarios
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propósito del tratamiento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Finalidad del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos tus datos personales para los siguientes fines:
            </p>
            <div className="space-y-3">
              {[
                { title: "Prestación de servicios", desc: "Gestión de tu cuenta, inscripción en eventos, y acceso a actividades comunitarias" },
                { title: "Comunicación", desc: "Envío de confirmaciones, recordatorios de eventos, y notificaciones importantes" },
                { title: "Mejora de servicios", desc: "Analizar cómo los usuarios utilizan nuestra plataforma para mejorar la experiencia" },
                { title: "Promoción de eventos", desc: "Mostrarte eventos relevantes basados en tus intereses y ubicación" },
                { title: "Seguridad", desc: "Proteger nuestra plataforma contra fraudes y abusos" },
                { title: "Cumplimiento legal", desc: "Cumplir con obligaciones legales y regulatorias" },
                { title: "Marketing (con consentimiento)", desc: "Enviarte información sobre eventos y actividades que puedan interesarte" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-1 text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Base legal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Base Legal del Tratamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {[
                { type: "Consentimiento", desc: "Para marketing y comunicaciones promocionales" },
                { type: "Ejecución contractual", desc: "Para proporcionarte los servicios solicitados" },
                { type: "Interés legítimo", desc: "Para mejora de servicios, análisis y seguridad" },
                { type: "Obligación legal", desc: "Para cumplir con requisitos legales y fiscales" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-1 text-sm text-purple-600">{item.type}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compartir datos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compartir tus Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Compartimos tus datos personales solo en las siguientes situaciones:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-2">Organizadores de eventos</h4>
                <p className="text-sm text-muted-foreground">
                  Compartimos información básica (nombre, email) con los organizadores de eventos en los que te inscribes, para que puedan gestionar tu participación.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-2">Proveedores de servicios</h4>
                <p className="text-sm text-muted-foreground">
                  Utilizamos proveedores externos para hosting, análisis, email marketing y procesamiento de pagos. Todos ellos tienen estrictos acuerdos de confidencialidad.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-2">Obligaciones legales</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando sea requerido por ley, orden judicial o autoridad gubernamental.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-semibold mb-2">Grupos de WhatsApp</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando te unes a nuestros grupos comunitarios de WhatsApp, esa plataforma maneja tus datos según su propia política de privacidad.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>No vendemos ni alquilamos tus datos personales a terceros con fines comerciales.</strong>
            </p>
          </CardContent>
        </Card>

        {/* Retención de datos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Retención de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Conservamos tus datos personales durante el tiempo necesario para cumplir con los propósitos para los que fueron recopilados:
            </p>
            <div className="space-y-3">
              {[
                { period: "Mientras tu cuenta esté activa", desc: "Mantendremos tu información mientras uses nuestros servicios" },
                { period: "3 años después de inactividad", desc: "Si no usas tu cuenta durante 3 años, te contactaremos antes de eliminar tus datos" },
                { period: "Según requerimientos legales", desc: "Algunos datos deben conservarse por ley (contabilidad, facturación)" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-1 text-sm">{item.period}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tus derechos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Tus Derechos (RGPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Tienes los siguientes derechos sobre tus datos personales:
            </p>
            <div className="space-y-2">
              {[
                { right: "Derecho de acceso", desc: "Saber qué datos tenemos sobre ti" },
                { right: "Derecho de rectificación", desc: "Corregir datos inexactos o incompletos" },
                { right: "Derecho de supresión", desc: "Solicitar la eliminación de tus datos" },
                { right: "Derecho a la portabilidad", desc: "Recibir tus datos en formato estructurado" },
                { right: "Derecho de oposición", desc: "Oponerte al tratamiento de tus datos" },
                { right: "Derecho a la limitación", desc: "Limitar el uso de tus datos en ciertas circunstancias" },
                { right: "Derecho a retirar consentimiento", desc: "Retirar tu consentimiento en cualquier momento" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10">
                  <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.right}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-muted-foreground">
                Para ejercer tus derechos, contacta con nosotros en{" "}
                <a href="mailto:admin@organizaciondame.org" className="text-purple-600 hover:underline font-medium">
                  admin@organizaciondame.org
                </a>
                . Responderemos en un plazo máximo de 30 días.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Seguridad de tus Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Encriptación de contraseñas",
                "Conexiones seguras (HTTPS)",
                "Control de acceso restringido",
                "Monitoreo de seguridad",
                "Copias de seguridad regulares",
                "Formación del personal",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Lock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menores de edad */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Menores de Edad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nuestros servicios están dirigidos a personas mayores de 18 años. Si tienes conocimiento de que un menor nos ha proporcionado información personal, contacta con nosotros inmediatamente en{" "}
              <a href="mailto:admin@organizaciondame.org" className="text-purple-600 hover:underline font-medium">
                admin@organizaciondame.org
              </a>
              {" "}para eliminarla.
            </p>
          </CardContent>
        </Card>

        {/* Transferencias internacionales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transferencias Internacionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Algunos de nuestros proveedores de servicios están ubicados fuera del Espacio Económico Europeo (EEE). En estos casos, implementamos salvaguardas adecuadas, como las Cláusulas Contractuales Estándar de la UE, para garantizar que tus datos reciban el mismo nivel de protección.
            </p>
          </CardContent>
        </Card>

        {/* Cambios a esta política */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cambios a esta Política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas o requisitos legales. Te notificaremos de cualquier cambio significativo mediante email o una notificación prominente en nuestro sitio web.
            </p>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos sobre tus datos personales:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:admin@organizaciondame.org" className="text-purple-600 hover:underline">
                    admin@organizaciondame.org
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Teléfono</p>
                  <a href="tel:+34644070282" className="text-purple-600 hover:underline">
                    (+34) 64 40 70 282
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">CIF</p>
                  <p className="text-muted-foreground">G56138217</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Ubicación</p>
                  <p className="text-muted-foreground">Valencia, España</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Autoridad de control</p>
                  <p className="text-muted-foreground text-sm">
                    También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que el tratamiento de tus datos vulnera el RGPD.
                  </p>
                </div>
              </div>
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
            <a href="/cookies" className="text-purple-600 hover:underline">
              Política de Cookies
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

export default PrivacyPolicy;
















