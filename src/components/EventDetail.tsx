import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dameEventsAPI } from "@/integrations/dame-api/events";
import type { DameEventDetail } from "@/integrations/dame-api/events";
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
  Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EventMap from "@/components/EventMap";

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
    if (event?.tickets_webview) return event.tickets_webview;
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

  const handleReserveClick = (reserveLink: string) => {
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description:
          i18n.language === 'en'
            ? 'Please sign in to reserve your spot at this event.'
            : 'Inicia sesión para reservar tu plaza en este evento.',
      });
      navigate("/auth", { state: { from: location.pathname + location.search } });
      return;
    }
    window.open(reserveLink, "_blank");
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
                      <div className="flex items-start justify-between gap-3">
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
                          // Generar URL de Google Maps
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

                          let mapsUrl = '';
                          if (hasValidCoords) {
                            // Usar coordenadas si están disponibles (más preciso)
                            mapsUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${latNum},${lngNum}&zoom=15`;
                          } else if (event.place.address) {
                            // Usar dirección si no hay coordenadas
                            const query = `${event.place.name || ''} ${event.place.address} ${event.place.city || ''}`.trim();
                            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                          } else if (event.place.name) {
                            // Usar solo el nombre del lugar
                            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.place.name)}`;
                          }

                          return mapsUrl ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0 gap-2"
                            >
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Navigation className="h-4 w-4" />
                                <span>{i18n.language === 'en' ? 'Maps' : 'Mapas'}</span>
                              </a>
                            </Button>
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
        const reserveLink = getReserveLink();
        if (!reserveLink) return null;
        return (
          <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 rounded-full bg-black/40 blur-xl opacity-70" />
              <div className="relative flex flex-row items-center gap-3 bg-white rounded-full p-2 sm:p-3 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
                <span className="px-4 py-2 rounded-full border text-sm font-semibold text-gray-800 bg-white text-center min-w-[110px] flex items-center justify-center">
                  {parseFloat(event?.price_amount || '0') === 0
                    ? (i18n.language === 'en' ? 'FREE' : 'GRATIS')
                    : formatPrice(event?.price_amount, event?.price_currency)}
                </span>
                <Button 
                  className="flex-1 h-16 sm:h-14 rounded-[999px] text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  onClick={() => handleReserveClick(reserveLink)}
                >
                  {i18n.language === 'en' ? 'Attend' : 'Asistir'}
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
  );
};

export default EventDetail;
