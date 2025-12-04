import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Mail, 
  MapPin,
  Calendar,
  XCircle,
  Info
} from "lucide-react";

const TermsOfService = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold dame-text-gradient">
              {isEnglish ? 'Terms of Service' : 'Términos y Condiciones de Servicio'}
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
            <CardTitle>{isEnglish ? '1. Introduction and Acceptance' : '1. Introducción y Aceptación'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {isEnglish
                ? 'Welcome to DAME Valencia. These Terms of Service ("Terms") govern your access to and use of our website, services, events, and activities. By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.'
                : 'Bienvenido a DAME Valencia. Estos Términos y Condiciones de Servicio ("Términos") rigen tu acceso y uso de nuestro sitio web, servicios, eventos y actividades. Al acceder o utilizar nuestros servicios, aceptas estar sujeto a estos Términos y a nuestra Política de Privacidad.'}
            </p>
            <p className="text-muted-foreground">
              {isEnglish
                ? 'DAME Valencia is a non-profit association dedicated to promoting diversity, cultural integration, and community wellbeing in Valencia. Our services include organizing cultural events, workshops, community activities, and providing a platform for community engagement.'
                : 'DAME Valencia es una asociación sin ánimo de lucro dedicada a promover la diversidad, integración cultural y bienestar de la comunidad en Valencia. Nuestros servicios incluyen la organización de eventos culturales, talleres, actividades comunitarias y la provisión de una plataforma para el engagement comunitario.'}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{isEnglish ? 'Important:' : 'Importante:'}</strong>{' '}
                {isEnglish
                  ? 'If you do not agree to these Terms, please do not use our services.'
                  : 'Si no estás de acuerdo con estos Términos, por favor no utilices nuestros servicios.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Definiciones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEnglish ? '2. Definitions' : '2. Definiciones'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  term: isEnglish ? '"We", "Us", "Our"' : '"Nosotros", "Nuestra", "La Asociación"',
                  def: isEnglish 
                    ? 'Refers to DAME Valencia, a non-profit association registered in Valencia, Spain.'
                    : 'Se refiere a DAME Valencia, una asociación sin ánimo de lucro registrada en Valencia, España.'
                },
                {
                  term: isEnglish ? '"You", "User", "Member"' : '"Tú", "Usuario", "Miembro"',
                  def: isEnglish
                    ? 'Refers to any person who accesses or uses our services.'
                    : 'Se refiere a cualquier persona que accede o utiliza nuestros servicios.'
                },
                {
                  term: isEnglish ? '"Services"' : '"Servicios"',
                  def: isEnglish
                    ? 'Refers to our website, mobile application, events, workshops, community activities, and any related services.'
                    : 'Se refiere a nuestro sitio web, aplicación móvil, eventos, talleres, actividades comunitarias y cualquier servicio relacionado.'
                },
                {
                  term: isEnglish ? '"Event"' : '"Evento"',
                  def: isEnglish
                    ? 'Refers to any organized activity, workshop, meeting, or gathering organized by DAME Valencia.'
                    : 'Se refiere a cualquier actividad organizada, taller, reunión o encuentro organizado por DAME Valencia.'
                },
                {
                  term: isEnglish ? '"Content"' : '"Contenido"',
                  def: isEnglish
                    ? 'Refers to any text, images, videos, audio, or other materials available on our platform.'
                    : 'Se refiere a cualquier texto, imagen, video, audio u otro material disponible en nuestra plataforma.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-sm text-purple-600 mb-1">{item.term}</p>
                  <p className="text-sm text-muted-foreground">{item.def}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uso del servicio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              {isEnglish ? '3. Use of Services' : '3. Uso de los Servicios'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Eligibility' : 'Elegibilidad'}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isEnglish
                  ? 'You must be at least 18 years old to use our services. By using our services, you represent and warrant that you are of legal age to form a binding contract and meet all eligibility requirements.'
                  : 'Debes ser mayor de 18 años para utilizar nuestros servicios. Al utilizar nuestros servicios, declaras y garantizas que tienes la edad legal para formar un contrato vinculante y cumples con todos los requisitos de elegibilidad.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Permitted Uses' : 'Usos Permitidos'}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isEnglish
                  ? 'You may use our services for:'
                  : 'Puedes utilizar nuestros servicios para:'}
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>{isEnglish ? 'Browsing and viewing event information' : 'Navegar y ver información de eventos'}</li>
                <li>{isEnglish ? 'Registering for events and activities' : 'Inscribirte en eventos y actividades'}</li>
                <li>{isEnglish ? 'Participating in community activities' : 'Participar en actividades comunitarias'}</li>
                <li>{isEnglish ? 'Contacting organizers and other members' : 'Contactar con organizadores y otros miembros'}</li>
                <li>{isEnglish ? 'Accessing community resources and information' : 'Acceder a recursos e información de la comunidad'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                {isEnglish ? 'Prohibited Uses' : 'Usos Prohibidos'}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isEnglish
                  ? 'You agree NOT to:'
                  : 'Te comprometes a NO:'}
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>{isEnglish ? 'Use our services for any illegal purpose or in violation of any laws' : 'Utilizar nuestros servicios para cualquier propósito ilegal o en violación de las leyes'}</li>
                <li>{isEnglish ? 'Harass, threaten, or harm other users or members' : 'Acosar, amenazar o dañar a otros usuarios o miembros'}</li>
                <li>{isEnglish ? 'Post false, misleading, or fraudulent information' : 'Publicar información falsa, engañosa o fraudulenta'}</li>
                <li>{isEnglish ? 'Impersonate any person or entity' : 'Suplantar a cualquier persona o entidad'}</li>
                <li>{isEnglish ? 'Interfere with or disrupt our services or servers' : 'Interferir o interrumpir nuestros servicios o servidores'}</li>
                <li>{isEnglish ? 'Attempt to gain unauthorized access to our systems' : 'Intentar obtener acceso no autorizado a nuestros sistemas'}</li>
                <li>{isEnglish ? 'Use automated systems to access our services without permission' : 'Utilizar sistemas automatizados para acceder a nuestros servicios sin permiso'}</li>
                <li>{isEnglish ? 'Reproduce, duplicate, or copy any content without authorization' : 'Reproducir, duplicar o copiar cualquier contenido sin autorización'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Registro y cuenta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              {isEnglish ? '4. Registration and Account' : '4. Registro y Cuenta'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Account Creation' : 'Creación de Cuenta'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'To access certain features, you may need to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.'
                  : 'Para acceder a ciertas funciones, es posible que necesites crear una cuenta. Te comprometes a proporcionar información precisa, actual y completa durante el registro y a actualizar dicha información para mantenerla precisa, actual y completa.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Account Security' : 'Seguridad de la Cuenta'}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isEnglish
                  ? 'You are responsible for:'
                  : 'Eres responsable de:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>{isEnglish ? 'Maintaining the confidentiality of your password and account information' : 'Mantener la confidencialidad de tu contraseña e información de cuenta'}</li>
                <li>{isEnglish ? 'All activities that occur under your account' : 'Todas las actividades que ocurran bajo tu cuenta'}</li>
                <li>{isEnglish ? 'Notifying us immediately of any unauthorized use' : 'Notificarnos inmediatamente de cualquier uso no autorizado'}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{isEnglish ? 'Warning:' : 'Advertencia:'}</strong>{' '}
                {isEnglish
                  ? 'DAME Valencia will not be liable for any loss or damage arising from your failure to comply with these security obligations.'
                  : 'DAME Valencia no será responsable de ninguna pérdida o daño derivado de tu incumplimiento de estas obligaciones de seguridad.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eventos e inscripciones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              {isEnglish ? '5. Events and Registrations' : '5. Eventos e Inscripciones'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Event Registration' : 'Registro en Eventos'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'When you register for an event, you agree to:'
                  : 'Cuando te registras en un evento, aceptas:'}
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 mt-3">
                <li>{isEnglish ? 'Provide accurate information' : 'Proporcionar información precisa'}</li>
                <li>{isEnglish ? 'Attend the event if you have registered, or cancel in advance if you cannot attend' : 'Asistir al evento si te has inscrito, o cancelar con antelación si no puedes asistir'}</li>
                <li>{isEnglish ? 'Follow the rules and guidelines of the event' : 'Seguir las reglas y directrices del evento'}</li>
                <li>{isEnglish ? 'Respect other participants and organizers' : 'Respetar a otros participantes y organizadores'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Event Changes and Cancellations' : 'Cambios y Cancelaciones de Eventos'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'DAME Valencia reserves the right to modify, postpone, or cancel any event at any time. We will make reasonable efforts to notify registered participants of any changes. If an event is canceled, we will attempt to notify you and may offer alternative activities when possible.'
                  : 'DAME Valencia se reserva el derecho de modificar, posponer o cancelar cualquier evento en cualquier momento. Haremos esfuerzos razonables para notificar a los participantes registrados sobre cualquier cambio. Si un evento es cancelado, intentaremos notificarte y podremos ofrecer actividades alternativas cuando sea posible.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Fees and Payments' : 'Tarifas y Pagos'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'Some events may require payment. All fees will be clearly indicated before registration. Payments are processed securely, and refund policies will be stated for each event if applicable.'
                  : 'Algunos eventos pueden requerir pago. Todas las tarifas se indicarán claramente antes del registro. Los pagos se procesan de forma segura, y las políticas de reembolso se indicarán para cada evento si corresponde.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Propiedad intelectual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              {isEnglish ? '6. Intellectual Property' : '6. Propiedad Intelectual'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Our Content' : 'Nuestro Contenido'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'All content on our platform, including text, graphics, logos, images, audio, video, and software, is the property of DAME Valencia or its content suppliers and is protected by Spanish and international copyright laws.'
                  : 'Todo el contenido en nuestra plataforma, incluidos textos, gráficos, logotipos, imágenes, audio, video y software, es propiedad de DAME Valencia o sus proveedores de contenido y está protegido por las leyes de derechos de autor españolas e internacionales.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'User-Generated Content' : 'Contenido Generado por Usuarios'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'By posting or submitting content to our platform, you grant DAME Valencia a non-exclusive, royalty-free, worldwide license to use, reproduce, modify, and display such content for the purposes of operating and promoting our services.'
                  : 'Al publicar o enviar contenido a nuestra plataforma, otorgas a DAME Valencia una licencia no exclusiva, libre de regalías, mundial para usar, reproducir, modificar y mostrar dicho contenido con el fin de operar y promocionar nuestros servicios.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Restrictions' : 'Restricciones'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'You may not copy, reproduce, distribute, or create derivative works from our content without express written permission from DAME Valencia.'
                  : 'No puedes copiar, reproducir, distribuir o crear trabajos derivados de nuestro contenido sin el permiso escrito expreso de DAME Valencia.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitación de responsabilidad */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              {isEnglish ? '7. Limitation of Liability' : '7. Limitación de Responsabilidad'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-sm text-muted-foreground mb-3">
                <strong>{isEnglish ? 'Important Notice:' : 'Aviso Importante:'}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'DAME Valencia provides its services "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free.'
                  : 'DAME Valencia proporciona sus servicios "tal cual" y "según disponibilidad" sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que nuestros servicios sean ininterrumpidos, seguros o libres de errores.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'No Liability for Damages' : 'Sin Responsabilidad por Daños'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'To the maximum extent permitted by law, DAME Valencia shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.'
                  : 'En la máxima medida permitida por la ley, DAME Valencia no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, o cualquier pérdida de ganancias o ingresos, ya sea incurrido directa o indirectamente, o cualquier pérdida de datos, uso, buena voluntad u otras pérdidas intangibles resultantes de tu uso de nuestros servicios.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{isEnglish ? 'Event Participation' : 'Participación en Eventos'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'Participation in events and activities is at your own risk. DAME Valencia is not responsible for any injury, loss, or damage that may occur during participation in our events, unless caused by our gross negligence or willful misconduct.'
                  : 'La participación en eventos y actividades es bajo tu propio riesgo. DAME Valencia no es responsable de ninguna lesión, pérdida o daño que pueda ocurrir durante la participación en nuestros eventos, a menos que sea causado por nuestra negligencia grave o mala conducta intencional.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indemnización */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEnglish ? '8. Indemnification' : '8. Indemnización'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isEnglish
                ? 'You agree to indemnify, defend, and hold harmless DAME Valencia, its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney\'s fees) arising from: (a) your use of our services; (b) your violation of these Terms; (c) your violation of any third party right; or (d) any content you submit or post on our platform.'
                : 'Te comprometes a indemnizar, defender y mantener indemne a DAME Valencia, sus funcionarios, directores, empleados y agentes de y contra todos y cada uno de los reclamos, daños, obligaciones, pérdidas, responsabilidades, costos o deudas, y gastos (incluidos los honorarios de abogados) que surjan de: (a) tu uso de nuestros servicios; (b) tu violación de estos Términos; (c) tu violación de cualquier derecho de terceros; o (d) cualquier contenido que envíes o publiques en nuestra plataforma.'}
            </p>
          </CardContent>
        </Card>

        {/* Modificaciones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              {isEnglish ? '9. Modifications to Terms' : '9. Modificaciones de los Términos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isEnglish
                ? 'DAME Valencia reserves the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.'
                : 'DAME Valencia se reserva el derecho de modificar estos Términos en cualquier momento. Notificaremos a los usuarios sobre cualquier cambio material publicando los Términos actualizados en nuestro sitio web y actualizando la fecha de "Última actualización". Tu uso continuo de nuestros servicios después de tales modificaciones constituye la aceptación de los Términos actualizados.'}
            </p>
          </CardContent>
        </Card>

        {/* Terminación */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEnglish ? '10. Termination' : '10. Terminación'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              {isEnglish
                ? 'We reserve the right to suspend or terminate your access to our services, with or without notice, for any reason, including if you violate these Terms. Upon termination, your right to use our services will immediately cease.'
                : 'Nos reservamos el derecho de suspender o terminar tu acceso a nuestros servicios, con o sin previo aviso, por cualquier motivo, incluida la violación de estos Términos. Al terminar, tu derecho a usar nuestros servicios cesará inmediatamente.'}
            </p>
            <p className="text-muted-foreground">
              {isEnglish
                ? 'You may also terminate your account at any time by contacting us at the email address provided below.'
                : 'También puedes terminar tu cuenta en cualquier momento contactándonos en la dirección de correo electrónico proporcionada a continuación.'}
            </p>
          </CardContent>
        </Card>

        {/* Ley aplicable */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEnglish ? '11. Governing Law' : '11. Ley Aplicable'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isEnglish
                ? 'These Terms shall be governed by and construed in accordance with the laws of Spain, without regard to its conflict of law provisions. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts of Valencia, Spain.'
                : 'Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflicto de leyes. Cualquier disputa que surja de estos Términos o nuestros servicios estará sujeta a la jurisdicción exclusiva de los tribunales de Valencia, España.'}
            </p>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? '12. Contact Information' : '12. Información de Contacto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {isEnglish
                ? 'If you have any questions about these Terms, please contact us:'
                : 'Si tienes preguntas sobre estos Términos, por favor contáctanos:'}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Email' : 'Correo electrónico'}</p>
                  <a href="mailto:legal@damevalencia.es" className="text-purple-600 hover:underline text-sm">
                    legal@damevalencia.es
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Location' : 'Ubicación'}</p>
                  <p className="text-sm text-muted-foreground">Valencia, España</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Association' : 'Asociación'}</p>
                  <p className="text-sm text-muted-foreground">DAME Valencia - Asociación de Diversidad e Integración Cultural</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} DAME Valencia. {isEnglish ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="/" className="text-purple-600 hover:underline">
              {isEnglish ? 'Home' : 'Inicio'}
            </a>
            <span>•</span>
            <a href="/privacy" className="text-purple-600 hover:underline">
              {isEnglish ? 'Privacy Policy' : 'Política de Privacidad'}
            </a>
            <span>•</span>
            <a href="/cookies" className="text-purple-600 hover:underline">
              {isEnglish ? 'Cookie Policy' : 'Política de Cookies'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;




