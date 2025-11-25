import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { Ticket } from '@/types/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, ArrowLeft, ArrowRightCircle } from 'lucide-react';

interface UpcomingEvent {
  key: string;
  eventTitle: string;
  eventDate: string;
  eventPlace?: string;
  eventSlug?: string;
  ticketCount: number;
  tickets: Ticket[];
}

const MyUpcomingEvents = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await dameTicketsAPI.getMyCurrentTickets(1);
        if (response.success && response.data?.results) {
          setTickets(response.data.results);
        } else {
          throw new Error(response.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Error loading upcoming events:', err);
        const message =
          i18n.language === 'en'
            ? 'Could not load your upcoming events'
            : 'No se pudieron cargar tus próximos eventos';
        setError(message);
        toast({
          title: i18n.language === 'en' ? 'Error' : 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, i18n.language, navigate, toast]);

  const groupedEvents = useMemo<UpcomingEvent[]>(() => {
    const map = new Map<string, UpcomingEvent>();

    tickets.forEach((ticket) => {
      const key = ticket.event_slug || ticket.event_id?.toString() || ticket.event_title;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          key,
          eventTitle: ticket.event_title,
          eventDate: ticket.event_date,
          eventPlace: ticket.ticket_metadata?.event_place,
          eventSlug: ticket.event_slug,
          ticketCount: 1,
          tickets: [ticket],
        });
      } else {
        const current = map.get(key)!;
        current.ticketCount += 1;
        current.tickets.push(ticket);
        if (new Date(ticket.event_date) < new Date(current.eventDate)) {
          current.eventDate = ticket.event_date;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }, [tickets]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(
        i18n.language === 'en' ? 'en-US' : 'es-ES',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {i18n.language === 'en' ? 'Back' : 'Volver'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/mis-entradas')}>
              {i18n.language === 'en' ? 'View tickets' : 'Ver entradas'}
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">
            {i18n.language === 'en' ? 'Events you will attend' : 'Eventos donde asistirás'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'en'
              ? 'Here you can review the events where you already have a confirmed ticket.'
              : 'Aquí puedes revisar los eventos en los que ya tienes una entrada confirmada.'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {groupedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {i18n.language === 'en'
                  ? 'You are not registered for any upcoming events yet.'
                  : 'Aún no estás registrado en próximos eventos.'}
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                {i18n.language === 'en' ? 'Discover events' : 'Descubrir eventos'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          groupedEvents.map((eventItem) => (
            <Card key={eventItem.key} className="border border-purple-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{eventItem.eventTitle}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(eventItem.eventDate)}
                    </span>
                    {eventItem.eventPlace && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {eventItem.eventPlace}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {i18n.language === 'en'
                    ? `${eventItem.ticketCount} ticket(s)`
                    : `${eventItem.ticketCount} entrada(s)`}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {i18n.language === 'en'
                    ? 'Remember to arrive early and have your QR ready.'
                    : 'Recuerda llegar con tiempo y tener tu QR listo.'}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/mis-entradas')}
                    className="flex items-center gap-2"
                  >
                    {i18n.language === 'en' ? 'View tickets' : 'Ver entradas'}
                  </Button>
                  {eventItem.eventSlug && (
                    <Button
                      onClick={() => navigate(`/eventos/${eventItem.eventSlug}`)}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                      {i18n.language === 'en' ? 'Event detail' : 'Ver evento'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyUpcomingEvents;

