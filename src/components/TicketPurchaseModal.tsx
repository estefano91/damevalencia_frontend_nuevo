import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { TicketTypeDetail, PurchaseTicketRequest } from '@/types/tickets';
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

  // Form fields
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'O' | ''>('');
  const [role, setRole] = useState<'LEADER' | 'FOLLOWER' | ''>('');
  const [idDocument, setIdDocument] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Calculate total price
  const totalPrice = (parseFloat(ticketType.current_price) * quantity).toFixed(2);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Full name is required' : 'El nombre completo es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Valid email is required' : 'Un email válido es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_phone && !phone.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Phone number is required' : 'El número de teléfono es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_gender && !gender) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Gender is required' : 'El género es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_role && !role) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Role is required' : 'El rol es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_document && !idDocument.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'ID document is required' : 'El documento de identidad es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_country && !country.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'Country is required' : 'El país es requerido',
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_city && !city.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' ? 'City is required' : 'La ciudad es requerida',
        variant: 'destructive',
      });
      return false;
    }

    if (quantity > ticketType.available_stock) {
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

    setLoading(true);

    try {
      const request: PurchaseTicketRequest = {
        ticket_type: ticketType.id,
        quantity,
        full_name: fullName.trim(),
        email: email.trim(),
        ...(ticketType.require_phone && phone && { phone: phone.trim() }),
        ...(ticketType.require_gender && gender && { gender: gender as 'M' | 'F' | 'O' }),
        ...(ticketType.require_role && role && { role: role as 'LEADER' | 'FOLLOWER' }),
        ...(ticketType.require_document && idDocument && { id_document: idDocument.trim() }),
        ...(ticketType.require_country && country && { country: country.trim() }),
        ...(ticketType.require_city && city && { city: city.trim() }),
        ...(additionalNotes && { additional_notes: additionalNotes.trim() }),
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

  const getLocalizedText = (textEs?: string, textEn?: string): string => {
    if (i18n.language === 'en' && textEn) return textEn;
    return textEs || textEn || '';
  };

  const formatPrice = (amount: string): string => {
    return `${parseFloat(amount).toFixed(2)}€`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-4 py-4">
          {/* Ticket Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{i18n.language === 'en' ? 'Price per ticket' : 'Precio por entrada'}</span>
              <span className="text-lg font-bold">{formatPrice(ticketType.current_price)}</span>
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
                onClick={() => setQuantity(Math.min(ticketType.available_stock || quantity, quantity + 1))}
                disabled={quantity >= (ticketType.available_stock || quantity)}
              >
                +
              </Button>
              <span className="ml-auto font-bold">
                {i18n.language === 'en' ? 'Total' : 'Total'}: {totalPrice}€
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {i18n.language === 'en' ? 'Full Name' : 'Nombre Completo'} *
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={i18n.language === 'en' ? 'Enter your full name' : 'Ingresa tu nombre completo'}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {i18n.language === 'en' ? 'Email' : 'Correo Electrónico'} *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={i18n.language === 'en' ? 'your.email@example.com' : 'tu.email@ejemplo.com'}
              required
            />
          </div>

          {/* Phone (conditional) */}
          {ticketType.require_phone && (
            <div className="space-y-2">
              <Label htmlFor="phone">
                {i18n.language === 'en' ? 'Phone' : 'Teléfono'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={i18n.language === 'en' ? '+34 612 345 678' : '+34 612 345 678'}
                required
              />
            </div>
          )}

          {/* Gender (conditional) */}
          {ticketType.require_gender && (
            <div className="space-y-2">
              <Label htmlFor="gender">
                {i18n.language === 'en' ? 'Gender' : 'Género'} *
              </Label>
              <Select value={gender} onValueChange={(value) => setGender(value as 'M' | 'F' | 'O')}>
                <SelectTrigger id="gender">
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
              <Label htmlFor="role">
                {i18n.language === 'en' ? 'Role' : 'Rol'} *
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'LEADER' | 'FOLLOWER')}>
                <SelectTrigger id="role">
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
              <Label htmlFor="idDocument">
                {i18n.language === 'en' ? 'ID Document' : 'Documento de Identidad'} *
              </Label>
              <Input
                id="idDocument"
                value={idDocument}
                onChange={(e) => setIdDocument(e.target.value)}
                placeholder={i18n.language === 'en' ? 'Enter ID document' : 'Ingresa documento de identidad'}
                required
              />
            </div>
          )}

          {/* Country (conditional) */}
          {ticketType.require_country && (
            <div className="space-y-2">
              <Label htmlFor="country">
                {i18n.language === 'en' ? 'Country' : 'País'} *
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={i18n.language === 'en' ? 'Enter country' : 'Ingresa país'}
                required
              />
            </div>
          )}

          {/* City (conditional) */}
          {ticketType.require_city && (
            <div className="space-y-2">
              <Label htmlFor="city">
                {i18n.language === 'en' ? 'City' : 'Ciudad'} *
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={i18n.language === 'en' ? 'Enter city' : 'Ingresa ciudad'}
                required
              />
            </div>
          )}

          {/* Additional Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {i18n.language === 'en' ? 'Additional Notes' : 'Notas Adicionales'}
            </Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={i18n.language === 'en' ? 'Any additional information...' : 'Información adicional...'}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
};

