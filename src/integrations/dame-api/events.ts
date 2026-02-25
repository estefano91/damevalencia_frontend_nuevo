// Servicio específico para eventos de DAME
// 🔗 API Integration: Las imágenes vienen directamente del backend de organizaciondame.org
// 📝 Estructura esperada: /api/events/by-category/
// 📸 Imágenes: Almacenadas en /storage/events/ en el servidor de DAME
import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api';

// Tipos específicos para categorías en listados
export interface EventCategoryBasic {
  id: number;
  name_es: string;
  name_en: string;
  icon: string;
}

export interface EventPlace {
  id: number;
  name: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

// Evento básico para listados
export interface DameEvent {
  id?: number; // ID del evento (puede venir de la API aunque no esté siempre presente)
  event_slug: string;
  title_es: string;
  title_en?: string;
  short_description_es?: string;
  short_description_en?: string;
  summary_es?: string;
  summary_en?: string;
  summary?: string; // fallback genérico si la API lo envía sin sufijo de idioma
  start: string; // ISO date string
  end?: string;
  price?: string;
  place: EventPlace;
  description_es?: string;
  description_en?: string;
  main_photo_url?: string; // Imagen principal desde organizaciondame.org/api
  registration_url?: string;
  capacity?: number;
  registered_count?: number;
  is_recurring_weekly?: boolean; // Indica si el evento se repite semanalmente
  is_perennial?: boolean; // Indica si es un evento perenne (abierto varios días/semana con horario fijo)
  event_type?: "one-time" | "recurring" | "perennial";
  is_cancelled?: boolean;
  organizers?: EventOrganizer[];
  // Campos para eventos perennes
  available_weekdays?: number[]; // 0= Lun, 1= Mar, ..., 6= Dom
  perennial_weekdays_start_time?: string | null;
  perennial_weekdays_end_time?: string | null;
  perennial_saturday_start_time?: string | null;
  perennial_saturday_end_time?: string | null;
  perennial_sunday_start_time?: string | null;
  perennial_sunday_end_time?: string | null;
}

// Tipos para el evento detallado (/api/events/{slug}/)
export interface EventCategory {
  id: number;
  name_es: string;
  name_en: string;
  slug?: string;
  icon?: string;
}

export interface EventTag {
  id: number;
  name_es: string;
  name_en: string;
  slug: string;
}

export interface OrganizerGroup {
  id: number;
  name: string;
  type: 'whatsapp' | 'telegram' | 'facebook' | 'discord' | 'other';
  link: string;
}

export interface EventOrganizer {
  id: number;
  name: string;
  email: string;
  logo_url?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
  whatsapp_group?: string;
  groups?: OrganizerGroup[];
}

export interface EventPhoto {
  id: number;
  event: number;
  image_url: string;
  caption_es?: string;
  caption_en?: string;
  sort_order: number;
}

export interface EventFAQ {
  id: number;
  event: number;
  question_es: string;
  question_en?: string;
  answer_es: string;
  answer_en?: string;
  sort_order: number;
}

export interface EventProgram {
  id: number;
  time: string; // HH:mm:ss format
  icon?: string;
  title_es: string;
  title_en?: string;
  description_es?: string;
  description_en?: string;
  sort_order: number;
}

// Evento detallado completo
export interface DameEventDetail {
  id: number;
  title_es: string;
  title_en?: string;
  summary_es?: string;
  summary_en?: string;
  description_es?: string;
  description_en?: string;
  slug: string;
  is_featured: boolean;
  price_amount?: string; // Legacy - usar from_price/to_price
  price_currency: string; // Legacy
  from_price: string; // Precio mínimo (obligatorio)
  to_price?: string; // Precio máximo (opcional)
  duration_minutes?: number;
  capacity?: number;
  whatsapp_contact?: string;
  main_photo_url?: string; // Imagen principal del evento
  tickets_webview?: string;
  booking_link?: string; // Link externo para reservas (opcional)
  start_datetime: string | null; // null para eventos perennes
  end_datetime?: string | null;
  is_recurring_weekly: boolean;
  is_perennial?: boolean;
  event_type?: "one-time" | "recurring" | "perennial";
  recurrence_start_time?: string | null;
  recurrence_end_time?: string | null;
  recurrence_weekday?: number | null;
  recurring_info?: RecurringEventInfo;
  // Campos para eventos perennes (detail API)
  perennial_start_date?: string | null;
  perennial_end_date?: string | null;
  available_monday?: boolean;
  available_tuesday?: boolean;
  available_wednesday?: boolean;
  available_thursday?: boolean;
  available_friday?: boolean;
  available_saturday?: boolean;
  available_sunday?: boolean;
  // Campos para eventos perennes (list + detail)
  available_weekdays?: number[] | null;
  perennial_weekdays_start_time?: string | null;
  perennial_weekdays_end_time?: string | null;
  perennial_saturday_start_time?: string | null;
  perennial_saturday_end_time?: string | null;
  perennial_sunday_start_time?: string | null;
  perennial_sunday_end_time?: string | null;
  upcoming_dates?: EventDate[]; // Próximas 6 fechas del evento (máximo), incluyendo ocurrencias con estado de cancelación
  place: EventPlace;
  categories: EventCategory[];
  tags: EventTag[];
  organizers: EventOrganizer[];
  photos: EventPhoto[];
  faqs: EventFAQ[];
  programs: EventProgram[];
}

export interface EventsByCategory {
  category: EventCategoryBasic;
  events: DameEvent[];
  total_events: number;
}

// Tipos para fechas específicas (recurrentes + perennes)
export interface EventDate {
  id?: string;
  date: string; // ISO date string para la fecha específica
  start_datetime?: string;
  end_datetime?: string;
  is_cancelled?: boolean;
  is_occurrence?: boolean;
  note_es?: string | null;
  note_en?: string | null;
  // Campos legacy (recurrentes)
  available_spots?: number;
  is_full?: boolean;
  registration_deadline?: string;
}

// Información extendida para eventos recurrentes
export interface RecurringEventInfo {
  next_dates: EventDate[]; // Próximas fechas disponibles
  total_sessions?: number; // Total de sesiones si es limitado
  schedule_info: string; // Descripción del horario (ej: "Todos los martes 18:00h")
}

export class DameEventsAPI {
  
  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log('🔗 Fetching events from DAME API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 🔑 Agregar autenticación si es necesaria
          // 'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        console.warn('⚠️ DAME API not available, using demo data with simulated image URLs');
        console.warn(`⚠️ Response status: ${response.status} ${response.statusText}`);
        // Decidir qué tipo de demo data devolver basado en el endpoint
        if (endpoint.includes('/events/monthly/')) {
          return this.getDemoData<T>(endpoint);
        }
        if (endpoint.includes('/events/') && !endpoint.includes('/by-category/') && !endpoint.includes('/monthly/')) {
          const slug = endpoint.replace('/events/', '').replace('/', '');
          return this.getEventDetailDemo(slug) as ApiResponse<T>;
        }
        return this.getDemoData<T>(endpoint);
      }

      let data = await response.json();
      
      // Procesar eventos detallados para asegurar que recurring_info está correcto
      if (endpoint.includes('/events/monthly/')) {
        // Endpoint mensual: puede devolver array directamente o objeto con propiedad 'events'
        console.log('📦 Monthly events API response:', data);
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Si es un objeto, extraer el array de eventos
          if ('events' in data && Array.isArray(data.events)) {
            data = data.events;
          } else if ('results' in data && Array.isArray(data.results)) {
            data = data.results;
          }
        }
        // Filtrar eventos cancelados en la respuesta de la API
        if (Array.isArray(data)) {
          const beforeFilter = data.length;
          data = data.filter((event: any) => !event.is_cancelled);
          if (beforeFilter !== data.length) {
            console.log(`🚫 Filtered ${beforeFilter - data.length} cancelled events from monthly API response`);
          }
        }
        console.log('✅ Monthly events loaded from DAME API:', Array.isArray(data) ? data.length : 'N/A');
      } else if (endpoint.includes('/events/') && !endpoint.includes('/by-category/')) {
        // Es un evento detallado (objeto único)
        if (data && typeof data === 'object' && !Array.isArray(data) && data.is_recurring_weekly) {
          data = this.processRecurringEvent(data);
        }
        console.log('✅ Event detail loaded from DAME API');
      } else {
        console.log('✅ Events loaded from DAME API with images:', Array.isArray(data) ? data.length : 'N/A');
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.warn('⚠️ API Connection Error, falling back to demo data:', error);
      // Decidir qué tipo de demo data devolver basado en el endpoint
      if (endpoint.includes('/events/monthly/')) {
        return this.getDemoData<T>(endpoint);
      }
      if (endpoint.includes('/events/') && !endpoint.includes('/by-category/') && !endpoint.includes('/monthly/')) {
        const slug = endpoint.replace('/events/', '').replace('/', '');
        return this.getEventDetailDemo(slug) as ApiResponse<T>;
      }
      return this.getDemoData<T>(endpoint);
    }
  }

  private getDemoData<T>(endpoint: string): ApiResponse<T> {
    // SIMULACIÓN: Estos datos representan lo que devolvería la API real de organizaciondame.org
    // En producción, las image_url vendrían directamente desde el backend de DAME
    
    // Manejar endpoint de eventos mensuales
    if (endpoint.includes('/events/monthly/')) {
      // Extraer año y mes de los parámetros
      const yearMatch = endpoint.match(/year=(\d+)/);
      const monthMatch = endpoint.match(/month=(\d+)/);
      
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
      const month = monthMatch ? parseInt(monthMatch[1], 10) : new Date().getMonth() + 1;
      
      // Generar eventos demo para el mes solicitado
      const demoEvents: DameEvent[] = this.generateMonthlyDemoEvents(year, month);
      
      return {
        success: true,
        data: demoEvents as T,
      };
    }
    
    if (endpoint.includes('/events/by-category')) {
      const demoData: EventsByCategory[] = [
        {
          category: {
            id: 1,
            name_es: "Música",
            name_en: "Music",
            icon: "music_note"
          },
          events: [
            {
              event_slug: "concierto-jazz-valencia",
              title_es: "Concierto de Jazz en Valencia",
              start: "2025-11-15T20:00:00+01:00",
              price: "25.00",
              place: {
                id: 1,
                name: "Palau de la Música Catalana"
              },
              description_es: "Una noche mágica con los mejores músicos de jazz valencianos",
              main_photo_url: "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg", // Imagen principal desde API
              capacity: 200,
              registered_count: 45,
              organizers: [
                { id: 1, name: "DAME Valencia Música", email: "musica@organizaciondame.org", logo_url: "https://organizaciondame.org/storage/organizers/dame-musica.png" }
              ]
            },
            {
              event_slug: "recital-piano-dame",
              title_es: "Recital de Piano DAME Música",
              start: "2025-11-22T19:30:00+01:00",
              price: "15.00",
              place: {
                id: 2,
                name: "Centro Cultural DAME"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/recital-piano-dame.jpg", // Imagen principal desde API
              capacity: 80,
              registered_count: 23
            }
          ],
          total_events: 2
        },
        {
          category: {
            id: 2,
            name_es: "Baile",
            name_en: "Dance",
            icon: "sports_kabaddi"
          },
          events: [
            {
              event_slug: "taller-bachata-principiantes",
              title_es: "Taller de Bachata para Principiantes",
              start: "2025-11-10T18:00:00+01:00",
              price: "20.00",
              place: {
                id: 3,
                name: "Escuela de Baile DAME"
              },
              description_es: "Aprende los pasos básicos de bachata en un ambiente divertido",
              main_photo_url: "https://organizaciondame.org/storage/events/taller-bachata-principiantes.jpg", // Imagen principal desde API
              capacity: 30,
              registered_count: 18,
              is_recurring_weekly: true
            },
            {
              event_slug: "noche-casino-cubano",
              title_es: "Noche de Casino Cubano",
              start: "2025-11-17T20:30:00+01:00",
              price: "12.00",
              place: {
                id: 4,
                name: "Salón Cultural Valencia"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/noche-casino-cubano.jpg", // Imagen principal desde API
              capacity: 50,
              registered_count: 32
            },
            {
              event_slug: "workshop-salsa-avanzado",
              title_es: "Workshop de Salsa Nivel Avanzado",
              start: "2025-11-24T17:00:00+01:00",
              price: "30.00",
              place: {
                id: 3,
                name: "Escuela de Baile DAME"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/workshop-salsa-avanzado.jpg", // Imagen principal desde API
              capacity: 20,
              registered_count: 12,
              is_recurring_weekly: true
            }
          ],
          total_events: 3
        },
        {
          category: {
            id: 3,
            name_es: "Arte y Cultura",
            name_en: "Art & Culture",
            icon: "palette"
          },
          events: [
            {
              event_slug: "exposicion-arte-local",
              title_es: "Exposición de Arte Local",
              start: "2025-11-12T17:00:00+01:00",
              price: "0.00",
              place: {
                id: 5,
                name: "Galería DAME Arte"
              },
              description_es: "Muestra de artistas locales valencianos con diversas técnicas",
              main_photo_url: "https://organizaciondame.org/storage/events/exposicion-arte-local.jpg", // Imagen principal desde API
              capacity: 100,
              registered_count: 67
            },
            {
              event_slug: "taller-pintura-acuarela",
              title_es: "Taller de Pintura en Acuarela",
              start: "2025-11-19T16:00:00+01:00",
              price: "18.00",
              place: {
                id: 6,
                name: "Estudio Creativo DAME"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/taller-pintura-acuarela.jpg", // Imagen principal desde API
              capacity: 15,
              registered_count: 8
            }
          ],
          total_events: 2
        },
        {
          category: {
            id: 4,
            name_es: "Fitness y Bienestar",
            name_en: "Fitness & Wellness",
            icon: "fitness_center"
          },
          events: [
            {
              event_slug: "clase-yoga-parque",
              title_es: "Clase de Yoga en el Parque",
              start: "2025-11-11T08:00:00+01:00",
              price: "0.00",
              place: {
                id: 7,
                name: "Parque de la Ciudadela"
              },
              description_es: "Sesión de yoga matutino al aire libre",
              main_photo_url: "https://organizaciondame.org/storage/events/clase-yoga-parque.jpg", // Imagen principal desde API
              capacity: 25,
              registered_count: 15,
              is_recurring_weekly: true
            },
            {
              event_slug: "entrenamiento-funcional-dame",
              title_es: "Entrenamiento Funcional DAME Fit",
              start: "2025-11-16T19:00:00+01:00",
              price: "10.00",
              place: {
                id: 8,
                name: "Centro Deportivo DAME"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/entrenamiento-funcional-dame.jpg", // Imagen principal desde API
              capacity: 20,
              registered_count: 14,
              is_recurring_weekly: true
            }
          ],
          total_events: 2
        },
        {
          category: {
            id: 5,
            name_es: "Apoyo y Bienestar Mental",
            name_en: "Support & Mental Wellness",
            icon: "psychology"
          },
          events: [
            {
              event_slug: "taller-mindfulness",
              title_es: "Taller de Mindfulness y Relajación",
              start: "2025-11-13T18:30:00+01:00",
              price: "0.00",
              place: {
                id: 9,
                name: "Centro DAME Apoyo"
              },
              description_es: "Técnicas de relajación y mindfulness para el bienestar mental",
              main_photo_url: "https://organizaciondame.org/storage/events/taller-mindfulness.jpg", // Imagen principal desde API
              capacity: 12,
              registered_count: 9,
              is_recurring_weekly: true
            },
            {
              event_slug: "grupo-apoyo-migrantes",
              title_es: "Grupo de Apoyo para Migrantes",
              start: "2025-11-20T17:30:00+01:00",
              price: "0.00",
              place: {
                id: 10,
                name: "Sala Comunitaria DAME"
              },
              main_photo_url: "https://organizaciondame.org/storage/events/grupo-apoyo-migrantes.jpg", // Imagen principal desde API
              capacity: 15,
              registered_count: 7
            }
          ],
          total_events: 2
        }
      ];
      
      return {
        success: true,
        data: demoData as T,
      };
    }
    
    return {
      success: false,
      error: 'Demo data not available for this endpoint',
    };
  }

  // Generar eventos demo para un mes específico
  private generateMonthlyDemoEvents(year: number, month: number): DameEvent[] {
    const events: DameEvent[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Eventos recurrentes semanales (cada martes, jueves, sábado)
    const recurringDays = [2, 4, 6]; // Martes, Jueves, Sábado
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, etc.
      
      // Ajustar para que 1 = lunes, 2 = martes, etc.
      const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      // Agregar eventos según el día de la semana
      if (recurringDays.includes(adjustedDayOfWeek)) {
        // Martes - Taller de Bachata
        if (adjustedDayOfWeek === 2) {
          events.push({
            event_slug: `taller-bachata-principiantes-${year}-${month}-${day}`,
            title_es: "Taller de Bachata para Principiantes",
            title_en: "Beginner's Bachata Workshop",
            short_description_es: "Aprende los pasos básicos de bachata",
            short_description_en: "Learn basic bachata steps",
            start: new Date(year, month - 1, day, 18, 0, 0).toISOString(),
            price: "20.00",
            place: {
              id: 3,
              name: "Escuela de Baile DAME",
              city: "Valencia"
            },
            is_recurring_weekly: true
          });
        }
        
        // Jueves - Clase de Yoga
        if (adjustedDayOfWeek === 4) {
          events.push({
            event_slug: `clase-yoga-parque-${year}-${month}-${day}`,
            title_es: "Clase de Yoga en el Parque",
            title_en: "Park Yoga Class",
            short_description_es: "Sesión de yoga matutino al aire libre",
            short_description_en: "Morning outdoor yoga session",
            start: new Date(year, month - 1, day, 8, 0, 0).toISOString(),
            price: "0.00",
            place: {
              id: 7,
              name: "Parque de la Ciudadela",
              city: "Valencia"
            },
            is_recurring_weekly: true
          });
        }
        
        // Sábado - Taller de Mindfulness
        if (adjustedDayOfWeek === 6) {
          events.push({
            event_slug: `taller-mindfulness-${year}-${month}-${day}`,
            title_es: "Taller de Mindfulness y Relajación",
            title_en: "Mindfulness and Relaxation Workshop",
            short_description_es: "Técnicas de relajación y mindfulness",
            short_description_en: "Relaxation and mindfulness techniques",
            start: new Date(year, month - 1, day, 18, 30, 0).toISOString(),
            price: "0.00",
            place: {
              id: 9,
              name: "Centro DAME Apoyo",
              city: "Valencia"
            },
            is_recurring_weekly: true
          });
        }
      }
      
      // Eventos únicos ocasionales
      if (day % 7 === 0) { // Cada domingo
        events.push({
          event_slug: `concierto-jazz-valencia-${year}-${month}-${day}`,
          title_es: "Concierto de Jazz en Valencia",
          title_en: "Jazz Concert in Valencia",
          short_description_es: "Una noche mágica con los mejores músicos de jazz",
          short_description_en: "A magical night with the best jazz musicians",
          start: new Date(year, month - 1, day, 20, 0, 0).toISOString(),
          price: "25.00",
          place: {
            id: 1,
            name: "Palau de la Música Catalana",
            city: "Valencia"
          }
        });
      }
    }
    
    return events;
  }

  // Obtener eventos por categoría
  async getEventsByCategory(): Promise<ApiResponse<EventsByCategory[]>> {
    const response = await this.makeRequest<EventsByCategory[]>('/events/by-category/');
    
    // Filtrar eventos cancelados en cada categoría
    if (response.success && response.data) {
      response.data = response.data.map(categoryData => ({
        ...categoryData,
        events: categoryData.events.filter(event => !event.is_cancelled),
        total_events: categoryData.events.filter(event => !event.is_cancelled).length
      })).filter(categoryData => categoryData.events.length > 0);
    }
    
    return response;
  }

  // Obtener un evento específico por slug - DATOS DETALLADOS
  async getEventBySlug(slug: string): Promise<ApiResponse<DameEventDetail>> {
    return this.makeRequest<DameEventDetail>(`/events/${slug}/`);
  }

  // Obtener eventos de una categoría específica
  async getEventsBySpecificCategory(categoryId: number): Promise<ApiResponse<EventsByCategory>> {
    return this.makeRequest<EventsByCategory>(`/events/by-category/${categoryId}/`);
  }

  // Obtener todos los eventos de un mes específico (sin paginación, con eventos recurrentes expandidos)
  async getMonthlyEvents(year: number, month: number): Promise<ApiResponse<DameEvent[]>> {
    // El mes debe ser 1-12, construir URL con parámetros usando URLSearchParams
    // Intentar primero con query parameters: /events/monthly/?year=2024&month=1
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString()
    });
    const endpoint = `/events/monthly/?${params.toString()}`;
    console.log(`📡 Calling monthly events API: ${API_BASE_URL}${endpoint}`);
    return this.makeRequest<DameEvent[]>(endpoint);
  }

  // Procesar evento recurrente para asegurar datos válidos
  private processRecurringEvent(event: DameEventDetail): DameEventDetail {
    // Validar fechas de inicio y fin
    if (!event.start_datetime) {
      console.warn('⚠️ Evento recurrente sin start_datetime:', event.slug);
      return event;
    }

    const startDate = new Date(event.start_datetime);
    if (isNaN(startDate.getTime()) || startDate.getFullYear() < 2000) {
      console.warn('⚠️ Fecha de inicio inválida en evento recurrente:', event.slug, event.start_datetime);
      return event;
    }

    // Si no existe recurring_info o está incompleto, generarlo
    if (!event.recurring_info || !event.recurring_info.schedule_info) {
      const schedule_info = formatRecurringSchedule(
        event.start_datetime,
        event.end_datetime
      );
      
      if (!event.recurring_info) {
        event.recurring_info = {
          schedule_info,
          next_dates: generateRecurringDates(event.start_datetime),
        };
      } else {
        event.recurring_info.schedule_info = schedule_info;
        // Regenerar fechas si están vacías o inválidas
        if (!event.recurring_info.next_dates || event.recurring_info.next_dates.length === 0) {
          event.recurring_info.next_dates = generateRecurringDates(event.start_datetime);
        }
      }
    } else {
      // Validar y limpiar fechas existentes
      if (event.recurring_info.next_dates) {
        event.recurring_info.next_dates = event.recurring_info.next_dates.filter(date => {
          const d = new Date(date.date);
          return !isNaN(d.getTime()) && d.getFullYear() >= 2000;
        });
      }

      // Asegurar que schedule_info incluye hora de fin si hay end_datetime
      if (event.end_datetime && !event.recurring_info.schedule_info.includes(' a ')) {
        event.recurring_info.schedule_info = formatRecurringSchedule(
          event.start_datetime,
          event.end_datetime
        );
      }
    }

    return event;
  }

  // NUEVO: Obtener detalles completos de un evento por slug
  private getEventDetailDemo(slug: string): ApiResponse<DameEventDetail> {
    // Datos demo detallados que simulan la respuesta de /api/events/{slug}/
    const eventDetails: Record<string, DameEventDetail> = {
      "concierto-jazz-valencia": {
        id: 1,
        title_es: "Concierto de Jazz en Valencia",
        title_en: "Jazz Concert in Valencia", 
        summary_es: "Una noche mágica con los mejores músicos de jazz valencianos",
        summary_en: "A magical night with the best Valencian jazz musicians",
        description_es: "Disfruta de una velada única en el corazón de Valencia con una selección de los mejores talentos del jazz local. Este concierto presenta una fusión de jazz tradicional y contemporáneo, creando una experiencia musical inolvidable. Los músicos, reconocidos en la escena nacional, interpretarán tanto clásicos del jazz como composiciones originales.",
        description_en: "Enjoy a unique evening in the heart of Valencia with a selection of the best local jazz talents...",
        slug: "concierto-jazz-valencia",
        is_featured: true,
        price_amount: "25.00",
        price_currency: "EUR",
        duration_minutes: 120,
        capacity: 200,
        whatsapp_contact: "+34658236665",
        main_photo_url: "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg",
        tickets_webview: "",
        start_datetime: "2025-11-15T20:00:00+02:00",
        end_datetime: "2025-11-15T22:00:00+02:00",
        is_recurring_weekly: false,
        place: {
          id: 1,
          name: "Palau de la Música Catalana",
          address: "Carrer de la Música 123",
          city: "Valencia",
          latitude: 39.4699,
          longitude: -0.3763
        },
        categories: [
          { id: 1, name_es: "Música", name_en: "Music", slug: "musica" }
        ],
        tags: [
          { id: 1, name_es: "Jazz", name_en: "Jazz", slug: "jazz" },
          { id: 2, name_es: "Nocturno", name_en: "Night", slug: "nocturno" }
        ],
        organizers: [
          { id: 1, name: "DAME Valencia Música", email: "musica@organizaciondame.org" }
        ],
        photos: [
          {
            id: 1,
            event: 1,
            image_url: "https://organizaciondame.org/storage/events/concierto-jazz-valencia.jpg",
            caption_es: "Foto principal del concierto",
            caption_en: "Main concert photo",
            sort_order: 1
          },
          {
            id: 2,
            event: 1,
            image_url: "https://organizaciondame.org/storage/events/concierto-jazz-valencia-2.jpg",
            caption_es: "Músicos en acción",
            caption_en: "Musicians in action",
            sort_order: 2
          }
        ],
        faqs: [
          {
            id: 1,
            event: 1,
            question_es: "¿Hay parking disponible?",
            question_en: "Is parking available?",
            answer_es: "Sí, hay parking gratuito en las cercanías del Palau de la Música",
            answer_en: "Yes, there is free parking near the Palau de la Música",
            sort_order: 1
          },
          {
            id: 2,
            event: 1,
            question_es: "¿Puedo traer niños?",
            question_en: "Can I bring children?",
            answer_es: "Sí, el evento es apto para toda la familia. Niños menores de 12 años entran gratis",
            answer_en: "Yes, the event is family-friendly. Children under 12 enter for free",
            sort_order: 2
          }
        ],
        programs: [
          {
            id: 1,
            time: "20:00:00",
            icon: "🎵",
            title_es: "Apertura del concierto",
            title_en: "Concert opening",
            description_es: "Bienvenida e introducción al programa musical",
            description_en: "Welcome and introduction to the musical program",
            sort_order: 1
          },
          {
            id: 2,
            time: "20:15:00", 
            icon: "🎺",
            title_es: "Primer set - Jazz Clásico",
            title_en: "First set - Classic Jazz",
            description_es: "Interpretación de estándares del jazz tradicional",
            description_en: "Performance of traditional jazz standards",
            sort_order: 2
          },
          {
            id: 3,
            time: "21:15:00",
            icon: "☕",
            title_es: "Descanso",
            title_en: "Intermission",
            description_es: "Pausa de 15 minutos - Bebidas disponibles",
            description_en: "15-minute break - Drinks available",
            sort_order: 3
          },
          {
            id: 4,
            time: "21:30:00",
            icon: "🎷",
            title_es: "Segundo set - Jazz Contemporáneo",
            title_en: "Second set - Contemporary Jazz",
            description_es: "Composiciones originales y fusión moderna",
            description_en: "Original compositions and modern fusion",
            sort_order: 4
          }
        ]
      },
      "taller-bachata-principiantes": {
        id: 2,
        title_es: "Taller de Bachata para Principiantes",
        title_en: "Beginner's Bachata Workshop",
        summary_es: "Aprende los pasos básicos de bachata en un ambiente divertido",
        summary_en: "Learn basic bachata steps in a fun environment",
        description_es: "¡Descubre la magia de la bachata! Este taller está diseñado especialmente para principiantes que quieren adentrarse en el mundo de este sensual baile caribeño. No necesitas experiencia previa ni pareja de baile. Nuestros instructores profesionales te guiarán paso a paso a través de los movimientos básicos, el ritmo y la conexión que caracterizan a la bachata. Al final de la clase, serás capaz de bailar bachata con confianza y estilo.",
        description_en: "Discover the magic of bachata! This workshop is specially designed for beginners...",
        slug: "taller-bachata-principiantes",
        is_featured: false,
        price_amount: "20.00",
        price_currency: "EUR", 
        duration_minutes: 90,
        capacity: 30,
        whatsapp_contact: "+34658236665",
        main_photo_url: "https://organizaciondame.org/storage/events/taller-bachata-principiantes.jpg",
        tickets_webview: "",
        start_datetime: "2025-11-10T18:00:00+01:00",
        end_datetime: "2025-11-10T19:30:00+01:00",
        is_recurring_weekly: true,
        recurring_info: {
          next_dates: generateRecurringDates("2025-11-10T18:00:00+01:00"),
          schedule_info: formatRecurringSchedule("2025-11-10T18:00:00+01:00", "2025-11-10T19:30:00+01:00"),
          total_sessions: 12 // 3 meses de clases
        },
        place: {
          id: 2,
          name: "Escuela de Baile DAME",
          address: "Calle del Baile 45",
          city: "Valencia",
          latitude: 39.4742,
          longitude: -0.3754
        },
        categories: [
          { id: 2, name_es: "Baile", name_en: "Dance", slug: "baile" }
        ],
        tags: [
          { id: 3, name_es: "Bachata", name_en: "Bachata", slug: "bachata" },
          { id: 4, name_es: "Principiantes", name_en: "Beginners", slug: "principiantes" }
        ],
        organizers: [
          { id: 2, name: "DAME Valencia Bachata", email: "baile@organizaciondame.org" }
        ],
        photos: [
          {
            id: 3,
            event: 2,
            image_url: "https://organizaciondame.org/storage/events/taller-bachata-principiantes.jpg",
            caption_es: "Sala de baile principal",
            caption_en: "Main dance room",
            sort_order: 1
          }
        ],
        faqs: [
          {
            id: 3,
            event: 2,
            question_es: "¿Necesito pareja para asistir?",
            question_en: "Do I need a partner to attend?",
            answer_es: "No, puedes venir solo/a. Rotamos las parejas durante la clase",
            answer_en: "No, you can come alone. We rotate partners during class",
            sort_order: 1
          },
          {
            id: 4,
            event: 2,
            question_es: "¿Qué ropa debo usar?",
            question_en: "What should I wear?",
            answer_es: "Ropa cómoda y zapatos que te permitan moverte fácilmente. Evita suelas de goma",
            answer_en: "Comfortable clothes and shoes that allow you to move easily. Avoid rubber soles",
            sort_order: 2
          }
        ],
        programs: [
          {
            id: 5,
            time: "18:00:00",
            icon: "👋",
            title_es: "Bienvenida y calentamiento",
            title_en: "Welcome and warm-up",
            description_es: "Presentaciones y ejercicios de calentamiento",
            description_en: "Introductions and warm-up exercises",
            sort_order: 1
          },
          {
            id: 6,
            time: "18:15:00",
            icon: "🦶",
            title_es: "Pasos básicos",
            title_en: "Basic steps",
            description_es: "Aprendizaje del paso básico de bachata",
            description_en: "Learning the basic bachata step",
            sort_order: 2
          },
          {
            id: 7,
            time: "18:45:00",
            icon: "🤝",
            title_es: "Trabajo en pareja",
            title_en: "Partner work",
            description_es: "Conexión y movimiento en pareja",
            description_en: "Connection and partner movement",
            sort_order: 3
          },
          {
            id: 8,
            time: "19:15:00",
            icon: "🎵",
            title_es: "Práctica libre",
            title_en: "Free practice",
            description_es: "Tiempo para practicar lo aprendido",
            description_en: "Time to practice what you've learned",
            sort_order: 4
          }
        ]
      },
      "clase-yoga-parque": {
        id: 3,
        title_es: "Clase de Yoga en el Parque",
        title_en: "Park Yoga Class",
        summary_es: "Sesión de yoga matutino al aire libre",
        summary_en: "Morning outdoor yoga session",
        description_es: "¡Conecta con la naturaleza mientras cuidas tu bienestar! Nuestras clases de yoga en el parque ofrecen una experiencia única combinando ejercicio, mindfulness y aire fresco. Perfectas para comenzar el día con energía positiva. Todos los niveles son bienvenidos - desde principiantes hasta yoguis experimentados. Solo necesitas traer tu esterilla y ganas de disfrutar.",
        description_en: "Connect with nature while taking care of your wellbeing...",
        slug: "clase-yoga-parque",
        is_featured: false,
        price_amount: "0.00",
        price_currency: "EUR",
        duration_minutes: 60,
        capacity: 25,
        whatsapp_contact: "+34658236665",
        main_photo_url: "https://organizaciondame.org/storage/events/clase-yoga-parque.jpg",
        tickets_webview: "",
        start_datetime: "2025-11-04T08:00:00+01:00",
        end_datetime: "2025-11-04T09:00:00+01:00",
        is_recurring_weekly: true,
        recurring_info: {
          next_dates: generateRecurringDates("2025-11-04T08:00:00+01:00"),
          schedule_info: formatRecurringSchedule("2025-11-04T08:00:00+01:00", "2025-11-04T09:00:00+01:00"),
          total_sessions: 8 // 2 meses de clases
        },
        place: {
          id: 7,
          name: "Parque de la Ciudadela",
          address: "Av. del Profesor López Piñero",
          city: "Valencia",
          latitude: 39.4698,
          longitude: -0.3775
        },
        categories: [
          { id: 4, name_es: "Fitness", name_en: "Fitness", slug: "fitness" }
        ],
        tags: [
          { id: 5, name_es: "Yoga", name_en: "Yoga", slug: "yoga" },
          { id: 6, name_es: "Gratis", name_en: "Free", slug: "gratis" },
          { id: 7, name_es: "Aire Libre", name_en: "Outdoor", slug: "aire-libre" }
        ],
        organizers: [
          { id: 3, name: "DAME Valencia Fit", email: "fit@organizaciondame.org" }
        ],
        photos: [
          {
            id: 4,
            event: 3,
            image_url: "https://organizaciondame.org/storage/events/clase-yoga-parque.jpg",
            caption_es: "Yoga matutino en el parque",
            caption_en: "Morning yoga in the park",
            sort_order: 1
          }
        ],
        faqs: [
          {
            id: 5,
            event: 3,
            question_es: "¿Qué debo traer?",
            question_en: "What should I bring?",
            answer_es: "Solo necesitas traer tu esterilla de yoga. Nosotros proporcionamos el resto del material si es necesario.",
            answer_en: "You only need to bring your yoga mat. We provide the rest of the material if necessary.",
            sort_order: 1
          },
          {
            id: 6,
            event: 3,
            question_es: "¿Se cancela si llueve?",
            question_en: "Is it cancelled if it rains?",
            answer_es: "Sí, en caso de lluvia la clase se cancela. Te avisaremos por WhatsApp con al menos 2 horas de antelación.",
            answer_en: "Yes, in case of rain the class is cancelled. We will notify you by WhatsApp at least 2 hours in advance.",
            sort_order: 2
          }
        ],
        programs: [
          {
            id: 9,
            time: "08:00:00",
            icon: "🧘‍♀️",
            title_es: "Calentamiento y respiración",
            title_en: "Warm-up and breathing",
            description_es: "Ejercicios suaves de calentamiento y técnicas de respiración",
            description_en: "Gentle warm-up exercises and breathing techniques",
            sort_order: 1
          },
          {
            id: 10,
            time: "08:15:00",
            icon: "🌅",
            title_es: "Saludo al sol",
            title_en: "Sun salutation",
            description_es: "Secuencia clásica de saludo al sol",
            description_en: "Classic sun salutation sequence",
            sort_order: 2
          },
          {
            id: 11,
            time: "08:35:00",
            icon: "🧘",
            title_es: "Posturas principales",
            title_en: "Main poses",
            description_es: "Práctica de asanas adaptadas a todos los niveles",
            description_en: "Asana practice adapted to all levels",
            sort_order: 3
          },
          {
            id: 12,
            time: "08:55:00",
            icon: "🙏",
            title_es: "Relajación final",
            title_en: "Final relaxation",
            description_es: "Savasana y meditación de cierre",
            description_en: "Savasana and closing meditation",
            sort_order: 4
          }
        ]
      },
      "exposicion-permanente": {
        id: 56,
        title_es: "Exposición Permanente de Arte Moderno",
        title_en: "Permanent Modern Art Exhibition",
        summary_es: "Exposición permanente con obras de artistas contemporáneos",
        summary_en: "Permanent exhibition featuring contemporary artists",
        description_es: "Descubre una colección única de arte moderno.",
        description_en: "Discover a unique collection of modern art.",
        slug: "exposicion-permanente",
        is_featured: true,
        from_price: "8.00",
        to_price: "12.00",
        price_currency: "EUR",
        duration_minutes: 120,
        capacity: 50,
        main_photo_url: "https://example.com/expo.jpg",
        start_datetime: null,
        end_datetime: null,
        is_recurring_weekly: false,
        is_perennial: true,
        perennial_start_date: "2025-09-01",
        perennial_end_date: "2025-12-31",
        available_monday: true,
        available_tuesday: true,
        available_wednesday: true,
        available_thursday: true,
        available_friday: true,
        available_saturday: false,
        available_sunday: false,
        perennial_weekdays_start_time: "10:00:00",
        perennial_weekdays_end_time: "20:00:00",
        perennial_saturday_start_time: null,
        perennial_saturday_end_time: null,
        perennial_sunday_start_time: null,
        perennial_sunday_end_time: null,
        place: {
          id: 3,
          name: "Museo de Arte Contemporáneo",
          address: "Calle Arte 123",
          city: "Valencia",
          latitude: 39.48,
          longitude: -0.375
        },
        categories: [
          { id: 3, name_es: "Exposiciones", name_en: "Exhibitions", slug: "exposiciones" }
        ],
        tags: [],
        organizers: [
          { id: 3, name: "Fundación Arte Valencia", email: "arte@valencia.com", groups: [] }
        ],
        photos: [],
        faqs: [],
        programs: [],
        upcoming_dates: [
          { date: "2025-09-23", start_datetime: "2025-09-23T10:00:00+02:00", end_datetime: "2025-09-23T20:00:00+02:00", is_cancelled: false, is_occurrence: false },
          { date: "2025-09-24", start_datetime: "2025-09-24T10:00:00+02:00", end_datetime: "2025-09-24T20:00:00+02:00", is_cancelled: false, is_occurrence: false },
          { date: "2025-09-25", start_datetime: "2025-09-25T10:00:00+02:00", end_datetime: "2025-09-25T20:00:00+02:00", is_cancelled: false, is_occurrence: false },
          { date: "2025-09-26", start_datetime: "2025-09-26T10:00:00+02:00", end_datetime: "2025-09-26T20:00:00+02:00", is_cancelled: false, is_occurrence: false },
          { date: "2025-09-29", start_datetime: "2025-09-29T10:00:00+02:00", end_datetime: "2025-09-29T20:00:00+02:00", is_cancelled: false, is_occurrence: false },
          { date: "2025-09-30", start_datetime: "2025-09-30T10:00:00+02:00", end_datetime: "2025-09-30T20:00:00+02:00", is_cancelled: false, is_occurrence: false }
        ]
      }
    };

    const eventDetail = eventDetails[slug];
    if (eventDetail) {
      return {
        success: true,
        data: eventDetail,
      };
    } else {
      return {
        success: false,
        error: `Evento con slug "${slug}" no encontrado`,
      };
    }
  }
}

// Instancia singleton del servicio de eventos
export const dameEventsAPI = new DameEventsAPI();

// Utilidades para formateo de fechas y precios
export const formatEventDate = (dateString: string | null | undefined, locale: string = 'es-ES'): string => {
  const messages = {
    'es': { pending: 'Fecha por determinar', invalid: 'Fecha inválida', error: 'Error en fecha' },
    'en': { pending: 'Date TBD', invalid: 'Invalid date', error: 'Date error' }
  };
  const lang = locale.split('-')[0] as 'es' | 'en';
  const msg = messages[lang] || messages.es;
  
  if (!dateString) return msg.pending;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return msg.invalid;
    
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    });
  } catch (error) {
    return msg.error;
  }
};

export const formatEventPrice = (price: string | null | undefined, locale: string = 'es-ES'): string => {
  const messages = {
    'es': { consult: 'Consultar precio', free: 'Gratuito' },
    'en': { consult: 'Contact for price', free: 'Free' }
  };
  const lang = locale.split('-')[0] as 'es' | 'en';
  const msg = messages[lang] || messages.es;
  
  if (!price) return msg.consult;
  
  try {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return msg.consult;
    if (numPrice === 0) return msg.free;
    return `${numPrice.toFixed(2)}€`;
  } catch (error) {
    return msg.consult;
  }
};

export const getAvailableSpots = (event: DameEvent | null | undefined): number => {
  if (!event || !event.capacity) return 0;
  return event.capacity - (event.registered_count || 0);
};

export const isEventSoldOut = (event: DameEvent | null | undefined): boolean => {
  if (!event || !event.capacity) return false;
  return (event.registered_count || 0) >= event.capacity;
};

// Helper para generar fechas futuras de eventos recurrentes
export const generateRecurringDates = (baseDate: string, weeksCount: number = 8): EventDate[] => {
  const dates: EventDate[] = [];
  
  if (!baseDate) return dates;
  
  try {
    const startDate = new Date(baseDate);
    
    // Validar que la fecha base es válida
    if (isNaN(startDate.getTime()) || startDate.getFullYear() < 2000) {
      console.warn('⚠️ Fecha base inválida para evento recurrente:', baseDate);
      return dates;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparación
    
    for (let i = 0; i < weeksCount; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + (i * 7)); // Agregar semanas
      
      // Validar que la fecha generada es válida
      if (isNaN(nextDate.getTime()) || nextDate.getFullYear() < 2000) {
        continue;
      }
      
      // Solo incluir fechas futuras
      const nextDateOnly = new Date(nextDate);
      nextDateOnly.setHours(0, 0, 0, 0);
      
      if (nextDateOnly >= today) {
        dates.push({
          id: `${nextDate.toISOString().split('T')[0]}`,
          date: nextDate.toISOString(),
          available_spots: Math.floor(Math.random() * 10) + 5, // Demo: 5-15 plazas
          is_full: Math.random() < 0.1, // Demo: 10% probabilidad de estar lleno
          registration_deadline: new Date(nextDate.getTime() - 24 * 60 * 60 * 1000).toISOString() // 24h antes
        });
      }
    }
    
    return dates.slice(0, 6); // Máximo 6 fechas próximas
  } catch (error) {
    console.error('❌ Error generando fechas recurrentes:', error);
    return dates;
  }
};

/** Nombres de días en español (0 = Lun, 6 = Dom) */
const WEEKDAY_NAMES_ES: Record<number, string> = {
  0: "lunes", 1: "martes", 2: "miércoles", 3: "jueves", 4: "viernes", 5: "sábado", 6: "domingo",
};
const WEEKDAY_NAMES_EN: Record<number, string> = {
  0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday",
};
/** Abreviaturas cortas (ES: Lun, Mar... / EN: Mon, Tue...) */
const WEEKDAY_SHORT_ES: Record<number, string> = {
  0: "Lun", 1: "Mar", 2: "Mié", 3: "Jue", 4: "Vie", 5: "Sáb", 6: "Dom",
};
const WEEKDAY_SHORT_EN: Record<number, string> = {
  0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun",
};

export interface PerennialScheduleGroup {
  dayLabels: string[];
  dayLabelsShort: string[];
  dayRange: string; // ej. "Lun–Vie" o "Sáb"
  startTime: string;
  endTime: string;
}

/** Devuelve grupos de días con sus horarios para mostrar en UI */
export const getPerennialScheduleGroups = (
  event: {
    available_weekdays?: number[] | null;
    perennial_weekdays_start_time?: string | null;
    perennial_weekdays_end_time?: string | null;
    perennial_saturday_start_time?: string | null;
    perennial_saturday_end_time?: string | null;
    perennial_sunday_start_time?: string | null;
    perennial_sunday_end_time?: string | null;
    available_monday?: boolean;
    available_tuesday?: boolean;
    available_wednesday?: boolean;
    available_thursday?: boolean;
    available_friday?: boolean;
    available_saturday?: boolean;
    available_sunday?: boolean;
  },
  locale: string = "es-ES"
): PerennialScheduleGroup[] => {
  const weekdays = event.available_weekdays && event.available_weekdays.length > 0
    ? event.available_weekdays
    : getAvailableWeekdaysFromBooleans(event);
  if (!weekdays || weekdays.length === 0) return [];

  const isEn = locale.startsWith("en");
  const names = isEn ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_ES;
  const shortNames = isEn ? WEEKDAY_SHORT_EN : WEEKDAY_SHORT_ES;

  const fmt = (t: string | null | undefined) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };

  const wdStart = fmt(event.perennial_weekdays_start_time);
  const wdEnd = fmt(event.perennial_weekdays_end_time);
  const satStart = fmt(event.perennial_saturday_start_time);
  const satEnd = fmt(event.perennial_saturday_end_time);
  const sunStart = fmt(event.perennial_sunday_start_time);
  const sunEnd = fmt(event.perennial_sunday_end_time);

  const weekdaysOnly = weekdays.filter((d) => d >= 0 && d <= 4).sort((a, b) => a - b);
  const hasSat = weekdays.includes(5);
  const hasSun = weekdays.includes(6);

  const groups: PerennialScheduleGroup[] = [];

  if (weekdaysOnly.length > 0 && (wdStart || wdEnd)) {
    const labels = weekdaysOnly.map((d) => names[d]);
    const shortLabels = weekdaysOnly.map((d) => shortNames[d]);
    const range =
      weekdaysOnly.length === 5 && weekdaysOnly.every((d, i) => d === i)
        ? isEn ? "Mon–Fri" : "Lun–Vie"
        : shortLabels.join(", ");
    groups.push({
      dayLabels: labels,
      dayLabelsShort: shortLabels,
      dayRange: range,
      startTime: wdStart,
      endTime: wdEnd,
    });
  }
  if (hasSat && (satStart || satEnd)) {
    groups.push({
      dayLabels: [names[5]],
      dayLabelsShort: [shortNames[5]],
      dayRange: shortNames[5],
      startTime: satStart,
      endTime: satEnd,
    });
  }
  if (hasSun && (sunStart || sunEnd)) {
    groups.push({
      dayLabels: [names[6]],
      dayLabelsShort: [shortNames[6]],
      dayRange: shortNames[6],
      startTime: sunStart,
      endTime: sunEnd,
    });
  }

  return groups;
};

/** Convierte available_monday...available_sunday a array de índices (0=Lun, 6=Dom) */
const getAvailableWeekdaysFromBooleans = (e: {
  available_monday?: boolean;
  available_tuesday?: boolean;
  available_wednesday?: boolean;
  available_thursday?: boolean;
  available_friday?: boolean;
  available_saturday?: boolean;
  available_sunday?: boolean;
}): number[] => {
  const out: number[] = [];
  if (e.available_monday) out.push(0);
  if (e.available_tuesday) out.push(1);
  if (e.available_wednesday) out.push(2);
  if (e.available_thursday) out.push(3);
  if (e.available_friday) out.push(4);
  if (e.available_saturday) out.push(5);
  if (e.available_sunday) out.push(6);
  return out;
};

/** Formatea el horario de un evento perenne (ej: "Lun-Vie 10:00-20:00") */
export const formatPerennialSchedule = (
  event: {
    available_weekdays?: number[] | null;
    perennial_weekdays_start_time?: string | null;
    perennial_weekdays_end_time?: string | null;
    perennial_saturday_start_time?: string | null;
    perennial_saturday_end_time?: string | null;
    perennial_sunday_start_time?: string | null;
    perennial_sunday_end_time?: string | null;
    available_monday?: boolean;
    available_tuesday?: boolean;
    available_wednesday?: boolean;
    available_thursday?: boolean;
    available_friday?: boolean;
    available_saturday?: boolean;
    available_sunday?: boolean;
  },
  locale: string = "es-ES"
): string => {
  const weekdays = event.available_weekdays && event.available_weekdays.length > 0
    ? event.available_weekdays
    : getAvailableWeekdaysFromBooleans(event);
  if (!weekdays || weekdays.length === 0) return locale.startsWith("en") ? "Schedule TBD" : "Horario por determinar";

  const isEn = locale.startsWith("en");
  const names = isEn ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_ES;

  const fmt = (t: string | null | undefined) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };

  const wdStart = fmt(event.perennial_weekdays_start_time);
  const wdEnd = fmt(event.perennial_weekdays_end_time);
  const satStart = fmt(event.perennial_saturday_start_time);
  const satEnd = fmt(event.perennial_saturday_end_time);
  const sunStart = fmt(event.perennial_sunday_start_time);
  const sunEnd = fmt(event.perennial_sunday_end_time);

  const weekdaysOnly = weekdays.filter((d) => d >= 0 && d <= 4).sort((a, b) => a - b);
  const hasSat = weekdays.includes(5);
  const hasSun = weekdays.includes(6);

  const parts: string[] = [];
  if (weekdaysOnly.length === 5 && weekdaysOnly.every((d, i) => d === i)) {
    parts.push(isEn ? `Mon–Fri ${wdStart || ""}–${wdEnd || ""}`.trim() : `Lun–Vie ${wdStart || ""}–${wdEnd || ""}`.trim());
  } else if (weekdaysOnly.length > 0) {
    const dayNames = weekdaysOnly.map((d) => names[d]).join(", ");
    parts.push(`${dayNames} ${wdStart || ""}–${wdEnd || ""}`.trim());
  }
  if (hasSat && (satStart || satEnd)) {
    parts.push(`${isEn ? "Sat" : "Sáb"} ${satStart || ""}–${satEnd || ""}`.trim());
  }
  if (hasSun && (sunStart || sunEnd)) {
    parts.push(`${isEn ? "Sun" : "Dom"} ${sunStart || ""}–${sunEnd || ""}`.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : (isEn ? "Open on selected days" : "Abierto según días indicados");
};

// Helper para formatear información de horario recurrente
export const formatRecurringSchedule = (startDateString: string, endDateString?: string): string => {
  try {
    const startDate = new Date(startDateString);
    
    // Validar fecha de inicio
    if (isNaN(startDate.getTime()) || startDate.getFullYear() < 2000) {
      return 'Horario semanal por determinar';
    }
    
    const dayName = startDate.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' });
    const startTime = startDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Madrid'
    });
    
    // Si hay hora de fin, formatear ambos
    if (endDateString) {
      const endDate = new Date(endDateString);
      if (!isNaN(endDate.getTime()) && endDate.getFullYear() >= 2000) {
        const endTime = endDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'Europe/Madrid'
        });
        return `Todos los ${dayName} de ${startTime} a ${endTime}`;
      }
    }
    
    return `Todos los ${dayName} a las ${startTime}`;
  } catch {
    return 'Horario semanal por determinar';
  }
};
