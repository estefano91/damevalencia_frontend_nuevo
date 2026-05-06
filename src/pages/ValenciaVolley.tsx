import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VALENCIA_VOLLEY_SLOTS,
  VALENCIA_VOLLEY_DAILY_FEE_EUR,
  VALENCIA_VOLLEY_DEPOSIT_EUR,
  VALENCIA_VOLLEY_DEPOSIT_REQUIRED,
  VALENCIA_VOLLEY_PICKUP_RETURN_ADDRESS,
  VALENCIA_VOLLEY_SHEET_CSV_URL,
  VALENCIA_VOLLEY_TOTAL_NETS,
  fetchValenciaVolleySlotsFromSheet,
  type NetStatus,
  type ValenciaVolleySlot,
} from "@/lib/valenciaVolley";
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, ExternalLink, Users, Volleyball } from "lucide-react";

const RESERVATION_WHATSAPP_URL = "https://wa.me/34658236665";
const WEEKEND_DAILY_FEE_EUR = 25;
const LATE_FEE_EUR_PER_30_MIN = 10;
const LATE_FEE_MAX_EUR = 50;

const STATUS_META: Record<NetStatus, { es: string; en: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { es: "Disponible", en: "Available", badge: "default" },
  pending: { es: "Pendiente", en: "Pending", badge: "secondary" },
  full: { es: "Completo", en: "Full", badge: "outline" },
};

const dateToLabel = (date: string, isEn: boolean) => {
  const parsed = new Date(`${date}T00:00:00`);
  const locale = isEn ? "en-GB" : "es-ES";
  const weekday = parsed.toLocaleDateString(locale, { weekday: "long" });
  const dayMonth = parsed.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
  });
  return `${weekday}, ${dayMonth}`;
};

const toLocalYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getWeekdayShort = (date: string, isEn: boolean) => {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed
    .toLocaleDateString(isEn ? "en-GB" : "es-ES", { weekday: "short" })
    .slice(0, 1)
    .toUpperCase();
};

const getDayNumber = (date: string) => new Date(`${date}T00:00:00`).getDate();

const getMonthTitle = (date: string, isEn: boolean) => {
  const parsed = new Date(`${date}T00:00:00`);
  const month = parsed.toLocaleDateString(isEn ? "en-GB" : "es-ES", {
    month: "long",
  });
  const normalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${normalized} ${parsed.getFullYear()}`;
};

const getNextSevenDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    return toLocalYmd(d);
  });
};

const getDateButtonClass = (availableCount: number, isSelected: boolean) => {
  if (isSelected) return "bg-primary text-primary-foreground border-primary";
  if (availableCount === 0) {
    return "border-slate-300 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900/60";
  }
  if (availableCount <= 2) {
    return "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
  }
  return "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
};

const getCardClassByStatus = (status: NetStatus) => {
  if (status === "available") {
    return "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/15";
  }
  if (status === "pending") {
    return "border-amber-300 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/15";
  }
  return "border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/50";
};

const getStatusHeadline = (status: NetStatus, isEn: boolean) => {
  if (status === "available") {
    return isEn
      ? "Ready to secure this net for your day?"
      : "¿Listo para asegurar esta net para tu día?";
  }
  if (status === "pending") {
    return isEn
      ? "Want to play this day with this net?"
      : "¿Quieres jugar este día con esta net?";
  }
  return isEn
    ? "This net is currently fully assigned."
    : "Esta net está actualmente completa.";
};

const getStatusBody = (status: NetStatus, isEn: boolean) => {
  if (status === "available") {
    return isEn
      ? "Complete the rental and we will coordinate pick-up/return at DAME."
      : "Completa el alquiler y coordinamos la recogida/devolución en DAME.";
  }
  if (status === "pending") {
    return isEn
      ? "This net is pending confirmation. Contact the assigned organizer if you want to join this game."
      : "Esta net está pendiente de confirmación. Contacta con la persona asignada si quieres unirte a este partido.";
  }
  return isEn
    ? "You can still contact the organizer in case a slot opens."
    : "Aun así puedes contactar por si se libera.";
};

const buildRentalRequestMessage = (slot: ValenciaVolleySlot, isEn: boolean) => {
  const isWeekend = [0, 5, 6].includes(new Date(`${slot.date}T00:00:00`).getDay());
  const dailyFee = isWeekend ? WEEKEND_DAILY_FEE_EUR : VALENCIA_VOLLEY_DAILY_FEE_EUR;
  const totalToPayNow = dailyFee + (VALENCIA_VOLLEY_DEPOSIT_REQUIRED ? VALENCIA_VOLLEY_DEPOSIT_EUR : 0);

  if (isEn) {
    return [
      `Hi DAME! I want to rent ${slot.netName} on ${dateToLabel(slot.date, true)} (${slot.startTime}-${slot.endTime}).`,
      "",
      "Rental conditions accepted:",
      `- Daily fee: ${dailyFee}€ (${isWeekend ? "weekend/holiday" : "weekday"}).`,
      VALENCIA_VOLLEY_DEPOSIT_REQUIRED
        ? `- Security deposit: ${VALENCIA_VOLLEY_DEPOSIT_EUR}€ (refundable after return check).`
        : "- Security deposit: not required.",
      `- Late return fee: ${LATE_FEE_EUR_PER_30_MIN}€ per 30 min (max ${LATE_FEE_MAX_EUR}€).`,
      "- Cancellation: free up to 24h, after that 50%.",
      "- Renter is responsible for damages/loss.",
      "",
      "Requested details:",
      "- Full name:",
      "- ID / passport:",
      "- Phone number:",
      "- Estimated pick-up time:",
      "",
      `Total to pay now: ${totalToPayNow}€.`,
    ].join("\n");
  }

  return [
    `Hola DAME, quiero alquilar la ${slot.netName} el ${dateToLabel(slot.date, false)} (${slot.startTime}-${slot.endTime}).`,
    "",
    "Acepto las condiciones de alquiler:",
    `- Fee diario: ${dailyFee}€ (${isWeekend ? "fin de semana/festivo" : "laborable"}).`,
    VALENCIA_VOLLEY_DEPOSIT_REQUIRED
      ? `- Fianza: ${VALENCIA_VOLLEY_DEPOSIT_EUR}€ (reembolsable tras revisión de devolución).`
      : "- Fianza: no requerida.",
    `- Recargo por retraso: ${LATE_FEE_EUR_PER_30_MIN}€ cada 30 min (máximo ${LATE_FEE_MAX_EUR}€).`,
    "- Cancelación: gratis hasta 24h antes, después 50%.",
    "- La persona titular asume responsabilidad por daños/pérdida.",
    "",
    "Datos de solicitud:",
    "- Nombre y apellidos:",
    "- DNI/NIE/Pasaporte:",
    "- Teléfono:",
    "- Hora estimada de recogida:",
    "",
    `Total a pagar ahora: ${totalToPayNow}€.`,
  ].join("\n");
};

const getDailyFeeForDate = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return [0, 5, 6].includes(day) ? WEEKEND_DAILY_FEE_EUR : VALENCIA_VOLLEY_DAILY_FEE_EUR;
};

const ValenciaVolley = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en" || i18n.language?.startsWith("en");
  const nextSevenDays = useMemo(() => getNextSevenDays(), []);
  const [dateFilter, setDateFilter] = useState<string>(nextSevenDays[0]);
  const [slots, setSlots] = useState<ValenciaVolleySlot[]>(VALENCIA_VOLLEY_SLOTS);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [usingSheetData, setUsingSheetData] = useState(false);

  useEffect(() => {
    const loadSheet = async () => {
      if (!VALENCIA_VOLLEY_SHEET_CSV_URL.trim()) {
        setUsingSheetData(false);
        return;
      }
      try {
        setLoadingSheet(true);
        setSheetError(null);
        const sheetSlots = await fetchValenciaVolleySlotsFromSheet(
          VALENCIA_VOLLEY_SHEET_CSV_URL
        );
        if (sheetSlots.length > 0) {
          setSlots(sheetSlots);
          setUsingSheetData(true);
        } else {
          setUsingSheetData(false);
          setSheetError(
            isEn
              ? "Google Sheet is reachable but empty/invalid. Showing local fallback."
              : "La hoja de Google está accesible pero vacía/inválida. Mostrando datos locales."
          );
        }
      } catch (error) {
        console.error("Error loading ValenciaVolley Google Sheet:", error);
        setUsingSheetData(false);
        setSheetError(
          isEn
            ? "Could not load Google Sheet. Showing local fallback."
            : "No se pudo cargar Google Sheets. Mostrando datos locales."
        );
      } finally {
        setLoadingSheet(false);
      }
    };
    loadSheet();
  }, [isEn]);

  useEffect(() => {
    // Hard stop: solo hoy + 6 días
    if (!nextSevenDays.includes(dateFilter)) {
      setDateFilter(nextSevenDays[0]);
    }
  }, [dateFilter, nextSevenDays]);

  const reservableSlots = useMemo(
    () => slots.filter((slot) => nextSevenDays.includes(slot.date)),
    [slots, nextSevenDays]
  );

  const dates = nextSevenDays;

  const availableCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    dates.forEach((date) => {
      map[date] = reservableSlots.filter(
        (slot) => slot.date === date && slot.status === "available"
      ).length;
    });
    return map;
  }, [dates, reservableSlots]);

  const filteredSlots = useMemo(() => {
    const baseByDate = reservableSlots.filter((slot) => slot.date === dateFilter);
    return [...baseByDate].sort((a, b) => {
      const dA = new Date(`${a.date}T${a.startTime}:00`).getTime();
      const dB = new Date(`${b.date}T${b.startTime}:00`).getTime();
      return dA - dB;
    });
  }, [dateFilter, reservableSlots]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, typeof filteredSlots>();
    filteredSlots.forEach((slot) => {
      const list = groups.get(slot.date) ?? [];
      list.push(slot);
      groups.set(slot.date, list);
    });
    return Array.from(groups.entries());
  }, [filteredSlots]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-6xl space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold flex items-center gap-2.5">
            <Volleyball className="h-7 w-7 sm:h-9 sm:w-9 text-orange-600" />
            Valencia Volley - Net Renting
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
            {isEn
              ? "Rent your net for the full day in seconds. Check live availability, contact the assigned person, and complete rental online."
              : "Alquila tu net para todo el día en segundos. Consulta disponibilidad, contacta a la persona asignada y completa el alquiler online."}
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isEn ? "Rental conditions" : "Condiciones de alquiler"}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {isEn ? "Pick-up and return point:" : "Punto de recogida y devolución:"}{" "}
                <strong>{VALENCIA_VOLLEY_PICKUP_RETURN_ADDRESS}</strong>.
              </li>
              <li>
                {isEn ? "Daily rental fee:" : "Fee diario de alquiler:"}{" "}
                <strong>{VALENCIA_VOLLEY_DAILY_FEE_EUR}€</strong>{" "}
                {isEn ? "weekday /" : "laborable /"} <strong>{WEEKEND_DAILY_FEE_EUR}€</strong>{" "}
                {isEn ? "weekend and holidays." : "fin de semana y festivos."}
              </li>
              {VALENCIA_VOLLEY_DEPOSIT_REQUIRED ? (
                <li>
                  <strong>
                    {isEn
                      ? `Security deposit required: ${VALENCIA_VOLLEY_DEPOSIT_EUR}€ (refundable after return check).`
                      : `Depósito de seguridad obligatorio: ${VALENCIA_VOLLEY_DEPOSIT_EUR}€ (reembolsable tras revisión de devolución).`}
                  </strong>
                </li>
              ) : null}
              <li>
                {isEn
                  ? "Valid ID (DNI/NIE/passport) is requested before delivery."
                  : "Se solicitará documento válido (DNI/NIE/Pasaporte) antes de entregar la net."}
              </li>
              <li>
                {isEn
                  ? "The renter is responsible for late return, damages or loss."
                  : "La persona que alquila asume responsabilidad por retrasos, daños o pérdida."}
              </li>
              <li>
                {isEn
                  ? `Late return fee: ${LATE_FEE_EUR_PER_30_MIN}€ per 30 minutes (max ${LATE_FEE_MAX_EUR}€).`
                  : `Recargo por retraso: ${LATE_FEE_EUR_PER_30_MIN}€ cada 30 minutos (máximo ${LATE_FEE_MAX_EUR}€).`}
              </li>
              <li>
                {isEn
                  ? "Cancellation policy: free up to 24h before, after that 50%."
                  : "Política de cancelación: gratis hasta 24h antes, después 50%."}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <section className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEn ? "Select date" : "Selecciona la fecha"}
          </h2>
          <div className="rounded-2xl border-2 shadow-md overflow-hidden">
            <div className="bg-[#5d5d5d] text-white px-4 sm:px-5 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-transparent border-white/60 text-white hover:bg-white/10"
                  disabled={dateFilter === dates[0]}
                  onClick={() => {
                    const idx = dates.indexOf(dateFilter);
                    if (idx > 0) setDateFilter(dates[idx - 1]);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <p className="font-semibold text-xl sm:text-2xl leading-none">
                  {getMonthTitle(dateFilter, isEn)}
                </p>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-transparent border-white/60 text-white hover:bg-white/10"
                  disabled={dateFilter === dates[dates.length - 1]}
                  onClick={() => {
                    const idx = dates.indexOf(dateFilter);
                    if (idx < dates.length - 1) setDateFilter(dates[idx + 1]);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-7 mt-4 text-center text-sm sm:text-base font-semibold text-white/90">
                {dates.map((date) => (
                  <span key={`w-${date}`}>{getWeekdayShort(date, isEn)}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 px-3 sm:px-4 py-4 sm:py-5 bg-white dark:bg-card">
              {dates.map((date) => {
                const isSelected = dateFilter === date;
                const free = availableCountByDate[date] ?? 0;
                const hasAvailability = free > 0;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setDateFilter(date)}
                    className={`h-11 sm:h-12 rounded-full text-base sm:text-lg font-semibold transition ${
                      isSelected
                        ? "bg-green-500 text-white"
                        : hasAvailability
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                    title={`${dateToLabel(date, isEn)} · ${free} ${isEn ? "nets free" : "nets libres"}`}
                  >
                    {getDayNumber(date)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {groupedByDate.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {isEn ? "No slots match your filters." : "No hay slots que coincidan con los filtros."}
            </CardContent>
          </Card>
        ) : (
          groupedByDate.map(([date, slots]) => (
            <div key={date} className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold">
                {dateToLabel(date, isEn)} · {isEn ? "Available nets" : "Nets disponibles"}: {availableCountByDate[date] ?? 0}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                {slots.map((slot) => {
                  const status = STATUS_META[slot.status];
                  const dailyFee = getDailyFeeForDate(slot.date);
                  const payNow = dailyFee + (VALENCIA_VOLLEY_DEPOSIT_REQUIRED ? VALENCIA_VOLLEY_DEPOSIT_EUR : 0);
                  return (
                    <Card
                      key={slot.id}
                      className={`border-2 shadow-md hover:shadow-lg transition-shadow ${getCardClassByStatus(slot.status)}`}
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-xl">{slot.netName}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <Badge variant={status.badge}>
                            {isEn ? status.en : status.es}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2.5 text-sm sm:text-[15px]">
                        <p><strong>{isEn ? "Location:" : "Ubicación:"}</strong> {slot.location}</p>
                        <p><strong>{isEn ? "Assigned person:" : "Persona asignada:"}</strong> {slot.assignedPerson}</p>
                        <p className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <strong>{isEn ? "Nets free:" : "Nets libres:"}</strong> {slot.openSpots}/{slot.totalSpots}
                        </p>
                        <p>
                          <strong>{isEn ? "Daily rental fee:" : "Fee diario de alquiler:"}</strong>{" "}
                          {dailyFee.toFixed(2)}€
                        </p>
                        {VALENCIA_VOLLEY_DEPOSIT_REQUIRED ? (
                          <p>
                            <strong>{isEn ? "Deposit:" : "Depósito:"}</strong>{" "}
                            {VALENCIA_VOLLEY_DEPOSIT_EUR.toFixed(2)}€
                          </p>
                        ) : null}
                        <p>
                          <strong>{isEn ? "Total to pay now:" : "Total a pagar ahora:"}</strong>{" "}
                          {payNow.toFixed(2)}€
                        </p>
                        {slot.notes ? (
                          <p className="text-muted-foreground">{slot.notes}</p>
                        ) : null}
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="font-medium">{getStatusHeadline(slot.status, isEn)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getStatusBody(slot.status, isEn)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                          {slot.status === "available" ? (
                            <Button
                              size="sm"
                              className="h-8 px-2.5 sm:px-3 text-xs"
                              onClick={() =>
                                window.open(
                                  `${RESERVATION_WHATSAPP_URL}?text=${encodeURIComponent(
                                    buildRentalRequestMessage(slot, isEn)
                                  )}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {isEn ? "Request rental" : "Solicitar alquiler"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="h-10 px-4 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
                              onClick={() =>
                                window.open(
                                  slot.contactUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {isEn ? "Contact organizer" : "Contactar organizador"}
                            </Button>
                          )}
                        </div>
                        {slot.status === "available" ? (
                          <p className="text-[11px] sm:text-xs text-muted-foreground">
                            {isEn
                              ? "You will be asked for ID, contact details and acceptance of deposit, cancellation and return policy."
                              : "Se te pedirá documento, datos de contacto y aceptación de fianza, cancelación y condiciones de devolución."}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ValenciaVolley;
