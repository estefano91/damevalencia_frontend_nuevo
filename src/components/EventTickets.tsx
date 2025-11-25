import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { TicketTypeDetail } from '@/types/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Ticket, ShoppingCart, CreditCard, Calendar, AlertCircle, Users } from 'lucide-react';
import { TicketPurchaseModal } from '@/components/TicketPurchaseModal';
import { TicketReserveModal } from '@/components/TicketReserveModal';
import { TicketAtDoorModal } from '@/components/TicketAtDoorModal';

interface EventTicketsProps {
  eventId: number;
  onTicketsLoaded?: (hasTickets: boolean, minPrice?: string | null) => void; // Callback para notificar si hay tickets y precio mínimo
  onOpenAtDoorModal?: (openAtDoor: () => void) => void; // Callback para exponer función de abrir modal
  onUserTicketChange?: (hasTicket: boolean) => void;
}

export const EventTickets = ({
  eventId,
  onTicketsLoaded,
  onOpenAtDoorModal,
  onUserTicketChange,
}: EventTicketsProps) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticketTypes, setTicketTypes] = useState<TicketTypeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [atDoorModalOpen, setAtDoorModalOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeDetail | null>(null);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar endpoint público que devuelve solo tickets visibles
        const response = await dameTicketsAPI.getTicketTypes(eventId);

        if (response.success && response.data) {
          const tickets = response.data.results || [];
          setTicketTypes(tickets);
          
          // Notificar al componente padre si hay tickets visibles y calcular precio mínimo
          if (onTicketsLoaded) {
            const hasVisibleTickets = tickets.length > 0;
            
            // Calcular precio mínimo de los tickets disponibles
            let minPrice: string | null = null;
            if (hasVisibleTickets) {
              const prices = tickets
                .filter(t => parseFloat(t.current_price || t.base_price || '0') > 0)
                .map(t => parseFloat(t.current_price || t.base_price || '0'));
              
              if (prices.length > 0) {
                const minPriceNum = Math.min(...prices);
                minPrice = `${minPriceNum.toFixed(2)}€`;
              } else {
                // Si todos son gratis, mostrar "GRATIS"
                minPrice = i18n.language === 'en' ? 'FREE' : 'GRATIS';
              }
            }
            
            onTicketsLoaded(hasVisibleTickets, minPrice);
          }

          // Debug: Mostrar todos los tickets para ver qué tenemos
          console.log('🎟️ EventTickets: Todos los tickets encontrados:', tickets.map(t => ({
            id: t.id,
            ticket_type: t.ticket_type,
            title: t.title_es,
            is_on_sale: t.is_on_sale,
            available_stock: t.available_stock,
            is_visible: t.is_visible,
            sale_start_date: t.sale_start_date,
            sale_end_date: t.sale_end_date
          })));

          // Buscar ticket EN_PUERTA - hacer la búsqueda más permisiva
          // Para tickets EN_PUERTA, no necesariamente requieren is_on_sale=true
          const atDoorTicket = tickets.find((t) => {
            if (t.ticket_type !== 'EN_PUERTA') return false;
            
            // Mostrar información detallada del ticket EN_PUERTA
            console.log('🎟️ EventTickets: Evaluando ticket EN_PUERTA:', {
              id: t.id,
              ticket_type: t.ticket_type,
              is_visible: t.is_visible,
              is_on_sale: t.is_on_sale,
              available_stock: t.available_stock,
              sale_start_date: t.sale_start_date,
              sale_end_date: t.sale_end_date
            });
            
            // Para EN_PUERTA: si viene del endpoint público, ya está filtrado por visibles
            // Si is_visible es undefined, asumimos que es visible (el endpoint público ya lo filtró)
            // Si es false explícitamente, entonces no es visible
            const isVisible = t.is_visible !== false; // true o undefined = visible
            
            if (!isVisible) {
              console.log('❌ EventTickets: Ticket EN_PUERTA no es visible (is_visible = false)');
              return false;
            }
            
            console.log('✅ EventTickets: Ticket EN_PUERTA válido encontrado');
            return true;
          });

          console.log('🎟️ EventTickets: Resultado búsqueda EN_PUERTA', {
            totalTickets: tickets.length,
            atDoorTicket: atDoorTicket ? {
              id: atDoorTicket.id,
              title: atDoorTicket.title_es,
              ticket_type: atDoorTicket.ticket_type
            } : null,
            hasCallback: !!onOpenAtDoorModal
          });

          if (atDoorTicket && onOpenAtDoorModal) {
            console.log('✅ EventTickets: Ticket EN_PUERTA encontrado, exponiendo función');
            const openModal = () => {
              console.log('🚀 EventTickets: Abriendo modal EN_PUERTA', atDoorTicket.id);
              setSelectedTicketType(atDoorTicket);
              setAtDoorModalOpen(true);
            };
            onOpenAtDoorModal(openModal);
          } else {
            if (onOpenAtDoorModal) {
              console.log('⚠️ EventTickets: No se encontró ticket EN_PUERTA disponible');
            }
          }
        } else {
          setError(response.error || 'Error al cargar tipos de entrada');
          if (onTicketsLoaded) {
            onTicketsLoaded(false, null);
          }
        }
      } catch (err) {
        setError('Error al cargar tipos de entrada');
        console.error('Error fetching ticket types:', err);
        if (onTicketsLoaded) {
          onTicketsLoaded(false, null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchTicketTypes();
    }
  }, [eventId, onTicketsLoaded, onOpenAtDoorModal]);

  const getLocalizedText = (textEs?: string, textEn?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return textEs || textEn || '';
  };

  const formatPrice = (amount: string, currency: string = 'EUR'): string => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) {
      return i18n.language === 'en' ? 'Free' : 'Gratuito';
    }
    return `${num.toFixed(2)}€`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
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

  const getTicketTypeBadgeColor = (ticketType: string): string => {
    switch (ticketType) {
      case 'ONLINE':
        return 'bg-blue-500';
      case 'RESERVA':
        return 'bg-yellow-500';
      case 'EN_PUERTA':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTicketTypeLabel = (ticketType: string): string => {
    if (i18n.language === 'en') {
      switch (ticketType) {
        case 'ONLINE':
          return 'Online';
        case 'RESERVA':
          return 'Reservation';
        case 'EN_PUERTA':
          return 'At Door';
        default:
          return ticketType;
      }
    } else {
      switch (ticketType) {
        case 'ONLINE':
          return 'Online';
        case 'RESERVA':
          return 'Reserva';
        case 'EN_PUERTA':
          return 'En Puerta';
        default:
          return ticketType;
      }
    }
  };

  const handlePurchase = (ticketType: TicketTypeDetail) => {
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description: i18n.language === 'en' 
          ? 'Please log in to purchase tickets' 
          : 'Por favor inicia sesión para comprar entradas',
        variant: 'destructive',
      });
      return;
    }

    setSelectedTicketType(ticketType);
    setPurchaseModalOpen(true);
  };

  const handleReserve = (ticketType: TicketTypeDetail) => {
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description: i18n.language === 'en' 
          ? 'Please log in to reserve tickets' 
          : 'Por favor inicia sesión para reservar entradas',
        variant: 'destructive',
      });
      return;
    }

    setSelectedTicketType(ticketType);
    setReserveModalOpen(true);
  };

  const handleAtDoor = (ticketType: TicketTypeDetail) => {
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description: i18n.language === 'en' 
          ? 'Please log in to register for this event' 
          : 'Por favor inicia sesión para registrarte en este evento',
        variant: 'destructive',
      });
      return;
    }

    setSelectedTicketType(ticketType);
    setAtDoorModalOpen(true);
  };

  const notifyUserTicket = () => {
    if (onUserTicketChange) {
      onUserTicketChange(true);
    }
  };

  const handlePurchaseSuccess = async () => {
    notifyUserTicket();
    // Recargar los tickets para actualizar el stock
    setPurchaseModalOpen(false);
    setSelectedTicketType(null);
    
    // Recargar tickets
    try {
      const response = await dameTicketsAPI.getTicketTypes(eventId);
      if (response.success && response.data) {
        const allTickets = response.data.results || [];
        const visibleTickets = allTickets.filter(t => t.is_visible === true);
        setTicketTypes(visibleTickets);
        
        if (onTicketsLoaded) {
          onTicketsLoaded(visibleTickets.length > 0);
        }
      }
    } catch (err) {
      console.error('Error reloading tickets:', err);
    }
  };

  const handleReserveSuccess = async () => {
    notifyUserTicket();
    // Recargar los tickets para actualizar el stock
    setReserveModalOpen(false);
    setSelectedTicketType(null);
    
    // Recargar tickets
    try {
      const response = await dameTicketsAPI.getTicketTypes(eventId);
      if (response.success && response.data) {
        const allTickets = response.data.results || [];
        const visibleTickets = allTickets.filter(t => t.is_visible === true);
        setTicketTypes(visibleTickets);
        
        if (onTicketsLoaded) {
          onTicketsLoaded(visibleTickets.length > 0);
        }
      }
    } catch (err) {
      console.error('Error reloading tickets:', err);
    }
  };

  const handleAtDoorSuccess = async () => {
    notifyUserTicket();
    // Recargar los tickets para actualizar el stock
    setAtDoorModalOpen(false);
    setSelectedTicketType(null);
    
    // Recargar tickets
    try {
      const response = await dameTicketsAPI.getTicketTypes(eventId);
      if (response.success && response.data) {
        const allTickets = response.data.results || [];
        const visibleTickets = allTickets.filter(t => t.is_visible === true);
        setTicketTypes(visibleTickets);
        
        if (onTicketsLoaded) {
          onTicketsLoaded(visibleTickets.length > 0);
        }
      }
    } catch (err) {
      console.error('Error reloading tickets:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {i18n.language === 'en' ? 'Tickets' : 'Entradas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || ticketTypes.length === 0) {
    // Si no hay tickets, no mostrar nada (no es un error crítico)
    if (ticketTypes.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {i18n.language === 'en' ? 'Tickets' : 'Entradas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          {i18n.language === 'en' ? 'Tickets' : 'Entradas'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ticketTypes.map((ticketType) => {
            const isAvailable = ticketType.is_on_sale && ticketType.available_stock > 0;
            const isSoldOut = ticketType.available_stock === 0;
            const saleNotStarted = ticketType.sale_start_date && new Date(ticketType.sale_start_date) > new Date();
            const saleEnded = ticketType.sale_end_date && new Date(ticketType.sale_end_date) < new Date();

            return (
              <div
                key={ticketType.id}
                className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {getLocalizedText(ticketType.title_es, ticketType.title_en)}
                      </h3>
                      <Badge
                        className={`${getTicketTypeBadgeColor(ticketType.ticket_type)} text-white`}
                      >
                        {getTicketTypeLabel(ticketType.ticket_type)}
                      </Badge>
                    </div>

                    {getLocalizedText(ticketType.description_es, ticketType.description_en) && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {getLocalizedText(ticketType.description_es, ticketType.description_en)}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-semibold text-foreground">
                          {formatPrice(ticketType.current_price, ticketType.currency)}
                        </span>
                      </div>
                      
                      {ticketType.available_stock !== null && (
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4" />
                          <span>
                            {ticketType.available_stock > 0
                              ? i18n.language === 'en'
                                ? `${ticketType.available_stock} available`
                                : `${ticketType.available_stock} disponibles`
                              : i18n.language === 'en'
                              ? 'Sold out'
                              : 'Agotadas'}
                          </span>
                        </div>
                      )}

                      {ticketType.sale_start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {i18n.language === 'en' ? 'Sale starts: ' : 'Venta inicia: '}
                            {formatDate(ticketType.sale_start_date)}
                          </span>
                        </div>
                      )}

                      {ticketType.sale_end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {i18n.language === 'en' ? 'Sale ends: ' : 'Venta termina: '}
                            {formatDate(ticketType.sale_end_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {ticketType.pricing_type !== 'FIXED' && ticketType.price_scales && ticketType.price_scales.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium mb-1">
                          {i18n.language === 'en' ? 'Price schedule:' : 'Escala de precios:'}
                        </p>
                        <div className="space-y-1">
                          {ticketType.price_scales
                            .sort((a, b) => a.order - b.order)
                            .map((scale) => (
                              <div key={scale.id} className="text-xs text-muted-foreground">
                                {scale.until_date && (
                                  <span>
                                    {i18n.language === 'en' ? 'Until ' : 'Hasta '}
                                    {formatDate(scale.until_date)}
                                  </span>
                                )}
                                {scale.until_sales_count && (
                                  <span>
                                    {i18n.language === 'en' ? 'First ' : 'Primeras '}
                                    {scale.until_sales_count}
                                    {i18n.language === 'en' ? ' tickets: ' : ' entradas: '}
                                  </span>
                                )}
                                <span className="font-semibold">{formatPrice(scale.price, ticketType.currency)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {saleNotStarted && (
                      <Button disabled variant="outline" className="w-full">
                        {i18n.language === 'en' ? 'Sale not started' : 'Venta no iniciada'}
                      </Button>
                    )}
                    
                    {saleEnded && (
                      <Button disabled variant="outline" className="w-full">
                        {i18n.language === 'en' ? 'Sale ended' : 'Venta finalizada'}
                      </Button>
                    )}

                    {isSoldOut && (
                      <Button disabled variant="outline" className="w-full">
                        {i18n.language === 'en' ? 'Sold out' : 'Agotadas'}
                      </Button>
                    )}

                    {isAvailable && !saleNotStarted && !saleEnded && (
                      <>
                        {ticketType.ticket_type === 'ONLINE' && (
                          <Button
                            onClick={() => handlePurchase(ticketType)}
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {i18n.language === 'en' ? 'Buy' : 'Comprar'}
                          </Button>
                        )}

                        {ticketType.ticket_type === 'RESERVA' && (
                          <Button
                            onClick={() => handleReserve(ticketType)}
                            variant="outline"
                            className="w-full"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {i18n.language === 'en' ? 'Reserve' : 'Reservar'}
                          </Button>
                        )}

                        {ticketType.ticket_type === 'EN_PUERTA' && (
                          <Button
                            onClick={() => handleAtDoor(ticketType)}
                            variant="outline"
                            className="w-full"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {i18n.language === 'en' ? 'Register' : 'Registrarse'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Modals */}
      {selectedTicketType && (
        <>
          {selectedTicketType.ticket_type === 'ONLINE' && (
            <TicketPurchaseModal
              ticketType={selectedTicketType}
              open={purchaseModalOpen}
              onOpenChange={setPurchaseModalOpen}
              onSuccess={handlePurchaseSuccess}
            />
          )}

          {selectedTicketType.ticket_type === 'RESERVA' && (
            <TicketReserveModal
              ticketType={selectedTicketType}
              open={reserveModalOpen}
              onOpenChange={setReserveModalOpen}
              onSuccess={handleReserveSuccess}
            />
          )}

          {selectedTicketType.ticket_type === 'EN_PUERTA' && (
            <TicketAtDoorModal
              ticketType={selectedTicketType}
              open={atDoorModalOpen}
              onOpenChange={setAtDoorModalOpen}
              onSuccess={handleAtDoorSuccess}
            />
          )}
        </>
      )}
    </Card>
  );
};
