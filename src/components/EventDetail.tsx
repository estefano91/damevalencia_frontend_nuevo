import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Users, 
  Clock, 
  Euro,
  MessageCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Repeat,
  CalendarDays,
  Music,
  Coffee
} from "lucide-react";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n, ready } = useTranslation();
  const [event, setEvent] = useState<DameEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver al inicio'}
        </Button>

        {/* Main Event Image */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-6 shadow-lg">
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
          
          {/* Featured Badge */}
          {event.is_featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-500 text-white">
                <Star className="mr-1 h-3 w-3" />
                {i18n.language === 'en' ? 'Featured' : 'Destacado'}
              </Badge>
            </div>
          )}

          {/* Price Badge eliminado en portada */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Summary */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 dame-text-gradient">
                {getLocalizedText(event.title_es, event.title_en)}
              </h1>
              {event.is_recurring_weekly && (
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  📅 {i18n.language === 'en' ? 'This event repeats weekly' : 'Este evento se repite semanalmente'}
                </p>
              )}
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

            {/* Additional Photos */}
            {event.photos && event.photos.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {i18n.language === 'en' ? 'Photo gallery' : 'Galería de fotos'}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllPhotos(!showAllPhotos)}
                    >
                      {showAllPhotos ? (
                        <>{i18n.language === 'en' ? 'Hide' : 'Ocultar'} <ChevronUp className="ml-1 h-4 w-4" /></>
                      ) : (
                        <>{i18n.language === 'en' ? 'Show all' : 'Ver todas'} <ChevronDown className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${showAllPhotos ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {event.photos
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .slice(0, showAllPhotos ? undefined : 4)
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

          {/* Sidebar */}
          <div className="">
            <div className="sticky top-24 sm:top-28 md:top-32 space-y-6">
              {/* Event Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{i18n.language === 'en' ? 'Event details' : 'Detalles del evento'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Date */}
                {event.is_recurring_weekly ? (
                  <>
                    {/* Día de la semana */}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">{i18n.language === 'en' ? 'Day' : 'Día'}</p>
                        <p className="text-sm text-muted-foreground">
                          {i18n.language === 'en' 
                            ? `Every ${getWeekdayName(event.recurrence_weekday)}` 
                            : `Todos los ${getWeekdayName(event.recurrence_weekday)}`}
                        </p>
                      </div>
                    </div>

                    {/* Horario */}
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
                    
                    {/* Time */}
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
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{i18n.language === 'en' ? 'Location' : 'Ubicación'}</p>
                      {event.place.name && (
                        <p className="text-sm text-muted-foreground">
                          {event.place.name}
                        </p>
                      )}
                      {event.place.address && (
                        <p className="text-sm text-muted-foreground">
                          {event.place.address}
                        </p>
                      )}
                      {event.place.city && (
                        <p className="text-sm text-muted-foreground">
                          {event.place.city}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{i18n.language === 'en' ? 'Capacity' : 'Capacidad'}</p>
                      <p className="text-sm text-muted-foreground">
                        {i18n.language === 'en' 
                          ? `${getAvailableSpots(event.capacity)} spots available out of ${event.capacity}`
                          : `${getAvailableSpots(event.capacity)} plazas disponibles de ${event.capacity}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{i18n.language === 'en' ? 'Price' : 'Precio'}</p>
                    {parseFloat(event.price_amount || '0') === 0 ? (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white text-lg px-3 py-1">
                        {i18n.language === 'en' ? 'Free' : 'Gratuito'}
                      </Badge>
                    ) : (
                      <p className="text-lg font-bold dame-text-gradient">
                        {formatPrice(event.price_amount, event.price_currency)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Recurring notice movido bajo el título */}
                </CardContent>
              </Card>

              {/* Contact & Registration */}
              <Card>
                <CardHeader>
                  <CardTitle>{i18n.language === 'en' ? 'Reserve your spot' : 'Reservar tu lugar'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* WhatsApp Contact */}
                {event.whatsapp_contact && (
                  <Button 
                    className="w-full dame-gradient"
                    onClick={() => {
                      let message = i18n.language === 'en' 
                        ? `Hello, I would like to reserve a spot for the event "${getLocalizedText(event.title_es, event.title_en)}"`
                        : `Hola, me gustaría reservar para el evento "${getLocalizedText(event.title_es, event.title_en)}"`;
                      if (event.is_recurring_weekly) {
                        message += ` (${formatRecurringSchedule(event)})`;
                      } else {
                        if (i18n.language === 'en') {
                          message += ` on ${formatOnlyDate(event.start_datetime)} ${formatTimeRange(event.start_datetime, event.end_datetime)}`;
                      } else {
                        message += ` el ${formatOnlyDate(event.start_datetime)} ${formatTimeRange(event.start_datetime, event.end_datetime)}`;
                        }
                      }
                      
                      window.open(
                        `https://wa.me/${event.whatsapp_contact.replace(/\+/, '').replace(/\s/g, '')}?text=${encodeURIComponent(message)}`,
                        '_blank'
                      );
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'Reserve via WhatsApp' : 'Reservar por WhatsApp'}
                  </Button>
                )}

                {/* Community WhatsApp Link */}
                {event.categories && event.categories.length > 0 && (() => {
                  const communityLink = getCommunityWhatsAppLink(event.categories[0].name_es);
                  if (communityLink) {
                    return (
                      <Button 
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => window.open(communityLink, '_blank')}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {i18n.language === 'en' ? 'Join Community' : 'Unirse a la Comunidad'}
                      </Button>
                    );
                  }
                  return null;
                })()}

                {/* Organizers Contact */}
                {event.organizers && event.organizers.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">{i18n.language === 'en' ? 'Organizers:' : 'Organizadores:'}</p>
                    <div className="space-y-2">
                      {event.organizers.map(organizer => (
                        <div key={organizer.id} className="text-sm">
                          <p className="font-medium">{organizer.name}</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-0 h-auto text-muted-foreground hover:text-primary"
                            onClick={() => window.open(`mailto:${organizer.email}`)}
                          >
                            <Mail className="mr-1 h-3 w-3" />
                            {organizer.email}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Contact */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    {i18n.language === 'en' ? 'Have questions? Contact us:' : '¿Tienes preguntas? Contáctanos:'}
                  </p>
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-0 h-auto text-muted-foreground hover:text-primary"
                      onClick={() => window.open('tel:+34658236665')}
                    >
                      <Phone className="mr-1 h-3 w-3" />
                      (+34) 658 236 665
                    </Button>
                    <br />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-0 h-auto text-muted-foreground hover:text-primary"
                      onClick={() => window.open('mailto:admin@organizaciondame.org')}
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      admin@organizaciondame.org
                    </Button>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
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
