import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Home,
  FileText,
  HelpCircle,
  Music,
  Leaf,
  UtensilsCrossed,
  PartyPopper,
  MapPinned,
  User,
  Heart,
  Users,
  ChefHat,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/tienda";

// Portada: Torres de Serranos, Valencia (imagen local)
const HERO_IMAGE_VALENCIA = "/portada-valencia.png";
const HERO_IMAGE_FALLBACK = "/dame.png";
const SIDEBAR_IMAGE = "/dame.png";

// ¿Para quién es el viaje? (pueden elegir varios)
const TRIP_AUDIENCE: Array<{ id: string; name_es: string; name_en: string; icon: LucideIcon }> = [
  { id: "individual", name_es: "Viaje individual", name_en: "Solo trip", icon: User },
  { id: "pareja", name_es: "En pareja", name_en: "Couple", icon: Heart },
  { id: "amigos", name_es: "Con amigos", name_en: "Friends", icon: Users },
  { id: "despedida", name_es: "Despedida de soltero/a", name_en: "Stag / hen party", icon: PartyPopper },
];

// Servicios que puede incluir el pack (orden: base → descubrir → gastronomía → experiencias → otro)
const TRIP_SERVICES: Array<{
  id: string;
  name_es: string;
  name_en: string;
  icon: LucideIcon;
}> = [
  // Base: alojamiento y trámites
  { id: "alojamiento", name_es: "Asesoramiento alojamiento", name_en: "Accommodation advice", icon: Home },
  { id: "practico", name_es: "Información práctica (trámites, documentación)", name_en: "Practical info (paperwork, documentation)", icon: FileText },
  // Descubrir la ciudad
  { id: "visitas-guiadas", name_es: "Visitas guiadas", name_en: "Guided tours", icon: MapPinned },
  // Gastronomía
  { id: "tapas", name_es: "Rutas de tapas", name_en: "Tapas routes", icon: UtensilsCrossed },
  { id: "gastronomia", name_es: "Experiencia gastronómica (cena, taller de cocina)", name_en: "Gastronomic experience (dinner, cooking workshop)", icon: ChefHat },
  // Experiencias y ocio
  { id: "bachata-salsa", name_es: "Cursos privados bachata / salsa", name_en: "Private bachata / salsa lessons", icon: Music },
  { id: "zen", name_es: "Actividades zen", name_en: "Zen activities", icon: Leaf },
  { id: "eventos-ocio", name_es: "Eventos y ocio (conciertos, planes de noche)", name_en: "Events and leisure (concerts, night plans)", icon: Sparkles },
  // Otro
  { id: "otro", name_es: "Otro (especificar en comentarios)", name_en: "Other (specify in comments)", icon: HelpCircle },
];

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const ViajePersonalizado = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");

  const [selectedAudience, setSelectedAudience] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fechas, setFechas] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [heroImage, setHeroImage] = useState(HERO_IMAGE_VALENCIA);

  const toggleAudience = (id: string) => {
    setSelectedAudience((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleService = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAudienceList = TRIP_AUDIENCE.filter((a) => selectedAudience.has(a.id));
  const selectedServices = TRIP_SERVICES.filter((s) => selectedIds.has(s.id));
  const canSend = selectedServices.length > 0;

  const whatsappMessage = (() => {
    const lines: string[] = [];
    lines.push(
      isEnglish
        ? "Hello! I'd like to request a custom trip pack to Valencia:"
        : "¡Hola! Me gustaría solicitar un pack de viaje personalizado a Valencia:"
    );
    lines.push("");
    if (selectedAudienceList.length > 0) {
      lines.push(isEnglish ? "For whom:" : "¿Para quién?:");
      selectedAudienceList.forEach((a) => {
        lines.push(`• ${isEnglish ? a.name_en : a.name_es}`);
      });
      lines.push("");
    }
    lines.push(isEnglish ? "Services I need:" : "Servicios que necesito:");
    selectedServices.forEach((s) => {
      lines.push(`• ${isEnglish ? s.name_en : s.name_es}`);
    });
    if (fechas.trim()) {
      lines.push("");
      lines.push(
        isEnglish ? `Approximate dates: ${fechas.trim()}` : `Fechas previstas: ${fechas.trim()}`
      );
    }
    if (comentarios.trim()) {
      lines.push("");
      lines.push(
        isEnglish ? `Comments / reason for trip: ${comentarios.trim()}` : `Comentarios o motivo del viaje: ${comentarios.trim()}`
      );
    }
    lines.push("");
    lines.push(isEnglish ? "Thank you!" : "¡Gracias!");
    return lines.join("\n");
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50/30 to-stone-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 overflow-x-hidden">
      {/* Hero: imagen de portada (fallback local si no carga) */}
      <div className="relative h-48 min-h-[200px] sm:h-56 md:h-72 overflow-hidden">
        <img
          src={heroImage}
          alt="Valencia"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 bg-stone-200 dark:bg-stone-800"
          onError={() => setHeroImage(HERO_IMAGE_FALLBACK)}
        />
        {/* Overlay oscuro en toda la zona inferior para que el texto no se mezcle con la imagen */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.2) 60%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-6 pt-14 px-4 sm:p-8 sm:pb-8">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate("/tienda")}
            className="absolute top-4 left-4 rounded-full h-10 w-10 bg-white/95 dark:bg-gray-900/95 hover:bg-white border-0 shadow-lg touch-manipulation backdrop-blur-sm"
            aria-label={isEnglish ? "Back to store" : "Volver a la tienda"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {/* Bloque de texto con fondo semitransparente para garantizar legibilidad */}
          <div className="rounded-lg bg-black/20 backdrop-blur-[2px] -mx-1 px-4 py-3 sm:px-5 sm:py-4 sm:-mx-3 max-w-xl">
            <span
              className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-white/90 mb-2 block"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
            >
              Valencia
            </span>
            <h1
              className="text-2xl font-semibold leading-tight text-white tracking-tight sm:text-4xl md:text-5xl"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)" }}
            >
              {isEnglish ? "Custom trip" : "Viaje personalizado"}
            </h1>
            <div className="mt-2 w-12 h-px bg-white/70 rounded-full" />
            <p
              className="text-sm text-white mt-2 max-w-md font-light sm:text-base"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)" }}
            >
              {isEnglish
                ? "Your season in Valencia, tailored to you."
                : "Tu temporada en Valencia, a tu medida."}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 -mt-5 sm:-mt-10 pb-24 sm:pb-14 relative z-10 max-w-4xl">
        {/* Intro: para quién y qué servicios */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-stone-200 dark:border-stone-600 shadow-sm px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-100 font-medium">
            {isEnglish
              ? "We have options for solo trips, couples, friends or stag/hen parties. Choose who the trip is for and the services you need — we'll put together a tailored pack."
              : "Tenemos opciones para viajes individuales, en pareja, con amigos o despedidas de soltero/a. Elige para quién es el viaje y los servicios que necesitas; prepararemos un pack a tu medida."}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Columna izquierda: ¿Para quién? + Servicios */}
          <div className="space-y-6">
            {/* Sección: ¿Para quién es el viaje? */}
            <Card className="border border-stone-200/80 dark:border-stone-700/50 bg-white dark:bg-gray-800/95 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-stone-100 dark:border-stone-700/50">
                <CardTitle className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100">
                  {isEnglish ? "Who is the trip for?" : "¿Para quién es el viaje?"}
                </CardTitle>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {isEnglish ? "You can select more than one." : "Puedes elegir más de uno."}
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {TRIP_AUDIENCE.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedAudience.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAudience(item.id)}
                        className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200 touch-manipulation min-h-[52px] ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/25 dark:border-purple-500/70"
                            : "border-stone-200 dark:border-stone-600 bg-stone-50/50 dark:bg-stone-800/30 hover:border-stone-300 dark:hover:border-stone-500"
                        }`}
                      >
                        <div
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-purple-600 text-white" : "bg-stone-200 dark:bg-stone-600 text-stone-500"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 truncate">
                          {isEnglish ? item.name_en : item.name_es}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sección: Servicios que necesito */}
            <Card className="border border-stone-200/80 dark:border-stone-700/50 bg-white dark:bg-gray-800/95 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-stone-100 dark:border-stone-700/50">
                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                    <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {isEnglish ? "Services I need" : "Servicios que necesito"}
                </CardTitle>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {isEnglish ? "Select at least one." : "Selecciona al menos uno."}
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-2">
                {TRIP_SERVICES.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedIds.has(service.id);
                  return (
                    <div
                      key={service.id}
                      className={`flex items-center gap-3 rounded-xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer touch-manipulation min-h-[48px] border ${
                        isSelected
                          ? "border-purple-400/60 bg-purple-50/80 dark:bg-purple-900/20 dark:border-purple-500/50"
                          : "border-stone-200/60 dark:border-stone-600/40 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-100/80 dark:hover:bg-stone-700/40"
                      }`}
                      onClick={() => toggleService(service.id)}
                      onKeyDown={(e) => e.key === "Enter" && toggleService(service.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <Checkbox
                        id={service.id}
                        checked={isSelected}
                        onCheckedChange={() => toggleService(service.id)}
                        className="shrink-0"
                      />
                      <div
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-purple-600 text-white" : "bg-stone-200/80 dark:bg-stone-600/50 text-stone-500"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <Label
                        htmlFor={service.id}
                        className="text-xs sm:text-sm font-medium cursor-pointer flex-1 text-stone-700 dark:text-stone-200"
                      >
                        {isEnglish ? service.name_en : service.name_es}
                      </Label>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Detalles + imagen */}
          <div className="space-y-0">
            <Card className="border border-stone-200/80 dark:border-stone-700/50 bg-white dark:bg-gray-800/95 backdrop-blur-sm shadow-lg rounded-3xl overflow-hidden">
              <div className="relative h-32 sm:h-40 overflow-hidden rounded-t-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40">
                <img
                  src={SIDEBAR_IMAGE}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-foreground drop-shadow-md">
                    {isEnglish ? "Additional details" : "Detalles adicionales"}
                  </CardTitle>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fechas" className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                    {isEnglish ? "Approximate dates" : "Fechas previstas"} ({isEnglish ? "optional" : "opcional"})
                  </Label>
                  <Input
                    id="fechas"
                    placeholder={isEnglish ? "e.g. March–May 2025" : "ej. Marzo–Mayo 2025"}
                    value={fechas}
                    onChange={(e) => setFechas(e.target.value)}
                    className="rounded-2xl h-11 border-stone-200 dark:border-stone-600 focus-visible:ring-purple-400/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentarios" className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                    {isEnglish ? "Comments or reason for your trip" : "Comentarios o motivo del viaje"} ({isEnglish ? "optional" : "opcional"})
                  </Label>
                  <Textarea
                    id="comentarios"
                    placeholder={
                      isEnglish
                        ? "Tell us a bit about your plans..."
                        : "Cuéntanos un poco sobre tu plan..."
                    }
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    rows={3}
                    className="resize-none rounded-2xl text-sm border-stone-200 dark:border-stone-600 focus-visible:ring-purple-400/50 sm:rows-4"
                  />
                </div>

                {/* CTA desktop */}
                <a
                  href={canSend ? buildWhatsAppUrl(whatsappMessage) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden sm:block ${!canSend ? "pointer-events-none opacity-60" : ""}`}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-400"
                    disabled={!canSend}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {isEnglish ? "Send request via WhatsApp" : "Enviar solicitud por WhatsApp"}
                  </Button>
                </a>
                {!canSend && (
                  <p className="hidden sm:block text-xs text-muted-foreground text-center">
                    {isEnglish ? "Select at least one service." : "Selecciona al menos un servicio."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA fijo en móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-background via-background/98 to-transparent pt-6 sm:hidden">
        <a
          href={canSend ? buildWhatsAppUrl(whatsappMessage) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={!canSend ? "pointer-events-none opacity-70 block" : "block"}
        >
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!canSend}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {isEnglish ? "Send via WhatsApp" : "Enviar por WhatsApp"}
          </Button>
        </a>
        {!canSend && (
          <p className="text-xs text-muted-foreground text-center mt-1.5">
            {isEnglish ? "Select at least one service above." : "Selecciona al menos un servicio arriba."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ViajePersonalizado;
