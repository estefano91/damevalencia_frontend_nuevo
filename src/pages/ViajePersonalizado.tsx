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
  Calendar,
  Home,
  Users,
  Map,
  FileText,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/tienda";

// Portada: Torres de Serranos, Valencia (imagen local)
const HERO_IMAGE_VALENCIA = "/portada-valencia.png";
const HERO_IMAGE_FALLBACK = "/dame.png";
// Tarjeta detalles: imagen local para que siempre cargue
const SIDEBAR_IMAGE = "/dame.png";

const TRIP_SERVICES: Array<{
  id: string;
  name_es: string;
  name_en: string;
  icon: LucideIcon;
}> = [
  {
    id: "eventos",
    name_es: "Acceso a eventos DAME (plan familiar, plan pareja, plan fiesta)",
    name_en: "DAME events access (family plan, couple plan, party plan)",
    icon: Calendar,
  },
  {
    id: "alojamiento",
    name_es: "Asesoramiento para alojamiento (pisos, zonas, estancias cortas o largas)",
    name_en: "Accommodation advice (apartments, areas, short or long stays)",
    icon: Home,
  },
  {
    id: "comunidad",
    name_es: "Conexión con la comunidad DAME — internacional y locales (ideal para conocer gente nueva)",
    name_en: "Connection with DAME community — international & locals (great for meeting new people)",
    icon: Users,
  },
  {
    id: "experiencias",
    name_es: "Experiencias y planes recomendados (plan familiar, pareja, fiestas, dónde comer, rutas, etc.)",
    name_en: "Recommended experiences and plans (family, couple, parties, where to eat, routes, etc.)",
    icon: Map,
  },
  {
    id: "practico",
    name_es: "Información práctica (transporte, trámites, documentación)",
    name_en: "Practical info (transport, paperwork, documentation)",
    icon: FileText,
  },
  {
    id: "otro",
    name_es: "Otro (especificar en comentarios)",
    name_en: "Other (specify in comments)",
    icon: HelpCircle,
  },
];

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const ViajePersonalizado = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fechas, setFechas] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [heroImage, setHeroImage] = useState(HERO_IMAGE_VALENCIA);

  const toggleService = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    lines.push(isEnglish ? "Services I'm interested in:" : "Servicios que me interesan:");
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
        {/* Intro: texto claro y legible */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-gray-800/90 border border-stone-200 dark:border-stone-600 shadow-sm px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-100 font-medium">
            {isEnglish
              ? "Choose the DAME services you need. We'll put together a tailored pack for you — send us your selection via WhatsApp when you're ready."
              : "Elige los servicios DAME que necesitas. Prepararemos un pack a tu medida; envíanos tu selección por WhatsApp cuando estés listo."}
          </p>
        </div>

        {/* Badge seleccionados */}
        {selectedServices.length > 0 && (
          <div className="mb-5 flex items-center justify-center sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-purple-200/80 dark:border-purple-700/50 px-4 py-2 text-xs font-medium text-purple-800 dark:text-purple-200 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              {selectedServices.length}{" "}
              {isEnglish
                ? selectedServices.length === 1 ? "service selected" : "services selected"
                : selectedServices.length === 1 ? "servicio seleccionado" : "servicios seleccionados"}
            </span>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Servicios: tarjetas elegantes */}
          <Card className="border border-stone-200/80 dark:border-stone-700/50 bg-white dark:bg-gray-800/95 backdrop-blur-sm shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="py-4 px-4 sm:py-5 sm:px-6 border-b border-stone-100 dark:border-stone-700/50">
              <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-stone-800 dark:text-stone-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                {isEnglish ? "Services that interest me" : "Servicios que me interesan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
              {TRIP_SERVICES.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedIds.has(service.id);
                return (
                  <div
                    key={service.id}
                    className={`flex items-start gap-3 rounded-2xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.99] min-h-[48px] sm:min-h-0 border ${
                      isSelected
                        ? "border-purple-400/60 bg-purple-50/80 dark:bg-purple-900/20 dark:border-purple-500/50 shadow-sm"
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
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "bg-purple-600 text-white" : "bg-stone-200/80 dark:bg-stone-600/50 text-stone-500 dark:text-stone-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <Label
                        htmlFor={service.id}
                        className="text-xs sm:text-sm font-medium leading-snug cursor-pointer flex-1 pt-0.5 text-stone-700 dark:text-stone-200"
                      >
                        {isEnglish ? service.name_en : service.name_es}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

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
