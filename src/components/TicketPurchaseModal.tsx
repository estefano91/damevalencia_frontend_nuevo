import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { TicketTypeDetail, PurchaseTicketRequest, Ticket } from '@/types/tickets';
import { StripeCheckout } from '@/components/StripeCheckout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';

interface TicketPurchaseModalProps {
  ticketType: TicketTypeDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TicketPurchaseModal = ({
  ticketType,
  open,
  onOpenChange,
  onSuccess,
}: TicketPurchaseModalProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stripeCheckoutData, setStripeCheckoutData] = useState<{
    clientSecret: string;
    publishableKey: string;
    orderId: number;
  } | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Form fields
  const [quantity, setQuantity] = useState(1);
  
  // Array de asistentes: cada asistente tiene sus propios datos
  interface AttendeeFormData {
    full_name: string;
    email: string;
    phone: string;
    gender: 'M' | 'F' | 'O' | '';
    role: 'LEADER' | 'FOLLOWER' | '';
    id_document: string;
    country: string;
    city: string;
    additional_notes: string;
  }
  
  const [attendees, setAttendees] = useState<AttendeeFormData[]>([{
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    role: '',
    id_document: '',
    country: '',
    city: '',
    additional_notes: '',
  }]);
  
  const [referralCode, setReferralCode] = useState('');
  
  // Actualizar array de asistentes cuando cambia la cantidad
  useEffect(() => {
    setAttendees((prevAttendees) => {
      const newAttendees: AttendeeFormData[] = [];
      for (let i = 0; i < quantity; i++) {
        if (prevAttendees[i]) {
          newAttendees.push({ ...prevAttendees[i] });
        } else {
          newAttendees.push({
            full_name: '',
            email: '',
            phone: '',
            gender: '',
            role: '',
            id_document: '',
            country: '',
            city: '',
            additional_notes: '',
          });
        }
      }
      return newAttendees;
    });
  }, [quantity]);
  
  // Actualizar datos de un asistente específico
  const updateAttendee = (
    index: number,
    field: keyof AttendeeFormData,
    value: string
  ) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value,
    };
    setAttendees(newAttendees);
  };

  // Calculate total price
  const pricePerTicket = parseFloat(ticketType.current_price || ticketType.base_price || '0');
  const totalPrice = (pricePerTicket * quantity).toFixed(2);

  const validateForm = (): boolean => {
    // Validar cada asistente
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      
      if (!attendee.full_name.trim()) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Full name is required for attendee ${i + 1}`
            : `El nombre completo es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (!attendee.email.trim() || !attendee.email.includes('@')) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Valid email is required for attendee ${i + 1}`
            : `Un email válido es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_phone && !attendee.phone.trim()) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Phone number is required for attendee ${i + 1}`
            : `El número de teléfono es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_gender && !attendee.gender) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Gender is required for attendee ${i + 1}`
            : `El género es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_role && !attendee.role) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Role is required for attendee ${i + 1}`
            : `El rol es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_document && !attendee.id_document.trim()) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `ID document is required for attendee ${i + 1}`
            : `El documento de identidad es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_country && !attendee.country.trim()) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `Country is required for attendee ${i + 1}`
            : `El país es requerido para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }

      if (ticketType.require_city && !attendee.city.trim()) {
        toast({
          title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
          description: i18n.language === 'en' 
            ? `City is required for attendee ${i + 1}`
            : `La ciudad es requerida para el asistente ${i + 1}`,
          variant: 'destructive',
        });
        return false;
      }
    }

    if (quantity > (ticketType.available_stock || 999)) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' 
          ? `Only ${ticketType.available_stock} tickets available`
          : `Solo ${ticketType.available_stock} entradas disponibles`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Verificar autenticación antes de validar
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description: i18n.language === 'en' 
          ? 'Please log in to purchase tickets' 
          : 'Por favor inicia sesión para comprar entradas',
        variant: 'destructive',
      });
      onOpenChange(false);
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }

    if (!validateForm()) return;

    // Si es un ticket ONLINE con Stripe, usar el nuevo flujo
    if (ticketType.ticket_type === 'ONLINE' && ticketType.payment_gateway === 'STRIPE') {
      await handleStripeCheckout();
      return;
    }

    // Flujo tradicional para otros tipos de tickets
    // Nota: Este flujo puede necesitar ajustes según la API
    setLoading(true);

    try {
      // Para el flujo tradicional, usar el primer asistente
      const firstAttendee = attendees[0];
      const request: PurchaseTicketRequest = {
        ticket_type: ticketType.id,
        quantity,
        full_name: firstAttendee.full_name.trim(),
        email: firstAttendee.email.trim(),
        ...(firstAttendee.phone && { phone: firstAttendee.phone.trim() }),
        ...(firstAttendee.gender && { gender: firstAttendee.gender as 'M' | 'F' | 'O' }),
        ...(firstAttendee.role && { role: firstAttendee.role as 'LEADER' | 'FOLLOWER' }),
        ...(firstAttendee.id_document && { id_document: firstAttendee.id_document.trim() }),
        ...(firstAttendee.country && { country: firstAttendee.country.trim() }),
        ...(firstAttendee.city && { city: firstAttendee.city.trim() }),
        ...(firstAttendee.additional_notes && { additional_notes: firstAttendee.additional_notes.trim() }),
      };

      const response = await dameTicketsAPI.purchaseTicket(request);

      if (response.success && response.data) {
        // Si hay checkout_url (Stripe), redirigir
        if (response.data.checkout_url) {
          window.location.href = response.data.checkout_url;
          return;
        }

        // Si hay tickets creados directamente, mostrar éxito
        if (response.data.tickets && response.data.tickets.length > 0) {
          toast({
            title: i18n.language === 'en' ? 'Purchase successful!' : '¡Compra exitosa!',
            description: i18n.language === 'en'
              ? `You have purchased ${response.data.tickets.length} ticket(s)`
              : `Has comprado ${response.data.tickets.length} entrada(s)`,
          });

          onOpenChange(false);
          if (onSuccess) onSuccess();
        }
      } else {
        toast({
          title: i18n.language === 'en' ? 'Purchase failed' : 'Error en la compra',
          description: response.error || (i18n.language === 'en' ? 'Could not complete purchase' : 'No se pudo completar la compra'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en' ? 'An error occurred while purchasing tickets' : 'Ocurrió un error al comprar las entradas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    setLoading(true);

    try {
      // Preparar datos de asistentes
      // Cada ticket necesita sus propios datos de asistente
      const attendeeData = attendees.map((attendee) => {
        const attendeeDataItem: {
          full_name: string;
          email: string;
          phone?: string;
          gender?: 'M' | 'F' | 'O';
          role?: 'LEADER' | 'FOLLOWER';
          id_document?: string;
          country?: string;
          city?: string;
          additional_notes?: string;
        } = {
          full_name: attendee.full_name.trim(),
          email: attendee.email.trim(),
        };

        // Incluir todos los campos que tengan valor
        if (attendee.phone && attendee.phone.trim()) {
          attendeeDataItem.phone = attendee.phone.trim();
        }
        if (attendee.gender) {
          attendeeDataItem.gender = attendee.gender as 'M' | 'F' | 'O';
        }
        if (attendee.role) {
          attendeeDataItem.role = attendee.role as 'LEADER' | 'FOLLOWER';
        }
        if (attendee.id_document && attendee.id_document.trim()) {
          attendeeDataItem.id_document = attendee.id_document.trim();
        }
        if (attendee.country && attendee.country.trim()) {
          attendeeDataItem.country = attendee.country.trim();
        }
        if (attendee.city && attendee.city.trim()) {
          attendeeDataItem.city = attendee.city.trim();
        }
        if (attendee.additional_notes && attendee.additional_notes.trim()) {
          attendeeDataItem.additional_notes = attendee.additional_notes.trim();
        }

        return attendeeDataItem;
      });

      const checkoutRequest: {
        ticket_type_id: number;
        quantity: number;
        attendee_data: typeof attendeeData;
        referral_code?: string;
      } = {
        ticket_type_id: ticketType.id,
        quantity,
        attendee_data: attendeeData,
      };

      // Solo incluir referral_code si tiene valor
      if (referralCode && referralCode.trim()) {
        checkoutRequest.referral_code = referralCode.trim();
      }

      // Log del request completo
      console.log('📤 REQUEST al endpoint /api/tickets/online/checkout/:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(JSON.stringify(checkoutRequest, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Detalles del request:');
      console.log('  - ticket_type_id:', checkoutRequest.ticket_type_id);
      console.log('  - quantity:', checkoutRequest.quantity);
      console.log('  - attendee_data (cantidad):', checkoutRequest.attendee_data.length);
      console.log('  - referral_code:', checkoutRequest.referral_code || '(no incluido)');
      console.log('  - attendee_data detallado:');
      checkoutRequest.attendee_data.forEach((attendee, index) => {
        console.log(`    Asistente ${index + 1}:`, {
          full_name: attendee.full_name,
          email: attendee.email,
          phone: attendee.phone || '(no incluido)',
          gender: attendee.gender || '(no incluido)',
          role: attendee.role || '(no incluido)',
          id_document: attendee.id_document || '(no incluido)',
          country: attendee.country || '(no incluido)',
          city: attendee.city || '(no incluido)',
          additional_notes: attendee.additional_notes || '(no incluido)',
        });
      });

      const response = await dameTicketsAPI.initiateStripeCheckout(checkoutRequest);

      // Log de la respuesta
      console.log('📥 RESPONSE del endpoint /api/tickets/online/checkout/:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  - success:', response.success);
      if (response.success && response.data) {
        console.log('  - order_id:', response.data.order_id);
        console.log('  - payment_intent_id:', response.data.payment_intent_id);
        console.log('  - client_secret:', response.data.client_secret ? '***' + response.data.client_secret.slice(-10) : '(no incluido)');
        console.log('  - publishable_key:', response.data.publishable_key ? response.data.publishable_key.substring(0, 20) + '...' : '(no incluido)');
        console.log('  - amount:', response.data.amount);
        console.log('  - currency:', response.data.currency);
        console.log('  - message:', response.data.message || '(no incluido)');
        console.log('  - Respuesta completa:');
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log('  - error:', response.error);
        console.log('  - Respuesta completa:');
        console.log(JSON.stringify(response, null, 2));
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (response.success && response.data) {
        setStripeCheckoutData({
          clientSecret: response.data.client_secret,
          publishableKey: response.data.publishable_key,
          orderId: response.data.order_id,
        });
        setShowStripeForm(true);
      } else {
        toast({
          title: i18n.language === 'en' ? 'Error' : 'Error',
          description: response.error || (i18n.language === 'en' ? 'Could not initiate checkout' : 'No se pudo iniciar el checkout'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initiating Stripe checkout:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en' ? 'An error occurred while initiating checkout' : 'Ocurrió un error al iniciar el checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (tickets: Ticket[]) => {
    toast({
      title: i18n.language === 'en' ? 'Purchase successful!' : '¡Compra exitosa!',
      description: i18n.language === 'en'
        ? `You have purchased ${tickets.length} ticket(s)`
        : `Has comprado ${tickets.length} entrada(s)`,
    });

    setShowStripeForm(false);
    setStripeCheckoutData(null);
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleStripeError = (error: string) => {
    toast({
      title: i18n.language === 'en' ? 'Payment failed' : 'Pago fallido',
      description: error,
      variant: 'destructive',
    });
    setShowStripeForm(false);
    setStripeCheckoutData(null);
  };

  const getLocalizedText = (textEs?: string, textEn?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return textEs || textEn || '';
  };

  const formatPrice = (amount?: string): string => {
    if (!amount || amount === '0' || parseFloat(amount) === 0) {
      return i18n.language === 'en' ? 'Free' : 'Gratis';
    }
    return `${parseFloat(amount).toFixed(2)}€`;
  };

  // Resetear estado cuando el modal se cierra
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowStripeForm(false);
      setStripeCheckoutData(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {i18n.language === 'en' ? 'Purchase Tickets' : 'Comprar Entradas'}
          </DialogTitle>
          <DialogDescription>
            {getLocalizedText(ticketType.title_es, ticketType.title_en)}
            {ticketType.description_es && (
              <span className="block mt-1 text-xs">
                {getLocalizedText(ticketType.description_es, ticketType.description_en)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {showStripeForm && stripeCheckoutData ? (
          <div className="py-4">
            <StripeCheckout
              clientSecret={stripeCheckoutData.clientSecret}
              publishableKey={stripeCheckoutData.publishableKey}
              orderId={stripeCheckoutData.orderId}
              onSuccess={handleStripeSuccess}
              onError={handleStripeError}
              onCancel={() => {
                setShowStripeForm(false);
                setStripeCheckoutData(null);
              }}
            />
          </div>
        ) : (
          <div className="space-y-4 py-4">
          {/* Ticket Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{i18n.language === 'en' ? 'Price per ticket' : 'Precio por entrada'}</span>
              <span className="text-lg font-bold">{formatPrice(ticketType.current_price || ticketType.base_price)}</span>
            </div>
            {ticketType.available_stock !== null && ticketType.available_stock <= 10 && (
              <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                <span>{i18n.language === 'en' ? 'Available' : 'Disponibles'}</span>
                <span>{ticketType.available_stock}</span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {i18n.language === 'en' ? 'Quantity' : 'Cantidad'} *
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={ticketType.available_stock || undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const maxQuantity = ticketType.available_stock !== null && ticketType.available_stock !== undefined 
                    ? ticketType.available_stock 
                    : 999; // Si no hay límite, usar un número alto
                  setQuantity(Math.min(maxQuantity, quantity + 1));
                }}
                disabled={
                  ticketType.available_stock !== null && 
                  ticketType.available_stock !== undefined && 
                  quantity >= ticketType.available_stock
                }
              >
                +
              </Button>
              <span className="ml-auto font-bold">
                {i18n.language === 'en' ? 'Total' : 'Total'}: {totalPrice}€
              </span>
            </div>
          </div>

          {/* Attendees Information */}
          {attendees.map((attendee, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">
                {i18n.language === 'en' 
                  ? `Attendee ${index + 1}${quantity > 1 ? ` of ${quantity}` : ''}`
                  : `Asistente ${index + 1}${quantity > 1 ? ` de ${quantity}` : ''}`}
              </h3>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor={`fullName-${index}`}>
                  {i18n.language === 'en' ? 'Full Name' : 'Nombre Completo'} *
                </Label>
                <Input
                  id={`fullName-${index}`}
                  value={attendee.full_name}
                  onChange={(e) => updateAttendee(index, 'full_name', e.target.value)}
                  placeholder={i18n.language === 'en' ? 'Enter full name' : 'Ingresa nombre completo'}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor={`email-${index}`}>
                  {i18n.language === 'en' ? 'Email' : 'Correo Electrónico'} *
                </Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={attendee.email}
                  onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                  placeholder={i18n.language === 'en' ? 'your.email@example.com' : 'tu.email@ejemplo.com'}
                  required
                />
              </div>

              {/* Phone (conditional) */}
              {ticketType.require_phone && (
                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`}>
                    {i18n.language === 'en' ? 'Phone' : 'Teléfono'} *
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    value={attendee.phone}
                    onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                    placeholder={i18n.language === 'en' ? '+34 612 345 678' : '+34 612 345 678'}
                    required
                  />
                </div>
              )}

              {/* Gender (conditional) */}
              {ticketType.require_gender && (
                <div className="space-y-2">
                  <Label htmlFor={`gender-${index}`}>
                    {i18n.language === 'en' ? 'Gender' : 'Género'} *
                  </Label>
                  <Select 
                    value={attendee.gender} 
                    onValueChange={(value) => updateAttendee(index, 'gender', value)}
                  >
                    <SelectTrigger id={`gender-${index}`}>
                      <SelectValue placeholder={i18n.language === 'en' ? 'Select gender' : 'Selecciona género'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{i18n.language === 'en' ? 'Male' : 'Masculino'}</SelectItem>
                      <SelectItem value="F">{i18n.language === 'en' ? 'Female' : 'Femenino'}</SelectItem>
                      <SelectItem value="O">{i18n.language === 'en' ? 'Other' : 'Otro'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Role (conditional) */}
              {ticketType.require_role && (
                <div className="space-y-2">
                  <Label htmlFor={`role-${index}`}>
                    {i18n.language === 'en' ? 'Role' : 'Rol'} *
                  </Label>
                  <Select 
                    value={attendee.role} 
                    onValueChange={(value) => updateAttendee(index, 'role', value)}
                  >
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue placeholder={i18n.language === 'en' ? 'Select role' : 'Selecciona rol'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEADER">{i18n.language === 'en' ? 'Leader' : 'Líder'}</SelectItem>
                      <SelectItem value="FOLLOWER">{i18n.language === 'en' ? 'Follower' : 'Seguidor'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ID Document (conditional) */}
              {ticketType.require_document && (
                <div className="space-y-2">
                  <Label htmlFor={`idDocument-${index}`}>
                    {i18n.language === 'en' ? 'ID Document' : 'Documento de Identidad'} *
                  </Label>
                  <Input
                    id={`idDocument-${index}`}
                    value={attendee.id_document}
                    onChange={(e) => updateAttendee(index, 'id_document', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'Enter ID document' : 'Ingresa documento de identidad'}
                    required
                  />
                </div>
              )}

              {/* Country (conditional) */}
              {ticketType.require_country && (
                <div className="space-y-2">
                  <Label htmlFor={`country-${index}`}>
                    {i18n.language === 'en' ? 'Country' : 'País'} *
                  </Label>
                  <Input
                    id={`country-${index}`}
                    value={attendee.country}
                    onChange={(e) => updateAttendee(index, 'country', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'Enter country' : 'Ingresa país'}
                    required
                  />
                </div>
              )}

              {/* City (conditional) */}
              {ticketType.require_city && (
                <div className="space-y-2">
                  <Label htmlFor={`city-${index}`}>
                    {i18n.language === 'en' ? 'City' : 'Ciudad'} *
                  </Label>
                  <Input
                    id={`city-${index}`}
                    value={attendee.city}
                    onChange={(e) => updateAttendee(index, 'city', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'Enter city' : 'Ingresa ciudad'}
                    required
                  />
                </div>
              )}

              {/* Additional Notes (optional) */}
              <div className="space-y-2">
                <Label htmlFor={`notes-${index}`}>
                  {i18n.language === 'en' ? 'Additional Notes' : 'Notas Adicionales'}
                </Label>
                <Textarea
                  id={`notes-${index}`}
                  value={attendee.additional_notes}
                  onChange={(e) => updateAttendee(index, 'additional_notes', e.target.value)}
                  placeholder={i18n.language === 'en' ? 'Any additional information...' : 'Información adicional...'}
                  rows={3}
                />
              </div>
            </div>
          ))}

          {/* Referral Code (optional) */}
          <div className="space-y-2">
            <Label htmlFor="referralCode">
              {i18n.language === 'en' ? 'Referral Code' : 'Código de Referido'} (Optional / Opcional)
            </Label>
            <Input
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder={i18n.language === 'en' ? 'Enter referral code if you have one' : 'Ingresa código de referido si tienes uno'}
            />
          </div>
        </div>
        )}

        {!showStripeForm && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {i18n.language === 'en' ? 'Processing...' : 'Procesando...'}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? `Buy ${totalPrice}€` : `Comprar ${totalPrice}€`}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

