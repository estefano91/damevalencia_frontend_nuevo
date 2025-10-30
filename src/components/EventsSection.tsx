import { useEffect, useState } from 'react';
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
  Music,
  Palette,
  PersonStanding,
  HeartPulse,
  Castle,
  Zap,
  Brain,
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
  const [eventSummaries, setEventSummaries] = useState<Record<string, { summary_es?: string; summary_en?: string }>>({});
  
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

  // Obtener summaries faltantes por slug cuando cambian los eventos filtrados
  useEffect(() => {
    const collectSlugs = (): string[] => {
      const slugs: string[] = [];
      filteredEventsByCategory.forEach(cat => {
        cat.events.forEach(ev => {
          const inList = (ev as any).summary_es || (ev as any).summary_en;
          if (!inList && !eventSummaries[ev.event_slug]) {
            slugs.push(ev.event_slug);
          }
        });
      });
      return Array.from(new Set(slugs));
    };

    const fetchAll = async (slugs: string[]) => {
      if (slugs.length === 0) return;
      const results = await Promise.allSettled(slugs.map(slug => dameEventsAPI.getEventBySlug(slug)));
      const next = { ...eventSummaries };
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value.success && res.value.data) {
          const data: any = res.value.data;
          next[slugs[idx]] = { summary_es: data.summary_es, summary_en: data.summary_en };
        }
      });
      setEventSummaries(next);
    };

    fetchAll(collectSlugs());
  }, [filteredEventsByCategory]);

  const getCategoryIcon = (iconName: string, nameEs?: string) => {
    switch (iconName) {
      case 'music_note': return <Music className="h-5 w-5" />;
      case 'sports_kabaddi': return <PersonStanding className="h-5 w-5" />;
      case 'palette': return <Palette className="h-5 w-5" />;
      case 'castle': return <Castle className="h-5 w-5" />;
      case 'fitness_center': return <HeartPulse className="h-5 w-5" />;
      case 'psychology': return <Brain className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
    // Heurística por nombre si el iconName no es distintivo
    const name = (nameEs || '').toLowerCase();
    if (name.includes('experienc')) return <Castle className="h-5 w-5" />;
    if (name.includes('baile') || name.includes('dance')) return <PersonStanding className="h-5 w-5" />;
    if (name.includes('deporte') || name.includes('fitness')) return <HeartPulse className="h-5 w-5" />;
    if (name.includes('música') || name.includes('musica') || name.includes('music')) return <Music className="h-5 w-5" />;
    if (name.includes('arte') || name.includes('cultura') || name.includes('art')) return <Palette className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const getCategoryColor = (categoryId: number) => {
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
            categoryColor={getCategoryColor(categoryData.category.id)}
            categoryIcon={getCategoryIcon(categoryData.category.icon, categoryData.category.name_es)}
            maxEvents={maxEventsPerCategory}
            summariesMap={eventSummaries}
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
  summariesMap: Record<string, { summary_es?: string; summary_en?: string }>;
}

const CategorySection = ({ categoryData, categoryColor, categoryIcon, maxEvents, summariesMap }: CategorySectionProps) => {
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
            summariesMap={summariesMap}
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
  summariesMap: Record<string, { summary_es?: string; summary_en?: string }>;
}

const EventCard = ({ event, categoryColor, summariesMap }: EventCardProps) => {
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
            <Badge variant="default" className="bg-white/90 backdrop-blur-sm">
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
          const fromDetail = summariesMap[event.event_slug];
          const rawSummary = getLocalizedText(event.summary_es, event.summary_en, (event as any).summary)
            || getLocalizedText(fromDetail?.summary_es, fromDetail?.summary_en)
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
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-pink-600" />
            <span>{event.place.name}</span>
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
