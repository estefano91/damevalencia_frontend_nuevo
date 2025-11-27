import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, MapPin, Share2, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { Ticket, TicketStatus } from '@/types/tickets';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver'}
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              {i18n.language === 'en' ? 'Ticket Viewer' : 'Visualizador de Ticket'}
            </h1>
            <p className="text-muted-foreground">
              {i18n.language === 'en'
                ? 'Access your ticket securely with the unique hash sent to your email.'
                : 'Accede a tu ticket de forma segura con el hash único enviado a tu correo.'}
            </p>
          </div>

          {loading && (
            <Card className="p-6">
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
            <Card className="shadow-xl">
              <CardHeader className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {ticket.event_title}
                    </CardTitle>
                    <p className="text-muted-foreground">{ticket.ticket_type_title}</p>
                  </div>
                  {statusBadge(ticket.status)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    {i18n.language === 'en' ? 'Copy link' : 'Copiar enlace'}
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
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        {i18n.language === 'en' ? 'Event date' : 'Fecha del evento'}
                      </span>
                      <span className="font-medium">{formatDate(ticket.event_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        {i18n.language === 'en' ? 'Location' : 'Ubicación'}
                      </span>
                      <span className="font-medium">
                        {ticket.ticket_metadata?.event_place || '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {i18n.language === 'en' ? 'Attendee' : 'Asistente'}
                    </span>
                    <p className="font-semibold">{ticket.full_name}</p>
                    <p className="text-sm text-muted-foreground">{ticket.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {i18n.language === 'en' ? 'Ticket code' : 'Código del ticket'}
                    </span>
                    <p className="font-mono text-lg font-semibold">{ticket.ticket_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {i18n.language === 'en' ? 'Hash' : 'Hash'}:{' '}
                      <span className="font-mono break-all">{effectiveHash}</span>
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {i18n.language === 'en' ? 'Price' : 'Precio'}
                    </span>
                    <p className="font-semibold">
                      {formatPrice(ticket.purchase_price, ticket.purchase_currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {i18n.language === 'en' ? 'Purchase date' : 'Fecha de compra'}
                    </span>
                    <p className="font-medium">{formatDate(ticket.purchase_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {i18n.language === 'en' ? 'Status' : 'Estado'}
                    </span>
                    <p className="font-medium">
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
                  <div className="pt-4 border-t flex flex-col items-center gap-3">
                    <img
                      src={qrDataUrl}
                      alt="Ticket QR"
                      className="w-48 h-48"
                    />
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
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

