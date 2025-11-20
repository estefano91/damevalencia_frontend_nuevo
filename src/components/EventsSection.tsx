import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoryFilter } from './AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  MapPin, 
  Euro, 
  Users, 
  Clock, 
  ExternalLink,
  Music2,
  Paintbrush2,
  PersonStanding,
  HeartPulse,
  Castle,
  Zap,
  BrainCircuit,
  Flower2,
  User,
  RefreshCw,
  Repeat
} from 'lucide-react';
import { 
  dameEventsAPI, 
  EventsByCategory, 
  DameEvent,
  formatEventDate,
  formatEventPrice,
  getAvailableSpots,
  isEventSoldOut
} from '@/integrations/dame-api/events';
import googleMapsIcon from '@/assets/mapsgoogle.png';
import wazeIcon from '@/assets/wazeicon.jpg';

interface EventsSectionProps {
  maxEventsPerCategory?: number;
}

const EventsSection = ({ maxEventsPerCategory = 3 }: EventsSectionProps) => {
  const { i18n } = useTranslation();
  const [, forceUpdate] = useState({});
  const [eventsByCategory, setEventsByCategory] = useState<EventsByCategory[]>([]);
  const [filteredEventsByCategory, setFilteredEventsByCategory] = useState<EventsByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCategoryId, setAvailableCategories } = useCategoryFilter();
  
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

  useEffect(() => {
    loadEvents();
  }, []);

  // Efecto para filtrar eventos por categoría
  useEffect(() => {
    if (selectedCategoryId === null) {
      // Mostrar todas las categorías
      setFilteredEventsByCategory(eventsByCategory);
    } else {
      // Filtrar solo la categoría seleccionada
      const filtered = eventsByCategory.filter(
        categoryData => categoryData.category.id === selectedCategoryId
      );
      setFilteredEventsByCategory(filtered);
    }
  }, [selectedCategoryId, eventsByCategory]);

  // Scroll al principio de la página cuando cambia la categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategoryId]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dameEventsAPI.getEventsByCategory();
      if (response.success && response.data) {
        // Eliminar duplicados usando event_slug como identificador único
        const seenEventSlugs = new Set<string>();
        const uniqueCategories = response.data.map(categoryData => {
          const uniqueEvents = categoryData.events.filter(event => {
            if (seenEventSlugs.has(event.event_slug)) {
              console.warn(`🚨 Evento duplicado eliminado: ${event.event_slug}`);
              return false; // Saltar evento duplicado
            }
            seenEventSlugs.add(event.event_slug);
            return true; // Mantener evento único
          });

          return {
            ...categoryData,
            events: uniqueEvents,
            total_events: uniqueEvents.length
          };
        }).filter(categoryData => categoryData.events.length > 0); // Solo categorías con eventos

        console.log(`✅ Eventos únicos cargados: ${seenEventSlugs.size} eventos en ${uniqueCategories.length} categorías`);
        setEventsByCategory(uniqueCategories);

        // Enviar categorías reales al Sidebar
        const categoriesForSidebar = uniqueCategories.map(categoryData => ({
          id: categoryData.category.id,
          name_es: categoryData.category.name_es,
          name_en: categoryData.category.name_en,
          icon: categoryData.category.icon,
          total_events: categoryData.events.length
        }));
        setAvailableCategories(categoriesForSidebar);
      } else {
        setError(response.error || 'Error cargando eventos');
      }
    } catch (err) {
      setError('Error conectando con la API de eventos');
    } finally {
      setLoading(false);
    }
  };


  const getCategoryIcon = (iconName: string, nameEs?: string) => {
    // Primero intentar por icono de la API
    const iconMap: Record<string, React.ReactNode> = {
      'music_note': <Music2 className="h-5 w-5" />, // 🎵 Música
      'sports_kabaddi': <PersonStanding className="h-5 w-5" />, // 💃 Baile
      'palette': <Paintbrush2 className="h-5 w-5" />, // 🎨 Arte
      'castle': <Castle className="h-5 w-5" />, // 🏰 Experiencias
      'fitness_center': <HeartPulse className="h-5 w-5" />, // 💪 Fitness
      'psychology': <BrainCircuit className="h-5 w-5" /> // 🧠 Bienestar Mental
    };
    
    if (iconMap[iconName]) return iconMap[iconName];
    
    // Heurística por nombre si el iconName no es distintivo
    const name = (nameEs || '').toLowerCase();
    if (name.includes('zen') || name.includes('yoga') || name.includes('mindfulness')) return <Flower2 className="h-5 w-5" />; // 🧘 Zen/Yoga
    if (name.includes('experienc')) return <Castle className="h-5 w-5" />;
    if (name.includes('baile') || name.includes('dance')) return <PersonStanding className="h-5 w-5" />;
    if (name.includes('deporte') || name.includes('fitness')) return <HeartPulse className="h-5 w-5" />;
    if (name.includes('música') || name.includes('musica') || name.includes('music')) return <Music2 className="h-5 w-5" />;
    if (name.includes('arte') || name.includes('cultura') || name.includes('art')) return <Paintbrush2 className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const getCategoryColor = (categoryId: number, categoryNameEs?: string) => {
    // Detectar por nombre primero (más preciso)
    if (categoryNameEs) {
      const name = categoryNameEs.toLowerCase();
      if (name.includes('zen') || name.includes('yoga') || name.includes('mindfulness')) {
        return 'from-sky-400 to-cyan-500'; // Azul claro para Zen
      }
      if (name.includes('música') || name.includes('musica') || name.includes('music')) {
        return 'from-pink-500 to-rose-500'; // Música
      }
      if (name.includes('baile') || name.includes('dance')) {
        return 'from-purple-500 to-violet-500'; // Baile
      }
      if (name.includes('arte') || name.includes('cultura') || name.includes('art')) {
        return 'from-blue-500 to-indigo-500'; // Arte
      }
      if (name.includes('fit') || name.includes('deporte') || name.includes('fitness')) {
        return 'from-green-500 to-emerald-500'; // Fitness
      }
      if (name.includes('apoyo') || name.includes('comunidad') || name.includes('support') || name.includes('community')) {
        return 'from-orange-500 to-red-500'; // Apoyo
      }
    }
    // Fallback por ID
    const colors = [
      'from-pink-500 to-rose-500',      // Música
      'from-purple-500 to-violet-500',  // Baile  
      'from-blue-500 to-indigo-500',    // Arte
      'from-green-500 to-emerald-500',  // Fitness
      'from-orange-500 to-red-500'      // Apoyo
    ];
    return colors[(categoryId - 1) % colors.length] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Eventos de DAME Valencia</h2>
          <p className="text-muted-foreground">Cargando eventos...</p>
        </div>
        
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((eventIndex) => (
                <Skeleton key={eventIndex} className="h-64" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Eventos de DAME Valencia</h2>
        </div>
        
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={loadEvents} size="sm" variant="outline">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
        
        <div className="text-center text-muted-foreground">
          <p>💡 Mostrando datos de demostración mientras se conecta con la API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header solo en "Todos los eventos" */}
      {selectedCategoryId === null && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 dame-text-gradient">
            {i18n.language === 'en' ? 'DAME Valencia Events' : 'Eventos de DAME Valencia'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {i18n.language === 'en'
              ? 'Discover our upcoming community activities. Art, music, dance, wellness and much more await you in Valencia.'
              : 'Descubre las próximas actividades organizadas por nuestra comunidad. Arte, música, baile, bienestar y mucho más te esperan en Valencia.'}
          </p>
        </div>
      )}

      {/* Eventos por categoría (incluye recurrentes y únicos) - Filtrados por sidebar */}
      {filteredEventsByCategory.length > 0 ? (
        filteredEventsByCategory.map((categoryData) => (
          <CategorySection 
            key={categoryData.category.id}
            categoryData={categoryData}
            categoryColor={getCategoryColor(categoryData.category.id, categoryData.category.name_es)}
            categoryIcon={getCategoryIcon(categoryData.category.icon, categoryData.category.name_es)}
            maxEvents={maxEventsPerCategory}
          />
        ))
      ) : selectedCategoryId !== null ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold mb-2">No hay eventos en esta categoría</h3>
          <p className="text-muted-foreground">
            Próximamente tendremos más eventos para ti. 
            <br />Mientras tanto, explora otras categorías.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold mb-2">Cargando eventos...</h3>
          <p className="text-muted-foreground">Un momento por favor</p>
        </div>
      )}

      {/* Footer call to action */}
      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          {i18n.language === 'en' ? 'Interested in an event? Contact us for more info!' : '¿Te interesa algún evento? ¡Contáctanos para más información!'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <a href="mailto:admin@organizaciondame.org">
              📧 admin@organizaciondame.org
            </a>
          </Button>
          <Button variant="outline" asChild className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700">
            <a href="https://wa.me/34658236665?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20DAME%20Valencia" target="_blank" rel="noopener noreferrer">
              💬 WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  categoryData: EventsByCategory;
  categoryColor: string;
  categoryIcon: React.ReactNode;
  maxEvents: number;
}

const CategorySection = ({ categoryData, categoryColor, categoryIcon, maxEvents }: CategorySectionProps) => {
  const { category, events } = categoryData;
  const displayEvents = events.slice(0, maxEvents);
  const hasMoreEvents = events.length > maxEvents;
  const { i18n } = useTranslation();
  
  const getLocalizedText = (textEs?: string, textEn?: string, generic?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return (textEs || textEn || generic || '').toString();
  };

  return (
    <div className="space-y-4">
      {/* Título de categoría */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColor}`}>
          <div className="text-white">
            {categoryIcon}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold">{getLocalizedText(category.name_es, category.name_en)}</h3>
          <p className="text-sm text-muted-foreground">
            {i18n.language === 'en'
              ? `${events.length} upcoming event${events.length !== 1 ? 's' : ''}`
              : `${events.length} evento${events.length !== 1 ? 's' : ''} próximo${events.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Grid de eventos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event, index) => (
          <EventCard 
            key={`${event.event_slug}-${index}`} 
            event={event} 
            categoryColor={categoryColor}
          />
        ))}
      </div>

      {/* Mostrar más eventos */}
      {hasMoreEvents && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            {i18n.language === 'en'
              ? `See ${events.length - maxEvents} more event${events.length - maxEvents !== 1 ? 's' : ''} from ${getLocalizedText(category.name_es, category.name_en)}`
              : `Ver ${events.length - maxEvents} evento${events.length - maxEvents !== 1 ? 's' : ''} más de ${getLocalizedText(category.name_es, category.name_en)}`}
          </Button>
        </div>
      )}
    </div>
  );
};

interface EventCardProps {
  event: DameEvent;
  categoryColor: string;
}

const EventCard = ({ event, categoryColor }: EventCardProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  if (!event) return null;

  const availableSpots = getAvailableSpots(event);
  const soldOut = isEventSoldOut(event);
  const isFree = parseFloat(event.price || '0') === 0;
  
  // Helper para obtener el texto en el idioma correcto
  const getLocalizedText = (textEs?: string, textEn?: string, generic?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return textEs || textEn || generic || '';
  };

  const handleCardClick = () => {
    navigate(`/eventos/${event.event_slug}`);
  };

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Imagen principal del evento - main_photo_url desde API organizaciondame.org */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
        {event.main_photo_url ? (
          <img 
            src={event.main_photo_url} 
            alt={event.title_es}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback: Si la imagen principal de la API no carga, mostrar placeholder de DAME
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNlOGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk4MzNlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRBTUUgVmFsZW5jaWE8L3RleHQ+Cjwvc3ZnPgo=';
              e.currentTarget.className = "w-full h-full object-cover";
            }}
          />
        ) : (
          // Placeholder cuando no hay main_photo_url desde la API
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <div className="text-center">
              <div className="text-4xl mb-2">🎭</div>
              <p className="text-sm text-purple-600 font-medium">DAME Valencia</p>
            </div>
          </div>
        )}
        
        {/* Badge de precio sobre la imagen */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isFree ? (
            <Badge className="bg-green-600 hover:bg-green-700 text-white backdrop-blur-sm font-bold">
              {i18n.language === 'en' ? 'Free' : 'Gratuito'}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-white text-black dark:bg-white dark:text-black border border-input backdrop-blur-sm font-bold">
              {formatEventPrice(event.price || '0', i18n.language === 'en' ? 'en-US' : 'es-ES')}
            </Badge>
          )}
          {event.is_recurring_weekly && (
            <Badge className="bg-blue-600 text-white">
              <Repeat className="mr-1 h-3 w-3" />
              {i18n.language === 'en' ? 'Weekly' : 'Semanal'}
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight group-hover:text-purple-600 transition-colors">
          {getLocalizedText(event.title_es, event.title_en)}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Resumen del evento visible y consistente */}
        {(() => {
          // Usar directamente la información que viene de by-category
          const rawSummary = getLocalizedText(event.short_description_es, event.short_description_en)
            || getLocalizedText(event.summary_es, event.summary_en, (event as any).summary)
            || getLocalizedText(event.description_es, event.description_en, (event as any).description);
          const summary = rawSummary ? String(rawSummary) : '';
          const trimmed = summary.length > 240 ? summary.slice(0, 240) + '…' : summary;
          return (
            <div className="h-16 overflow-hidden">
              <p className="text-sm text-muted-foreground line-clamp-3">{trimmed}</p>
            </div>
          );
        })()}

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-purple-600" />
          <div className="flex-1">
            <span className="font-medium">
              {formatEventDate(event.start, i18n.language === 'en' ? 'en-US' : 'es-ES')}
            </span>
            {event.is_recurring_weekly && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                <Repeat className="inline h-3 w-3 mr-1" />
                {i18n.language === 'en' ? 'Repeats weekly' : 'Se repite semanalmente'}
              </p>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {event.place && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pink-600 flex-shrink-0" />
              <span className="truncate">{event.place.name}</span>
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
                const query = `${event.place.address}`.trim();
                wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
              } else if (event.place.name) {
                wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(event.place.name)}&navigate=yes`;
              }

              return (googleMapsUrl || wazeUrl) ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                      onClick={(e) => e.stopPropagation()}
                      title={i18n.language === 'en' ? 'Open in Google Maps' : 'Abrir en Google Maps'}
                    >
                      <img 
                        src={googleMapsIcon} 
                        alt="Google Maps" 
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                      />
                      <span className="truncate">{i18n.language === 'en' ? 'Google Maps' : 'Google Maps'}</span>
                    </a>
                  )}
                  {wazeUrl && (
                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                      onClick={(e) => e.stopPropagation()}
                      title={i18n.language === 'en' ? 'Open in Waze' : 'Abrir en Waze'}
                    >
                      <img 
                        src={wazeIcon} 
                        alt="Waze" 
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain rounded-full flex-shrink-0"
                      />
                      <span className="truncate">Waze</span>
                    </a>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Capacidad y disponibilidad */}
        {event.capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span>
              {i18n.language === 'en' 
                ? `${event.registered_count || 0}/${event.capacity} people`
                : `${event.registered_count || 0}/${event.capacity} personas`}
            </span>
            {soldOut ? (
              <Badge variant="destructive" className="ml-auto">{i18n.language === 'en' ? 'Full' : 'Completo'}</Badge>
            ) : (
              <Badge variant="outline" className="ml-auto">
                {i18n.language === 'en' 
                  ? `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} available`
                  : `${availableSpots} disponible${availableSpots !== 1 ? 's' : ''}`}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Los eventos recurrentes se muestran una sola vez en sus categorías normales
// La selección de fechas específicas se maneja en la vista detallada

export default EventsSection;
