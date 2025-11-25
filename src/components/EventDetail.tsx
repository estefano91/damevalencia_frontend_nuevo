import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dameEventsAPI } from "@/integrations/dame-api/events";
import type { DameEventDetail } from "@/integrations/dame-api/events";
import type { Ticket } from "@/types/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Pencil,
  Copy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EventMap from "@/components/EventMap";
import { EventTickets } from "@/components/EventTickets";
import { dameTicketsAPI } from "@/integrations/dame-api/tickets";
import googleMapsIcon from "@/assets/mapsgoogle.png";
import wazeIcon from "@/assets/wazeicon.png";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Ticket } from "@/types/tickets";

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
  const [attendanceStatus, setAttendanceStatus] = useState<{ going: boolean; plusOnes: number } | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceDraft, setAttendanceDraft] = useState<{ going: boolean; plusOnes: number } | null>(null);
  const [attendancePrefLoaded, setAttendancePrefLoaded] = useState(false);
  const [attendanceRefreshToken, setAttendanceRefreshToken] = useState(0);
  const pendingAttendKey = 'dame_pending_attend';
  
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

  const attendanceStorageKey = event?.id ? `dame_attendance_${event.id}` : null;

  useEffect(() => {
    if (!attendanceStorageKey) return;
    setAttendancePrefLoaded(false);
    const stored = localStorage.getItem(attendanceStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed.going === 'boolean' && typeof parsed.plusOnes === 'number') {
          setAttendanceStatus(parsed);
        }
      } catch (error) {
        console.error('Error parsing attendance preference:', error);
      }
    } else {
      setAttendanceStatus(null);
    }
    setAttendancePrefLoaded(true);
  }, [attendanceStorageKey]);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const response = await dameEventsAPI.getEventBySlug(slug);
        console.log('RESPUESTA DE LA API TOTAL', response);
        if (response.success && response.data) {
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

  // Callback para recibir notificación del componente EventTickets sobre si hay tickets
  const handleTicketsLoaded = (hasTickets: boolean, minPrice?: string | null) => {
    setHasTickets(hasTickets);
    setMinTicketPrice(minPrice || null);
  };

  // Función para abrir modal EN_PUERTA directamente
  const openAtDoorModalFnRef = useRef<(() => void) | null>(null);
  
  const handleOpenAtDoorModal = (openFn: () => void) => {
    console.log('📞 EventDetail: handleOpenAtDoorModal llamado');
    openAtDoorModalFnRef.current = openFn;
  };

  const handleUserTicketChange = (hasTicket: boolean) => {
    setUserHasTicket(hasTicket);
    setAttendanceRefreshToken(prev => prev + 1);
  };

  const displayPlusOnes = attendanceStatus
    ? Math.max(attendanceStatus.plusOnes, Math.max(userTicketCount - 1, 0))
    : Math.max(userTicketCount - 1, 0);
  const displayGoing = attendanceStatus ? attendanceStatus.going : userHasTicket;

  const openAttendanceModal = () => {
    const baseStatus = attendanceStatus || {
      going: true,
      plusOnes: Math.max(userTicketCount - 1, 0),
    };
    setAttendanceDraft(baseStatus);
    setAttendanceModalOpen(true);
  };

  const handleAttendanceSave = () => {
    if (!attendanceDraft || !attendanceStorageKey) return;
    setAttendanceStatus(attendanceDraft);
    localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceDraft));
    setAttendanceModalOpen(false);
    toast({
      title: i18n.language === 'en' ? 'Attendance updated' : 'Asistencia actualizada',
      description: attendanceDraft.going
        ? i18n.language === 'en'
          ? 'We have saved your RSVP preference.'
          : 'Hemos guardado tu preferencia de asistencia.'
        : i18n.language === 'en'
          ? 'Remember to manage or cancel your tickets from My Tickets.'
          : 'Recuerda gestionar o cancelar tus entradas desde Mis Entradas.',
    });
    if (!attendanceDraft.going) {
      navigate('/mis-entradas');
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: i18n.language === 'en' ? 'Link copied!' : '¡Enlace copiado!',
        description: i18n.language === 'en'
          ? 'Share it with your guests to confirm attendance.'
          : 'Compártelo con tus invitados para confirmar asistencia.',
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en'
          ? 'Could not copy the link'
          : 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

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
          normalize(event.title),
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

        if (attendancePrefLoaded && !attendanceStatus && matchingTickets.length > 0) {
          setAttendanceStatus({
            going: true,
            plusOnes: Math.max(matchingTickets.length - 1, 0),
          });
        }
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
  }, [user, event?.id, event?.slug, attendancePrefLoaded, attendanceRefreshToken]);

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

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'Duración no especificada';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes} minutos`;
    if (remainingMinutes === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatOnlyDate = (dateString?: string): string => {
    if (!dateString) return 'Fecha por determinar';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: MADRID_TZ
      });
    } catch {
      return 'Fecha por determinar';
    }
  };

  const formatOnlyTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '';
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: MADRID_TZ });
    } catch {
      return '';
    }
  };

  const formatTimeRange = (start?: string, end?: string): string => {
    const from = formatOnlyTime(start);
    const to = formatOnlyTime(end);
    if (from && to) return `De ${from} a ${to}`;
    if (from) return `A las ${from}`;
    return '';
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
    // Si hay tickets configurados en el sistema, no usar tickets_webview
    // Si no hay tickets, usar tickets_webview si existe
    if (hasTickets === false && event?.tickets_webview) {
      return event.tickets_webview;
    }
    
    const whatsappLink = event?.whatsapp_contact;
    if (whatsappLink) {
      const sanitized = whatsappLink.replace(/\+/, '').replace(/\s/g, '');
      const message = i18n.language === 'en' 
        ? `Hello, I would like to reserve a spot for the event "${getLocalizedText(event.title_es, event.title_en)}"`
        : `Hola, me gustaría reservar para el evento "${getLocalizedText(event.title_es, event.title_en)}"`;
      return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
    }
    return null;
  };

  const handleReserveClick = (reserveLink?: string) => {
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

    if (userHasTicket) {
      toast({
        title: i18n.language === 'en' ? 'Already registered' : 'Ya estás registrado',
        description: i18n.language === 'en'
          ? 'You already have a ticket for this event'
          : 'Ya cuentas con una entrada para este evento',
      });
      navigate('/mis-entradas');
      return;
    }

    console.log('🔘 EventDetail: Botón Asistir clickeado', {
      hasOpenAtDoorModalFn: !!openAtDoorModalFnRef.current,
      hasTickets: hasTickets,
      hasReserveLink: !!reserveLink
    });
    
    // Si hay una función para abrir modal EN_PUERTA, abrirlo directamente
    if (openAtDoorModalFnRef.current) {
      console.log('🎯 EventDetail: Abriendo modal EN_PUERTA');
      try {
        openAtDoorModalFnRef.current();
      } catch (error) {
        console.error('❌ EventDetail: Error al abrir modal:', error);
      }
      return;
    }

    // Si hay tickets configurados, hacer scroll a la sección de tickets
    if (hasTickets === true) {
      console.log('📜 EventDetail: Haciendo scroll a sección de tickets');
      const ticketsSection = document.getElementById('event-tickets-section');
      if (ticketsSection) {
        ticketsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Agregar un pequeño offset para que no quede pegado al header
        setTimeout(() => {
          window.scrollBy(0, -80);
        }, 100);
        return;
      }
    }

    // Si no hay tickets, usar el comportamiento anterior (WhatsApp)
    // WhatsApp no requiere login, solo abrir directamente
    if (reserveLink) {
      console.log('📱 EventDetail: Abriendo WhatsApp');
      window.open(reserveLink, "_blank");
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
              {event.is_recurring_weekly && (() => {
                const nextOccurrences = generateNextWeeklyOccurrences(event, 8);
                if (nextOccurrences.length === 0) return null;
                return (
                  <div className="mb-4 -mx-1">
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                      {nextOccurrences.map((occ, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full border text-xs font-medium text-gray-800 whitespace-nowrap bg-white border-gray-200 shadow-sm"
                        >
                          {formatCompactDate(occ)}
                        </span>
                      ))}
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

              {userHasTicket && (
                <Alert className="border-green-200 bg-green-50 text-green-900">
                  <AlertTitle className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    {i18n.language === 'en' ? 'You are already registered' : 'Ya estás apuntado'}
                  </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <span>
                  {i18n.language === 'en'
                    ? 'Show your ticket from the My Tickets section when you arrive at the venue.'
                    : 'Presenta tu entrada desde Mis Entradas cuando llegues al evento.'}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={`px-3 py-1 text-sm ${
                      displayGoing ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {displayGoing
                      ? (displayPlusOnes > 0
                        ? (i18n.language === 'en'
                            ? `You + ${displayPlusOnes} going!`
                            : `Tú + ${displayPlusOnes} asistirán`)
                        : (i18n.language === 'en'
                            ? 'You are going!'
                            : '¡Vas a asistir!'))
                      : (i18n.language === 'en'
                          ? 'You marked as not going'
                          : 'Marcaste que no asistirás')}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-900 hover:bg-green-100"
                    onClick={openAttendanceModal}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {i18n.language === 'en' ? 'Edit attendance' : 'Editar asistencia'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/mis-entradas')}
                  >
                    {i18n.language === 'en' ? 'Open My Tickets' : 'Ver mis entradas'}
                  </Button>
                </div>
              </AlertDescription>
                </Alert>
              )}
            </div>

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
                            const nextOccurrences = generateNextWeeklyOccurrences(event, 4);
                            return nextOccurrences.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground/80">
                                  {i18n.language === 'en' ? 'Next dates:' : 'Próximas fechas:'}
                                </p>
                                <div className="space-y-0.5">
                                  {nextOccurrences.map((occ, idx) => (
                                    <p key={idx} className="text-xs text-muted-foreground">
                                      • {formatCompactDate(occ)}
                                    </p>
                                  ))}
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

              {/* Tickets Section */}
              {event.id && (
                <div id="event-tickets-section">
                  <EventTickets 
                    eventId={event.id} 
                    onTicketsLoaded={handleTicketsLoaded}
                    onOpenAtDoorModal={handleOpenAtDoorModal}
                    onUserTicketChange={handleUserTicketChange}
                  />
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

        // Mostrar el botón si hay tickets O si hay un link de reserva (WhatsApp)
        const reserveLink = getReserveLink();
        const shouldShowButton = hasTickets === true || (hasTickets === false && reserveLink);
        
        if (!shouldShowButton) return null;

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
          // Si no hay tickets, mostrar el precio del evento
          priceDisplay = parseFloat(event?.price_amount || '0') === 0
            ? (i18n.language === 'en' ? 'FREE' : 'GRATIS')
            : formatPrice(event?.price_amount, event?.price_currency);
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

        const attendLabel = userHasTicket
          ? (i18n.language === 'en' ? 'You are already registered' : 'Ya estás apuntado')
          : checkingUserTicket
            ? (i18n.language === 'en' ? 'Checking availability...' : 'Verificando disponibilidad...')
            : (i18n.language === 'en' ? 'Attend' : 'Asistir');

        return (
          <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 rounded-full bg-black/40 blur-xl opacity-70" />
              <div className="relative flex flex-row items-center gap-2 sm:gap-3 bg-white rounded-full p-2 sm:p-3 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
                <span className="px-3 sm:px-4 py-2 rounded-full border text-sm font-semibold text-gray-800 bg-white text-center min-w-[90px] sm:min-w-[110px] flex items-center justify-center">
                  {priceDisplay}
                </span>
                <Button 
                  className="flex-1 h-16 sm:h-14 rounded-[999px] text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={() => handleReserveClick(reserveLink)}
                  disabled={userHasTicket || checkingUserTicket}
                >
                  {attendLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 sm:h-14 w-16 sm:w-14 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
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
    <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{i18n.language === 'en' ? 'Update your RSVP' : 'Actualiza tu asistencia'}</DialogTitle>
          <DialogDescription>
            {i18n.language === 'en'
              ? 'Tell us if you are still going and how many guests you will bring.'
              : 'Cuéntanos si sigues asistiendo y cuántos invitados llevarás.'}
          </DialogDescription>
        </DialogHeader>
        {attendanceDraft && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>{i18n.language === 'en' ? 'Attendance status' : 'Estado de asistencia'}</Label>
              <RadioGroup
                value={attendanceDraft.going ? 'going' : 'not-going'}
                onValueChange={(value) =>
                  setAttendanceDraft({
                    ...attendanceDraft,
                    going: value === 'going',
                  })
                }
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  className={`border rounded-xl px-4 py-3 cursor-pointer flex flex-col gap-1 text-sm ${
                    attendanceDraft.going ? 'border-purple-500 bg-purple-50' : 'border'
                  }`}
                >
                  <RadioGroupItem value="going" className="sr-only" />
                  <span className="font-semibold">{i18n.language === 'en' ? 'Going' : 'Asistiré'}</span>
                  <span className="text-xs text-muted-foreground">
                    {i18n.language === 'en' ? 'Keep my reservation' : 'Mantener mi reserva'}
                  </span>
                </Label>
                <Label
                  className={`border rounded-xl px-4 py-3 cursor-pointer flex flex-col gap-1 text-sm ${
                    !attendanceDraft.going ? 'border-purple-500 bg-purple-50' : 'border'
                  }`}
                >
                  <RadioGroupItem value="not-going" className="sr-only" />
                  <span className="font-semibold">{i18n.language === 'en' ? 'Not going' : 'No asistiré'}</span>
                  <span className="text-xs text-muted-foreground">
                    {i18n.language === 'en' ? 'I will cancel later' : 'Cancelaré más tarde'}
                  </span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>{i18n.language === 'en' ? 'Are you bringing anyone?' : '¿Llevas acompañantes?'}</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setAttendanceDraft({
                      ...attendanceDraft,
                      plusOnes: Math.max(0, attendanceDraft.plusOnes - 1),
                    })
                  }
                  disabled={attendanceDraft.plusOnes <= 0}
                >
                  -
                </Button>
                <div className="text-2xl font-semibold w-16 text-center">{attendanceDraft.plusOnes}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setAttendanceDraft({
                      ...attendanceDraft,
                      plusOnes: Math.min(99, attendanceDraft.plusOnes + 1),
                    })
                  }
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'en'
                  ? 'Let us know how many guests will use your tickets.'
                  : 'Indica cuántos acompañantes usarán tus entradas.'}
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 space-y-2">
              <p className="text-sm font-medium text-purple-900">
                {i18n.language === 'en' ? 'Share the event with your guests' : 'Comparte el evento con tus invitados'}
              </p>
              <p className="text-xs text-purple-800">
                {i18n.language === 'en'
                  ? 'Sending the link helps them confirm their attendance.'
                  : 'Enviar el enlace les ayuda a confirmar su asistencia.'}
              </p>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleCopyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                {i18n.language === 'en' ? 'Copy link now' : 'Copiar enlace ahora'}
              </Button>
            </div>
          </div>
        )}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setAttendanceModalOpen(false)}>
            {i18n.language === 'en' ? 'Close' : 'Cerrar'}
          </Button>
          <Button onClick={handleAttendanceSave} disabled={!attendanceDraft}>
            {i18n.language === 'en' ? 'Update' : 'Actualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EventDetail;
