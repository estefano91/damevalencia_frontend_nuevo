import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Heart,
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
  const [eventsByCategory, setEventsByCategory] = useState<EventsByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

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
      } else {
        setError(response.error || 'Error cargando eventos');
      }
    } catch (err) {
      setError('Error conectando con la API de eventos');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'music_note': return <Music className="h-5 w-5" />;
      case 'sports_kabaddi': return <Heart className="h-5 w-5" />;
      case 'palette': return <Palette className="h-5 w-5" />;
      case 'fitness_center': return <Zap className="h-5 w-5" />;
      case 'psychology': return <Brain className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
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
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 dame-text-gradient">
          Eventos de DAME Valencia
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre las próximas actividades organizadas por nuestra comunidad. 
          Arte, música, baile, bienestar y mucho más te esperan en Valencia.
        </p>
      </div>

      {/* Eventos por categoría (incluye recurrentes y únicos) */}
      {eventsByCategory.map((categoryData) => (
        <CategorySection 
          key={categoryData.category.id}
          categoryData={categoryData}
          categoryColor={getCategoryColor(categoryData.category.id)}
          categoryIcon={getCategoryIcon(categoryData.category.icon)}
          maxEvents={maxEventsPerCategory}
        />
      ))}

      {/* Footer call to action */}
      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          ¿Te interesa algún evento? ¡Contáctanos para más información!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <a href="mailto:admin@organizaciondame.org">
              📧 admin@organizaciondame.org
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="tel:+34644070282">
              📞 (+34) 64 40 70 282
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
          <h3 className="text-2xl font-bold">{category.name_es}</h3>
          <p className="text-sm text-muted-foreground">
            {category.total_events} evento{category.total_events !== 1 ? 's' : ''} próximo{category.total_events !== 1 ? 's' : ''}
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
            Ver {events.length - maxEvents} evento{events.length - maxEvents !== 1 ? 's' : ''} más de {category.name_es}
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
  
  if (!event) return null;

  const availableSpots = getAvailableSpots(event);
  const soldOut = isEventSoldOut(event);
  const isFree = parseFloat(event.price || '0') === 0;

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
          <Badge variant={isFree ? "secondary" : "default"} className="bg-white/90 backdrop-blur-sm">
            {formatEventPrice(event.price || '0')}
          </Badge>
          {event.is_recurring_weekly && (
            <Badge className="bg-blue-600 text-white">
              <Repeat className="mr-1 h-3 w-3" />
              Semanal
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight group-hover:text-purple-600 transition-colors">
          {event.title_es}
        </CardTitle>
        
        {/* Descripción si existe */}
        {event.description_es && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description_es}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-purple-600" />
          <div className="flex-1">
            <span className="font-medium">
              {formatEventDate(event.start)}
            </span>
            {event.is_recurring_weekly && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                <Repeat className="inline h-3 w-3 mr-1" />
                Se repite semanalmente
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
              {event.registered_count || 0}/{event.capacity} personas
            </span>
            {soldOut ? (
              <Badge variant="destructive" className="ml-auto">Completo</Badge>
            ) : (
              <Badge variant="outline" className="ml-auto">
                {availableSpots} disponible{availableSpots !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {/* Botón de acción */}
        <div className="pt-2">
          <Button 
            className={`w-full bg-gradient-to-r ${categoryColor} hover:opacity-90`}
            disabled={soldOut}
            onClick={(e) => {
              e.stopPropagation(); // Evitar que se dispare el click del card
              handleCardClick();
            }}
          >
            {soldOut ? (
              <>
                <Users className="mr-2 h-4 w-4" />
                Ver Detalles
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                {isFree ? 'Ver Detalles' : 'Reservar Plaza'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Los eventos recurrentes se muestran una sola vez en sus categorías normales
// La selección de fechas específicas se maneja en la vista detallada

export default EventsSection;
