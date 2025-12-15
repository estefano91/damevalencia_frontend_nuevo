import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Volleyball, 
  Music, 
  Box, 
  Phone, 
  Mail, 
  Globe,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import WhatsAppIcon from "@/assets/WhatsApp.svg.webp";

const Alquiler = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const whatsappNumber = "34644070282";
  const rentalMessage = isEnglish
    ? "Hello, I would like information about equipment rental"
    : "Hola, me gustaría información sobre alquiler de material";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rentalMessage)}`;

  const volleyEquipment = isEnglish
    ? [
        "Volleyball nets and posts",
        "Official size volleyballs",
        "Court markers and boundary lines",
        "Antennas and referee equipment",
        "Scoreboards",
        "First aid kits for sports"
      ]
    : [
        "Redes y postes de voleibol",
        "Balones de voleibol (tamaño oficial)",
        "Marcadores de cancha y líneas de límite",
        "Antenas y material de árbitro",
        "Marcadores de puntuación",
        "Botiquines de primeros auxilios deportivos"
      ];

  const soundEquipment = isEnglish
    ? [
        "PA systems and speakers",
        "Microphones (wired and wireless)",
        "Mixing consoles",
        "Audio cables and accessories",
        "DJ equipment (turntables, controllers)",
        "Stage monitors",
        "Subwoofers and amplifiers",
        "Wireless microphone systems"
      ]
    : [
        "Sistemas de megafonía y altavoces",
        "Micrófonos (con cable e inalámbricos)",
        "Mesas de mezclas",
        "Cables de audio y accesorios",
        "Equipo de DJ (platos, controladores)",
        "Monitores de escenario",
        "Subwoofers y amplificadores",
        "Sistemas de micrófonos inalámbricos"
      ];

  const otherEquipment = isEnglish
    ? [
        "Tables and chairs",
        "Projectors and screens",
        "Lighting equipment",
        "Tents and canopies",
        "Sports equipment (various)",
        "Decoration materials",
        "Sound barriers and panels",
        "Portable stages"
      ]
    : [
        "Mesas y sillas",
        "Proyectores y pantallas",
        "Equipamiento de iluminación",
        "Carpas y toldos",
        "Material deportivo (varios)",
        "Material de decoración",
        "Barreras acústicas y paneles",
        "Escenarios portátiles"
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 dame-text-gradient">
            {isEnglish ? "Equipment Rental" : "Alquiler de Material"}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {isEnglish
              ? "DAME Valencia offers equipment rental services for your events and activities. We have everything you need to make your event a success."
              : "DAME Valencia ofrece servicios de alquiler de material para tus eventos y actividades. Tenemos todo lo que necesitas para que tu evento sea un éxito."}
          </p>
        </div>

        {/* Información importante */}
        <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {isEnglish ? "Important Information" : "Información Importante"}
                </h3>
                <p className="text-muted-foreground">
                  {isEnglish
                    ? "Please contact us in advance to check availability and reserve equipment. Prices may vary depending on the duration and type of event. We recommend booking at least one week in advance."
                    : "Por favor, contáctanos con antelación para consultar disponibilidad y reservar material. Los precios pueden variar según la duración y tipo de evento. Recomendamos reservar con al menos una semana de antelación."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Material de Volley */}
        <Card className="mb-6 hover:shadow-xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-center gap-3">
              <Volleyball className="h-8 w-8" />
              <div>
                <CardTitle className="text-white text-2xl">
                  {isEnglish ? "Volleyball Equipment" : "Material de Volley"}
                </CardTitle>
                <p className="text-orange-100 text-sm mt-1">
                  {isEnglish ? "Complete volleyball equipment for your matches" : "Equipamiento completo de voleibol para tus partidos"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-2">
              {volleyEquipment.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipo de Sonido */}
        <Card className="mb-6 hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8" />
              <div>
                <CardTitle className="text-white text-2xl">
                  {isEnglish ? "Sound Equipment" : "Equipo de Sonido"}
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  {isEnglish ? "Professional sound systems for events" : "Sistemas de sonido profesionales para eventos"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-2">
              {soundEquipment.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Otros Materiales */}
        <Card className="mb-8 hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
            <div className="flex items-center gap-3">
              <Box className="h-8 w-8" />
              <div>
                <CardTitle className="text-white text-2xl">
                  {isEnglish ? "Other Equipment" : "Otros Materiales"}
                </CardTitle>
                <p className="text-green-100 text-sm mt-1">
                  {isEnglish ? "Additional equipment for your events" : "Material adicional para tus eventos"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-2">
              {otherEquipment.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <img 
                    src={WhatsAppIcon} 
                    alt="WhatsApp" 
                    className="h-8 w-8"
                  />
                </div>
              </div>
              <h3 className="font-semibold mb-2">
                {isEnglish ? "WhatsApp" : "WhatsApp"}
              </h3>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline font-medium block mb-3"
              >
                (+34) 644 070 282
              </a>
              <Button 
                asChild
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Contact via WhatsApp" : "Contactar por WhatsApp"}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">
                {isEnglish ? "Email" : "Correo Electrónico"}
              </h3>
              <a 
                href="mailto:admin@organizaciondame.org"
                className="text-purple-600 dark:text-purple-400 hover:underline block mb-3 break-all"
              >
                admin@organizaciondame.org
              </a>
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <a href="mailto:admin@organizaciondame.org">
                  {isEnglish ? "Send Email" : "Enviar Email"}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">
                {isEnglish ? "Website" : "Sitio Web"}
              </h3>
              <a 
                href="https://organizaciondame.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline block mb-3"
              >
                organizaciondame.org
              </a>
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <a 
                  href="https://organizaciondame.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isEnglish ? "Visit Website" : "Visitar Web"}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default Alquiler;

