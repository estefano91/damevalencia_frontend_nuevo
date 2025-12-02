import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dameEventsAPI } from "@/integrations/dame-api/events";
import type { DameEventDetail, EventOrganizer } from "@/integrations/dame-api/events";
import type { Ticket, TicketTypeDetail } from "@/types/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Repeat,
  CalendarDays,
  Music,
  Coffee,
  Navigation,
  Share2,
  CheckCircle,
  User,
  Instagram,
  Facebook,
  Youtube,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EventMap from "@/components/EventMap";
import { TicketAtDoorModal } from "@/components/TicketAtDoorModal";
import { dameTicketsAPI } from "@/integrations/dame-api/tickets";
import googleMapsIcon from "@/assets/mapsgoogle.png";
import wazeIcon from "@/assets/wazeicon.png";
import WhatsAppIcon from "@/assets/WhatsApp.svg.webp";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, ready } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<DameEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [hasTickets, setHasTickets] = useState<boolean | null>(null); // null = checking, true = has tickets, false = no tickets
  const [minTicketPrice, setMinTicketPrice] = useState<string | null>(null); // Precio mínimo de los tickets
  const [userHasTicket, setUserHasTicket] = useState(false);
  const [checkingUserTicket, setCheckingUserTicket] = useState(false);
  const [shouldResumeAttend, setShouldResumeAttend] = useState(false);
  const [userTicketCount, setUserTicketCount] = useState(0);
  const [atDoorTicketType, setAtDoorTicketType] = useState<TicketTypeDetail | null>(null);
  const [atDoorModalOpen, setAtDoorModalOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<EventOrganizer | null>(null);
  const pendingAttendKey = 'dame_pending_attend';
  const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
  
  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  // Helper para obtener el texto en el idioma correcto
  const getLocalizedText = (textEs?: string, textEn?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return textEs || textEn || '';
  };


  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const response = await dameEventsAPI.getEventBySlug(slug);
        console.log('RESPUESTA DE LA API TOTAL', response);
        if (response.success && response.data) {
          console.log('📋 Organizadores del evento:', response.data.organizers);
          if (response.data.is_recurring_weekly) {
            console.log('RECURRENCE_START_TIME', response.data.recurrence_start_time);
            console.log('RECURRENCE_END_TIME', response.data.recurrence_end_time);
            console.log('RECURRENCE_WEEKDAY', response.data.recurrence_weekday);
          }
          setEvent(response.data);
        } else {
          setError(response.error || 'Evento no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el evento');
        console.error('Error fetching event detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [slug]);

  const loadAtDoorTicket = useCallback(async () => {
    if (!event?.id) return;

    try {
      const response = await dameTicketsAPI.getTicketTypes(event.id);
      if (response.success && response.data) {
        const tickets = response.data.results || [];
        const atDoorTicket = tickets.find((t) => t.ticket_type === 'EN_PUERTA') || null;

        setAtDoorTicketType(atDoorTicket);

        if (atDoorTicket) {
          const priceValue = parseFloat(
            atDoorTicket.current_price || atDoorTicket.base_price || '0'
          );

          setHasTickets(true);
          setMinTicketPrice(
            priceValue > 0
              ? `${priceValue.toFixed(2)}€`
              : i18n.language === 'en'
                ? 'FREE'
                : 'GRATIS'
          );
        } else {
          setHasTickets(false);
          setMinTicketPrice(null);
        }
      } else {
        setAtDoorTicketType(null);
        setHasTickets(false);
        setMinTicketPrice(null);
      }
    } catch (err) {
      console.error('Error fetching ticket info:', err);
      setAtDoorTicketType(null);
      setHasTickets(false);
      setMinTicketPrice(null);
    }
  }, [event?.id, i18n.language]);

  useEffect(() => {
    loadAtDoorTicket();
  }, [loadAtDoorTicket]);


  // Verificar si el usuario ya tiene tickets para este evento
  useEffect(() => {
    if (!user || !event?.id) {
      setUserHasTicket(false);
      setUserTicketCount(0);
      return;
    }

    let isMounted = true;
    let currentPage = 1;
    const collectedTickets: Ticket[] = [];

    const fetchPage = async (page: number): Promise<boolean> => {
      const response = await dameTicketsAPI.getMyCurrentTickets(page);
      if (!isMounted) return false;

      if (response.success && response.data?.results) {
        collectedTickets.push(...response.data.results);
        if (response.data.next) {
          currentPage += 1;
          return fetchPage(currentPage);
        }
        return true;
      }

      return false;
    };

    const normalize = (value?: string | null) =>
      value ? value.trim().toLowerCase().replace(/\s+/g, ' ') : '';

    const checkTickets = async () => {
      setCheckingUserTicket(true);
      try {
        const ok = await fetchPage(1);
        if (!isMounted || !ok) {
          setUserHasTicket(false);
          setUserTicketCount(0);
          return;
        }

        const eventTitleCandidates = [
          normalize(event.title_es),
          normalize(event.title_en),
          normalize(getLocalizedText(event.title_es, event.title_en)),
        ].filter(Boolean);

        const matchingTickets = collectedTickets.filter((ticket) => {
          if (ticket.event_id && ticket.event_id === event.id) return true;
          if (ticket.event_slug && event.slug && ticket.event_slug === event.slug) return true;
          const ticketTitles = [
            normalize(ticket.event_title),
            normalize(ticket.ticket_metadata?.event_title),
          ].filter(Boolean);
          if (ticketTitles.length && eventTitleCandidates.length) {
            return ticketTitles.some((ticketTitle) =>
              eventTitleCandidates.includes(ticketTitle)
            );
          }
          return false;
        });

        setUserHasTicket(matchingTickets.length > 0);
        setUserTicketCount(matchingTickets.length);
      } catch (err) {
        console.error('Error checking user tickets:', err);
        if (isMounted) {
          setUserHasTicket(false);
          setUserTicketCount(0);
        }
      } finally {
        if (isMounted) {
          setCheckingUserTicket(false);
        }
      }
    };

    checkTickets();

    return () => {
      isMounted = false;
    };
  }, [user, event?.id, event?.slug]);

  // Scroll al inicio al abrir la página de detalle o cambiar de evento
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  // Helper functions
  const MADRID_TZ = 'Europe/Madrid';

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'Fecha por determinar';
    
    try {
      const date = new Date(dateString);
      // Validar que la fecha es válida (no es 1970 o NaN)
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: MADRID_TZ
      });
    } catch {
      return 'Fecha por determinar';
    }
  };

  const formatPrice = (amount?: string, currency: string = 'EUR'): string => {
    if (!amount || parseFloat(amount) === 0) return 'Gratuito';
    return `${parseFloat(amount).toFixed(2)}€`;
  };

  // Formatea el rango de precios usando from_price y to_price
  const formatPriceRange = (event: DameEventDetail): string => {
    const fromPrice = parseFloat(event.from_price || event.price_amount || '0');
    const toPrice = event.to_price ? parseFloat(event.to_price) : null;
    
    if (fromPrice === 0 && (!toPrice || toPrice === 0)) {
      return i18n.language === 'en' ? 'FREE' : 'GRATIS';
    }
    
    if (toPrice && toPrice > fromPrice) {
      return `${fromPrice.toFixed(2)}€ - ${toPrice.toFixed(2)}€`;
    }
    
    return `${fromPrice.toFixed(2)}€`;
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'Duración no especificada';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes} minutos`;
    if (remainingMinutes === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatOnlyDate = (dateString?: string): string => {
    if (!dateString) return i18n.language === 'en' ? 'Date TBD' : 'Fecha por determinar';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        return i18n.language === 'en' ? 'Invalid date' : 'Fecha inválida';
      }
      return date.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: MADRID_TZ
      });
    } catch {
      return i18n.language === 'en' ? 'Date TBD' : 'Fecha por determinar';
    }
  };

  const formatOnlyTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '';
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: MADRID_TZ,
      });
    } catch {
      return '';
    }
  };

  const formatTimeRange = (start?: string, end?: string): string => {
    const from = formatOnlyTime(start);
    const to = formatOnlyTime(end);
    if (from && to) {
      return i18n.language === 'en' ? `From ${from} to ${to}` : `De ${from} a ${to}`;
    }
    if (from) {
      return i18n.language === 'en' ? `At ${from}` : `A las ${from}`;
    }
    return i18n.language === 'en' ? 'Time TBD' : 'Horario por determinar';
  };

  const formatTimeFromHHmmss = (timeString?: string): string => {
    if (!timeString) return '';
    try {
      // Parsear formato HH:mm:ss a solo HH:mm
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getWeekdayName = (weekday?: number): string => {
    if (weekday === undefined || weekday === null) return '';
    const weekdaysEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const weekdaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // weekday es 0-6 donde 0=lunes, 6=domingo
    return i18n.language === 'en' ? (weekdaysEn[weekday] || '') : (weekdaysEs[weekday] || '');
  };

  const formatRecurringSchedule = (eventData: DameEventDetail): string => {
    if (!eventData.recurrence_weekday || !eventData.recurrence_start_time) {
      return i18n.language === 'en' ? 'Weekly schedule TBD' : 'Horario semanal por determinar';
    }
    const dayName = getWeekdayName(eventData.recurrence_weekday);
    const startTime = formatTimeFromHHmmss(eventData.recurrence_start_time);
    const endTime = formatTimeFromHHmmss(eventData.recurrence_end_time);
    
    if (i18n.language === 'en') {
      if (endTime) {
        return `Every ${dayName} from ${startTime} to ${endTime}`;
      }
      return `Every ${dayName} at ${startTime}`;
    } else {
    if (endTime) {
      return `Todos los ${dayName} de ${startTime} a ${endTime}`;
    }
    return `Todos los ${dayName} a las ${startTime}`;
    }
  };

  const formatRecurringTimeOnly = (eventData: DameEventDetail): string => {
    const startTime = formatTimeFromHHmmss(eventData.recurrence_start_time);
    const endTime = formatTimeFromHHmmss(eventData.recurrence_end_time);
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    return startTime || '';
  };

  // Genera próximas ocurrencias para eventos semanales (siguientes 4)
  const generateNextWeeklyOccurrences = (eventData: DameEventDetail, count: number = 4): Date[] => {
    try {
      if (!eventData || !eventData.is_recurring_weekly || eventData.recurrence_weekday === undefined || !eventData.recurrence_start_time) {
        return [];
      }
      if (!i18n || !i18n.language) {
        return [];
      }
      const results: Date[] = [];
      const today = new Date();
      // Convertir nuestro weekday (0=lunes..6=domingo) a JS getDay (0=domingo..6=sábado)
      const jsTargetDay = (eventData.recurrence_weekday + 1) % 7; // lunes(0)->1 ... domingo(6)->0
      const currentJsDay = today.getDay();
      let addDays = jsTargetDay - currentJsDay;
      if (addDays < 0) addDays += 7;
      // Si es hoy pero la hora ya pasó, igualmente apuntar a la próxima semana
      const timeParts = eventData.recurrence_start_time.split(":");
      if (!timeParts || timeParts.length < 2) return [];
      const hh = parseInt(timeParts[0], 10) || 0;
      const mm = parseInt(timeParts[1], 10) || 0;
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + addDays);
      candidate.setHours(hh, mm, 0, 0);
      if (candidate <= today) {
        candidate.setDate(candidate.getDate() + 7);
      }
      for (let i = 0; i < count; i++) {
        const d = new Date(candidate);
        d.setDate(candidate.getDate() + i * 7);
        results.push(new Date(d));
      }
      return results;
    } catch (error) {
      console.error('Error generating next occurrences:', error);
      return [];
    }
  };

  const formatCompactDate = (date: Date): string => {
    const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgramIconNode = (iconText?: string) => {
    // Evitar mostrar palabras tipo "SCHEDULE" y mapear a íconos
    const normalized = (iconText || '').toUpperCase();
    if (!iconText) return <Clock className="h-4 w-4" />;
    if (/^[\p{Emoji}\uFE0F\u200D]+$/u.test(iconText)) {
      // Si es claramente un emoji, úsalo
      return <span className="text-lg leading-none">{iconText}</span>;
    }
    if (normalized.includes('SCHEDULE')) return <CalendarDays className="h-4 w-4" />;
    if (normalized.includes('BREAK') || normalized.includes('PAUSA')) return <Coffee className="h-4 w-4" />;
    if (normalized.includes('MUSIC') || normalized.includes('CONCIERTO')) return <Music className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getAvailableSpots = (capacity?: number, registered?: number): number => {
    if (!capacity) return 0;
    return capacity - (registered || 0);
  };

  // Mapeo de categorías a comunidades de WhatsApp
  const getCommunityWhatsAppLink = (categoryName: string): string | null => {
    const categoryLower = categoryName.toLowerCase();
    
    if (categoryLower.includes('salsa')) {
      return "https://chat.whatsapp.com/JhtzEylNaAT1EnHQmNi3Dc";
    } else if (categoryLower.includes('bachata')) {
      return "https://chat.whatsapp.com/GSfzCHspYY1LJxmbozWc1m";
    } else if (categoryLower.includes('baloncesto') || categoryLower.includes('basket') || categoryLower.includes('basketball')) {
      return "https://chat.whatsapp.com/CtLfrELuYQjFxzvYiw61fX";
    } else if (categoryLower.includes('zen') || categoryLower.includes('yoga')) {
      return "https://chat.whatsapp.com/CFgD6wStj2q7PJjiY633qY";
    } else if (categoryLower.includes('fútbol') || categoryLower.includes('deporte')) {
      return "https://chat.whatsapp.com/GLTEVz2YjVTAq7F6JgXPeO";
    } else if (categoryLower.includes('música') || categoryLower.includes('jam')) {
      return "https://chat.whatsapp.com/HYnZYcXgAti3XrBRPtqyWv";
    }
    
    return null;
  };

  const getReserveLink = () => {
    // Prioridad 1: booking_link (link externo para reservas)
    if (event?.booking_link) {
      return event.booking_link;
    }
    
    // Prioridad 2: Si hay tickets configurados en el sistema, no usar tickets_webview
    // Si no hay tickets, usar tickets_webview si existe
    if (hasTickets === false && event?.tickets_webview) {
      return event.tickets_webview;
    }
    
    // Prioridad 3: Usar el contacto de WhatsApp del evento
    const whatsappLink = event?.whatsapp_contact;
    if (whatsappLink) {
      const sanitized = whatsappLink.replace(/\+/, '').replace(/\s/g, '');
      const message = i18n.language === 'en' 
        ? `Hello, I would like to reserve a spot for the event "${getLocalizedText(event.title_es, event.title_en)}"`
        : `Hola, me gustaría reservar para el evento "${getLocalizedText(event.title_es, event.title_en)}"`;
      return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
    }
    
    // Prioridad 4: Usar el grupo de WhatsApp del primer organizador
    if (event?.organizers && event.organizers.length > 0 && event.organizers[0]?.whatsapp_group) {
      return event.organizers[0].whatsapp_group;
    }
    
    return null;
  };

  const handleReserveClick = (reserveLink?: string) => {
    // Si NO hay tickets, redirigir directamente al link de reserva (sin login requerido)
    if (hasTickets === false) {
      if (reserveLink) {
        console.log('🔗 EventDetail: Abriendo link de reserva');
        window.open(reserveLink, "_blank");
      } else {
        toast({
          title: i18n.language === 'en' ? 'Reservation unavailable' : 'Reserva no disponible',
          description: i18n.language === 'en'
            ? 'Reservation link is not configured for this event.'
            : 'El enlace de reserva no está configurado para este evento.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Si hay tickets configurados, se requiere login
    if (hasTickets === true) {
      if (!user) {
        try {
          sessionStorage.setItem(
            pendingAttendKey,
            JSON.stringify({
              slug,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error('⚠️ EventDetail: No se pudo guardar la acción pendiente', error);
        }
        
        const returnPath = `${location.pathname}${location.search}`;
        navigate('/auth', {
          state: { from: returnPath },
        });
        return;
      }

      if (!atDoorTicketType) {
        toast({
          title: i18n.language === 'en' ? 'Registration unavailable' : 'Registro no disponible',
          description: i18n.language === 'en'
            ? 'At-door tickets are not available right now.'
            : 'No hay entradas en puerta disponibles en este momento.',
          variant: 'destructive',
        });
        return;
      }

      const isSoldOut =
        atDoorTicketType.available_stock !== null &&
        atDoorTicketType.available_stock !== undefined &&
        atDoorTicketType.available_stock <= 0;

      if (isSoldOut) {
        toast({
          title: i18n.language === 'en' ? 'Sold out' : 'Agotado',
          description: i18n.language === 'en'
            ? 'No at-door spots available right now.'
            : 'No hay plazas en puerta disponibles en este momento.',
          variant: 'destructive',
        });
        return;
      }

      setAtDoorModalOpen(true);
      return;
    }
  };

  useEffect(() => {
    if (!user) return;

    const pendingActionRaw = sessionStorage.getItem(pendingAttendKey);
    if (!pendingActionRaw) return;

    try {
      const pendingAction = JSON.parse(pendingActionRaw) as { slug?: string; timestamp?: number };
      const isExpired = pendingAction.timestamp ? (Date.now() - pendingAction.timestamp) > 15 * 60 * 1000 : false;
      const slugMatches = !pendingAction.slug || pendingAction.slug === slug;

      if (!isExpired && slugMatches) {
        setShouldResumeAttend(true);
      }
    } catch (error) {
      console.error('⚠️ EventDetail: Error leyendo acción pendiente', error);
    } finally {
      sessionStorage.removeItem(pendingAttendKey);
    }
  }, [user, slug]);

  useEffect(() => {
    if (!shouldResumeAttend) return;
    if (hasTickets === null) return;

    const reserveLink = getReserveLink();
    handleReserveClick(reserveLink || undefined);
    setShouldResumeAttend(false);
  }, [shouldResumeAttend, hasTickets, event]);

  const handleReserveSuccess = () => {
    setAtDoorModalOpen(false);
    setUserHasTicket(true);
    setUserTicketCount((prev) => prev + 1);
    loadAtDoorTicket();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-6" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {i18n.language === 'en' ? 'Back to home' : 'Volver al inicio'}
          </Button>
          <Alert>
            <AlertTitle>{i18n.language === 'en' ? 'Error' : 'Error'}</AlertTitle>
            <AlertDescription>
              {error || (i18n.language === 'en' ? 'Could not load event.' : 'No se pudo cargar el evento.')}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 pt-8 pb-28">
        {/* Back Button */}
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver al inicio'}
        </Button>

        {/* Hero Image for mobile */}
        <div className="lg:hidden w-full mb-6">
          <div className="relative w-full aspect-[680/384] rounded-lg overflow-hidden shadow-lg">
            {event.main_photo_url ? (
              <img 
                src={event.main_photo_url}
                alt={getLocalizedText(event.title_es, event.title_en)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNlOGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk4MzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRBTUUgVmFsZW5jaWE8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎭</div>
                  <p className="text-xl text-purple-600 font-medium">DAME Valencia</p>
                </div>
              </div>
            )}
            {event.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  {i18n.language === 'en' ? 'Featured' : 'Destacado'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title and Summary */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                {getLocalizedText(event.title_es, event.title_en)}
              </h1>
              {event.organizers && event.organizers.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
                  <div className="flex items-center" style={{ marginLeft: event.organizers.length > 1 ? `${(event.organizers.length - 1) * 12}px` : '0' }}>
                    {event.organizers.map((organizer, index) => {
                      // Intentar diferentes nombres de campos posibles para el logo
                      const logoUrl = (organizer as any).logo_url || 
                                     (organizer as any).image_url || 
                                     (organizer as any).avatar_url || 
                                     (organizer as any).logo ||
                                     (organizer as any).image;
                      
                      const overlapStyle = index > 0 ? { marginLeft: '-12px' } : {};
                      
                      if (logoUrl) {
                        return (
                          <img 
                            key={organizer.id}
                            src={logoUrl} 
                            alt={organizer.name}
                            className="h-9 w-9 rounded-full object-cover border-2 border-background"
                            style={{ ...overlapStyle, zIndex: event.organizers.length - index }}
                            onError={(e) => {
                              // Si falla la carga, mostrar icono por defecto
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                e.currentTarget.style.display = 'none';
                                const icon = document.createElement('div');
                                icon.className = 'h-9 w-9 rounded-full bg-muted flex items-center justify-center border-2 border-background';
                                icon.style.cssText = `${Object.entries(overlapStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}; z-index: ${event.organizers.length - index};`;
                                icon.innerHTML = '<svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                parent.insertBefore(icon, e.currentTarget);
                              }
                            }}
                          />
                        );
                      }
                      // Si no hay logo, mostrar icono por defecto
                      return (
                        <div 
                          key={organizer.id} 
                          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-background"
                          style={{ ...overlapStyle, zIndex: event.organizers.length - index }}
                        >
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-muted-foreground">
                    {i18n.language === 'en' ? 'Hosted by' : 'Organizado por'}{' '}
                    <span className="font-medium text-foreground">
                      {event.organizers.map((org, idx) => (
                        <span key={org.id}>
                          {idx > 0 && ', '}
                          <button
                            onClick={() => setSelectedOrganizer(org)}
                            className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2 cursor-pointer"
                          >
                            {org.name}
                          </button>
                        </span>
                      ))}
                    </span>
                  </p>
                </div>
              )}
              {!event.is_recurring_weekly && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {event.start_datetime && (
                    <div className="inline-flex items-center gap-2.5 rounded-lg bg-muted/40 px-4 py-2 border border-border/60 hover:border-border transition-colors duration-200">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground text-sm">
                        {formatOnlyDate(event.start_datetime)}
                      </span>
                    </div>
                  )}
                  {(event.start_datetime || event.end_datetime) && (
                    <div className="inline-flex items-center gap-2.5 rounded-lg bg-muted/40 px-4 py-2 border border-border/60 hover:border-border transition-colors duration-200">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground text-sm">
                        {formatTimeRange(event.start_datetime, event.end_datetime)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {event.is_recurring_weekly && (() => {
                // Usar upcoming_dates de la API si está disponible, sino generar manualmente
                const datesToShow = event.upcoming_dates && event.upcoming_dates.length > 0
                  ? event.upcoming_dates.map(d => new Date(d.date))
                  : generateNextWeeklyOccurrences(event, 8);
                
                if (datesToShow.length === 0) return null;
                return (
                  <div className="mb-4 -mx-1">
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                      {datesToShow.map((occ, idx) => {
                        const originalDate = event.upcoming_dates?.[idx];
                        const isCancelled = originalDate?.is_cancelled;
                        return (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap shadow-sm ${
                              isCancelled 
                                ? 'bg-red-50 border-red-200 text-red-600 line-through' 
                                : 'bg-white border-gray-200 text-gray-800'
                            }`}
                          >
                            {formatCompactDate(occ)}
                            {isCancelled && (
                              <span className="ml-1 text-red-600">✕</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {/* Resumen eliminado según requisitos */}
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categories.map(category => (
                  <Badge key={category.id} variant="outline" className="border-purple-200">
                    {getLocalizedText(category.name_es, category.name_en)}
                  </Badge>
                ))}
                {event.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {getLocalizedText(tag.name_es, tag.name_en)}
                  </Badge>
                ))}
              </div>

            </div>

            {/* User Tickets Info */}
            {userHasTicket && userTicketCount > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-base text-green-600 font-medium">
                        {i18n.language === 'en' 
                          ? `You have reserved ${userTicketCount} ${userTicketCount === 1 ? 'ticket' : 'tickets'}`
                          : `Has reservado ${userTicketCount} ${userTicketCount === 1 ? 'entrada' : 'entradas'}`}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto py-2 px-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Link to="/mis-entradas">
                        {i18n.language === 'en' ? 'My Tickets' : 'Mis Entradas'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {getLocalizedText(event.description_es, event.description_en) && (
              <Card>
                <CardHeader>
                  <CardTitle>{i18n.language === 'en' ? 'Event description' : 'Descripción del evento'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {getLocalizedText(event.description_es, event.description_en)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {event.photos && event.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {i18n.language === 'en' ? 'Photo gallery' : 'Galería de fotos'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {event.photos
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(photo => (
                        <div 
                          key={photo.id} 
                          className="relative aspect-video rounded-lg overflow-hidden cursor-zoom-in"
                          onClick={() => setSelectedPhotoUrl(photo.image_url)}
                        >
                          <img 
                            src={photo.image_url}
                            alt={getLocalizedText(photo.caption_es, photo.caption_en) || getLocalizedText(event.title_es, event.title_en)}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNlOGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk4MzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRBTUUgVmFsZW5jaWE8L3RleHQ+Cjwvc3ZnPgo=';
                            }}
                          />
                          {getLocalizedText(photo.caption_es, photo.caption_en) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                              <p className="text-sm">{getLocalizedText(photo.caption_es, photo.caption_en)}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizers Card - Desktop: visible after gallery */}
            {event.organizers && event.organizers.length > 0 && (
              <div className="hidden lg:block">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {i18n.language === 'en' 
                        ? event.organizers.length > 1 ? 'Organizers' : 'Organizer'
                        : event.organizers.length > 1 ? 'Organizadores' : 'Organizador'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event.organizers.map((organizer, orgIndex) => {
                      const logoUrl = (organizer as any).logo_url || 
                                     (organizer as any).image_url || 
                                     (organizer as any).avatar_url || 
                                     (organizer as any).logo ||
                                     (organizer as any).image;
                      
                      return (
                        <div 
                          key={organizer.id} 
                          className={`${orgIndex > 0 ? 'pt-6 border-t' : ''}`}
                        >
                          {/* Organizer Header */}
                          <div className="flex items-start gap-4 mb-4">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={organizer.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-border flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const icon = document.createElement('div');
                                    icon.className = 'h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0';
                                    icon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                    parent.insertBefore(icon, e.currentTarget);
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
                                <User className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{organizer.name}</h3>
                              {organizer.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <a 
                                    href={`mailto:${organizer.email}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {organizer.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Social Media Links */}
                          {(organizer.instagram || organizer.facebook || organizer.youtube || organizer.website || organizer.whatsapp_group) && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                {i18n.language === 'en' ? 'Social Media' : 'Redes Sociales'}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3">
                                {organizer.instagram && (
                                  <a
                                    href={organizer.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                    aria-label={`Instagram de ${organizer.name}`}
                                  >
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <defs>
                                        <linearGradient id={`instagram-gradient-card-main-${organizer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#f09433" />
                                          <stop offset="25%" stopColor="#e6683c" />
                                          <stop offset="50%" stopColor="#dc2743" />
                                          <stop offset="75%" stopColor="#cc2366" />
                                          <stop offset="100%" stopColor="#bc1888" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                                        fill={`url(#instagram-gradient-card-main-${organizer.id})`}
                                      />
                                    </svg>
                                  </a>
                                )}
                                {organizer.facebook && (
                                  <a
                                    href={organizer.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                                    aria-label={`Facebook de ${organizer.name}`}
                                  >
                                    <Facebook className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.youtube && (
                                  <a
                                    href={organizer.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-red-600 transition-colors"
                                    aria-label={`YouTube de ${organizer.name}`}
                                  >
                                    <Youtube className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.website && (
                                  <a
                                    href={organizer.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`Website de ${organizer.name}`}
                                  >
                                    <Globe className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.whatsapp_group && (
                                  <a
                                    href={organizer.whatsapp_group}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-green-600 transition-colors"
                                    aria-label={`Grupo de WhatsApp de ${organizer.name}`}
                                  >
                                    <img 
                                      src={WhatsAppIcon} 
                                      alt="Grupo de WhatsApp" 
                                      className="h-6 w-6"
                                    />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Groups and Communities */}
                          {organizer.groups && organizer.groups.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                {i18n.language === 'en' ? 'Groups & Communities' : 'Grupos y Comunidades'}
                              </h4>
                              <div className="space-y-2">
                                {organizer.groups.map((group) => {
                                  const getGroupIcon = () => {
                                    switch (group.type) {
                                      case 'whatsapp':
                                        return (
                                          <img 
                                            src={WhatsAppIcon} 
                                            alt="WhatsApp" 
                                            className="h-5 w-5"
                                          />
                                        );
                                      case 'telegram':
                                        return (
                                          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                          </svg>
                                        );
                                      case 'facebook':
                                        return <Facebook className="h-5 w-5 text-blue-600" />;
                                      case 'discord':
                                        return (
                                          <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                          </svg>
                                        );
                                      default:
                                        return <Globe className="h-5 w-5" />;
                                    }
                                  };

                                  const getGroupTypeLabel = () => {
                                    switch (group.type) {
                                      case 'whatsapp':
                                        return 'WhatsApp';
                                      case 'telegram':
                                        return 'Telegram';
                                      case 'facebook':
                                        return 'Facebook';
                                      case 'discord':
                                        return 'Discord';
                                      default:
                                        return group.type;
                                    }
                                  };

                                  return (
                                    <a
                                      key={group.id}
                                      href={group.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                    >
                                      <div className="flex-shrink-0">
                                        {getGroupIcon()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                          {group.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {getGroupTypeLabel()}
                                        </p>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Program Schedule */}
            {event.programs && event.programs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{i18n.language === 'en' ? 'Event program' : 'Programa del evento'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.programs
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(program => (
                        <div key={program.id} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className="text-2xl">{getProgramIconNode(program.icon)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-purple-600">{program.time}</span>
                              <span className="font-semibold">{getLocalizedText(program.title_es, program.title_en)}</span>
                            </div>
                            {getLocalizedText(program.description_es, program.description_en) && (
                              <p className="text-sm text-muted-foreground">
                                {getLocalizedText(program.description_es, program.description_en)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 sm:top-28 md:top-32 space-y-6">
              {/* Hero Image */}
              <div className="rounded-lg overflow-hidden shadow-lg hidden lg:block">
                <div className="relative w-full aspect-[680/384] bg-gradient-to-br from-purple-100 to-pink-100">
                  {event.main_photo_url ? (
                    <img
                      src={event.main_photo_url}
                      alt={getLocalizedText(event.title_es, event.title_en)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNlOGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk4MzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRBTUUgVmFsZW5jaWE8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎭</div>
                        <p className="text-xl text-purple-600 font-medium">DAME Valencia</p>
                      </div>
                    </div>
                  )}

                  {event.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        {i18n.language === 'en' ? 'Featured' : 'Destacado'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{i18n.language === 'en' ? 'Event details' : 'Detalles del evento'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date */}
                  {event.is_recurring_weekly ? (
                    <>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-medium">{i18n.language === 'en' ? 'Day' : 'Día'}</p>
                          <p className="text-sm text-muted-foreground">
                            {i18n.language === 'en' 
                              ? `Every ${getWeekdayName(event.recurrence_weekday)}`
                              : `Todos los ${getWeekdayName(event.recurrence_weekday)}`}
                          </p>
                          {(() => {
                            // Usar upcoming_dates de la API si está disponible, sino generar manualmente
                            const datesToShow = event.upcoming_dates && event.upcoming_dates.length > 0
                              ? event.upcoming_dates.map(d => new Date(d.date))
                              : generateNextWeeklyOccurrences(event, 4);
                            
                            return datesToShow.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground/80">
                                  {i18n.language === 'en' ? 'Next dates:' : 'Próximas fechas:'}
                                </p>
                                <div className="space-y-0.5">
                                  {datesToShow.map((occ, idx) => {
                                    const originalDate = event.upcoming_dates?.[idx];
                                    const isCancelled = originalDate?.is_cancelled;
                                    return (
                                      <p 
                                        key={idx} 
                                        className={`text-xs ${isCancelled ? 'text-red-500 line-through' : 'text-muted-foreground'}`}
                                      >
                                        • {formatCompactDate(occ)}
                                        {isCancelled && (
                                          <span className="ml-2 text-red-600 font-medium">
                                            ({i18n.language === 'en' ? 'Cancelled' : 'Cancelado'})
                                          </span>
                                        )}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{i18n.language === 'en' ? 'Time' : 'Horario'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRecurringTimeOnly(event)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{i18n.language === 'en' ? 'Date' : 'Fecha'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatOnlyDate(event.start_datetime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{i18n.language === 'en' ? 'Time' : 'Horario'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeRange(event.start_datetime, event.end_datetime)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Location */}
                  {event.place && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">{i18n.language === 'en' ? 'Location' : 'Ubicación'}</p>
                            {event.place.name && (
                              <p className="text-sm text-muted-foreground">{event.place.name}</p>
                            )}
                            {event.place.address && (
                              <p className="text-sm text-muted-foreground">{event.place.address}</p>
                            )}
                            {event.place.city && (
                              <p className="text-sm text-muted-foreground">{event.place.city}</p>
                            )}
                          </div>
                        </div>
                        {(() => {
                          // Generar URLs de Google Maps y Waze
                          const lat = event.place.latitude;
                          const lng = event.place.longitude;
                          const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
                          const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
                          const hasValidCoords = 
                            latNum != null && 
                            lngNum != null && 
                            isFinite(latNum) && 
                            isFinite(lngNum) &&
                            latNum >= -90 && latNum <= 90 &&
                            lngNum >= -180 && lngNum <= 180;

                          // Google Maps URL
                          let googleMapsUrl = '';
                          if (hasValidCoords) {
                            // Formato estándar de Google Maps con coordenadas
                            googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`;
                          } else if (event.place.address) {
                            // Construir dirección completa con ciudad
                            const fullAddress = `${event.place.name || ''}, ${event.place.address}${event.place.city ? ', ' + event.place.city : ''}, Valencia, España`.trim();
                            googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
                          } else if (event.place.name) {
                            // Si solo tenemos el nombre, agregar Valencia para mejor búsqueda
                            const queryWithCity = event.place.city 
                              ? `${event.place.name}, ${event.place.city}, Valencia, España`
                              : `${event.place.name}, Valencia, España`;
                            googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryWithCity)}`;
                          }

                          // Waze URL
                          let wazeUrl = '';
                          if (hasValidCoords) {
                            wazeUrl = `https://waze.com/ul?ll=${latNum},${lngNum}&navigate=yes`;
                          } else if (event.place.address) {
                            const query = `${event.place.address} ${event.place.city || ''}`.trim();
                            wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
                          } else if (event.place.name) {
                            wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(event.place.name)}&navigate=yes`;
                          }


                          return (googleMapsUrl || wazeUrl) ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                              {googleMapsUrl && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 w-full sm:w-auto justify-center sm:justify-start"
                                >
                                  <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <img 
                                      src={googleMapsIcon} 
                                      alt="Google Maps" 
                                      className="w-5 h-5 object-contain"
                                    />
                                    <span>{i18n.language === 'en' ? 'Google Maps' : 'Google Maps'}</span>
                                  </a>
                                </Button>
                              )}
                              {wazeUrl && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 w-full sm:w-auto justify-center sm:justify-start"
                                >
                                  <a
                                    href={wazeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <img 
                                      src={wazeIcon} 
                                      alt="Waze" 
                                      className="w-5 h-5 object-contain rounded-full"
                                    />
                                    <span>Waze</span>
                                  </a>
                                </Button>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      {/* Google Maps Interactive Map */}
                      {(() => {
                        // Validar y convertir coordenadas
                        const lat = event.place.latitude;
                        const lng = event.place.longitude;
                        const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
                        const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
                        const hasValidCoords = 
                          latNum != null && 
                          lngNum != null && 
                          isFinite(latNum) && 
                          isFinite(lngNum) &&
                          latNum >= -90 && latNum <= 90 &&
                          lngNum >= -180 && lngNum <= 180;

                        return hasValidCoords ? (
                          <EventMap
                            latitude={latNum}
                            longitude={lngNum}
                            placeName={event.place.name}
                            address={event.place.address}
                          />
                        ) : (
                        <div className="rounded-lg overflow-hidden border shadow-sm">
                          <a
                            href={
                              event.place.address
                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.place.address)}`
                                : 'https://maps.google.com'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="w-full h-64 bg-muted flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">
                                {i18n.language === 'en' 
                                  ? 'Click to view location on Google Maps' 
                                  : 'Haz clic para ver la ubicación en Google Maps'}
                              </p>
                            </div>
                          </a>
                        </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizers Card - Mobile: visible in sidebar */}
              {event.organizers && event.organizers.length > 0 && (
                <div className="lg:hidden">
                  <Card>
                  <CardHeader>
                    <CardTitle>
                      {i18n.language === 'en' 
                        ? event.organizers.length > 1 ? 'Organizers' : 'Organizer'
                        : event.organizers.length > 1 ? 'Organizadores' : 'Organizador'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event.organizers.map((organizer, orgIndex) => {
                      const logoUrl = (organizer as any).logo_url || 
                                     (organizer as any).image_url || 
                                     (organizer as any).avatar_url || 
                                     (organizer as any).logo ||
                                     (organizer as any).image;
                      
                      return (
                        <div 
                          key={organizer.id} 
                          className={`${orgIndex > 0 ? 'pt-6 border-t' : ''}`}
                        >
                          {/* Organizer Header */}
                          <div className="flex items-start gap-4 mb-4">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={organizer.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-border flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const icon = document.createElement('div');
                                    icon.className = 'h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0';
                                    icon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                    parent.insertBefore(icon, e.currentTarget);
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
                                <User className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{organizer.name}</h3>
                              {organizer.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <a 
                                    href={`mailto:${organizer.email}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {organizer.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Social Media Links */}
                          {(organizer.instagram || organizer.facebook || organizer.youtube || organizer.website || organizer.whatsapp_group) && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                {i18n.language === 'en' ? 'Social Media' : 'Redes Sociales'}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3">
                                {organizer.instagram && (
                                  <a
                                    href={organizer.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                    aria-label={`Instagram de ${organizer.name}`}
                                  >
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <defs>
                                        <linearGradient id={`instagram-gradient-card-${organizer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#f09433" />
                                          <stop offset="25%" stopColor="#e6683c" />
                                          <stop offset="50%" stopColor="#dc2743" />
                                          <stop offset="75%" stopColor="#cc2366" />
                                          <stop offset="100%" stopColor="#bc1888" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                                        fill={`url(#instagram-gradient-card-${organizer.id})`}
                                      />
                                    </svg>
                                  </a>
                                )}
                                {organizer.facebook && (
                                  <a
                                    href={organizer.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                                    aria-label={`Facebook de ${organizer.name}`}
                                  >
                                    <Facebook className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.youtube && (
                                  <a
                                    href={organizer.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-red-600 transition-colors"
                                    aria-label={`YouTube de ${organizer.name}`}
                                  >
                                    <Youtube className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.website && (
                                  <a
                                    href={organizer.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`Website de ${organizer.name}`}
                                  >
                                    <Globe className="h-6 w-6" />
                                  </a>
                                )}
                                {organizer.whatsapp_group && (
                                  <a
                                    href={organizer.whatsapp_group}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-green-600 transition-colors"
                                    aria-label={`Grupo de WhatsApp de ${organizer.name}`}
                                  >
                                    <img 
                                      src={WhatsAppIcon} 
                                      alt="Grupo de WhatsApp" 
                                      className="h-6 w-6"
                                    />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Groups and Communities */}
                          {organizer.groups && organizer.groups.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                {i18n.language === 'en' ? 'Groups & Communities' : 'Grupos y Comunidades'}
                              </h4>
                              <div className="space-y-2">
                                {organizer.groups.map((group) => {
                                  const getGroupIcon = () => {
                                    switch (group.type) {
                                      case 'whatsapp':
                                        return (
                                          <img 
                                            src={WhatsAppIcon} 
                                            alt="WhatsApp" 
                                            className="h-5 w-5"
                                          />
                                        );
                                      case 'telegram':
                                        return (
                                          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                          </svg>
                                        );
                                      case 'facebook':
                                        return <Facebook className="h-5 w-5 text-blue-600" />;
                                      case 'discord':
                                        return (
                                          <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                          </svg>
                                        );
                                      default:
                                        return <Globe className="h-5 w-5" />;
                                    }
                                  };

                                  const getGroupTypeLabel = () => {
                                    switch (group.type) {
                                      case 'whatsapp':
                                        return 'WhatsApp';
                                      case 'telegram':
                                        return 'Telegram';
                                      case 'facebook':
                                        return 'Facebook';
                                      case 'discord':
                                        return 'Discord';
                                      default:
                                        return group.type;
                                    }
                                  };

                                  return (
                                    <a
                                      key={group.id}
                                      href={group.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                    >
                                      <div className="flex-shrink-0">
                                        {getGroupIcon()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                          {group.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {getGroupTypeLabel()}
                                        </p>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                </div>
              )}

              {/* FAQs */}
              {event.faqs && event.faqs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{i18n.language === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {event.faqs
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map(faq => (
                          <div key={faq.id} className="border rounded-lg">
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-4 h-auto text-left"
                              onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                            >
                              <span className="font-medium">{getLocalizedText(faq.question_es, faq.question_en)}</span>
                              {expandedFAQ === faq.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            {expandedFAQ === faq.id && (
                              <div className="px-4 pb-4">
                                <p className="text-muted-foreground">{getLocalizedText(faq.answer_es, faq.answer_en)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Floating reserve button */}
      {(() => {
        // Esperar a que termine la verificación de tickets
        if (hasTickets === null || !event) return null;

        // Todos los eventos deben tener alguna opción, siempre mostrar el botón
        const reserveLink = getReserveLink();

        // Determinar el precio a mostrar
        let priceDisplay = '';
        if (hasTickets === true) {
          // Si hay tickets, mostrar el precio mínimo de los tickets
          if (minTicketPrice) {
            priceDisplay = minTicketPrice;
          } else {
            // Fallback si no hay precio disponible
            priceDisplay = i18n.language === 'en' ? 'Tickets' : 'Entradas';
          }
        } else {
          // Si no hay tickets, mostrar solo el precio "Desde" (from_price)
          if (event && event.from_price) {
            const fromPrice = parseFloat(event.from_price);
            if (isNaN(fromPrice) || fromPrice === 0) {
              priceDisplay = i18n.language === 'en' ? 'FREE' : 'GRATIS';
            } else {
              const fromPriceText = `${fromPrice.toFixed(2)}€`;
              // Si from_price == to_price, no mostrar "Desde"
              if (event.to_price) {
                const toPrice = parseFloat(event.to_price);
                if (!isNaN(toPrice) && toPrice === fromPrice) {
                  priceDisplay = fromPriceText;
                } else {
                  priceDisplay = i18n.language === 'en' 
                    ? `From ${fromPriceText}` 
                    : `Desde ${fromPriceText}`;
                }
              } else {
                priceDisplay = i18n.language === 'en' 
                  ? `From ${fromPriceText}` 
                  : `Desde ${fromPriceText}`;
              }
            }
          } else {
            // Si no hay from_price, mostrar "Consultar precio"
            priceDisplay = i18n.language === 'en' ? 'Contact for price' : 'Consultar precio';
          }
        }

        const handleShare = async () => {
          const eventUrl = window.location.href;
          const eventTitle = getLocalizedText(event.title_es, event.title_en);
          const shareText = i18n.language === 'en' 
            ? `Check out this event: ${eventTitle}`
            : `Echa un vistazo a este evento: ${eventTitle}`;

          // Intentar usar la Web Share API si está disponible
          if (navigator.share) {
            try {
              await navigator.share({
                title: eventTitle,
                text: shareText,
                url: eventUrl,
              });
            } catch (err) {
              // El usuario canceló el share o hubo un error
              if ((err as Error).name !== 'AbortError') {
                console.error('Error sharing:', err);
                // Fallback a copiar al portapapeles
                await navigator.clipboard.writeText(eventUrl);
                toast({
                  title: i18n.language === 'en' ? 'Link copied!' : '¡Enlace copiado!',
                  description: i18n.language === 'en' 
                    ? 'The event link has been copied to your clipboard'
                    : 'El enlace del evento se ha copiado al portapapeles',
                });
              }
            }
          } else {
            // Fallback: copiar al portapapeles
            try {
              await navigator.clipboard.writeText(eventUrl);
              toast({
                title: i18n.language === 'en' ? 'Link copied!' : '¡Enlace copiado!',
                description: i18n.language === 'en' 
                  ? 'The event link has been copied to your clipboard'
                  : 'El enlace del evento se ha copiado al portapapeles',
              });
            } catch (err) {
              console.error('Error copying to clipboard:', err);
              toast({
                title: i18n.language === 'en' ? 'Error' : 'Error',
                description: i18n.language === 'en' 
                  ? 'Could not copy link'
                  : 'No se pudo copiar el enlace',
                variant: 'destructive',
              });
            }
          }
        };

        // Determinar el label del botón según si hay tickets o no
        const attendLabel = checkingUserTicket
          ? (i18n.language === 'en' ? 'Checking availability...' : 'Verificando disponibilidad...')
          : hasTickets === true
          ? (i18n.language === 'en' ? 'Reserve Tickets' : 'Reservar Tickets')
          : (i18n.language === 'en' ? 'Reserve' : 'Reservar');

        return (
          <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 rounded-full bg-black/40 blur-xl opacity-70" />
              <div className="relative flex flex-row items-center gap-2 sm:gap-3 bg-white rounded-full p-2 sm:p-3 shadow-[0_25px_50px_rgba(0,0,0,0.25)] border border-gray-100">
                <div className="flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-full border border-gray-200 bg-gradient-to-br from-white to-gray-50 min-w-[90px] sm:min-w-[110px]">
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {priceDisplay}
                  </span>
                </div>
                <Button 
                  className="flex-1 h-16 sm:h-14 rounded-[999px] text-base sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg relative overflow-hidden group"
                  onClick={() => handleReserveClick(reserveLink)}
                  disabled={checkingUserTicket}
                >
                  <span className="relative z-10">{attendLabel}</span>
                  {!checkingUserTicket && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-300/30 to-orange-400/0 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 sm:h-14 w-16 sm:w-14 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 border border-gray-200"
                  onClick={handleShare}
                  title={i18n.language === 'en' ? 'Share event' : 'Compartir evento'}
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de imagen completa */}
    {selectedPhotoUrl && (
      <div 
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
        onClick={() => setSelectedPhotoUrl(null)}
      >
        <img 
          src={selectedPhotoUrl} 
          alt={getLocalizedText(event.title_es, event.title_en)}
          className="max-w-full max-h-full rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button 
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full px-3 py-1 text-sm"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          {i18n.language === 'en' ? 'Close' : 'Cerrar'}
        </button>
      </div>
    )}
    </div>
    
    {atDoorTicketType && (
      <TicketAtDoorModal
        ticketType={atDoorTicketType}
        open={atDoorModalOpen}
        onOpenChange={setAtDoorModalOpen}
        onSuccess={handleReserveSuccess}
      />
    )}

    {/* Organizer Modal */}
    <Dialog open={!!selectedOrganizer} onOpenChange={(open) => !open && setSelectedOrganizer(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {selectedOrganizer && (() => {
          const organizer = selectedOrganizer;
          const logoUrl = (organizer as any).logo_url || 
                         (organizer as any).image_url || 
                         (organizer as any).avatar_url || 
                         (organizer as any).logo ||
                         (organizer as any).image;

          return (
            <>
              <DialogHeader>
                <DialogTitle>{organizer.name}</DialogTitle>
                <DialogDescription>
                  {i18n.language === 'en' ? 'Organizer information' : 'Información del organizador'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Organizer Header */}
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={organizer.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-border flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const icon = document.createElement('div');
                          icon.className = 'h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0';
                          icon.innerHTML = '<svg class="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                          parent.insertBefore(icon, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{organizer.name}</h3>
                    {organizer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${organizer.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {organizer.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Links */}
                {(organizer.instagram || organizer.facebook || organizer.youtube || organizer.website || organizer.whatsapp_group) && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      {i18n.language === 'en' ? 'Social Media' : 'Redes Sociales'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {organizer.instagram && (
                        <a
                          href={organizer.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity"
                          aria-label={`Instagram de ${organizer.name}`}
                        >
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id={`instagram-gradient-modal-${organizer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f09433" />
                                <stop offset="25%" stopColor="#e6683c" />
                                <stop offset="50%" stopColor="#dc2743" />
                                <stop offset="75%" stopColor="#cc2366" />
                                <stop offset="100%" stopColor="#bc1888" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                              fill={`url(#instagram-gradient-modal-${organizer.id})`}
                            />
                          </svg>
                        </a>
                      )}
                      {organizer.facebook && (
                        <a
                          href={organizer.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-blue-600 transition-colors"
                          aria-label={`Facebook de ${organizer.name}`}
                        >
                          <Facebook className="h-6 w-6" />
                        </a>
                      )}
                      {organizer.youtube && (
                        <a
                          href={organizer.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-red-600 transition-colors"
                          aria-label={`YouTube de ${organizer.name}`}
                        >
                          <Youtube className="h-6 w-6" />
                        </a>
                      )}
                      {organizer.website && (
                        <a
                          href={organizer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Website de ${organizer.name}`}
                        >
                          <Globe className="h-6 w-6" />
                        </a>
                      )}
                      {organizer.whatsapp_group && (
                        <a
                          href={organizer.whatsapp_group}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-green-600 transition-colors"
                          aria-label={`Grupo de WhatsApp de ${organizer.name}`}
                        >
                          <img 
                            src={WhatsAppIcon} 
                            alt="Grupo de WhatsApp" 
                            className="h-6 w-6"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Groups and Communities */}
                {organizer.groups && organizer.groups.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      {i18n.language === 'en' ? 'Groups & Communities' : 'Grupos y Comunidades'}
                    </h4>
                    <div className="space-y-2">
                      {organizer.groups.map((group) => {
                        const getGroupIcon = () => {
                          switch (group.type) {
                            case 'whatsapp':
                              return (
                                <img 
                                  src={WhatsAppIcon} 
                                  alt="WhatsApp" 
                                  className="h-5 w-5"
                                />
                              );
                            case 'telegram':
                              return (
                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                              );
                            case 'facebook':
                              return <Facebook className="h-5 w-5 text-blue-600" />;
                            case 'discord':
                              return (
                                <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                              );
                            default:
                              return <Globe className="h-5 w-5" />;
                          }
                        };

                        const getGroupTypeLabel = () => {
                          switch (group.type) {
                            case 'whatsapp':
                              return 'WhatsApp';
                            case 'telegram':
                              return 'Telegram';
                            case 'facebook':
                              return 'Facebook';
                            case 'discord':
                              return 'Discord';
                            default:
                              return group.type;
                          }
                        };

                        return (
                          <a
                            key={group.id}
                            href={group.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex-shrink-0">
                              {getGroupIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                {group.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getGroupTypeLabel()}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EventDetail;
