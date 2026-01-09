import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import { dameEventsAPI } from '@/integrations/dame-api/events';
import type { Ticket } from '@/types/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import dameLogoWhite from '@/assets/damelogo blanco.png';

const MyTickets = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTickets, setCurrentTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [copiedTicketCode, setCopiedTicketCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const [currentResponse, pastResponse] = await Promise.all([
          dameTicketsAPI.getMyCurrentTickets(1),
          dameTicketsAPI.getMyPastTickets(1),
        ]);

        if (currentResponse.success && currentResponse.data) {
          setCurrentTickets(currentResponse.data.results || []);
        } else {
          console.error('Error fetching current tickets:', currentResponse.error);
        }

        if (pastResponse.success && pastResponse.data) {
          setPastTickets(pastResponse.data.results || []);
        } else {
          console.error('Error fetching past tickets:', pastResponse.error);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(i18n.language === 'en' ? 'Error loading tickets' : 'Error al cargar las entradas');
        toast({
          title: i18n.language === 'en' ? 'Error' : 'Error',
          description: i18n.language === 'en' ? 'Could not load your tickets' : 'No se pudieron cargar tus entradas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate, i18n.language, toast]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (amount: string, currency: string = 'EUR'): string => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) {
      return i18n.language === 'en' ? 'Free' : 'Gratuito';
    }
    return `${num.toFixed(2)}${currency === 'EUR' ? '€' : currency}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            {i18n.language === 'en' ? 'Confirmed' : 'Confirmado'}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {i18n.language === 'en' ? 'Cancelled' : 'Cancelado'}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            {i18n.language === 'en' ? 'Pending' : 'Pendiente'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const handleCopyTicketCode = async (ticketCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ticketCode);
      setCopiedTicketCode(ticketCode);
      toast({
        title: i18n.language === 'en' ? 'Copied!' : '¡Copiado!',
        description: i18n.language === 'en' 
          ? 'Ticket code copied to clipboard'
          : 'Código de entrada copiado al portapapeles',
      });
      setTimeout(() => setCopiedTicketCode(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en' ? 'Could not copy code' : 'No se pudo copiar el código',
        variant: 'destructive',
      });
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    // Función vacía por ahora, puede expandirse para mostrar detalles
  };

  const generateTicketPDF = async (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const ticketHash =
        ticket.hash ||
        ticket.ticket_hash ||
        ticket.ticket_metadata?.hash ||
        ticket.ticket_metadata?.ticket_hash;

      const qrDataUrl = ticketHash
        ? await QRCode.toDataURL(ticketHash, {
            width: 400,
            margin: 0,
            errorCorrectionLevel: 'H',
          })
        : null;

      const loadImageAsBase64 = (
        src: string
      ): Promise<{ dataUrl: string; width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
              }
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              resolve({
                dataUrl: canvas.toDataURL('image/png'),
                width: img.width,
                height: img.height,
              });
            } catch (error) {
              reject(error);
            }
          };
          img.onerror = (error) => reject(error);
          img.src = src;
        });
      };

      const logoData = await loadImageAsBase64(dameLogoWhite);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const purple = [98, 47, 141];
      const dark = [18, 18, 18];
      const gray = [80, 80, 80];
      const lightGray = [240, 240, 240];

      // Header compacto
      const headerHeight = 20;
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      const logoHeight = headerHeight - 2;
      const ratio = logoData.width / logoData.height;
      const logoWidth = logoHeight * ratio;
      doc.addImage(logoData.dataUrl, 'PNG', margin, (headerHeight - logoHeight) / 2, logoWidth, logoHeight);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        i18n.language === 'en' ? 'Digital Access Ticket' : 'Entrada digital de acceso',
        pageWidth - margin,
        headerHeight / 2 + 2,
        { align: 'right' }
      );

      let cursorY = headerHeight + 10;
      const cardWidth = pageWidth - margin * 2;

      // Hero card compacto
      const heroHeight = 50;
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.roundedRect(margin, cursorY, cardWidth, heroHeight, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleLines = doc.splitTextToSize(ticket.event_title, cardWidth - 20);
      doc.text(titleLines, margin + 10, cursorY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const eventDate = formatDate(ticket.event_date);
      const dateY = cursorY + 12 + (titleLines.length * 5.5) + 4;
      doc.text(eventDate, margin + 10, dateY);

      cursorY += heroHeight + 10;

      // Location box - Recuadro destacado para ubicación
      const eventPlace =
        ticket.ticket_metadata?.event_place ||
        (i18n.language === 'en' ? 'Location to be confirmed' : 'Ubicación por confirmar');
      
      // Separar nombre y dirección si están en el string (formato: "Nombre, Dirección" o similar)
      let placeName = '';
      let placeAddress = '';
      if (eventPlace && eventPlace !== (i18n.language === 'en' ? 'Location to be confirmed' : 'Ubicación por confirmar')) {
        // Intentar separar por comas
        const parts = eventPlace.split(',').map(p => p.trim()).filter(p => p);
        if (parts.length >= 2) {
          placeName = parts[0];
          placeAddress = parts.slice(1).join(', ');
        } else {
          placeName = eventPlace;
        }
      } else {
        placeName = eventPlace;
      }

      // Location box compacto
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const placeNameLines = placeName ? doc.splitTextToSize(placeName, cardWidth / 2 - 15) : [];
      const placeAddressLines = placeAddress && placeAddress !== placeName ? doc.splitTextToSize(placeAddress, cardWidth / 2 - 15) : [];
      const locationBoxHeight = Math.max(28, 8 + (placeNameLines.length * 4.5) + (placeAddressLines.length * 4) + 8);
      
      doc.setFillColor(250, 248, 255);
      doc.roundedRect(margin, cursorY, cardWidth, locationBoxHeight, 4, 4, 'F');
      doc.setDrawColor(purple[0], purple[1], purple[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cursorY, cardWidth, locationBoxHeight, 4, 4, 'D');
      
      // Título "Ubicación"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(
        i18n.language === 'en' ? 'Location' : 'Ubicación',
        margin + 8,
        cursorY + 8
      );
      
      // Nombre y dirección lado a lado si hay espacio
      if (placeName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(dark[0], dark[1], dark[2]);
        const nameY = cursorY + 8 + 6;
        doc.text(placeNameLines, margin + 8, nameY);
        
        if (placeAddress && placeAddress !== placeName) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(gray[0], gray[1], gray[2]);
          const addressY = nameY + (placeNameLines.length * 4.5) + 2;
          doc.text(placeAddressLines, margin + 8, addressY);
        }
      }

      cursorY += locationBoxHeight + 8;

      // Ticket info block - diseño horizontal compacto
      const infoHeight = 50;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, cardWidth, infoHeight, 4, 4, 'FD');

      // QR Code a la derecha
      if (qrDataUrl) {
        const qrSize = 35;
        doc.addImage(qrDataUrl, 'PNG', margin + cardWidth - qrSize - 8, cursorY + 7, qrSize, qrSize);
      }

      // Información del ticket a la izquierda
      const leftWidth = cardWidth - (qrDataUrl ? 45 : 0) - 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(i18n.language === 'en' ? 'Ticket' : 'Entrada', margin + 8, cursorY + 12);
      doc.setFontSize(9);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(ticket.ticket_type_title, margin + 8, cursorY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(
        i18n.language === 'en' ? `Attendee: ${ticket.full_name}` : `Asistente: ${ticket.full_name}`,
        margin + 8,
        cursorY + 28
      );
      doc.text(i18n.language === 'en' ? `Email: ${ticket.email}` : `Correo: ${ticket.email}`, margin + 8, cursorY + 35);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(ticket.ticket_code, margin + 8, cursorY + infoHeight - 8);

      cursorY += infoHeight + 8;

      // Ticket metadata row compacto
      const detailHeight = 22;
      doc.setFillColor(248, 248, 250);
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, cardWidth, detailHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      const detailY = cursorY + 7;
      const detailValuesY = cursorY + 15;
      doc.text('Ticket ID', margin + 8, detailY);
      doc.text(
        i18n.language === 'en' ? 'Purchase Date' : 'Fecha de compra',
        margin + cardWidth / 3 + 3,
        detailY
      );
      doc.text(i18n.language === 'en' ? 'Price' : 'Precio', margin + (cardWidth / 3) * 2 + 3, detailY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(`#${ticket.id}`, margin + 8, detailValuesY);
      doc.text(formatDate(ticket.purchase_date), margin + cardWidth / 3 + 3, detailValuesY);
      doc.text(formatPrice(ticket.purchase_price, ticket.purchase_currency), margin + (cardWidth / 3) * 2 + 3, detailValuesY);

      cursorY += detailHeight + 8;

      // Important info box compacto - ajustar para que quepa en una página
      const infoText =
        i18n.language === 'en'
          ? 'Present this ticket and QR code at the venue entrance. Arrive early to guarantee access and follow the team instructions at all times.'
          : 'Presenta esta entrada y el código QR en la entrada del evento. Llega con tiempo para garantizar el acceso y sigue las indicaciones del equipo en todo momento.';
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const infoLines = doc.splitTextToSize(infoText, cardWidth - 16);
      const infoTitleHeight = 8;
      const infoTextHeight = infoLines.length * 4;
      const infoPadding = 12;
      const infoBoxHeight = infoTitleHeight + infoTextHeight + infoPadding;
      
      // Ajustar altura si no cabe
      const remainingSpace = pageHeight - cursorY - margin - 10;
      const finalInfoBoxHeight = Math.min(infoBoxHeight, remainingSpace - 5);

      doc.setFillColor(250, 248, 255);
      doc.roundedRect(margin, cursorY, cardWidth, finalInfoBoxHeight, 4, 4, 'F');
      doc.setDrawColor(purple[0], purple[1], purple[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cursorY, cardWidth, finalInfoBoxHeight, 4, 4, 'D');

      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(
        i18n.language === 'en' ? 'Important information' : 'Información importante',
        margin + 8,
        cursorY + 8
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(infoLines, margin + 8, cursorY + 8 + infoTitleHeight + 3);

      cursorY += finalInfoBoxHeight + 6;

      // Footer note compacto
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(
        i18n.language === 'en'
          ? 'Valid only for the specified event and date. Non-transferable.'
          : 'Válida solo para el evento y fecha indicados. Personal e intransferible.',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      const fileName = `ticket-${ticket.ticket_code}-${ticket.event_title
        .substring(0, 20)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}.pdf`;
      doc.save(fileName);

      toast({
        title: i18n.language === 'en' ? 'PDF downloaded!' : '¡PDF descargado!',
        description:
          i18n.language === 'en' ? 'Your ticket has been downloaded' : 'Tu entrada ha sido descargada',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description:
          i18n.language === 'en' ? 'Could not generate PDF' : 'No se pudo generar el PDF',
        variant: 'destructive',
      });
    }
  };

  const renderTicketCard = (ticket: Ticket) => (
    <Card 
      key={ticket.id} 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => handleTicketClick(ticket)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{ticket.event_title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{ticket.ticket_type_title}</p>
          </div>
          {getStatusBadge(ticket.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(ticket.event_date)}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted-foreground">
                {i18n.language === 'en' ? 'Ticket Code' : 'Código de Entrada'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{ticket.ticket_code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleCopyTicketCode(ticket.ticket_code, e)}
                  title={i18n.language === 'en' ? 'Copy code' : 'Copiar código'}
                >
                  {copiedTicketCode === ticket.ticket_code ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-right ml-4">
              <span className="text-xs text-muted-foreground block">
                {i18n.language === 'en' ? 'Price' : 'Precio'}
              </span>
              <span className="font-semibold">{formatPrice(ticket.purchase_price, ticket.purchase_currency)}</span>
            </div>
          </div>
          
          {ticket.purchase_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Clock className="h-3 w-3" />
              <span>
                {i18n.language === 'en' ? 'Purchased:' : 'Comprado:'} {formatDate(ticket.purchase_date)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                const ticketHash = ticket.hash || ticket.ticket_hash || ticket.ticket_metadata?.hash || ticket.ticket_metadata?.ticket_hash;
                if (ticketHash) {
                  navigate(`/tickets/hash/${ticketHash}`);
                } else {
                  toast({
                    title: i18n.language === 'en' ? 'Error' : 'Error',
                    description: i18n.language === 'en' 
                      ? 'Ticket hash not available' 
                      : 'Hash del ticket no disponible',
                    variant: 'destructive',
                  });
                }
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? 'View' : 'Ver'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => generateTicketPDF(ticket, e)}
            >
              <Download className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? 'PDF' : 'PDF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver'}
        </Button>

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {i18n.language === 'en' ? 'My Tickets' : 'Mis Entradas'}
              </h1>
              <p className="text-muted-foreground">
                {i18n.language === 'en' 
                  ? 'View and manage your event tickets'
                  : 'Visualiza y gestiona tus entradas de eventos'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/mis-eventos')}>
              {i18n.language === 'en' ? 'My events' : 'Mis eventos'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'current' | 'past')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="current">
              <TicketIcon className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? 'Upcoming' : 'Próximos'} 
              {currentTickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">{currentTickets.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              <Calendar className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? 'Past' : 'Pasados'}
              {pastTickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pastTickets.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {currentTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {i18n.language === 'en' 
                      ? 'You don\'t have any upcoming tickets'
                      : 'No tienes entradas próximas'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentTickets.map(renderTicketCard)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {i18n.language === 'en' 
                      ? 'You don\'t have any past tickets'
                      : 'No tienes entradas pasadas'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastTickets.map(renderTicketCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTickets;
