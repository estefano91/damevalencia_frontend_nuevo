import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { TicketTypeDetail, PurchaseTicketAtDoorRequest } from '@/types/tickets';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, User, Mail, Phone, CreditCard, MapPin, FileText, Euro, Ticket, CheckCircle2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TicketReserveTerms } from '@/components/TicketReserveTerms';

interface TicketAtDoorModalProps {
  ticketType: TicketTypeDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface AttendeeData {
  full_name: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  role?: 'LEADER' | 'FOLLOWER';
  id_document?: string;
  country?: string;
  city?: string;
}

export const TicketAtDoorModal = ({
  ticketType,
  open,
  onOpenChange,
  onSuccess,
}: TicketAtDoorModalProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  // Número de invitados = número de tickets generados
  const [numberOfAttendees, setNumberOfAttendees] = useState(1);
  
  // Array de invitados: cada invitado genera un ticket
  const [attendees, setAttendees] = useState<AttendeeData[]>(() => {
    // Inicializar con 1 invitado
    return [{
      full_name: '',
      email: '',
    }];
  });

  // Resetear estado cuando el modal se abre (solo una vez cuando cambia de false a true)
  const prevOpenRef = useRef(open);
  
  useEffect(() => {
    // Solo resetear si el modal cambia de cerrado a abierto
    if (open && !prevOpenRef.current) {
      console.log('🔄 TicketAtDoorModal: Reseteando estado al abrir el modal');
      setNumberOfAttendees(1);
      setAttendees([{
        full_name: '',
        email: '',
      }]);
      setTermsAccepted(false);
      setLoading(false);
    }
    prevOpenRef.current = open;
  }, [open]);

  // Actualizar número de invitados y ajustar array
  const handleAttendeesChange = (newNumber: number) => {
    // Validar que el número esté dentro del rango permitido
    const minAttendees = 1;
    const maxAttendees = ticketType.available_stock !== null && ticketType.available_stock !== undefined 
      ? ticketType.available_stock 
      : 999; // Si no hay límite de stock, usar un número alto
    
    const validNumber = Math.max(minAttendees, Math.min(maxAttendees, newNumber));
    
    console.log('🔢 TicketAtDoorModal: Cambiando número de invitados', {
      newNumber,
      validNumber,
      minAttendees,
      maxAttendees,
      available_stock: ticketType.available_stock,
      currentAttendees: numberOfAttendees,
      currentAttendeesArrayLength: attendees.length
    });
    
    // Ajustar array de invitados ANTES de actualizar el estado
    const newAttendees: AttendeeData[] = [];
    for (let i = 0; i < validNumber; i++) {
      if (attendees[i]) {
        // Mantener datos existentes
        newAttendees.push({ ...attendees[i] });
      } else {
        // Crear nuevo invitado vacío
        newAttendees.push({
          full_name: '',
          email: '',
        });
      }
    }
    
    // Actualizar ambos estados
    setAttendees(newAttendees);
    setNumberOfAttendees(validNumber);
    
    console.log('✅ TicketAtDoorModal: Estado actualizado', {
      numberOfAttendees: validNumber,
      attendeesLength: newAttendees.length
    });
  };

  // Actualizar datos de un invitado específico
  const updateAttendee = (
    attendeeIndex: number,
    field: keyof AttendeeData,
    value: string
  ) => {
    const newAttendees = [...attendees];
    newAttendees[attendeeIndex] = {
      ...newAttendees[attendeeIndex],
      [field]: value,
    };
    setAttendees(newAttendees);
  };

  const validateAttendee = (attendee: AttendeeData, attendeeIndex: number): boolean => {
    if (!attendee.full_name.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Full name required for attendee ${attendeeIndex + 1}`
          : `Nombre completo requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (!attendee.email.trim() || !attendee.email.includes('@')) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Valid email required for attendee ${attendeeIndex + 1}`
          : `Email válido requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_phone && !attendee.phone?.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Phone required for attendee ${attendeeIndex + 1}`
          : `Teléfono requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_gender && !attendee.gender) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Gender required for attendee ${attendeeIndex + 1}`
          : `Género requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_role && !attendee.role) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Role required for attendee ${attendeeIndex + 1}`
          : `Rol requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_document && !attendee.id_document?.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `ID document required for attendee ${attendeeIndex + 1}`
          : `Documento de identidad requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_country && !attendee.country?.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `Country required for attendee ${attendeeIndex + 1}`
          : `País requerido para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    if (ticketType.require_city && !attendee.city?.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en'
          ? `City required for attendee ${attendeeIndex + 1}`
          : `Ciudad requerida para el invitado ${attendeeIndex + 1}`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateAllAttendees = (): boolean => {
    for (let i = 0; i < numberOfAttendees; i++) {
      const attendee = attendees[i];
      if (!validateAttendee(attendee, i)) {
        return false;
      }
    }

    if (!termsAccepted) {
      toast({
        title: i18n.language === 'en' ? 'Validation error' : 'Error de validación',
        description: i18n.language === 'en' 
          ? 'You must accept the terms and conditions to proceed' 
          : 'Debes aceptar los términos y condiciones para continuar',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Verificar autenticación
    if (!user) {
      toast({
        title: i18n.language === 'en' ? 'Login required' : 'Inicio de sesión requerido',
        description: i18n.language === 'en'
          ? 'Please log in to register for this event'
          : 'Por favor inicia sesión para registrarte en este evento',
        variant: 'destructive',
      });
      onOpenChange(false);
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }

    if (!validateAllAttendees()) return;

    setLoading(true);

    try {
      // Para tickets EN_PUERTA: usar formato especial con ticket_type_id y attendee_data como array
      const attendeeDataArray = attendees.map(attendee => {
        const attendeeData: any = {
          full_name: attendee.full_name.trim(),
          email: attendee.email.trim(),
        };
        
        // Agregar campos requeridos siempre que sean requeridos
        if (ticketType.require_phone && attendee.phone) {
          attendeeData.phone = attendee.phone.trim();
        }
        if (ticketType.require_gender && attendee.gender) {
          attendeeData.gender = attendee.gender;
        }
        if (ticketType.require_role && attendee.role) {
          attendeeData.role = attendee.role;
        }
        if (ticketType.require_document && attendee.id_document) {
          attendeeData.id_document = attendee.id_document.trim();
        }
        if (ticketType.require_country && attendee.country) {
          attendeeData.country = attendee.country.trim();
        }
        if (ticketType.require_city && attendee.city) {
          attendeeData.city = attendee.city.trim();
        }
        
        return attendeeData;
      });
      
      const request: PurchaseTicketAtDoorRequest = {
        ticket_type_id: ticketType.id,
        quantity: numberOfAttendees, // Cantidad de tickets = número de asistentes
        attendee_data: attendeeDataArray,
      };
      
      console.log('📤 TicketAtDoorModal: Enviando request EN_PUERTA:', request);
      console.log('📋 TicketAtDoorModal: Campos requeridos del ticket:', {
        require_phone: ticketType.require_phone,
        require_gender: ticketType.require_gender,
        require_role: ticketType.require_role,
        require_document: ticketType.require_document,
        require_country: ticketType.require_country,
        require_city: ticketType.require_city,
      });
      
      const response = await dameTicketsAPI.purchaseTicketAtDoor(request);
      
      if (response.success) {
        toast({
          title: i18n.language === 'en' ? 'Registration successful!' : '¡Registro exitoso!',
          description: i18n.language === 'en'
            ? `You have registered ${numberOfAttendees} attendee(s)`
            : `Te has registrado ${numberOfAttendees} asistente(s)`,
        });

        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        console.error('❌ TicketAtDoorModal: Error en registro:', {
          error: response.error,
          errorDetails: (response as any).errorDetails,
        });
        
        // Construir mensaje de error más descriptivo
        let errorDescription = response.error || (i18n.language === 'en' ? 'Could not complete registration' : 'No se pudo completar el registro');
        if ((response as any).errorDetails?.errors) {
          const errorDetails = (response as any).errorDetails.errors;
          const errorKeys = Object.keys(errorDetails);
          if (errorKeys.length > 0) {
            errorDescription = errorKeys.map(key => `${key}: ${Array.isArray(errorDetails[key]) ? errorDetails[key].join(', ') : errorDetails[key]}`).join('\n');
          }
        }
        
        toast({
          title: i18n.language === 'en' ? 'Registration error' : 'Error en el registro',
          description: errorDescription,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: i18n.language === 'en' ? 'An error occurred while registering' : 'Ocurrió un error al registrarse',
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
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) {
      return i18n.language === 'en' ? 'Free' : 'Gratuito';
    }
    return `${num.toFixed(2)}€`;
  };

  // Número de tickets = número de invitados
  const numberOfTickets = numberOfAttendees;
  const totalPrice = (parseFloat(ticketType.base_price || '0') * numberOfTickets).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden touch-pan-y" style={{ touchAction: 'pan-y' }}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            {i18n.language === 'en' ? 'Register for Event' : 'Registrarse en el Evento'}
          </DialogTitle>
          <DialogDescription className="pt-2">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {getLocalizedText(ticketType.title_es, ticketType.title_en)}
              </p>
              {ticketType.description_es && (
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(ticketType.description_es, ticketType.description_en)}
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ticket Info - Mejorado */}
          <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className={`grid gap-4 ${ticketType.available_stock !== null && ticketType.available_stock <= 10 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  <span>{i18n.language === 'en' ? 'Price per ticket' : 'Precio por entrada'}</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPrice(ticketType.base_price || '0')}
                </p>
              </div>
              {ticketType.available_stock !== null && ticketType.available_stock <= 10 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>{i18n.language === 'en' ? 'Available' : 'Disponibles'}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {ticketType.available_stock}
                  </p>
                </div>
              )}
            </div>
            {/* Aviso de pago en puerta - Justo debajo del precio */}
            <Alert className="mt-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100 font-medium">
                {i18n.language === 'en' 
                  ? '💳 Payment will be made at the door when you arrive at the event. No online payment required.'
                  : '💳 El pago se realizará en puerta al llegar al evento. No se requiere pago online.'}
              </AlertDescription>
            </Alert>
          </div>

          {/* Number of Attendees - Mejorado */}
          <div className="space-y-3">
            <Label htmlFor="attendees" className="text-base font-semibold">
              {i18n.language === 'en' ? 'Number of Attendees' : 'Número de Asistentes'} *
            </Label>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAttendeesChange(Math.max(1, numberOfAttendees - 1))}
                  disabled={numberOfAttendees <= 1}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  max={ticketType.available_stock !== null && ticketType.available_stock !== undefined 
                    ? ticketType.available_stock 
                    : undefined}
                  value={numberOfAttendees.toString()}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === '' || rawValue === '0') {
                      return;
                    }
                    const value = parseInt(rawValue, 10);
                    if (isNaN(value) || value < 1) {
                      return;
                    }
                    handleAttendeesChange(value);
                  }}
                  onBlur={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === '' || rawValue === '0') {
                      handleAttendeesChange(1);
                    }
                  }}
                  className="w-24 text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newNumber = numberOfAttendees + 1;
                    handleAttendeesChange(newNumber);
                  }}
                  disabled={
                    ticketType.available_stock !== null && 
                    ticketType.available_stock !== undefined && 
                    numberOfAttendees >= ticketType.available_stock
                  }
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Forms for each attendee - Mejorado */}
          {attendees.map((attendee, attendeeIndex) => (
            <Card key={attendeeIndex} className="p-6 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg">
                  {i18n.language === 'en' 
                    ? `Attendee ${attendeeIndex + 1} / Ticket ${attendeeIndex + 1}`
                    : `Asistente ${attendeeIndex + 1} / Entrada ${attendeeIndex + 1}`}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`fullName-${attendeeIndex}`} className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    {i18n.language === 'en' ? 'Full Name' : 'Nombre Completo'} *
                  </Label>
                  <Input
                    id={`fullName-${attendeeIndex}`}
                    value={attendee.full_name}
                    onChange={(e) => updateAttendee(attendeeIndex, 'full_name', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'Enter full name' : 'Ingresa nombre completo'}
                    className="h-11"
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor={`email-${attendeeIndex}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    {i18n.language === 'en' ? 'Email' : 'Correo Electrónico'} *
                  </Label>
                  <Input
                    id={`email-${attendeeIndex}`}
                    type="email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(attendeeIndex, 'email', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'your.email@example.com' : 'tu.email@ejemplo.com'}
                    className="h-11"
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Phone (conditional) */}
                {ticketType.require_phone && (
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${attendeeIndex}`} className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'Phone' : 'Teléfono'} *
                    </Label>
                    <Input
                      id={`phone-${attendeeIndex}`}
                      type="tel"
                      value={attendee.phone || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'phone', e.target.value)}
                      placeholder={i18n.language === 'en' ? '+34 612 345 678' : '+34 612 345 678'}
                      className="h-11"
                      autoComplete="off"
                      required
                    />
                  </div>
                )}

                {/* Gender (conditional) */}
                {ticketType.require_gender && (
                  <div className="space-y-2">
                    <Label htmlFor={`gender-${attendeeIndex}`} className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'Gender' : 'Género'} *
                    </Label>
                    <Select 
                      value={attendee.gender || ''} 
                      onValueChange={(value) => updateAttendee(attendeeIndex, 'gender', value as 'M' | 'F' | 'O')}
                    >
                      <SelectTrigger id={`gender-${attendeeIndex}`} className="h-11">
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
                    <Label htmlFor={`role-${attendeeIndex}`} className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'Role' : 'Rol'} *
                    </Label>
                    <Select 
                      value={attendee.role || ''} 
                      onValueChange={(value) => updateAttendee(attendeeIndex, 'role', value as 'LEADER' | 'FOLLOWER')}
                    >
                      <SelectTrigger id={`role-${attendeeIndex}`} className="h-11">
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
                    <Label htmlFor={`idDocument-${attendeeIndex}`} className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'ID Document' : 'Documento de Identidad'} *
                    </Label>
                      <Input
                        id={`idDocument-${attendeeIndex}`}
                        value={attendee.id_document || ''}
                        onChange={(e) => updateAttendee(attendeeIndex, 'id_document', e.target.value)}
                        placeholder={i18n.language === 'en' ? 'Enter ID document' : 'Ingresa documento de identidad'}
                        className="h-11"
                        autoComplete="off"
                        required
                      />
                  </div>
                )}

                {/* Country (conditional) */}
                {ticketType.require_country && (
                  <div className="space-y-2">
                    <Label htmlFor={`country-${attendeeIndex}`} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'Country' : 'País'} *
                    </Label>
                    <Input
                      id={`country-${attendeeIndex}`}
                      value={attendee.country || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'country', e.target.value)}
                      placeholder={i18n.language === 'en' ? 'Enter country' : 'Ingresa país'}
                      className="h-11"
                      required
                    />
                  </div>
                )}

                {/* City (conditional) */}
                {ticketType.require_city && (
                  <div className="space-y-2">
                    <Label htmlFor={`city-${attendeeIndex}`} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      {i18n.language === 'en' ? 'City' : 'Ciudad'} *
                    </Label>
                    <Input
                      id={`city-${attendeeIndex}`}
                      value={attendee.city || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'city', e.target.value)}
                      placeholder={i18n.language === 'en' ? 'Enter city' : 'Ingresa ciudad'}
                      className="h-11"
                      required
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Terms and Conditions - Mejorado */}
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1 h-5 w-5"
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {i18n.language === 'en' 
                    ? 'I accept the ' 
                    : 'Acepto los '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalOpen(true);
                    }}
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    {i18n.language === 'en' ? 'terms and conditions' : 'términos y condiciones'}
                  </button>
                  {i18n.language === 'en' ? ' *' : ' *'}
                </Label>
                {!termsAccepted && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {i18n.language === 'en' 
                      ? 'You must accept the terms to continue' 
                      : 'Debes aceptar los términos para continuar'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="min-w-[100px]"
          >
            {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !termsAccepted}
            className="min-w-[160px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {i18n.language === 'en' ? 'Processing...' : 'Procesando...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {i18n.language === 'en' 
                  ? `Register ${numberOfTickets} ${numberOfTickets === 1 ? 'Attendee' : 'Attendees'}` 
                  : `Registrar ${numberOfTickets} ${numberOfTickets === 1 ? 'Asistente' : 'Asistentes'}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Terms Modal */}
      <TicketReserveTerms open={termsModalOpen} onOpenChange={setTermsModalOpen} />
    </Dialog>
  );
};

