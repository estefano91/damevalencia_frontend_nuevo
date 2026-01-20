import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { damePromotionsAPI, type Promotion } from '@/integrations/dame-api/promotions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Tag,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Info,
  Users,
  Ticket as TicketIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const MyPromotions = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [eventPrice, setEventPrice] = useState<{ original: number; discounted: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!user.member) {
      navigate('/afiliarse');
      return;
    }

    const fetchPromotions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await damePromotionsAPI.getPublicPromotions();

        if (response.success && response.data) {
          setPromotions(response.data.promotions || []);
        } else {
          console.error('Error fetching promotions:', response.error);
          setError(response.error || (i18n.language === 'en' ? 'Error loading promotions' : 'Error al cargar las promociones'));
          toast({
            title: i18n.language === 'en' ? 'Error' : 'Error',
            description: response.error || (i18n.language === 'en' ? 'Could not load your promotions' : 'No se pudieron cargar tus promociones'),
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(i18n.language === 'en' ? 'Error loading promotions' : 'Error al cargar las promociones');
        toast({
          title: i18n.language === 'en' ? 'Error' : 'Error',
          description: i18n.language === 'en' ? 'Could not load your promotions' : 'No se pudieron cargar tus promociones',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [user, navigate, i18n.language, toast]);

  const getDiscountDisplay = (promotion: Promotion): string => {
    if (promotion.discount_type === 'PERCENTAGE') {
      return `${promotion.discount_value}%`;
    } else if (promotion.discount_type === 'AMOUNT') {
      return `€${promotion.discount_value}`;
    }
    return '';
  };

  const handleViewDetails = async (promotion: Promotion) => {
    try {
      const response = await damePromotionsAPI.getPromotionDetail(promotion.id);
      const promotionData = response.success && response.data ? response.data.promotion : promotion;
      setSelectedPromotion(promotionData);
      
      // Calcular precio original y con descuento si existe actual_price
      if (promotionData.actual_price) {
        const originalPrice = parseFloat(promotionData.actual_price);
        let discountedPrice = 0;
        
        if (promotionData.discount_type === 'AMOUNT') {
          const discountAmount = parseFloat(promotionData.discount_value);
          discountedPrice = Math.max(0, originalPrice - discountAmount);
        } else if (promotionData.discount_type === 'PERCENTAGE') {
          const discountPercent = parseFloat(promotionData.discount_value);
          const discountAmount = originalPrice * (discountPercent / 100);
          const maxDiscount = promotionData.max_discount_amount ? parseFloat(promotionData.max_discount_amount) : null;
          const finalDiscount = maxDiscount ? Math.min(discountAmount, maxDiscount) : discountAmount;
          discountedPrice = Math.max(0, originalPrice - finalDiscount);
        }
        
        setEventPrice({
          original: originalPrice,
          discounted: discountedPrice
        });
      } else {
        setEventPrice(null);
      }
      
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('Error fetching promotion detail:', err);
      setSelectedPromotion(promotion);
      setEventPrice(null);
      setDetailDialogOpen(true);
    }
  };

  const renderPromotionCard = (promotion: Promotion) => {
    const lang = i18n.language === 'en' ? 'en' : 'es';
    const isExpired = new Date(promotion.end_date) < new Date();
    const isNotStarted = new Date(promotion.start_date) > new Date();
    // Usar is_active si está disponible, sino is_valid para compatibilidad
    const isActive = promotion.is_active !== undefined ? promotion.is_active : (promotion.is_valid ?? true);
    const isValid = isActive && !isExpired && !isNotStarted;
    
    const title = lang === 'en' ? (promotion.title_en || promotion.title_es) : promotion.title_es;
    const description = lang === 'en' ? (promotion.description_en || promotion.description_es || '') : (promotion.description_es || '');

    return (
      <Card key={promotion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          {promotion.image_url && (
            <div className="md:w-1/3 h-48 md:h-auto">
              <img
                src={promotion.image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`flex-1 ${promotion.image_url ? '' : 'p-6'}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {isValid ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {i18n.language === 'en' ? 'Valid' : 'Válida'}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        {i18n.language === 'en' ? 'Invalid' : 'Inválida'}
                      </Badge>
                    )}
                    {promotion.event && (
                      <Badge variant="outline">
                        <TicketIcon className="mr-1 h-3 w-3" />
                        {lang === 'en' ? promotion.event.title_en : promotion.event.title_es}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-sm opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg shadow-lg">
                      <div className="text-xs font-medium opacity-90 mb-0.5">
                        {i18n.language === 'en' ? 'DISCOUNT' : 'DESCUENTO'}
                      </div>
                      <div className="text-3xl font-extrabold leading-none">
                        {getDiscountDisplay(promotion)}
                      </div>
                    </div>
                  </div>
                  {promotion.actual_price && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {i18n.language === 'en' ? 'Original' : 'Original'}
                        </span>
                        <div className="text-sm font-medium text-muted-foreground line-through">
                          {parseFloat(promotion.actual_price).toFixed(2)}€
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-green-600">
                          {i18n.language === 'en' ? 'Final' : 'Final'}
                        </span>
                        <div className="text-lg font-bold text-green-600">
                          {(() => {
                            const originalPrice = parseFloat(promotion.actual_price);
                            let discountedPrice = 0;
                            
                            if (promotion.discount_type === 'AMOUNT') {
                              discountedPrice = Math.max(0, originalPrice - parseFloat(promotion.discount_value));
                            } else if (promotion.discount_type === 'PERCENTAGE') {
                              const discountPercent = parseFloat(promotion.discount_value);
                              const discountAmount = originalPrice * (discountPercent / 100);
                              const maxDiscount = promotion.max_discount_amount ? parseFloat(promotion.max_discount_amount) : null;
                              const finalDiscount = maxDiscount ? Math.min(discountAmount, maxDiscount) : discountAmount;
                              discountedPrice = Math.max(0, originalPrice - finalDiscount);
                            }
                            
                            return discountedPrice.toFixed(2);
                          })()}€
                        </div>
                      </div>
                    </div>
                  )}
                  {promotion.discount_type === 'PERCENTAGE' && promotion.max_discount_amount && !promotion.actual_price && (
                    <div className="mt-2 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                      {i18n.language === 'en' ? 'Max' : 'Máx'}: €{promotion.max_discount_amount}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {description}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(promotion)}
                  className="flex-1"
                >
                  <Info className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'View Details' : 'Ver Detalles'}
                </Button>
                {promotion.event && (
                  <Button
                    variant="default"
                    onClick={() => navigate(`/eventos/${promotion.event!.slug}`)}
                  >
                    <TicketIcon className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'View Event' : 'Ver Evento'}
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
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
                {i18n.language === 'en' ? 'My Promotions' : 'Mis Promociones'}
              </h1>
              <p className="text-muted-foreground">
                {i18n.language === 'en' 
                  ? 'View and use your available promotions'
                  : 'Visualiza y utiliza tus promociones disponibles'}
              </p>
            </div>
            {promotions.length > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {promotions.length} {i18n.language === 'en' ? 'promotions' : 'promociones'}
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {promotions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-2">
                {i18n.language === 'en' 
                  ? 'You don\'t have any promotions available'
                  : 'No tienes promociones disponibles'}
              </p>
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'en' 
                  ? 'Promotions will appear here when they become available for your account'
                  : 'Las promociones aparecerán aquí cuando estén disponibles para tu cuenta'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {promotions.map(renderPromotionCard)}
          </div>
        )}

        {/* Dialog para detalles de promoción */}
        <Dialog open={detailDialogOpen} onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            // Limpiar estados cuando se cierra el diálogo
            setEventPrice(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPromotion && (() => {
              const detailLang = i18n.language === 'en' ? 'en' : 'es';
              const detailTitle = detailLang === 'en' ? (selectedPromotion.title_en || selectedPromotion.title_es) : selectedPromotion.title_es;
              const detailDescription = detailLang === 'en' ? (selectedPromotion.description_en || selectedPromotion.description_es || '') : (selectedPromotion.description_es || '');
              const detailHowToUse = detailLang === 'en' ? (selectedPromotion.how_to_use_en || selectedPromotion.how_to_use_es || '') : (selectedPromotion.how_to_use_es || '');
              const detailTerms = detailLang === 'en' ? (selectedPromotion.terms_and_conditions_en || selectedPromotion.terms_and_conditions_es || '') : (selectedPromotion.terms_and_conditions_es || '');
              const eventTitle = selectedPromotion.event ? (detailLang === 'en' ? (selectedPromotion.event.title_en || selectedPromotion.event.title_es) : selectedPromotion.event.title_es) : '';
              
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {detailTitle}
                    </DialogTitle>
                  </DialogHeader>

                  {selectedPromotion.image_url && (
                    <div className="w-full rounded-lg overflow-hidden mb-4">
                      <img
                        src={selectedPromotion.image_url}
                        alt={detailTitle}
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  )}

                  {detailDescription && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {detailDescription}
                      </p>
                    </div>
                  )}

                <div className="space-y-4">
                  <div className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-purple-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 dark:bg-pink-800 rounded-full -ml-12 -mb-12 opacity-20"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                          {i18n.language === 'en' ? 'Special Offer' : 'Oferta Especial'}
                        </div>
                        <div className="relative inline-block mb-3">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-40"></div>
                          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-xl">
                            <div className="text-xs font-bold opacity-90 mb-1 tracking-wider">
                              {i18n.language === 'en' ? 'DISCOUNT' : 'DESCUENTO'}
                            </div>
                            <div className="text-4xl font-extrabold leading-none">
                              {getDiscountDisplay(selectedPromotion)}
                            </div>
                          </div>
                        </div>
                        {selectedPromotion.actual_price && eventPrice && (
                          <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">
                                {i18n.language === 'en' ? 'Original price' : 'Precio original'}
                              </span>
                              <div className="text-base font-semibold text-muted-foreground line-through">
                                {eventPrice.original.toFixed(2)}€
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-green-600">
                                {i18n.language === 'en' ? 'Final price' : 'Precio final'}
                              </span>
                              <div className="text-2xl font-bold text-green-600">
                                {eventPrice.discounted.toFixed(2)}€
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedPromotion.discount_type === 'PERCENTAGE' && selectedPromotion.max_discount_amount && (
                          <div className="mt-3 inline-block text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-full">
                            {i18n.language === 'en' ? 'Maximum discount' : 'Descuento máximo'}: €{selectedPromotion.max_discount_amount}
                          </div>
                        )}
                      </div>
                      {(selectedPromotion.is_active !== undefined ? selectedPromotion.is_active : (selectedPromotion.is_valid ?? true)) ? (
                        <Badge variant="default" className="bg-green-600 text-lg px-4 py-2">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {i18n.language === 'en' ? 'Valid' : 'Válida'}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          <XCircle className="mr-2 h-4 w-4" />
                          {i18n.language === 'en' ? 'Invalid' : 'Inválida'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedPromotion.event && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-semibold mb-2">
                        {i18n.language === 'en' ? 'Applies to event' : 'Aplica al evento'}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedPromotion.event.main_photo_url && (
                          <img
                            src={selectedPromotion.event.main_photo_url}
                            alt={eventTitle}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {eventTitle}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setDetailDialogOpen(false);
                              navigate(`/eventos/${selectedPromotion.event!.slug}`);
                            }}
                            className="p-0 h-auto"
                          >
                            {i18n.language === 'en' ? 'View event' : 'Ver evento'} →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedPromotion.applies_to_all_segments && selectedPromotion.segments && selectedPromotion.segments.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        {i18n.language === 'en' ? 'Applies to segments' : 'Aplica a segmentos'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPromotion.segments.map((segment) => (
                          <Badge key={segment.id} variant="secondary">
                            <Users className="mr-1 h-3 w-3" />
                            {segment.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-semibold mb-2">
                      {i18n.language === 'en' ? 'How to use' : 'Cómo usar'}
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm whitespace-pre-line">
                        {detailHowToUse}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">
                      {i18n.language === 'en' ? 'Terms and conditions' : 'Términos y condiciones'}
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-line">
                        {detailTerms}
                      </p>
                    </div>
                  </div>
                </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyPromotions;

