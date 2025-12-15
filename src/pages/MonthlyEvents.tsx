import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { dameEventsAPI, formatEventDate, formatEventPrice } from '@/integrations/dame-api/events';
import type { DameEvent } from '@/integrations/dame-api/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MonthlyEvents = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Obtener año y mes de los query params, o usar el mes actual
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11
  
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  
  const [selectedYear, setSelectedYear] = useState<number>(
    yearParam ? parseInt(yearParam, 10) : currentYear
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    monthParam ? parseInt(monthParam, 10) : currentMonth
  );
  
  const [events, setEvents] = useState<DameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [selectedYear, selectedMonth]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📅 Loading events for ${selectedYear}-${selectedMonth}`);
      const response = await dameEventsAPI.getMonthlyEvents(selectedYear, selectedMonth);
      
      if (response.success && response.data) {
        console.log('📦 Response data type:', typeof response.data);
        console.log('📦 Response data:', response.data);
        console.log('📦 Is array?', Array.isArray(response.data));
        
        // La API podría devolver un array directamente o un objeto con una propiedad 'events'
        let eventsArray: DameEvent[] = [];
        
        if (Array.isArray(response.data)) {
          // Si es un array directamente, usarlo
          eventsArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Si es un objeto, buscar la propiedad que contiene el array
          if ('events' in response.data && Array.isArray(response.data.events)) {
            eventsArray = response.data.events;
          } else if ('results' in response.data && Array.isArray(response.data.results)) {
            eventsArray = response.data.results;
          } else {
            // Intentar convertir el objeto a array si tiene propiedades numéricas
            const values = Object.values(response.data);
            if (values.length > 0 && Array.isArray(values[0])) {
              eventsArray = values[0] as DameEvent[];
            } else {
              console.warn('⚠️ Unexpected data structure:', response.data);
              eventsArray = [];
            }
          }
        }
        
        console.log(`✅ Loaded ${eventsArray.length} events`);
        
        // Ordenar eventos por fecha
        const sortedEvents = eventsArray.sort((a, b) => {
          const dateA = new Date(a.start).getTime();
          const dateB = new Date(b.start).getTime();
          return dateA - dateB;
        });
        setEvents(sortedEvents);
      } else {
        const errorMsg = response.error || (i18n.language === 'en' ? 'Error loading events' : 'Error al cargar eventos');
        console.error('❌ Error loading events:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error loading monthly events:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (i18n.language === 'en' ? 'Error connecting to API' : 'Error al conectar con la API');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    let newYear = selectedYear;
    let newMonth = selectedMonth;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    
    // Actualizar URL params
    setSearchParams({ year: newYear.toString(), month: newMonth.toString() });
  };

  const goToCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setSearchParams({ year: currentYear.toString(), month: currentMonth.toString() });
  };

  // Función auxiliar para formatear patrón de recurrencia
  const formatRecurrencePattern = (event: DameEvent): string => {
    if (!event.is_recurring_weekly) return '';
    
    const eventDate = new Date(event.start);
    const dayNames = i18n.language === 'en'
      ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      : ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    const dayName = dayNames[eventDate.getDay()];
    const timeStr = eventDate.toLocaleTimeString(
      i18n.language === 'en' ? 'en-US' : 'es-ES',
      { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }
    );
    
    return i18n.language === 'en' 
      ? `Cada ${dayName} a las ${timeStr}`
      : `Cada ${dayName} a las ${timeStr}`;
  };

  // Función para cargar imagen como base64
  const loadImageAsBase64 = (
    src: string
  ): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
            width: img.width,
            height: img.height,
          });
        } catch (error) {
          console.warn('Error converting image to base64:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.warn('Error loading image:', src);
        resolve(null);
      };
      
      img.src = src;
    });
  };

  const generatePDF = async () => {
    if (events.length === 0) {
      toast({
        title: i18n.language === 'en' ? 'No events' : 'Sin eventos',
        description: i18n.language === 'en' 
          ? 'There are no events to generate PDF' 
          : 'No hay eventos para generar PDF',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingPDF(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const imageWidth = 40; // Ancho de las imágenes
      const imageHeight = 30; // Alto de las imágenes
      
      // Título con fondo
      doc.setFillColor(98, 47, 141); // Color morado DAME
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const monthNames = i18n.language === 'en' 
        ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthName = monthNames[selectedMonth - 1];
      const title = i18n.language === 'en' 
        ? `Events - ${monthName} ${selectedYear}`
        : `Eventos - ${monthName} ${selectedYear}`;
      
      doc.text(title, margin, 18);
      
      let yPosition = 35;
      
      // Agrupar eventos: recurrentes por slug, únicos por fecha
      const uniqueEvents: Map<string, DameEvent> = new Map();
      const recurringEvents: Map<string, DameEvent> = new Map();
      
      for (const event of events) {
        if (event.is_recurring_weekly) {
          // Para recurrentes, agrupar por slug (solo guardar uno)
          if (!recurringEvents.has(event.event_slug)) {
            recurringEvents.set(event.event_slug, event);
          }
        } else {
          // Para únicos, agrupar por día y slug
          const eventDate = new Date(event.start);
          const dayKey = eventDate.toISOString().split('T')[0];
          const uniqueKey = `${dayKey}-${event.event_slug}`;
          if (!uniqueEvents.has(uniqueKey)) {
            uniqueEvents.set(uniqueKey, event);
          }
        }
      }
      
      // Agrupar eventos únicos por día
      const eventsByDay = Array.from(uniqueEvents.values()).reduce((acc, event) => {
        const eventDate = new Date(event.start);
        const dayKey = eventDate.toISOString().split('T')[0];
        
        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push(event);
        return acc;
      }, {} as Record<string, DameEvent[]>);
      
      // Agregar sección de eventos recurrentes al inicio
      if (recurringEvents.size > 0) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 2, 2, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const recurringTitle = i18n.language === 'en' ? 'Recurring Events' : 'Eventos Recurrentes';
        doc.text(recurringTitle, margin + 2, yPosition + 2);
        yPosition += 12;
        
        for (const event of recurringEvents.values()) {
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Cargar imagen
          let imageData = null;
          if (event.main_photo_url) {
            imageData = await loadImageAsBase64(event.main_photo_url);
          }
          
          // Dibujar card con borde
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          const cardHeight = imageData ? Math.max(imageHeight + 10, 35) : 30;
          doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 3, 3, 'S');
          
          // Agregar imagen si existe
          if (imageData) {
            const imgRatio = imageData.width / imageData.height;
            const imgHeight = imageHeight;
            const imgWidth = imgHeight * imgRatio;
            doc.addImage(
              imageData.dataUrl,
              'JPEG',
              margin + 2,
              yPosition + 2,
              imgWidth,
              imgHeight
            );
          }
          
          // Texto del evento
          const textStartX = imageData ? margin + imageWidth + 5 : margin + 2;
          const textWidth = contentWidth - (imageData ? imageWidth + 7 : 4);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const eventTitle = i18n.language === 'en' && event.title_en ? event.title_en : event.title_es;
          const titleLines = doc.splitTextToSize(eventTitle, textWidth);
          doc.text(titleLines, textStartX, yPosition + 6);
          let textY = yPosition + 6 + (titleLines.length * 4.5);
          
          // Patrón de recurrencia
          const recurrencePattern = formatRecurrencePattern(event);
          if (recurrencePattern) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(98, 47, 141);
            doc.text(recurrencePattern, textStartX, textY);
            textY += 5;
          }
          
          // Lugar
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          if (event.place?.name) {
            doc.text(`📍 ${event.place.name}`, textStartX, textY);
            textY += 5;
          }
          
          // Precio
          const priceStr = formatEventPrice(event.price, i18n.language === 'en' ? 'en-US' : 'es-ES');
          doc.text(`💰 ${priceStr}`, textStartX, textY);
          
          yPosition += cardHeight + 5;
        }
        
        yPosition += 5;
      }
      
      // Eventos únicos agrupados por día
      const sortedDays = Object.keys(eventsByDay).sort();
      
      for (const dayKey of sortedDays) {
        const dayEvents = eventsByDay[dayKey];
        const dayDate = new Date(dayKey);
        
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Fecha del día con fondo
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 2, 2, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        const dayName = dayDate.toLocaleDateString(
          i18n.language === 'en' ? 'en-US' : 'es-ES',
          { weekday: 'long', day: 'numeric', month: 'long' }
        );
        doc.text(dayName.charAt(0).toUpperCase() + dayName.slice(1), margin + 2, yPosition + 2);
        yPosition += 12;
        
        // Eventos del día
        for (const event of dayEvents) {
          // Verificar si necesitamos una nueva página
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Cargar imagen
          let imageData = null;
          if (event.main_photo_url) {
            imageData = await loadImageAsBase64(event.main_photo_url);
          }
          
          // Dibujar card con borde
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          const cardHeight = imageData ? Math.max(imageHeight + 10, 40) : 35;
          doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 3, 3, 'S');
          
          // Agregar imagen si existe
          if (imageData) {
            const imgRatio = imageData.width / imageData.height;
            const imgHeight = imageHeight;
            const imgWidth = imgHeight * imgRatio;
            doc.addImage(
              imageData.dataUrl,
              'JPEG',
              margin + 2,
              yPosition + 2,
              imgWidth,
              imgHeight
            );
          }
          
          // Texto del evento
          const textStartX = imageData ? margin + imageWidth + 5 : margin + 2;
          const textWidth = contentWidth - (imageData ? imageWidth + 7 : 4);
          
          // Título del evento
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const eventTitle = i18n.language === 'en' && event.title_en ? event.title_en : event.title_es;
          const titleLines = doc.splitTextToSize(eventTitle, textWidth);
          doc.text(titleLines, textStartX, yPosition + 6);
          let textY = yPosition + 6 + (titleLines.length * 4.5);
          
          // Hora
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const eventDate = new Date(event.start);
          const timeStr = eventDate.toLocaleTimeString(
            i18n.language === 'en' ? 'en-US' : 'es-ES',
            { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }
          );
          doc.text(`🕐 ${timeStr}`, textStartX, textY);
          textY += 5;
          
          // Lugar
          if (event.place?.name) {
            doc.text(`📍 ${event.place.name}`, textStartX, textY);
            textY += 5;
          }
          
          // Precio
          const priceStr = formatEventPrice(event.price, i18n.language === 'en' ? 'en-US' : 'es-ES');
          doc.text(`💰 ${priceStr}`, textStartX, textY);
          textY += 5;
          
          // Descripción corta si existe
          if (event.short_description_es || event.short_description_en) {
            const description = i18n.language === 'en' && event.short_description_en 
              ? event.short_description_en 
              : event.short_description_es;
            if (description) {
              doc.setFontSize(8);
              doc.setTextColor(80, 80, 80);
              const descLines = doc.splitTextToSize(description, textWidth);
              doc.text(descLines, textStartX, textY);
              textY += descLines.length * 3.5;
            }
          }
          
          doc.setTextColor(0, 0, 0);
          yPosition += cardHeight + 5;
        }
        
        yPosition += 5;
      }
      
      // Página de alquiler de material
      doc.addPage();
      yPosition = margin;
      
      // Título de la sección
      doc.setFillColor(98, 47, 141); // Color morado DAME
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const rentalTitle = i18n.language === 'en' 
        ? 'Equipment Rental'
        : 'Alquiler de Material';
      doc.text(rentalTitle, margin, 18);
      
      yPosition = 35;
      
      // Descripción introductoria
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const introText = i18n.language === 'en'
        ? 'DAME Valencia offers equipment rental services for your events and activities. Contact us for availability and pricing.'
        : 'DAME Valencia ofrece servicios de alquiler de material para tus eventos y actividades. Contáctanos para disponibilidad y precios.';
      const introLines = doc.splitTextToSize(introText, contentWidth);
      doc.text(introLines, margin, yPosition);
      yPosition += introLines.length * 5 + 10;
      
      // Material de Volley
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 2, 2, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const volleyTitle = i18n.language === 'en' ? 'Volleyball Equipment' : 'Material de Volley';
      doc.text(volleyTitle, margin + 2, yPosition + 2);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const volleyItems = i18n.language === 'en'
        ? [
            '• Volleyball nets and posts',
            '• Volleyballs (official size)',
            '• Court markers and boundary lines',
            '• Antennas and referee equipment',
            '• Scoreboards'
          ]
        : [
            '• Redes y postes de voleibol',
            '• Balones de voleibol (tamaño oficial)',
            '• Marcadores de cancha y líneas de límite',
            '• Antenas y material de árbitro',
            '• Marcadores de puntuación'
          ];
      
      for (const item of volleyItems) {
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      }
      
      yPosition += 8;
      
      // Equipo de Sonido
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const soundTitle = i18n.language === 'en' ? 'Sound Equipment' : 'Equipo de Sonido';
      doc.text(soundTitle, margin + 2, yPosition + 2);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const soundItems = i18n.language === 'en'
        ? [
            '• PA systems and speakers',
            '• Microphones (wired and wireless)',
            '• Mixing consoles',
            '• Audio cables and accessories',
            '• DJ equipment (turntables, controllers)',
            '• Stage monitors'
          ]
        : [
            '• Sistemas de megafonía y altavoces',
            '• Micrófonos (con cable e inalámbricos)',
            '• Mesas de mezclas',
            '• Cables de audio y accesorios',
            '• Equipo de DJ (platos, controladores)',
            '• Monitores de escenario'
          ];
      
      for (const item of soundItems) {
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      }
      
      yPosition += 8;
      
      // Otros Materiales
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const otherTitle = i18n.language === 'en' ? 'Other Equipment' : 'Otros Materiales';
      doc.text(otherTitle, margin + 2, yPosition + 2);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const otherItems = i18n.language === 'en'
        ? [
            '• Tables and chairs',
            '• Projectors and screens',
            '• Lighting equipment',
            '• Tents and canopies',
            '• Sports equipment (various)',
            '• Decoration materials'
          ]
        : [
            '• Mesas y sillas',
            '• Proyectores y pantallas',
            '• Equipamiento de iluminación',
            '• Carpas y toldos',
            '• Material deportivo (varios)',
            '• Material de decoración'
          ];
      
      for (const item of otherItems) {
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      }
      
      yPosition += 15;
      
      // Información de contacto
      doc.setFillColor(98, 47, 141);
      doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const contactTitle = i18n.language === 'en' ? 'Contact Information' : 'Información de Contacto';
      doc.text(contactTitle, margin + 5, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactInfo = i18n.language === 'en'
        ? [
            '📧 Email: info@organizaciondame.org',
            '📱 WhatsApp: +34 644 070 282',
            '🌐 Web: organizaciondame.org'
          ]
        : [
            '📧 Email: info@organizaciondame.org',
            '📱 WhatsApp: +34 644 070 282',
            '🌐 Web: organizaciondame.org'
          ];
      
      let contactY = yPosition + 15;
      for (const info of contactInfo) {
        doc.text(info, margin + 5, contactY);
        contactY += 6;
      }
      
      // Nota final
      yPosition += 35;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const note = i18n.language === 'en'
        ? 'Please contact us in advance to check availability and reserve equipment. Prices may vary depending on the duration and type of event.'
        : 'Por favor, contáctanos con antelación para consultar disponibilidad y reservar material. Los precios pueden variar según la duración y tipo de evento.';
      const noteLines = doc.splitTextToSize(note, contentWidth);
      doc.text(noteLines, margin, yPosition);
      
      // Guardar PDF
      const fileName = `eventos-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: i18n.language === 'en' ? 'PDF downloaded!' : '¡PDF descargado!',
        description: i18n.language === 'en' 
          ? 'The monthly events PDF has been downloaded' 
          : 'El PDF de eventos mensuales ha sido descargado',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en' 
          ? 'Could not generate PDF' 
          : 'No se pudo generar el PDF',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const monthNames = i18n.language === 'en' 
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header con controles de mes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {i18n.language === 'en' ? 'Monthly Events' : 'Eventos Mensuales'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'en' 
              ? 'View and download all events for a specific month' 
              : 'Visualiza y descarga todos los eventos de un mes específico'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth('prev')}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center min-w-[200px]">
            <div className="font-semibold text-lg">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </div>
            {!isCurrentMonth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToCurrentMonth}
                className="text-xs mt-1"
              >
                {i18n.language === 'en' ? 'Current month' : 'Mes actual'}
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth('next')}
            disabled={loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Botón de descarga PDF */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={generatePDF}
          disabled={loading || events.length === 0 || generatingPDF}
          className="gap-2"
        >
          {generatingPDF ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {i18n.language === 'en' ? 'Generating PDF...' : 'Generando PDF...'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {i18n.language === 'en' ? 'Download PDF' : 'Descargar PDF'}
            </>
          )}
        </Button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">
              {i18n.language === 'en' ? 'No events found' : 'No se encontraron eventos'}
            </p>
            <p className="text-muted-foreground">
              {i18n.language === 'en' 
                ? `There are no events scheduled for ${monthNames[selectedMonth - 1]} ${selectedYear}`
                : `No hay eventos programados para ${monthNames[selectedMonth - 1]} ${selectedYear}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Agrupar eventos por día */}
          {Object.entries(
            events.reduce((acc, event) => {
              const eventDate = new Date(event.start);
              const dayKey = eventDate.toISOString().split('T')[0];
              
              if (!acc[dayKey]) {
                acc[dayKey] = [];
              }
              acc[dayKey].push(event);
              return acc;
            }, {} as Record<string, DameEvent[]>)
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dayKey, dayEvents]) => {
              const dayDate = new Date(dayKey);
              const dayName = dayDate.toLocaleDateString(
                i18n.language === 'en' ? 'en-US' : 'es-ES',
                { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
              );
              
              return (
                <div key={dayKey} className="space-y-3">
                  <h2 className="text-xl font-semibold border-b pb-2">
                    {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                  </h2>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dayEvents.map((event) => {
                      const eventDate = new Date(event.start);
                      const timeStr = eventDate.toLocaleTimeString(
                        i18n.language === 'en' ? 'en-US' : 'es-ES',
                        { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }
                      );
                      
                      return (
                        <Card key={event.event_slug} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg line-clamp-2">
                              {i18n.language === 'en' && event.title_en ? event.title_en : event.title_es}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{timeStr}</span>
                            </div>
                            
                            {event.place?.name && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">{event.place.name}</span>
                              </div>
                            )}
                            
                            {event.price && (
                              <div className="text-sm font-semibold">
                                {formatEventPrice(event.price, i18n.language === 'en' ? 'en-US' : 'es-ES')}
                              </div>
                            )}
                            
                            {(event.short_description_es || event.short_description_en) && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {i18n.language === 'en' && event.short_description_en 
                                  ? event.short_description_en 
                                  : event.short_description_es}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MonthlyEvents;

