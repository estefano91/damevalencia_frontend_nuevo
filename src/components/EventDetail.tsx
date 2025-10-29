import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CalendarDays
} from "lucide-react";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<DameEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedRecurringDate, setSelectedRecurringDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const response = await dameEventsAPI.getEventBySlug(slug);
        if (response.success && response.data) {
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

  // Helper functions
  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const getAvailableSpots = (capacity?: number, registered?: number): number => {
    if (!capacity) return 0;
    return capacity - (registered || 0);
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
            Volver al inicio
          </Button>
          <Alert>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'No se pudo cargar el evento.'}
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
          Volver al inicio
        </Button>

        {/* Main Event Image */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-6 shadow-lg">
          {event.main_photo_url ? (
            <img 
              src={event.main_photo_url}
              alt={event.title_es}
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
                Destacado
              </Badge>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-lg font-bold">
              {formatPrice(event.price_amount, event.price_currency)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Summary */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 dame-text-gradient">
                {event.title_es}
              </h1>
              {event.summary_es && (
                <p className="text-xl text-muted-foreground mb-4">
                  {event.summary_es}
                </p>
              )}
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categories.map(category => (
                  <Badge key={category.id} variant="outline" className="border-purple-200">
                    {category.name_es}
                  </Badge>
                ))}
                {event.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name_es}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            {event.description_es && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {event.description_es}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Program Schedule */}
            {event.programs && event.programs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Programa del evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.programs
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(program => (
                        <div key={program.id} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className="text-2xl">{program.icon || '🕐'}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-purple-600">{program.time}</span>
                              <span className="font-semibold">{program.title_es}</span>
                            </div>
                            {program.description_es && (
                              <p className="text-sm text-muted-foreground">
                                {program.description_es}
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
                    Galería de fotos
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllPhotos(!showAllPhotos)}
                    >
                      {showAllPhotos ? (
                        <>Ocultar <ChevronUp className="ml-1 h-4 w-4" /></>
                      ) : (
                        <>Ver todas <ChevronDown className="ml-1 h-4 w-4" /></>
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
                        <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={photo.image_url}
                            alt={photo.caption_es || event.title_es}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNlOGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk4MzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRBTUUgVmFsZW5jaWE8L3RleHQ+Cjwvc3ZnPgo=';
                            }}
                          />
                          {photo.caption_es && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                              <p className="text-sm">{photo.caption_es}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fechas disponibles para eventos recurrentes */}
            {event.is_recurring_weekly && event.recurring_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-blue-600" />
                    Fechas disponibles
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {event.recurring_info.schedule_info}
                    {event.recurring_info.total_sessions && (
                      <span className="ml-2">• Total: {event.recurring_info.total_sessions} sesiones</span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {event.recurring_info.next_dates.map((eventDate) => (
                      <div
                        key={eventDate.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRecurringDate === eventDate.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : eventDate.is_full
                            ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                        }`}
                        onClick={() => {
                          if (!eventDate.is_full) {
                            setSelectedRecurringDate(
                              selectedRecurringDate === eventDate.id ? null : eventDate.id
                            );
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {formatDateTime(eventDate.date)}
                            </span>
                          </div>
                          {eventDate.is_full ? (
                            <Badge variant="destructive" className="text-xs">
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {eventDate.available_spots} plazas
                            </Badge>
                          )}
                        </div>
                        
                        {eventDate.registration_deadline && (
                          <p className="text-xs text-muted-foreground">
                            Inscripción hasta: {formatDateTime(eventDate.registration_deadline)}
                          </p>
                        )}
                        
                        {selectedRecurringDate === eventDate.id && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                              ✓ Fecha seleccionada para reservar
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (event.whatsapp_contact) {
                                  const message = `Hola, me gustaría reservar para "${event.title_es}" el ${formatDateTime(eventDate.date)}`;
                                  window.open(
                                    `https://wa.me/${event.whatsapp_contact.replace(/\+/, '').replace(/\s/g, '')}?text=${encodeURIComponent(message)}`,
                                    '_blank'
                                  );
                                }
                              }}
                            >
                              <MessageCircle className="mr-2 h-3 w-3" />
                              Reservar esta fecha
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!selectedRecurringDate && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 Selecciona una fecha específica para reservar tu plaza
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {event.faqs && event.faqs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preguntas frecuentes</CardTitle>
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
                            <span className="font-medium">{faq.question_es}</span>
                            {expandedFAQ === faq.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          {expandedFAQ === faq.id && (
                            <div className="px-4 pb-4">
                              <p className="text-muted-foreground">{faq.answer_es}</p>
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
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card className="sticky top-24 sm:top-28 md:top-32">
              <CardHeader>
                <CardTitle>Detalles del evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">
                      {event.is_recurring_weekly ? "Horario semanal" : "Fecha y hora"}
                    </p>
                    {event.is_recurring_weekly && event.recurring_info ? (
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          <Repeat className="inline h-3 w-3 mr-1" />
                          {event.recurring_info.schedule_info}
                        </p>
                        {selectedRecurringDate && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            ✓ Fecha seleccionada: {
                              event.recurring_info.next_dates
                                .find(d => d.id === selectedRecurringDate)
                                ?.date ? formatDateTime(
                                  event.recurring_info.next_dates
                                    .find(d => d.id === selectedRecurringDate)!.date
                                ) : ''
                            }
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(event.start_datetime)}
                        </p>
                        {event.end_datetime && (
                          <p className="text-sm text-muted-foreground">
                            Hasta: {formatDateTime(event.end_datetime)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration */}
                {event.duration_minutes && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(event.duration_minutes)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">
                      {event.place.name}
                    </p>
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

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Capacidad</p>
                      <p className="text-sm text-muted-foreground">
                        {getAvailableSpots(event.capacity)} plazas disponibles de {event.capacity}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Precio</p>
                    <p className="text-lg font-bold dame-text-gradient">
                      {formatPrice(event.price_amount, event.price_currency)}
                    </p>
                  </div>
                </div>

                {/* Recurring */}
                {event.is_recurring_weekly && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      📅 Este evento se repite semanalmente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact & Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Reservar tu lugar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* WhatsApp Contact */}
                {event.whatsapp_contact && (
                  <Button 
                    className="w-full dame-gradient"
                    disabled={event.is_recurring_weekly && !selectedRecurringDate}
                    onClick={() => {
                      let message = `Hola, me gustaría reservar para el evento "${event.title_es}"`;
                      
                      if (event.is_recurring_weekly && selectedRecurringDate && event.recurring_info) {
                        const selectedDate = event.recurring_info.next_dates.find(d => d.id === selectedRecurringDate);
                        if (selectedDate) {
                          message += ` el ${formatDateTime(selectedDate.date)}`;
                        }
                      }
                      
                      window.open(
                        `https://wa.me/${event.whatsapp_contact.replace(/\+/, '').replace(/\s/g, '')}?text=${encodeURIComponent(message)}`,
                        '_blank'
                      );
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {event.is_recurring_weekly 
                      ? (selectedRecurringDate ? 'Reservar fecha seleccionada' : 'Selecciona una fecha primero')
                      : 'Reservar por WhatsApp'
                    }
                  </Button>
                )}

                {/* Organizers Contact */}
                {event.organizers && event.organizers.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Organizadores:</p>
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
                    ¿Tienes preguntas? Contáctanos:
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
  );
};

export default EventDetail;
