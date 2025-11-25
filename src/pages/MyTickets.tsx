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
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
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
      // Cargar la imagen del logo como base64
      const loadImageAsBase64 = (src: string): Promise<{dataUrl: string, width: number, height: number}> => {
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
              const dataUrl = canvas.toDataURL('image/png');
              resolve({
                dataUrl,
                width: img.width,
                height: img.height
              });
            } catch (error) {
              console.error('❌ MyTickets: Error converting image to base64:', error);
              reject(error);
            }
          };
          img.onerror = (error) => {
            console.error('❌ MyTickets: Error loading image:', error);
            reject(new Error(`Failed to load image from ${src}`));
          };
          img.src = src;
        });
      };

      const logoData = await loadImageAsBase64(dameLogoWhite);
      const logoBase64 = logoData.dataUrl;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const boxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Colores DAME mejorados - paleta elegante
      const purpleColor = [128, 0, 128]; // Morado DAME principal
      const darkGrayColor = [30, 30, 30]; // Negro suave para texto
      const lightGrayColor = [250, 250, 250]; // Gris muy claro para fondos
      const accentColor = [160, 120, 220]; // Morado claro elegante
      const borderColor = [230, 230, 230]; // Gris suave para bordes

      // Header elegante con fondo negro
      const headerHeight = 60;
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Agregar el logo DAME - manteniendo proporción original
      // Convertir píxeles a mm (1px ≈ 0.264583mm a 96dpi)
      const pxToMm = 0.264583;
      const logoWidthMm = logoData.width * pxToMm;
      const logoHeightMm = logoData.height * pxToMm;
      
      // Ajustar si es muy grande, pero mantener proporción
      const maxLogoWidth = pageWidth - (margin * 2);
      let finalLogoWidth = logoWidthMm;
      let finalLogoHeight = logoHeightMm;
      
      if (logoWidthMm > maxLogoWidth) {
        const scale = maxLogoWidth / logoWidthMm;
        finalLogoWidth = logoWidthMm * scale;
        finalLogoHeight = logoHeightMm * scale;
      }
      
      const logoX = (pageWidth - finalLogoWidth) / 2;
      const logoY = (headerHeight - finalLogoHeight) / 2;
      doc.addImage(logoBase64, 'PNG', logoX, logoY, finalLogoWidth, finalLogoHeight);
      
      // Subtítulo elegante debajo del logo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const subtitleY = logoY + finalLogoHeight + 6;
      doc.text(i18n.language === 'en' ? 'EVENT TICKET' : 'ENTRADA DE EVENTO', pageWidth / 2, subtitleY, { align: 'center' });

      yPosition = headerHeight + 15;

      // Caja principal del ticket - diseño elegante y profesional
      // Calcular altura dinámica basada en el contenido
      const boxStartY = yPosition;
      const boxPadding = 20;
      const boxContentHeight = 140; // Altura aumentada para que quepa todo
      
      // Sombra suave debajo
      doc.setFillColor(220, 220, 220);
      doc.rect(margin + 1, boxStartY + 1, boxWidth, boxContentHeight, 'F');
      
      // Caja principal con borde fino y elegante
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.3);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, boxStartY, boxWidth, boxContentHeight, 'FD');
      
      yPosition = boxStartY + boxPadding;

      // Título del evento - tamaño ajustado para que quepa
      doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
      doc.setFontSize(18); // Reducido de 22 a 18
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(ticket.event_title, boxWidth - 30);
      const titleStartY = yPosition;
      doc.text(titleLines, pageWidth / 2, titleStartY, { align: 'center' });
      yPosition += titleLines.length * 7 + 5; // Espaciado reducido

      // Tipo de ticket - estilo elegante
      doc.setFontSize(9); // Reducido de 10 a 9
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(ticket.ticket_type_title.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10; // Reducido de 15 a 10

      // Línea separadora elegante
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.2);
      doc.line(margin + 15, yPosition, pageWidth - margin - 15, yPosition);
      
      // Línea decorativa morada fina
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin + 15, yPosition + 0.5, pageWidth - margin - 15, yPosition + 0.5);
      
      yPosition += 8; // Reducido de 12 a 8

      // Código del ticket - diseño premium más compacto
      const codeBoxY = yPosition;
      const codeBoxHeight = 12; // Reducido de 14 a 12
      
      // Fondo elegante con borde
      doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.2);
      doc.rect(margin + 15, codeBoxY - 3, boxWidth - 30, codeBoxHeight, 'FD');
      
      // Etiqueta del código
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7); // Reducido de 8 a 7
      doc.setTextColor(140, 140, 140);
      const codeLabel = i18n.language === 'en' ? 'TICKET CODE' : 'CÓDIGO DE ENTRADA';
      doc.text(codeLabel, margin + 18, codeBoxY + 1);
      
      // Código destacado
      doc.setFont('courier', 'bold');
      doc.setFontSize(16); // Reducido de 18 a 16
      doc.setTextColor(purpleColor[0], purpleColor[1], purpleColor[2]);
      doc.text(ticket.ticket_code, margin + 18, codeBoxY + 6);
      
      yPosition += 16; // Reducido de 20 a 16

      // Información del asistente - diseño compacto en dos columnas
      const infoStartXLeft = margin + 15;
      const infoStartXRight = pageWidth / 2 + 5; // Columna derecha
      const infoSpacing = 5; // Reducido de 7 a 5
      const labelColor = [130, 130, 130];
      const lineHeight = 9; // Reducido de 13 a 9
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7); // Reducido de 8 a 7
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      
      // Columna izquierda
      // Nombre
      const nameLabel = i18n.language === 'en' ? 'NAME' : 'NOMBRE';
      doc.setFont('helvetica', 'bold');
      doc.text(nameLabel, infoStartXLeft, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9); // Reducido de 10 a 9
      doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
      const nameLines = doc.splitTextToSize(ticket.full_name, (boxWidth / 2) - 20);
      doc.text(nameLines, infoStartXLeft, yPosition + infoSpacing);
      let nameHeight = nameLines.length * 4;
      
      // Email
      const emailY = yPosition + nameHeight + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      doc.text('EMAIL', infoStartXLeft, emailY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8); // Reducido para emails largos
      doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
      const emailLines = doc.splitTextToSize(ticket.email, (boxWidth / 2) - 20);
      doc.text(emailLines, infoStartXLeft, emailY + infoSpacing);
      const emailHeight = emailLines.length * 4;
      
      // Columna derecha
      // Fecha del evento
      const eventDateLabel = i18n.language === 'en' ? 'EVENT DATE' : 'FECHA DEL EVENTO';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      doc.text(eventDateLabel, infoStartXRight, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
      const dateText = formatDate(ticket.event_date);
      const dateLines = doc.splitTextToSize(dateText, (boxWidth / 2) - 20);
      doc.text(dateLines, infoStartXRight, yPosition + infoSpacing);
      let dateHeight = dateLines.length * 4;
      
      // Precio - destacado
      const priceY = yPosition + dateHeight + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      const priceLabel = i18n.language === 'en' ? 'PRICE' : 'PRECIO';
      doc.text(priceLabel, infoStartXRight, priceY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11); // Reducido de 12 a 11
      doc.setTextColor(purpleColor[0], purpleColor[1], purpleColor[2]);
      doc.text(formatPrice(ticket.purchase_price, ticket.purchase_currency), infoStartXRight, priceY + infoSpacing);
      
      // Estado - en la misma línea que el precio o debajo si no cabe
      const maxY = Math.max(emailY + emailHeight, priceY + 10);
      const statusY = maxY + 8;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      const statusLabel = i18n.language === 'en' ? 'STATUS' : 'ESTADO';
      doc.text(statusLabel, infoStartXLeft, statusY);
      
      let statusText: string = ticket.status;
      let statusColor = [100, 100, 100];
      if (ticket.status === 'PURCHASED') {
        statusText = i18n.language === 'en' ? 'CONFIRMED' : 'CONFIRMADO';
        statusColor = [34, 197, 94]; // Verde elegante
      } else if (ticket.status === 'CANCELLED') {
        statusText = i18n.language === 'en' ? 'CANCELLED' : 'CANCELADO';
        statusColor = [239, 68, 68]; // Rojo
      } else if (ticket.status === 'RESERVED') {
        statusText = i18n.language === 'en' ? 'RESERVED' : 'RESERVADO';
        statusColor = [251, 191, 36]; // Amarillo
      } else if (ticket.status === 'REDEEMED') {
        statusText = i18n.language === 'en' ? 'REDEEMED' : 'CANJEADO';
        statusColor = [59, 130, 246]; // Azul
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Reducido de 10 a 9
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(statusText, infoStartXLeft, statusY + infoSpacing);

      // Footer elegante y profesional
      yPosition = pageHeight - 22;
      
      // Línea decorativa superior del footer - doble línea elegante
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Línea morada decorativa
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition + 0.3, pageWidth - margin, yPosition + 0.3);
      
      yPosition += 10;
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.setFont('helvetica', 'normal');
      doc.setFont('helvetica', 'normal');
      const footerText = i18n.language === 'en' 
        ? 'Present this ticket at the event entrance. Valid only for the specified event and date.'
        : 'Presenta esta entrada en la entrada del evento. Válida solo para el evento y fecha especificados.';
      const footerLines = doc.splitTextToSize(footerText, pageWidth - (margin * 2));
      doc.text(footerLines, pageWidth / 2, yPosition, { align: 'center' });

      // Generar nombre del archivo
      const fileName = `ticket-${ticket.ticket_code}-${ticket.event_title.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Guardar el PDF
      doc.save(fileName);
      
      toast({
        title: i18n.language === 'en' ? 'PDF downloaded!' : '¡PDF descargado!',
        description: i18n.language === 'en' 
          ? 'Your ticket has been downloaded'
          : 'Tu entrada ha sido descargada',
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

          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => generateTicketPDF(ticket, e)}
            >
              <Download className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? 'Download PDF' : 'Descargar PDF'}
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
          <h1 className="text-3xl font-bold mb-2">
            {i18n.language === 'en' ? 'My Tickets' : 'Mis Entradas'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'en' 
              ? 'View and manage your event tickets'
              : 'Visualiza y gestiona tus entradas de eventos'}
          </p>
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
