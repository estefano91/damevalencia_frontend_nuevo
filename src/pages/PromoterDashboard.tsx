import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePromoter } from '@/hooks/usePromoter';
import { damePromotersAPI } from '@/integrations/dame-api/promoters';
import { buildPromoterLink } from '@/lib/promoterLink';
import type { PromoterEvent, PromoterSale } from '@/types/promoters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Megaphone,
  Euro,
  Ticket,
  Calendar,
  ChevronDown,
  TrendingUp,
  Loader2,
  Link2,
  Copy,
  Check,
} from 'lucide-react';

export default function PromoterDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPromoter, promoter, loading: promoterLoading, error: promoterError } = usePromoter();
  const [events, setEvents] = useState<PromoterEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [salesByEvent, setSalesByEvent] = useState<Record<number, PromoterSale[]>>({});
  const [loadingSales, setLoadingSales] = useState<Record<number, boolean>>({});
  const [linkCopied, setLinkCopied] = useState(false);
  const isEn = i18n.language === 'en';

  const promoterLink = promoter ? buildPromoterLink(promoter.code) : '';
  const copyPromoterLink = async () => {
    if (!promoterLink) return;
    await navigator.clipboard.writeText(promoterLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isPromoter) return;
    const fetchEvents = async () => {
      setEventsLoading(true);
      const res = await damePromotersAPI.getUserEvents({ event_status: 'future' });
      setEventsLoading(false);
      if (res.success && res.data?.results) {
        setEvents(res.data.results);
      }
    };
    fetchEvents();
  }, [isPromoter]);

  const loadSales = async (eventId: number) => {
    if (salesByEvent[eventId] !== undefined) return;
    setLoadingSales((prev) => ({ ...prev, [eventId]: true }));
    const res = await damePromotersAPI.getEventSales(eventId);
    setLoadingSales((prev) => ({ ...prev, [eventId]: false }));
    if (res.success && res.data?.results) {
      setSalesByEvent((prev) => ({ ...prev, [eventId]: res.data!.results }));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(isEn ? 'en-US' : 'es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!user) return null;
  if (promoterLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-12 w-full max-w-md mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isPromoter || promoterError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isEn ? 'Back' : 'Volver'}
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isEn ? 'Promoter panel' : 'Panel de promotor'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isEn
                  ? 'You are not registered as a promoter. If you think this is an error, please contact us.'
                  : 'No estás registrado como promotor. Si crees que es un error, contacta con nosotros.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isEn ? 'Back' : 'Volver'}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? 'Promoter panel' : 'Panel de promotor'}
          </h1>
          <p className="text-muted-foreground">
            {isEn
              ? 'Your events, sales and commissions'
              : 'Tus eventos, ventas y comisiones'}
          </p>
        </div>

        {/* Resumen promotor */}
        {promoter && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {isEn ? 'Your promoter account' : 'Tu cuenta de promotor'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {isEn ? 'Code' : 'Código'}
                </p>
                <p className="font-mono font-semibold">{promoter.code}</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {isEn ? 'Total sales' : 'Ventas totales'}
                </p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Ticket className="h-5 w-5" />
                  {promoter.total_sales}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {isEn ? 'Total commission' : 'Comisión total'}
                </p>
                <p className="text-2xl font-bold flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Euro className="h-5 w-5" />
                  {Number(promoter.total_commission).toFixed(2)}€
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enlace para compartir con clientes */}
        {promoter && (
          <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Link2 className="h-5 w-5" />
                {isEn ? 'Your promoter link' : 'Tu enlace de promotor'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isEn
                  ? 'Share this link with your audience. When they buy tickets through it, you earn your commission.'
                  : 'Comparte este enlace con tu público. Cuando compren entradas a través de él, tú ganas tu comisión.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  readOnly
                  value={promoterLink}
                  className="font-mono text-sm bg-background"
                />
                <Button onClick={copyPromoterLink} variant="secondary" className="shrink-0 gap-2">
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {isEn ? 'Copied!' : '¡Copiado!'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {isEn ? 'Copy link' : 'Copiar enlace'}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? 'The link can be used for any event. The client will have your code applied automatically at checkout.'
                  : 'El enlace sirve para cualquier evento. El cliente tendrá tu código aplicado automáticamente al comprar.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Eventos */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isEn ? 'Events where you are promoter' : 'Eventos donde eres promotor'}
          </h2>
          {eventsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {isEn
                  ? 'No events yet. When you are assigned as promoter for an event, it will appear here.'
                  : 'Aún no hay eventos. Cuando seas asignado como promotor de un evento, aparecerá aquí.'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <Collapsible
                  key={ev.event_id}
                  onOpenChange={(open) => open && loadSales(ev.event_id)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{ev.event_title}</CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(ev.event_date)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {ev.sales_count} {isEn ? 'sales' : 'ventas'}
                            </Badge>
                            <Badge variant="outline" className="text-green-600 dark:text-green-400">
                              {ev.total_commission}€
                            </Badge>
                            <Badge variant={ev.payment_status === 'TO_PAY' ? 'default' : 'secondary'}>
                              {ev.payment_status}
                            </Badge>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t">
                        {loadingSales[ev.event_id] ? (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {isEn ? 'Loading sales...' : 'Cargando ventas...'}
                            </span>
                          </div>
                        ) : (salesByEvent[ev.event_id]?.length ?? 0) > 0 ? (
                          <ul className="space-y-2 py-2">
                            {salesByEvent[ev.event_id].map((sale, idx) => (
                              <li
                                key={`${sale.ticket_id}-${idx}`}
                                className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                              >
                                <span className="font-medium">{sale.ticket_name}</span>
                                <span className="text-muted-foreground">
                                  {formatDate(sale.purchase_date)}
                                </span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  +{sale.commission}€
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="py-4 text-sm text-muted-foreground">
                            {isEn ? 'No sales for this event.' : 'No hay ventas en este evento.'}
                          </p>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
