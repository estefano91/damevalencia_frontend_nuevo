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

// Imágenes de alta calidad (Unsplash) - Valencia / viajes
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80";
const SIDEBAR_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-gray-900 overflow-x-hidden">
      {/* Hero: altura fija en móvil, más espacio para texto */}
      <div className="relative h-44 min-h-[180px] sm:h-52 md:h-64 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Valencia"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end pb-5 pt-14 px-4 sm:p-6 sm:pb-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate("/tienda")}
            className="absolute top-4 left-4 rounded-full h-10 w-10 bg-white/95 dark:bg-gray-900/95 hover:bg-white shadow-lg touch-manipulation"
            aria-label={isEnglish ? "Back to store" : "Volver a la tienda"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            {isEnglish ? "Custom trip" : "Viaje personalizado"}
          </h1>
          <p className="text-xs text-white/95 mt-0.5 max-w-md sm:text-sm md:text-base">
            {isEnglish
              ? "Your season in Valencia, tailored to you."
              : "Tu temporada en Valencia, a tu medida."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 pb-24 sm:pb-12 relative z-10 max-w-4xl">
        {/* Intro con estilo destacado */}
        <div className="mb-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 px-4 py-3 shadow-sm sm:px-5 sm:py-4">
          <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
            {isEnglish
              ? "Choose the DAME services you need. We'll put together a tailored pack for you — send us your selection via WhatsApp when you're ready."
              : "Elige los servicios DAME que necesitas. Prepararemos un pack a tu medida; envíanos tu selección por WhatsApp cuando estés listo."}
          </p>
        </div>

        {/* Badge seleccionados (solo si hay alguno) */}
        {selectedServices.length > 0 && (
          <div className="mb-4 flex items-center justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 text-xs font-medium text-purple-800 dark:text-purple-200">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              {selectedServices.length}{" "}
              {isEnglish
                ? selectedServices.length === 1 ? "service selected" : "services selected"
                : selectedServices.length === 1 ? "servicio seleccionado" : "servicios seleccionados"}
            </span>
          </div>
        )}

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {/* Servicios: tarjetas más compactas en móvil, buen touch */}
          <Card className="border border-purple-100 dark:border-purple-900/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl shadow-purple-500/5 rounded-2xl overflow-hidden">
            <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-b">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                {isEnglish ? "Services that interest me" : "Servicios que me interesan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3">
              {TRIP_SERVICES.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedIds.has(service.id);
                return (
                  <div
                    key={service.id}
                    className={`flex items-start gap-2.5 sm:gap-3 rounded-xl border-2 p-2.5 sm:p-3 transition-all cursor-pointer touch-manipulation active:scale-[0.99] min-h-[44px] sm:min-h-0 ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/25 dark:border-purple-500/70 shadow-sm"
                        : "border-transparent bg-muted/30 hover:bg-muted/50 dark:bg-gray-800/50"
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
                      className="mt-1 sm:mt-0.5 shrink-0"
                    />
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <Label
                        htmlFor={service.id}
                        className="text-xs sm:text-sm font-medium leading-snug cursor-pointer flex-1 pt-0.5"
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
            <Card className="border border-purple-100 dark:border-purple-900/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl shadow-purple-500/5 rounded-2xl overflow-hidden">
              <div className="relative h-28 sm:h-36 overflow-hidden">
                <img
                  src={SIDEBAR_IMAGE}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4">
                  <CardTitle className="text-base sm:text-lg text-foreground drop-shadow-md">
                    {isEnglish ? "Additional details" : "Detalles adicionales"}
                  </CardTitle>
                </div>
              </div>
              <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="fechas" className="text-xs sm:text-sm">
                    {isEnglish ? "Approximate dates" : "Fechas previstas"} ({isEnglish ? "optional" : "opcional"})
                  </Label>
                  <Input
                    id="fechas"
                    placeholder={isEnglish ? "e.g. March–May 2025" : "ej. Marzo–Mayo 2025"}
                    value={fechas}
                    onChange={(e) => setFechas(e.target.value)}
                    className="rounded-xl h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="comentarios" className="text-xs sm:text-sm">
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
                    className="resize-none rounded-xl text-sm sm:rows-4"
                  />
                </div>

                {/* CTA: en desktop aquí, en móvil también pero además sticky abajo */}
                <a
                  href={canSend ? buildWhatsAppUrl(whatsappMessage) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden sm:block ${!canSend ? "pointer-events-none opacity-60" : ""}`}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-11 text-base shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30"
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

      {/* CTA fijo en móvil: siempre visible al hacer scroll */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 sm:hidden">
        <a
          href={canSend ? buildWhatsAppUrl(whatsappMessage) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={!canSend ? "pointer-events-none opacity-70 block" : "block"}
        >
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-12 text-base font-semibold shadow-lg shadow-purple-500/30"
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
