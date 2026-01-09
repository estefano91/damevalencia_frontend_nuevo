import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, MapPin, Share2, Copy, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { Ticket, TicketStatus } from '@/types/tickets';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import dameLogoWhite from '@/assets/damelogo blanco.png';

const STATUS_COLORS: Record<TicketStatus, string> = {
  PURCHASED: 'bg-green-500 text-white',
  REDEEMED: 'bg-blue-500 text-white',
  RESERVED: 'bg-yellow-500 text-white',
  CANCELLED: 'bg-red-500 text-white',
};

const TicketHashLookup = () => {
  const { hash: hashFromParams } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const formatDate = (value?: string) => {
    if (!value) return '--';
    try {
      return new Date(value).toLocaleString(
        i18n.language === 'en' ? 'en-US' : 'es-ES',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    } catch {
      return value;
    }
  };

  const formatPrice = (amount?: string, currency: string = 'EUR') => {
    if (!amount) return i18n.language === 'en' ? 'Free' : 'Gratuito';
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed === 0) {
      return i18n.language === 'en' ? 'Free' : 'Gratuito';
    }
    return `${parsed.toFixed(2)}${currency === 'EUR' ? '€' : currency}`;
  };

  const effectiveHash = useMemo(() => {
    if (hashFromParams) return hashFromParams;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('hash') || '';
  }, [hashFromParams, location.search]);

  const hashIsValid = useMemo(() => {
    if (!effectiveHash) return false;
    return effectiveHash.length === 96;
  }, [effectiveHash]);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!effectiveHash) {
        setError(i18n.language === 'en' ? 'Ticket hash missing' : 'Falta el hash del ticket');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await dameTicketsAPI.getTicketByHash(effectiveHash);
        if (response.success && response.data?.ticket) {
          setTicket(response.data.ticket);
        } else {
          setError(
            response.error ||
              response.data?.error ||
              (i18n.language === 'en'
                ? 'Ticket not found or unavailable'
                : 'Ticket no encontrado o no disponible')
          );
        }
      } catch (err) {
        console.error('Error fetching ticket by hash:', err);
        setError(
          i18n.language === 'en'
            ? 'Unexpected error retrieving the ticket'
            : 'Error inesperado al consultar el ticket'
        );
      } finally {
        setLoading(false);
      }
    };

    if (hashIsValid) {
      fetchTicket();
    } else {
      setLoading(false);
      setError(
        i18n.language === 'en'
          ? 'Invalid ticket link'
          : 'Enlace de ticket no válido'
      );
    }
  }, [effectiveHash, hashIsValid, i18n.language]);

  useEffect(() => {
    if (!hashIsValid || !effectiveHash) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(effectiveHash, {
      width: 400,
      margin: 0,
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        if (!cancelled) {
          setQrDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveHash, hashIsValid]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: i18n.language === 'en' ? 'Link copied' : 'Enlace copiado',
        description:
          i18n.language === 'en'
            ? 'Share this link to show your ticket at the entrance.'
            : 'Comparte este enlace para mostrar tu ticket en la entrada.',
      });
    } catch (err) {
      console.error('Error copying ticket link:', err);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description:
          i18n.language === 'en'
            ? 'Unable to copy the link'
            : 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

  const generateTicketPDF = async () => {
    if (!ticket) return;

    setDownloading(true);
    try {
      const ticketHash =
        ticket.hash ||
        ticket.ticket_hash ||
        ticket.ticket_metadata?.hash ||
        ticket.ticket_metadata?.ticket_hash ||
        effectiveHash;

      const qrDataUrlForPDF = ticketHash
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

      // Header compacto (sin logo)
      const headerHeight = 12;
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
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

      // Hero card compacto con logo grande a la derecha
      const heroHeight = 55;
      doc.setFillColor(dark[0], dark[1], dark[2]);
      doc.roundedRect(margin, cursorY, cardWidth, heroHeight, 4, 4, 'F');
      
      // Logo grande a la derecha del hero card
      const logoHeight = heroHeight - 10;
      const ratio = logoData.width / logoData.height;
      const logoWidth = logoHeight * ratio;
      const logoX = margin + cardWidth - logoWidth - 10;
      const logoY = cursorY + 5;
      doc.addImage(logoData.dataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Título del evento a la izquierda (con espacio para el logo)
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleMaxWidth = cardWidth - logoWidth - 25;
      const titleLines = doc.splitTextToSize(ticket.event_title, titleMaxWidth);
      doc.text(titleLines, margin + 10, cursorY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const eventDate = formatDate(ticket.event_date);
      const dateY = cursorY + 12 + (titleLines.length * 5.5) + 4;
      doc.text(eventDate, margin + 10, dateY);

      cursorY += heroHeight + 10;

      // Location box compacto
      const eventPlace =
        ticket.ticket_metadata?.event_place ||
        (i18n.language === 'en' ? 'Location to be confirmed' : 'Ubicación por confirmar');
      
      let placeName = '';
      let placeAddress = '';
      if (eventPlace && eventPlace !== (i18n.language === 'en' ? 'Location to be confirmed' : 'Ubicación por confirmar')) {
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
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(
        i18n.language === 'en' ? 'Location' : 'Ubicación',
        margin + 8,
        cursorY + 8
      );
      
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

      if (qrDataUrlForPDF) {
        const qrSize = 35;
        doc.addImage(qrDataUrlForPDF, 'PNG', margin + cardWidth - qrSize - 8, cursorY + 7, qrSize, qrSize);
      }

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

      // Important info box compacto
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
    } finally {
      setDownloading(false);
    }
  };

  const statusBadge = (status?: TicketStatus) => {
    if (!status) return null;
    const className = STATUS_COLORS[status] || 'bg-gray-200 text-gray-900';
    const label: Record<TicketStatus, string> = {
      PURCHASED: i18n.language === 'en' ? 'Confirmed' : 'Confirmado',
      REDEEMED: i18n.language === 'en' ? 'Redeemed' : 'Canjeado',
      RESERVED: i18n.language === 'en' ? 'Reserved' : 'Reservado',
      CANCELLED: i18n.language === 'en' ? 'Cancelled' : 'Cancelado',
    };

    return (
      <Badge className={className}>
        {status === 'PURCHASED' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'REDEEMED' && <Share2 className="h-3 w-3 mr-1" />}
        {status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
        {status === 'RESERVED' && <Clock className="h-3 w-3 mr-1" />}
        {label[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-6 bg-white text-gray-900 border-2 border-gray-400 hover:bg-gray-100 hover:border-gray-500 shadow-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver'}
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {i18n.language === 'en' ? 'Ticket Viewer' : 'Visualizador de Ticket'}
            </h1>
            <p className="text-gray-600">
              {i18n.language === 'en'
                ? 'Access your ticket securely with the unique hash sent to your email.'
                : 'Accede a tu ticket de forma segura con el hash único enviado a tu correo.'}
            </p>
          </div>

          {loading && (
            <Card className="p-6 bg-white border-gray-200">
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-52 w-full" />
              </div>
            </Card>
          )}

          {!loading && error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{i18n.language === 'en' ? 'Error' : 'Error'}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && ticket && (
            <Card className="shadow-xl bg-white border-gray-200">
              <CardHeader className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900">
                      {ticket.event_title}
                    </CardTitle>
                    <p className="text-gray-600">{ticket.ticket_type_title}</p>
                  </div>
                  {statusBadge(ticket.status)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    {i18n.language === 'en' ? 'Copy link' : 'Copiar enlace'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={generateTicketPDF}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading 
                      ? (i18n.language === 'en' ? 'Generating...' : 'Generando...')
                      : (i18n.language === 'en' ? 'Download PDF' : 'Descargar PDF')
                    }
                  </Button>
                  {ticket.event_slug && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/eventos/${ticket.event_slug}`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {i18n.language === 'en' ? 'Event info' : 'Ver evento'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {i18n.language === 'en' ? 'Event date' : 'Fecha del evento'}
                      </span>
                      <span className="font-medium text-gray-900">{formatDate(ticket.event_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {i18n.language === 'en' ? 'Location' : 'Ubicación'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ticket.ticket_metadata?.event_place || '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      {i18n.language === 'en' ? 'Attendee' : 'Asistente'}
                    </span>
                    <p className="font-semibold text-gray-900">{ticket.full_name}</p>
                    <p className="text-sm text-gray-600">{ticket.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">
                      {i18n.language === 'en' ? 'Ticket code' : 'Código del ticket'}
                    </span>
                    <p className="font-mono text-lg font-semibold text-gray-900">{ticket.ticket_code}</p>
                    <p className="text-xs text-gray-500">
                      {i18n.language === 'en' ? 'Hash' : 'Hash'}:{' '}
                      <span className="font-mono break-all text-gray-700">{effectiveHash}</span>
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      {i18n.language === 'en' ? 'Price' : 'Precio'}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(ticket.purchase_price, ticket.purchase_currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">
                      {i18n.language === 'en' ? 'Purchase date' : 'Fecha de compra'}
                    </span>
                    <p className="font-medium text-gray-900">{formatDate(ticket.purchase_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">
                      {i18n.language === 'en' ? 'Status' : 'Estado'}
                    </span>
                    <p className="font-medium text-gray-900">
                      {ticket.status === 'PURCHASED'
                        ? i18n.language === 'en'
                          ? 'Confirmed'
                          : 'Confirmado'
                        : ticket.status === 'REDEEMED'
                        ? i18n.language === 'en'
                          ? 'Redeemed'
                          : 'Canjeado'
                        : ticket.status}
                    </p>
                  </div>
                </div>

                {qrDataUrl && (
                  <div className="pt-4 border-t border-gray-200 flex flex-col items-center gap-3">
                    <img
                      src={qrDataUrl}
                      alt="Ticket QR"
                      className="w-48 h-48"
                    />
                    <p className="text-xs text-gray-600 text-center max-w-sm">
                      {i18n.language === 'en'
                        ? 'Present this QR code at the entrance to validate your ticket.'
                        : 'Presenta este código QR en la entrada para validar tu ticket.'}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    className="flex-1 sm:flex-none"
                    variant="outline"
                    onClick={() => navigate('/mis-entradas')}
                  >
                    {i18n.language === 'en'
                      ? 'Manage my tickets'
                      : 'Gestionar mis entradas'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketHashLookup;

