import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, TrendingUp, Calendar, Award, Music, Heart, Dumbbell, Palette, MessageSquare, Mail, MessageCircle, FileText } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 dame-text-gradient">
            HOLA, SOMOS LA ASOCIACIÓN DAME
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Somos una comunidad vibrante y diversa, unida por el amor al <strong>arte</strong>, la <strong>cultura</strong> y el <strong>movimiento</strong>.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-6 leading-relaxed">
            A través de talleres, eventos y proyectos innovadores, buscamos fomentar la <strong>creatividad</strong>, la <strong>inclusión</strong> y el <strong>bienestar</strong> de todos nuestros miembros.
          </p>
          <p className="text-xl text-purple-700 dark:text-purple-300 max-w-3xl mx-auto mt-8 italic font-medium">
            "Nuestra asociación es un espacio donde las mentes se expanden, los corazones se conectan y los sueños cobran vida."
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold dame-text-gradient mb-2">6</div>
              <p className="text-sm text-muted-foreground">Proyectos enfocados al arte, la cultura, el bienestar de Valencia</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold dame-text-gradient mb-2">10K+</div>
              <p className="text-sm text-muted-foreground">Participantes de más de 50 países diferentes</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold dame-text-gradient mb-2">300+</div>
              <p className="text-sm text-muted-foreground">Eventos organizados de diferente índole en la comunidad de Valencia</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold dame-text-gradient mb-2">100+</div>
              <p className="text-sm text-muted-foreground">Instructores, músicos, bailarines, artistas y colaboradores</p>
            </CardContent>
          </Card>
        </div>

        {/* Nuestros Proyectos */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 dame-text-gradient">
            Nuestros Proyectos
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Trabajamos duro para alcanzar un impacto firme y duradero en las personas de Valencia, España y el mundo. 
            Cada proyecto que creamos tiene personalidad propia y un profundo mensaje que nos gustaría compartir con cada persona.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* DAME CASINO */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">💃</div>
                  <div>
                    <CardTitle className="text-white">DAME CASINO</CardTitle>
                    <p className="text-purple-100 text-sm">Promoción y difusión de la música cubana</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Es un proyecto cultural cuyo objetivo principal es la <strong>promoción</strong> y <strong>difusión</strong> 
                  de la <strong>música cubana</strong> en la ciudad de <strong>Valencia</strong>. A través de talleres, 
                  eventos sociales y conferencias, fomentamos la práctica del baile de casino y la inmersión en la rica cultura cubana.
                </p>
              </CardContent>
            </Card>

            {/* DAME BACHATA */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-pink-500 to-red-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🕺</div>
                  <div>
                    <CardTitle className="text-white">DAME BACHATA</CardTitle>
                    <p className="text-pink-100 text-sm">Propuesta pedagógica para promover la bachata</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Es una propuesta pedagógica y social destinada a promover la práctica de la <strong>bachata</strong> en <strong>Valencia</strong>. 
                  A través de clases y talleres de diversos niveles, ofrecemos a nuestros alumnos la oportunidad de <strong>aprender</strong> 
                  esta danza y <strong>disfrutar</strong> de sus beneficios físicos y sociales.
                </p>
              </CardContent>
            </Card>

            {/* DAME FIT */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">⚽</div>
                  <div>
                    <CardTitle className="text-white">DAME FIT</CardTitle>
                    <p className="text-green-100 text-sm">Programa de actividad física</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Es un programa de <strong>actividad física</strong> que busca <strong>mejorar la calidad de vida</strong> 
                  de los habitantes de Valencia. A través de una amplia oferta de clases y actividades, gratuitas y de pago, 
                  promovemos la salud y el bienestar físico y mental de nuestros participantes.
                </p>
              </CardContent>
            </Card>

            {/* DAME APOYO */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🤝</div>
                  <div>
                    <CardTitle className="text-white">DAME APOYO</CardTitle>
                    <p className="text-blue-100 text-sm">Iniciativa social para salud mental y apoyo a migrantes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Es una iniciativa social que trata temas sobre la <strong>salud mental y la psicología</strong>, 
                  o el apoyo a personas migrantes tanto en talleres sobre duelo migratorio como creando conexiones 
                  con otras asociaciones que presten apoyo con respecto a trámites y extranjería.
                </p>
              </CardContent>
            </Card>

            {/* DAME MÚSICA */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎵</div>
                  <div>
                    <CardTitle className="text-white">DAME MÚSICA</CardTitle>
                    <p className="text-orange-100 text-sm">Fomento de la creación y difusión musical</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Es un proyecto cultural que fomenta la <strong>creación y difusión musical</strong> en Valencia. 
                  A través de micrófonos abiertos, conciertos y charlas, ofrecemos un espacio para que músicos 
                  emergentes y aficionados puedan <strong>expresarse y compartir su pasión por la música</strong>.
                </p>
              </CardContent>
            </Card>

            {/* DAME ARTE */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎨</div>
                  <div>
                    <CardTitle className="text-white">DAME ARTE</CardTitle>
                    <p className="text-purple-100 text-sm">Fomento del desarrollo artístico y cultural</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Este programa tiene como objetivo principal <strong>fomentar el desarrollo artístico y cultural de la comunidad</strong>, 
                  proporcionando un espacio para la expresión creativa y la experimentación artística. A través de talleres, 
                  residencias y exposiciones, buscamos impulsar el talento local.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Programa de Prácticas */}
        <Card className="mb-16 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-8 w-8 text-purple-600" />
              <CardTitle className="text-3xl">¿ERES ESTUDIANTE EN EUROPA Y QUIERES HACER TUS PRÁCTICAS CON DAME?</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Te invitamos a crear un impacto en el mundo y en la comunidad Valenciana a través de nuestro programa de prácticas.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Requisitos
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Tener ganas de colaborar para impactar en las comunidades de arte, baile y fit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Poder realizar prácticas en Valencia de forma presencial y/o remota.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Hablar Inglés y/o Español.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Poder estar apto dentro de la universidad a la realización de prácticas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Ser de carreras afines: Informática, marketing, turismo, comunicación, organización de eventos, ayuda social, danza, música, etc.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Contacto Directo
              </h3>
              <p className="text-muted-foreground mb-2">
                Si tienes interés en esta propuesta, escríbenos directamente a:
              </p>
              <a 
                href="mailto:admin@organizaciondame.org" 
                className="text-lg font-semibold text-purple-600 hover:underline flex items-center gap-2"
              >
                <Mail className="h-5 w-5" />
                admin@organizaciondame.org
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Te contestaremos en breve con toda la información necesaria.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Contáctanos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Linktree</h3>
                <a 
                  href="https://linktr.ee/asociaciondame" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  @asociaciondame
                </a>
              </div>

              <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <a 
                  href="https://wa.me/34658236665?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20DAME%20Valencia" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline font-medium"
                >
                  (+34) 658 23 66 65
                </a>
              </div>

              <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <a 
                  href="mailto:admin@organizaciondame.org" 
                  className="text-purple-600 hover:underline"
                >
                  admin@organizaciondame.org
                </a>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                <strong>CIF:</strong> G56138217
              </p>
              <p className="text-sm text-muted-foreground">
                Hecho con ❤️ en <strong>Valencia, España</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-4">
            <a href="/" className="text-purple-600 hover:underline">
              Inicio
            </a>
            <span>•</span>
            <a href="/cookies" className="text-purple-600 hover:underline">
              Política de Cookies
            </a>
            <span>•</span>
            <a href="/privacy" className="text-purple-600 hover:underline">
              Política de Privacidad
            </a>
          </div>
          <p>© {new Date().getFullYear()} DAME Valencia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

