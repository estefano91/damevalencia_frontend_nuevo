import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoryFilter } from './AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Repeat,
  CheckCircle,
  Filter,
  List,
  ListFilter,
  X,
  Crown,
  Sparkles,
  Edit2,
  HelpCircle
} from 'lucide-react';
import { 
  dameEventsAPI, 
  EventsByCategory, 
  DameEvent,
  formatEventDate,
  formatEventPrice,
  formatPerennialSchedule,
  getAvailableSpots,
  isEventSoldOut
} from '@/integrations/dame-api/events';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import { interestsApi } from '@/api/interests';
import type { UserInterest } from '@/types/interests';
import { InterestsModal } from '@/components/InterestsModal';

interface UserAttendance {
  event_slug?: string;
  event_id?: number;
}

interface EventsSectionProps {
  maxEventsPerCategory?: number;
}

const EventsSection = ({ maxEventsPerCategory = 3 }: EventsSectionProps) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [, forceUpdate] = useState({});
  const [eventsByCategory, setEventsByCategory] = useState<EventsByCategory[]>([]);
  const [filteredEventsByCategory, setFilteredEventsByCategory] = useState<EventsByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCategoryId, setSelectedCategoryId, setAvailableCategories } = useCategoryFilter();
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [userTickets, setUserTickets] = useState<UserAttendance[]>([]);
  const [userTicketsLoaded, setUserTicketsLoaded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<DameEvent[]>([]);
  const [interestsModalOpen, setInterestsModalOpen] = useState(false);
  
  // Inicializar dateFilter en 'all' por defecto
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'weekend'>('all');

  // Estado para controlar si la barra de membresía está cerrada
  // Se resetea en cada cambio de página, refrescar o nuevo login
  const [membershipBannerClosed, setMembershipBannerClosed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMembershipBanner, setShowMembershipBanner] = useState(true);

  // Resetear el estado en cada cambio de página, refrescar o nuevo login
  useEffect(() => {
    // Resetear siempre que cambie la ruta o el usuario
    setMembershipBannerClosed(false);
    setShowMembershipBanner(true);
    setLastScrollY(0);
  }, [location.pathname, user?.id]);

  // Controlar visibilidad de la barra basado en scroll (igual que la barra de filtro)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar cuando se hace scroll hacia arriba o está cerca del top
      if (currentScrollY < 100) {
        setShowMembershipBanner(true);
      } else if (currentScrollY < lastScrollY) {
        // Scroll hacia arriba - mostrar
        setShowMembershipBanner(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll hacia abajo - ocultar
        setShowMembershipBanner(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleCloseMembershipBanner = () => {
    setMembershipBannerClosed(true);
  };

  // Guardar el filtro cuando cambie y hacer scroll al inicio
  const handleDateFilterChange = (value: 'all' | 'today' | 'tomorrow' | 'weekend') => {
    setDateFilter(value);
    // Hacer scroll al inicio cuando cambia el filtro
    window.scrollTo(0, 0);
  };

  // Resetear el filtro a 'all' cuando cambie la categoría
  useEffect(() => {
    setDateFilter('all');
  }, [selectedCategoryId]);

  // Calcular el ancho del sidebar para posicionar la barra correctamente
  useEffect(() => {
    const calculateSidebarWidth = () => {
      if (isMobile) {
        // En móvil, el sidebar está oculto (0px)
        setSidebarWidth(0);
      } else {
        // En desktop, buscar el sidebar en el DOM
        const sidebar = document.querySelector('[class*="fixed"][class*="left-0"][class*="z-40"]') as HTMLElement;
        if (sidebar) {
          const width = sidebar.offsetWidth || sidebar.getBoundingClientRect().width;
          setSidebarWidth(width);
        } else {
          // Por defecto en desktop: 256px si está abierto, 48px si está cerrado
          // Asumimos que está abierto por defecto en desktop
          setSidebarWidth(256);
        }
      }
    };

    calculateSidebarWidth();
    
    // Recalcular cuando cambie el tamaño de la ventana o cuando cambie selectedCategoryId
    const handleResize = () => {
      calculateSidebarWidth();
    };
    
    window.addEventListener('resize', handleResize);
    // Recalcular periódicamente para detectar cambios en el sidebar
    const interval = setInterval(calculateSidebarWidth, 300);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [isMobile, selectedCategoryId]);

  // Helper para obtener el texto del filtro seleccionado
  const getFilterLabel = (filter: 'all' | 'today' | 'tomorrow' | 'weekend'): string => {
    if (i18n.language === 'en') {
      switch (filter) {
        case 'all': return 'Always';
        case 'today': return 'Today';
        case 'tomorrow': return 'Tomorrow';
        case 'weekend': return 'Weekend';
        default: return 'Always';
      }
    } else {
      switch (filter) {
        case 'all': return 'Siempre';
        case 'today': return 'Hoy';
        case 'tomorrow': return 'Mañana';
        case 'weekend': return 'FinDeSemana';
        default: return 'Siempre';
      }
    }
  };
  
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

  // Función helper para obtener fecha en zona horaria de España
  const getSpainDate = (date: Date = new Date()): Date => {
    // Convertir a zona horaria de España (Europe/Madrid)
    const spainTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    return spainTime;
  };

  // Función helper para comparar solo la fecha (sin hora)
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Función para filtrar eventos por fecha
  const filterEventsByDate = (events: DameEvent[], filter: 'all' | 'today' | 'tomorrow' | 'weekend'): DameEvent[] => {
    if (filter === 'all') return events;

    const now = getSpainDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events.filter(event => {
      if (!event.start) return false;
      
      const eventDate = new Date(event.start);
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      switch (filter) {
        case 'today':
          return isSameDate(eventDateOnly, today);
        
        case 'tomorrow':
          return isSameDate(eventDateOnly, tomorrow);
        
        case 'weekend': {
          // Fin de semana: desde el viernes hasta el domingo
          const dayOfWeek = eventDateOnly.getDay(); // 0 = domingo, 5 = viernes, 6 = sábado
          const todayDayOfWeek = today.getDay();
          
          // Solo eventos futuros o de hoy
          if (eventDateOnly < today) return false;
          
          // Si hoy es viernes, sábado o domingo, mostrar eventos de este fin de semana (futuros o hoy)
          if (todayDayOfWeek >= 5 || todayDayOfWeek === 0) {
            // Estamos en fin de semana, mostrar eventos de viernes, sábado o domingo de esta semana
            // Calcular el viernes de esta semana
            const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Lunes = 0
            const thisWeekFriday = new Date(today);
            thisWeekFriday.setDate(thisWeekFriday.getDate() - daysFromMonday + 4); // Viernes
            const thisWeekSunday = new Date(thisWeekFriday);
            thisWeekSunday.setDate(thisWeekSunday.getDate() + 2); // Domingo
            
            return eventDateOnly >= thisWeekFriday && eventDateOnly <= thisWeekSunday && 
                   (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);
          } else {
            // Estamos entre lunes y jueves, mostrar eventos del próximo fin de semana
            const daysUntilFriday = 5 - todayDayOfWeek;
            const nextFriday = new Date(today);
            nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
            const nextSunday = new Date(nextFriday);
            nextSunday.setDate(nextSunday.getDate() + 2);
            
            return eventDateOnly >= nextFriday && eventDateOnly <= nextSunday;
          }
        }
        
        default:
          return true;
      }
    });
  };

  // Efecto para filtrar eventos por categoría y fecha
  useEffect(() => {
    let filtered = eventsByCategory;

    // Filtrar por categoría
    if (selectedCategoryId !== null) {
      filtered = filtered.filter(
        categoryData => categoryData.category.id === selectedCategoryId
      );
    }

    // Filtrar por fecha
    if (dateFilter !== 'all') {
      filtered = filtered.map(categoryData => ({
        ...categoryData,
        events: filterEventsByDate(categoryData.events, dateFilter)
      })).filter(categoryData => categoryData.events.length > 0); // Solo categorías con eventos después del filtro
    }

    setFilteredEventsByCategory(filtered);
  }, [selectedCategoryId, eventsByCategory, dateFilter]);

  // Scroll al principio de la página cuando cambia la categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user) {
        setUserTickets([]);
        setUserTicketsLoaded(true);
        return;
      }

      setUserTicketsLoaded(false);
      try {
        const response = await dameTicketsAPI.getMyCurrentTickets(1);
        if (response.success && response.data?.results) {
          const tickets = response.data.results.map((ticket) => ({
            event_slug: ticket.event_slug,
            event_id: ticket.event_id,
          }));
          console.log('🎫 EventsSection: User tickets loaded:', tickets);
          console.log('🎫 EventsSection: Full ticket data sample:', response.data.results[0]);
          setUserTickets(tickets);
        } else {
          console.log('🎫 EventsSection: No tickets found');
          setUserTickets([]);
        }
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        setUserTickets([]);
      } finally {
        setUserTicketsLoaded(true);
      }
    };

    fetchUserTickets();
  }, [user]);

  // Load user interests
  const loadUserInterests = async () => {
    if (!user) {
      setUserInterests([]);
      return;
    }

    const accessToken = localStorage.getItem("dame_access_token");
    if (!accessToken) {
      return;
    }

    try {
      const result = await interestsApi.getInterests(accessToken);
      if (result.ok && result.data) {
        setUserInterests(result.data.interests);
      }
    } catch (error) {
      console.error("Error loading user interests:", error);
    }
  };

  useEffect(() => {
    loadUserInterests();
  }, [user]);

  const handleInterestsUpdated = () => {
    loadUserInterests();
  };

  // Calculate recommended events based on user interests
  useEffect(() => {
    if (userInterests.length === 0 || eventsByCategory.length === 0) {
      setRecommendedEvents([]);
      return;
    }

    // Get user interest tag slugs and IDs
    const userInterestSlugs = userInterests.map(interest => interest.tag_slug.toLowerCase());
    const userInterestIds = userInterests.map(interest => interest.tag.id);

    // Function to fetch event details and check if it matches user interests
    const fetchRecommendedEvents = async () => {
      const allEvents: DameEvent[] = [];
      eventsByCategory.forEach(categoryData => {
        allEvents.push(...categoryData.events);
      });

      // Remove duplicates
      const seenSlugs = new Set<string>();
      const uniqueEvents = allEvents.filter(event => {
        if (seenSlugs.has(event.event_slug)) {
          return false;
        }
        seenSlugs.add(event.event_slug);
        return true;
      });

      // Fetch details for each event to get tags
      const eventsWithTags = await Promise.all(
        uniqueEvents.map(async (event) => {
          try {
            const detailResponse = await dameEventsAPI.getEventBySlug(event.event_slug);
            if (detailResponse.success && detailResponse.data) {
              const eventDetail = detailResponse.data;
              // Check if event has any tag that matches user interests
              const hasMatchingTag = eventDetail.tags.some(tag => 
                userInterestIds.includes(tag.id) || 
                userInterestSlugs.includes(tag.slug.toLowerCase())
              );
              return hasMatchingTag ? event : null;
            }
          } catch (error) {
            console.error(`Error fetching details for event ${event.event_slug}:`, error);
          }
          return null;
        })
      );

      // Filter out nulls and sort by date
      let recommended = eventsWithTags
        .filter((event): event is DameEvent => event !== null)
        .sort((a, b) => {
          const dateA = new Date(a.start).getTime();
          const dateB = new Date(b.start).getTime();
          return dateA - dateB;
        });

      // Apply date filter to recommended events
      recommended = filterEventsByDate(recommended, dateFilter);

      setRecommendedEvents(recommended);
    };

    fetchRecommendedEvents();
  }, [userInterests, eventsByCategory, dateFilter, i18n.language]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dameEventsAPI.getEventsByCategory();
      if (response.success && response.data) {
        // Eliminar duplicados y eventos cancelados usando event_slug como identificador único
        const seenEventSlugs = new Set<string>();
        const uniqueCategories = response.data.map(categoryData => {
          const uniqueEvents = categoryData.events.filter(event => {
            // Filtrar eventos cancelados
            if (event.is_cancelled) {
              console.log(`🚫 Evento cancelado filtrado: ${event.event_slug} - ${event.start}`);
              return false;
            }
            
            // Filtrar duplicados
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
        }).filter(categoryData => categoryData.events.length > 0) // Solo categorías con eventos
          .sort((a, b) => b.events.length - a.events.length); // Ordenar por cantidad de eventos (mayor a menor)

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
    <>
      {/* Barra fija superior con dropdown de filtros */}
      <div 
        className="fixed top-20 sm:top-24 md:top-28 z-30 bg-card border-b shadow-sm transition-all duration-300"
        style={{
          left: `${sidebarWidth}px`,
          right: '0'
        }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-2 sm:gap-4 md:gap-6 h-auto sm:h-14 py-2 sm:py-0">
            {/* Botón categorías - solo móvil */}
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                onClick={() => setCategoriesModalOpen(true)}
                aria-label={i18n.language === 'en' ? 'Filter by category' : 'Filtrar por categoría'}
                title={i18n.language === 'en' ? 'Categories' : 'Categorías'}
              >
                <ListFilter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </Button>
            )}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-sm sm:text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
                {i18n.language === 'en' ? 'When:' : 'Cuando:'}
              </span>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[140px] xs:w-[160px] sm:w-[180px] md:w-[220px] h-9 sm:h-10 bg-background border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-background transition-all duration-200 shadow-md hover:shadow-lg font-medium text-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <SelectValue className="truncate text-xs sm:text-sm md:text-base font-medium">
                      {getFilterLabel(dateFilter)}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border shadow-xl min-w-[220px] text-popover-foreground">
                  <SelectItem 
                    value="all" 
                    className="cursor-pointer text-base py-3 pl-3 pr-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 rounded-sm font-medium [&>span:first-child]:hidden !pl-3 text-foreground"
                  >
                    {i18n.language === 'en' ? 'Always' : 'Siempre'}
                  </SelectItem>
                  <SelectItem 
                    value="today" 
                    className="cursor-pointer text-base py-3 pl-3 pr-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 rounded-sm font-medium [&>span:first-child]:hidden !pl-3 text-foreground"
                  >
                    {i18n.language === 'en' ? 'Today' : 'Hoy'}
                  </SelectItem>
                  <SelectItem 
                    value="tomorrow" 
                    className="cursor-pointer text-base py-3 pl-3 pr-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 rounded-sm font-medium [&>span:first-child]:hidden !pl-3 text-foreground"
                  >
                    {i18n.language === 'en' ? 'Tomorrow' : 'Mañana'}
                  </SelectItem>
                  <SelectItem 
                    value="weekend" 
                    className="cursor-pointer text-base py-3 pl-3 pr-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 rounded-sm font-medium [&>span:first-child]:hidden !pl-3 text-foreground"
                  >
                    {i18n.language === 'en' ? 'Weekend' : 'FinDeSemana'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Contador de eventos en la misma barra */}
            {!loading && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-full shadow-sm flex-shrink-0">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600 dark:text-purple-400 hidden xs:block" />
                <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap" style={{ fontSize: '11px' }}>
                  {(() => {
                    const totalEvents = filteredEventsByCategory.reduce((sum, category) => sum + category.events.length, 0);
                    if (i18n.language === 'en') {
                      return `${totalEvents} event${totalEvents !== 1 ? 's' : ''}`;
                    } else {
                      return `${totalEvents} evento${totalEvents !== 1 ? 's' : ''}`;
                    }
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de categorías - solo móvil */}
      <Dialog open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)] max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-foreground">
              {i18n.language === 'en' ? 'Categories' : 'Categorías'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {i18n.language === 'en' ? 'Filter events by category' : 'Filtra eventos por categoría'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {/* Todas */}
            <Button
              variant="ghost"
              className={`w-full justify-start h-auto py-3 px-4 rounded-xl transition-all ${
                selectedCategoryId === null
                  ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => {
                setSelectedCategoryId(null);
                setCategoriesModalOpen(false);
                window.scrollTo(0, 0);
              }}
            >
              <div className={`mr-3 p-2 rounded-lg ${selectedCategoryId === null ? 'bg-white/20' : 'bg-muted-foreground/10'}`}>
                <List className={`h-5 w-5 ${selectedCategoryId === null ? 'text-white' : ''}`} />
              </div>
              <span className="font-semibold">
                {i18n.language === 'en' ? 'All' : 'Todos'}
              </span>
            </Button>
            {/* Categorías */}
            {eventsByCategory.map(({ category, events }) => {
              const isSelected = selectedCategoryId === category.id;
              const gradient = getCategoryColor(category.id, category.name_es);
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-4 rounded-xl transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${gradient} text-white [&_svg]:text-white`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setCategoriesModalOpen(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className={`mr-3 p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-muted-foreground/10'}`}>
                    {getCategoryIcon(category.icon, category.name_es)}
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-semibold block">
                      {i18n.language === 'en' ? (category.name_en || category.name_es) : category.name_es}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {events.length} {i18n.language === 'en' ? 'events' : 'eventos'}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Barra de membresía para usuarios no miembros */}
      {user && !user.member && !membershipBannerClosed && (
        <div 
          className={`fixed z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all duration-300 ${
            showMembershipBanner ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{
            top: isMobile ? '140px' : '168px', // Debajo de la barra de filtro (top-20/24/28 + h-14)
            left: `${sidebarWidth}px`,
            right: '0'
          }}
        >
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-medium flex-1">
                  {i18n.language === 'en' ? (
                    <>
                      Become a member and enjoy exclusive benefits, discounts, and priority access to events!
                    </>
                  ) : (
                    <>
                      ¡Hazte miembro y disfruta de beneficios exclusivos, descuentos y acceso prioritario a eventos!
                    </>
                  )}
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/afiliarse')}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-3 sm:px-4 py-1.5 h-auto text-xs sm:text-sm flex-shrink-0"
                >
                  {i18n.language === 'en' ? 'Join Now' : 'Únete Ahora'}
                </Button>
              </div>
              <button
                onClick={handleCloseMembershipBanner}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label={i18n.language === 'en' ? 'Close' : 'Cerrar'}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido con padding superior para la barra fija */}
      <div className={`space-y-8 ${user && !user.member && !membershipBannerClosed ? 'pt-32 sm:pt-36' : 'pt-14'}`}>

      {/* Modal de intereses */}
      {user && (
        <InterestsModal
          open={interestsModalOpen}
          onOpenChange={setInterestsModalOpen}
          onSuccess={handleInterestsUpdated}
          isFirstTime={false}
        />
      )}

      {/* Grid unificado de todos los eventos (recomendados + otros) sin separación */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold mb-2">Cargando eventos...</h3>
          <p className="text-muted-foreground">Un momento por favor</p>
        </div>
      ) : (() => {
        // Combinar eventos recomendados con eventos de categorías
        const allEvents: Array<{ event: DameEvent; categoryColor: string; categoryName?: string; isRecommended: boolean }> = [];
        
        // Agregar eventos recomendados primero (filtrados por categoría si hay una seleccionada)
        if (user && userInterests.length > 0 && recommendedEvents.length > 0) {
          recommendedEvents.forEach((event) => {
            const eventCategory = eventsByCategory.find(cat => 
              cat.events.some(e => e.event_slug === event.event_slug)
            );
            
            // Si hay una categoría seleccionada, solo incluir eventos recomendados de esa categoría
            if (selectedCategoryId !== null && eventCategory?.category.id !== selectedCategoryId) {
              return; // Saltar este evento recomendado si no pertenece a la categoría seleccionada
            }
            
            const categoryName = eventCategory 
              ? (i18n.language === 'en' ? eventCategory.category.name_en : eventCategory.category.name_es)
              : undefined;
            const categoryColor = eventCategory 
              ? getCategoryColor(eventCategory.category.id, eventCategory.category.name_es)
              : 'from-purple-600 to-pink-600';
            
            allEvents.push({
              event,
              categoryColor,
              categoryName,
              isRecommended: true
            });
          });
        }
        
        // Agregar eventos de categorías (excluyendo los que ya están en recomendados)
        if (filteredEventsByCategory.length > 0) {
          const recommendedSlugs = new Set(recommendedEvents.map(e => e.event_slug));
          filteredEventsByCategory.forEach((categoryData) => {
            categoryData.events.forEach((event) => {
              // Solo agregar si no está en recomendados
              if (!recommendedSlugs.has(event.event_slug)) {
                const categoryColor = getCategoryColor(categoryData.category.id, categoryData.category.name_es);
                const categoryName = i18n.language === 'en' 
                  ? categoryData.category.name_en 
                  : categoryData.category.name_es;
                
                allEvents.push({
                  event,
                  categoryColor,
                  categoryName,
                  isRecommended: false
                });
              }
            });
          });
        }
        
        if (allEvents.length === 0) {
          if (selectedCategoryId !== null) {
            return (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold mb-2">No hay eventos en esta categoría</h3>
                <p className="text-muted-foreground">
                  Próximamente tendremos más eventos para ti. 
                  <br />Mientras tanto, explora otras categorías.
                </p>
              </div>
            );
          }
          return null;
        }
        
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map(({ event, categoryColor, categoryName, isRecommended }, index) => (
              <EventCard 
                key={`${event.event_slug}-${index}`} 
                event={event} 
                categoryColor={categoryColor}
                categoryName={categoryName}
                isRecommended={isRecommended}
                attendedEvents={userTickets}
                userTicketsLoaded={userTicketsLoaded}
                onOpenInterestsModal={() => setInterestsModalOpen(true)}
              />
            ))}
          </div>
        );
      })()}
    </div>
    </>
  );
};

interface CategorySectionProps {
  categoryData: EventsByCategory;
  categoryColor: string;
  categoryIcon: React.ReactNode;
  maxEvents: number;
  attendedEvents: UserAttendance[];
  userTicketsLoaded: boolean;
}

const CategorySection = ({
  categoryData,
  categoryColor,
  categoryIcon,
  maxEvents,
  attendedEvents,
  userTicketsLoaded,
}: CategorySectionProps) => {
  const { category, events } = categoryData;
  const { i18n } = useTranslation();
  
  const getLocalizedText = (textEs?: string, textEn?: string, generic?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return (textEs || textEn || generic || '').toString();
  };

  return (
    <div className="space-y-4">
      {/* Grid de eventos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <EventCard 
            key={`${event.event_slug}-${index}`} 
            event={event} 
            categoryColor={categoryColor}
            categoryName={getLocalizedText(category.name_es, category.name_en)}
            attendedEvents={attendedEvents}
            userTicketsLoaded={userTicketsLoaded}
          />
        ))}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: DameEvent;
  categoryColor: string;
  categoryName?: string;
  isRecommended?: boolean;
  attendedEvents: UserAttendance[];
  userTicketsLoaded: boolean;
  onOpenInterestsModal?: () => void;
}

const hasUserTicket = (event: DameEvent, attendedEvents: UserAttendance[]): boolean => {
  if (!attendedEvents.length) {
    return false;
  }
  
  // Normalizar slug para comparación (lowercase, trim)
  const normalizeSlug = (slug: string | undefined | null): string | null => {
    if (!slug) return null;
    return slug.toLowerCase().trim();
  };
  
  const eventSlugNormalized = normalizeSlug(event.event_slug);
  
  const hasMatch = attendedEvents.some((ticket) => {
    // Comparar por slug (normalizado)
    const ticketSlugNormalized = normalizeSlug(ticket.event_slug);
    if (ticketSlugNormalized && eventSlugNormalized && ticketSlugNormalized === eventSlugNormalized) {
      console.log('✅ Match found by slug:', ticket.event_slug, '===', event.event_slug);
      return true;
    }
    // Comparar por ID
    if (ticket.event_id && event.id && ticket.event_id === event.id) {
      console.log('✅ Match found by ID:', ticket.event_id, '===', event.id);
      return true;
    }
    return false;
  });
  
  if (!hasMatch && eventSlugNormalized) {
    console.log('❌ No match for event:', {
      event_slug: event.event_slug,
      event_slug_normalized: eventSlugNormalized,
      event_id: event.id,
      event_title: event.title_es,
      tickets_sample: attendedEvents.slice(0, 3).map(t => ({ 
        event_slug: t.event_slug, 
        event_slug_normalized: normalizeSlug(t.event_slug),
        event_id: t.event_id 
      }))
    });
  }
  
  return hasMatch;
};

const EventCard = ({ event, categoryColor, categoryName, isRecommended = false, attendedEvents, userTicketsLoaded, onOpenInterestsModal }: EventCardProps) => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

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
        {/* Badges en la esquina superior izquierda */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
          {/* Badge de recomendado (más vistoso) */}
          {isRecommended && (
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white backdrop-blur-sm font-bold border-0 shadow-lg ring-2 ring-purple-300 dark:ring-purple-500">
                <Sparkles className="h-3 w-3 mr-1" />
                {i18n.language === 'en' ? 'Recommended for You' : 'Recomendado para Ti'}
              </Badge>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="text-white hover:text-purple-200 dark:hover:text-purple-300 cursor-pointer transition-colors p-0.5"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={i18n.language === 'en' ? 'Why is this recommended?' : '¿Por qué está recomendado?'}
                  >
                    <HelpCircle className="h-5 w-5 font-bold" strokeWidth={2.5} />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-3 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <p className="font-semibold text-purple-600 dark:text-purple-400">
                      {i18n.language === 'en' ? 'Why is this recommended?' : '¿Por qué está recomendado?'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {i18n.language === 'en' 
                        ? 'This event matches your interests. You can edit your interests '
                        : 'Este evento coincide con tus intereses. Puedes editar tus intereses '}
                      {onOpenInterestsModal ? (
                        <>
                          {i18n.language === 'en' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInterestsModal();
                                }}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline decoration-2 underline-offset-2 font-medium transition-colors"
                              >
                                here
                              </button>
                              .
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInterestsModal();
                                }}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline decoration-2 underline-offset-2 font-medium transition-colors"
                              >
                                aquí
                              </button>
                              .
                            </>
                          )}
                        </>
                      ) : (
                        i18n.language === 'en' ? 'in your profile page.' : 'en tu página de perfil.'
                      )}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {/* Badge de categoría */}
          {categoryName && (
            <Badge className={`bg-gradient-to-r ${categoryColor} text-white backdrop-blur-sm font-bold border-0 ${isRecommended ? '' : ''}`}>
              {categoryName}
            </Badge>
          )}
        </div>
        {/* Badge de precio sobre la imagen */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {isFree ? (
            <Badge className="bg-green-600 hover:bg-green-700 text-white backdrop-blur-sm font-bold">
              {i18n.language === 'en' ? 'Free' : 'Gratuito'}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-white text-black dark:bg-white dark:text-black border border-input backdrop-blur-sm font-bold">
              {formatEventPrice(event.price || '0', i18n.language === 'en' ? 'en-US' : 'es-ES')}
            </Badge>
          )}
          {event.is_recurring_weekly && !event.is_perennial && (
            <Badge className="bg-blue-600 text-white">
              <Repeat className="mr-1 h-3 w-3" />
              {i18n.language === 'en' ? 'Weekly' : 'Semanal'}
            </Badge>
          )}
          {event.is_perennial && (
            <Badge className="bg-amber-600 text-white">
              <Calendar className="mr-1 h-3 w-3" />
              {i18n.language === 'en' ? 'Ongoing' : 'Permanente'}
            </Badge>
          )}
          {(() => {
            const shouldShow = userTicketsLoaded && hasUserTicket(event, attendedEvents);
            if (userTicketsLoaded) {
              console.log('🎟️ EventCard badge check:', {
                event_slug: event.event_slug,
                event_id: event.id,
                shouldShow,
                attendedEvents,
                userTicketsLoaded
              });
            }
            return shouldShow ? (
              <Badge className="bg-white/90 text-green-700 border-green-200 backdrop-blur flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {i18n.language === 'en' ? 'Going' : 'Asistirás'}
              </Badge>
            ) : null;
          })()}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
          {getLocalizedText(event.title_es, event.title_en)}
        </CardTitle>
        {/* Organizador - discreto debajo del título */}
        {(event as any).organizers && (event as any).organizers.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {(event as any).organizers.map((org: any) => org.name).join(', ')}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-2 flex-1 flex flex-col">
        {/* Resumen del evento visible y consistente */}
        {(() => {
          // Usar directamente la información que viene de by-category
          const rawSummary = getLocalizedText(event.short_description_es, event.short_description_en)
            || getLocalizedText(event.summary_es, event.summary_en, (event as any).summary)
            || getLocalizedText(event.description_es, event.description_en, (event as any).description);
          const summary = rawSummary ? String(rawSummary) : '';
          const trimmed = summary.length > 160 ? summary.slice(0, 160) + '…' : summary;
          return (
            <div className="h-10 overflow-hidden">
              <p className="text-sm text-muted-foreground line-clamp-2">{trimmed}</p>
            </div>
          );
        })()}

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {event.is_perennial ? (
              <span className="font-medium text-xs sm:text-sm">
                {formatPerennialSchedule(event, i18n.language === 'en' ? 'en-US' : 'es-ES')}
              </span>
            ) : (
              <>
                <span className="font-medium text-xs sm:text-sm">
                  {formatEventDate(event.start, i18n.language === 'en' ? 'en-US' : 'es-ES')}
                </span>
                {event.is_recurring_weekly && (
                  <span className="text-xs text-blue-600 ml-1.5 font-medium">
                    <Repeat className="inline h-3 w-3 mr-0.5" />
                    {i18n.language === 'en' ? 'Weekly' : 'Semanal'}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {event.place && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-pink-600 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{event.place.name}</span>
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
