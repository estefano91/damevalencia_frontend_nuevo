import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '@/types/tickets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Loader2, Ticket as TicketIcon, Sparkles, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import dameLogoWhite from '@/assets/damelogo blanco.png';

interface PurchaseSuccessModalProps {
  open: boolean;
  tickets: Ticket[];
  onClose: () => void;
}

export const PurchaseSuccessModal = ({
  open,
  tickets,
  onClose,
}: PurchaseSuccessModalProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: string, currency: string): string => {
    const num = parseFloat(amount);
    return `${num.toFixed(2)} ${currency}`;
  };

  const generateTicketPDF = async (ticket: Ticket) => {
    setDownloading(true);
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
      const margin = 18;
      const purple = [98, 47, 141];
      const dark = [18, 18, 18];
      const gray = [80, 80, 80];

      // Header
      const headerHeight = 20;
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      const logoHeight = headerHeight - 6;
      const ratio = logoData.width / logoData.height;
      const logoWidth = logoHeight * ratio;
      doc.addImage(logoData.dataUrl, 'PNG', margin, (headerHeight - logoHeight) / 2, logoWidth, logoHeight);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(
        i18n.language === 'en' ? 'Digital Access Ticket' : 'Entrada digital de acceso',
        pageWidth - margin,
        headerHeight / 2 + 3,
        { align: 'right' }
      );

      let cursorY = headerHeight + 20;
      const cardWidth = pageWidth - margin * 2;

      // Hero card
      const heroHeight = 70;
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.roundedRect(margin, cursorY, cardWidth, heroHeight, 5, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const titleLines = doc.splitTextToSize(ticket.event_title, cardWidth - 80);
      doc.text(titleLines, margin + 15, cursorY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const eventDate = formatDate(ticket.event_date);
      const dateY = cursorY + 18 + (titleLines.length * 7) + 5;
      doc.text(eventDate, margin + 15, dateY);

      // Decorative panel
      const accentPanelWidth = 58;
      const accentPanelHeight = heroHeight - 20;
      const accentPanelX = margin + cardWidth - accentPanelWidth - 12;
      const accentPanelY = cursorY + 10;
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.roundedRect(accentPanelX, accentPanelY, accentPanelWidth, accentPanelHeight, 4, 4, 'F');
      const accentPadding = 4;
      const accentLogoWidth = accentPanelWidth - accentPadding * 2;
      const accentLogoHeight = accentPanelHeight - accentPadding * 2;
      const accentLogoRatio = logoData.width / logoData.height;
      let drawLogoWidth = accentLogoWidth;
      let drawLogoHeight = accentLogoWidth / accentLogoRatio;
      if (drawLogoHeight > accentLogoHeight) {
        drawLogoHeight = accentLogoHeight;
        drawLogoWidth = accentLogoHeight * accentLogoRatio;
      }
      const accentLogoX = accentPanelX + (accentPanelWidth - drawLogoWidth) / 2;
      const accentLogoY = accentPanelY + (accentPanelHeight - drawLogoHeight) / 2;
      doc.addImage(logoData.dataUrl, 'PNG', accentLogoX, accentLogoY, drawLogoWidth, drawLogoHeight);

      cursorY += heroHeight + 18;

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

      // Calcular altura dinámica del recuadro de ubicación
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const placeNameLines = placeName ? doc.splitTextToSize(placeName, cardWidth - 30) : [];
      const placeAddressLines = placeAddress && placeAddress !== placeName ? doc.splitTextToSize(placeAddress, cardWidth - 30) : [];
      const titleHeight = 12;
      const nameHeight = placeNameLines.length * 6;
      const addressHeight = placeAddressLines.length * 5;
      const padding = 20;
      const locationBoxHeight = titleHeight + nameHeight + addressHeight + padding;
      
      doc.setFillColor(240, 240, 255); // Fondo lila claro
      doc.roundedRect(margin, cursorY, cardWidth, locationBoxHeight, 5, 5, 'F');
      
      // Borde morado más visible
      doc.setDrawColor(purple[0], purple[1], purple[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, cursorY, cardWidth, locationBoxHeight, 5, 5, 'D');
      
      // Título "Ubicación"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(
        i18n.language === 'en' ? 'Location' : 'Ubicación',
        margin + 12,
        cursorY + 12
      );
      
      // Nombre del lugar (si existe)
      if (placeName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(dark[0], dark[1], dark[2]);
        const nameY = cursorY + 12 + titleHeight + 3;
        doc.text(placeNameLines, margin + 12, nameY);
        
        // Dirección (si existe y es diferente del nombre)
        if (placeAddress && placeAddress !== placeName) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(gray[0], gray[1], gray[2]);
          const addressY = nameY + nameHeight + 3;
          doc.text(placeAddressLines, margin + 12, addressY);
        }
      }

      cursorY += locationBoxHeight + 15;

      // Ticket info block
      const infoHeight = 75;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, cardWidth, infoHeight, 5, 5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(i18n.language === 'en' ? 'Ticket' : 'Entrada', margin + 15, cursorY + 18);
      doc.setFontSize(10);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(ticket.ticket_type_title, margin + 15, cursorY + 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(
        i18n.language === 'en' ? `Attendee: ${ticket.full_name}` : `Asistente: ${ticket.full_name}`,
        margin + 15,
        cursorY + 43
      );
      doc.text(i18n.language === 'en' ? `Email: ${ticket.email}` : `Correo: ${ticket.email}`, margin + 15, cursorY + 52);

      if (qrDataUrl) {
        const qrSize = 40;
        doc.addImage(qrDataUrl, 'PNG', margin + cardWidth - qrSize - 15, cursorY + 12, qrSize, qrSize);
      }

      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(ticket.ticket_code, margin + 15, cursorY + infoHeight - 10);

      cursorY += infoHeight + 15;

      // Ticket metadata row
      const detailHeight = 28;
      doc.setFillColor(248, 248, 250);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, cardWidth, detailHeight, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      const detailY = cursorY + 9;
      const detailValuesY = cursorY + 19;
      doc.text('Ticket ID', margin + 10, detailY);
      doc.text(
        i18n.language === 'en' ? 'Purchase Date' : 'Fecha de compra',
        margin + cardWidth / 3 + 5,
        detailY
      );
      doc.text(i18n.language === 'en' ? 'Price' : 'Precio', margin + (cardWidth / 3) * 2 + 5, detailY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(`#${ticket.id}`, margin + 10, detailValuesY);
      doc.text(formatDate(ticket.purchase_date), margin + cardWidth / 3 + 5, detailValuesY);
      doc.text(formatPrice(ticket.purchase_price, ticket.purchase_currency), margin + (cardWidth / 3) * 2 + 5, detailValuesY);

      cursorY += detailHeight + 15;

      // Verificar si hay espacio suficiente en la página
      const pageHeight = doc.internal.pageSize.getHeight();
      const remainingSpace = pageHeight - cursorY - margin;
      const minSpaceNeeded = 50; // Espacio mínimo necesario para el recuadro de información

      // Important info box - Calcular altura dinámicamente
      const infoText =
        i18n.language === 'en'
          ? 'Present this ticket and QR code at the venue entrance. Arrive early to guarantee access and follow the team instructions at all times.'
          : 'Presenta esta entrada y el código QR en la entrada del evento. Llega con tiempo para garantizar el acceso y sigue las indicaciones del equipo en todo momento.';
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const infoLines = doc.splitTextToSize(infoText, cardWidth - 24);
      const infoTitleHeight = 12;
      const infoTextHeight = infoLines.length * 5;
      const infoPadding = 20;
      const infoBoxHeight = infoTitleHeight + infoTextHeight + infoPadding;
      
      // Si no hay espacio suficiente, agregar nueva página
      if (remainingSpace < infoBoxHeight + 20) {
        doc.addPage();
        cursorY = margin;
      }

      // Fondo con color suave
      doc.setFillColor(250, 248, 255); // Fondo lila muy claro
      doc.roundedRect(margin, cursorY, cardWidth, infoBoxHeight, 4, 4, 'F');
      
      // Borde morado
      doc.setDrawColor(purple[0], purple[1], purple[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cursorY, cardWidth, infoBoxHeight, 4, 4, 'D');

      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        i18n.language === 'en' ? 'Important information' : 'Información importante',
        margin + 12,
        cursorY + 15
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(infoLines, margin + 12, cursorY + 28);

      cursorY += infoBoxHeight + 12;

      // Footer note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(
        i18n.language === 'en'
          ? 'Valid only for the specified event and date. Non-transferable.'
          : 'Válida solo para el evento y fecha indicados. Personal e intransferible.',
        pageWidth / 2,
        cursorY,
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
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    for (const ticket of tickets) {
      await generateTicketPDF(ticket);
      // Pequeña pausa entre descargas
      if (tickets.indexOf(ticket) < tickets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden touch-pan-y p-0" style={{ touchAction: 'pan-y' }}>
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white rounded-t-lg">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icono de éxito animado */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative bg-white/20 rounded-full p-6 backdrop-blur-sm">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            
            {/* Título */}
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                {i18n.language === 'en' ? 'Purchase Successful!' : '¡Compra Exitosa!'}
              </DialogTitle>
              <DialogDescription className="text-purple-100 text-lg">
                {i18n.language === 'en'
                  ? `Congratulations! You've successfully purchased ${tickets.length} ticket${tickets.length > 1 ? 's' : ''}`
                  : `¡Felicidades! Has comprado exitosamente ${tickets.length} entrada${tickets.length > 1 ? 's' : ''}`}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-6">
          {/* Información del evento (si todos los tickets son del mismo evento) */}
          {tickets.length > 0 && tickets[0]?.event_title && (
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <TicketIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{tickets[0].event_title}</h3>
                    {tickets[0].event_date && (
                      <p className="text-sm text-muted-foreground">
                        {formatEventDate(tickets[0].event_date)}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {tickets.length} {i18n.language === 'en' ? 'ticket(s)' : 'entrada(s)'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de tickets */}
          {tickets.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {i18n.language === 'en' ? 'Your Tickets' : 'Tus Entradas'}
              </h4>
              <div className="grid gap-3 max-h-48 overflow-y-auto">
                {tickets.map((ticket, index) => (
                  <Card key={ticket.id} className="border hover:border-purple-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <TicketIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {ticket.ticket_type_title || `${i18n.language === 'en' ? 'Ticket' : 'Entrada'} ${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {ticket.full_name} • {ticket.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {ticket.ticket_code}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {i18n.language === 'en'
                ? '✨ Your tickets are ready! Download them as PDF or view them in your tickets section. Make sure to save them before the event.'
                : '✨ ¡Tus entradas están listas! Descárgalas en PDF o visualízalas en tu sección de entradas. Asegúrate de guardarlas antes del evento.'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-2">
            {tickets.length === 1 ? (
              <Button
                onClick={() => generateTicketPDF(tickets[0])}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {i18n.language === 'en' ? 'Generating PDF...' : 'Generando PDF...'}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    {i18n.language === 'en' ? 'Download Ticket PDF' : 'Descargar Entrada PDF'}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDownloadAll}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {i18n.language === 'en' ? 'Generating PDFs...' : 'Generando PDFs...'}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    {i18n.language === 'en' 
                      ? `Download All Tickets (${tickets.length})` 
                      : `Descargar Todas las Entradas (${tickets.length})`}
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => {
                onClose();
                navigate('/mis-entradas');
              }}
              variant="outline"
              className="w-full border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              size="lg"
            >
              <TicketIcon className="mr-2 h-5 w-5" />
              {i18n.language === 'en' ? 'View My Tickets' : 'Ver Mis Entradas'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              {i18n.language === 'en' ? 'Continue Browsing' : 'Seguir Navegando'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

