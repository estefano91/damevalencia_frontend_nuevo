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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {i18n.language === 'en' ? 'Register for Event' : 'Registrarse en el Evento'}
          </DialogTitle>
          <DialogDescription>
            {getLocalizedText(ticketType.title_es, ticketType.title_en)}
            {ticketType.description_es && (
              <span className="block mt-1 text-xs">
                {getLocalizedText(ticketType.description_es, ticketType.description_en)}
              </span>
            )}
            <span className="block mt-2 text-sm">
              {i18n.language === 'en'
                ? `Each attendee will receive one ticket`
                : `Cada asistente recibirá una entrada`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ticket Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{i18n.language === 'en' ? 'Price per ticket' : 'Precio por entrada'}</span>
              <span className="text-lg font-bold">{formatPrice(ticketType.base_price || '0')}</span>
            </div>
            {ticketType.available_stock !== null && (
              <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                <span>{i18n.language === 'en' ? 'Available' : 'Disponibles'}</span>
                <span>{ticketType.available_stock}</span>
              </div>
            )}
          </div>

          {/* Number of Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">
              {i18n.language === 'en' ? 'Number of Attendees' : 'Número de Asistentes'} *
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAttendeesChange(Math.max(1, numberOfAttendees - 1))}
                disabled={numberOfAttendees <= 1}
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
                  console.log('✏️ Input onChange - valor raw:', rawValue, 'número actual:', numberOfAttendees);
                  
                  // Permitir que el usuario borre y escriba libremente
                  if (rawValue === '' || rawValue === '0') {
                    // No hacer nada si está vacío o es 0
                    console.log('⚠️ Input: Valor vacío o 0, ignorando');
                    return;
                  }
                  
                  const value = parseInt(rawValue, 10);
                  console.log('✏️ Input onChange - valor parseado:', value);
                  
                  // Validar que sea un número válido y mayor a 0
                  if (isNaN(value) || value < 1) {
                    console.log('⚠️ Input: Valor inválido, ignorando');
                    return;
                  }
                  
                  // Llamar a handleAttendeesChange para validar y actualizar
                  console.log('✅ Input: Llamando handleAttendeesChange con valor:', value);
                  handleAttendeesChange(value);
                }}
                onBlur={(e) => {
                  // Si el valor está vacío al perder el foco, restaurar a 1
                  const rawValue = e.target.value;
                  if (rawValue === '' || rawValue === '0') {
                    console.log('🔄 Input onBlur: Valor vacío, restaurando a 1');
                    handleAttendeesChange(1);
                  }
                }}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  console.log('➕ Botón + clickeado, número actual:', numberOfAttendees);
                  const newNumber = numberOfAttendees + 1;
                  handleAttendeesChange(newNumber);
                }}
                disabled={
                  ticketType.available_stock !== null && 
                  ticketType.available_stock !== undefined && 
                  numberOfAttendees >= ticketType.available_stock
                }
              >
                +
              </Button>
              <span className="ml-auto font-bold">
                {i18n.language === 'en' ? 'Total' : 'Total'}: {totalPrice}€
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({numberOfTickets} {i18n.language === 'en' ? 'ticket(s)' : 'entrada(s)'})
                </span>
              </span>
            </div>
          </div>

          {/* Forms for each attendee */}
          {attendees.map((attendee, attendeeIndex) => (
            <Card key={attendeeIndex} className="p-4">
              <h3 className="font-semibold mb-4">
                {i18n.language === 'en' 
                  ? `Attendee ${attendeeIndex + 1} / Ticket ${attendeeIndex + 1}`
                  : `Asistente ${attendeeIndex + 1} / Entrada ${attendeeIndex + 1}`}
              </h3>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor={`fullName-${attendeeIndex}`}>
                    {i18n.language === 'en' ? 'Full Name' : 'Nombre Completo'} *
                  </Label>
                  <Input
                    id={`fullName-${attendeeIndex}`}
                    value={attendee.full_name}
                    onChange={(e) => updateAttendee(attendeeIndex, 'full_name', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'Enter full name' : 'Ingresa nombre completo'}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor={`email-${attendeeIndex}`}>
                    {i18n.language === 'en' ? 'Email' : 'Correo Electrónico'} *
                  </Label>
                  <Input
                    id={`email-${attendeeIndex}`}
                    type="email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(attendeeIndex, 'email', e.target.value)}
                    placeholder={i18n.language === 'en' ? 'your.email@example.com' : 'tu.email@ejemplo.com'}
                    required
                  />
                </div>

                {/* Phone (conditional) */}
                {ticketType.require_phone && (
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'Phone' : 'Teléfono'} *
                    </Label>
                    <Input
                      id={`phone-${attendeeIndex}`}
                      type="tel"
                      value={attendee.phone || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'phone', e.target.value)}
                      placeholder={i18n.language === 'en' ? '+34 612 345 678' : '+34 612 345 678'}
                      required
                    />
                  </div>
                )}

                {/* Gender (conditional) */}
                {ticketType.require_gender && (
                  <div className="space-y-2">
                    <Label htmlFor={`gender-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'Gender' : 'Género'} *
                    </Label>
                    <Select 
                      value={attendee.gender || ''} 
                      onValueChange={(value) => updateAttendee(attendeeIndex, 'gender', value as 'M' | 'F' | 'O')}
                    >
                      <SelectTrigger id={`gender-${attendeeIndex}`}>
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
                    <Label htmlFor={`role-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'Role' : 'Rol'} *
                    </Label>
                    <Select 
                      value={attendee.role || ''} 
                      onValueChange={(value) => updateAttendee(attendeeIndex, 'role', value as 'LEADER' | 'FOLLOWER')}
                    >
                      <SelectTrigger id={`role-${attendeeIndex}`}>
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
                    <Label htmlFor={`idDocument-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'ID Document' : 'Documento de Identidad'} *
                    </Label>
                    <Input
                      id={`idDocument-${attendeeIndex}`}
                      value={attendee.id_document || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'id_document', e.target.value)}
                      placeholder={i18n.language === 'en' ? 'Enter ID document' : 'Ingresa documento de identidad'}
                      required
                    />
                  </div>
                )}

                {/* Country (conditional) */}
                {ticketType.require_country && (
                  <div className="space-y-2">
                    <Label htmlFor={`country-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'Country' : 'País'} *
                    </Label>
                    <Input
                      id={`country-${attendeeIndex}`}
                      value={attendee.country || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'country', e.target.value)}
                      placeholder={i18n.language === 'en' ? 'Enter country' : 'Ingresa país'}
                      required
                    />
                  </div>
                )}

                {/* City (conditional) */}
                {ticketType.require_city && (
                  <div className="space-y-2">
                    <Label htmlFor={`city-${attendeeIndex}`}>
                      {i18n.language === 'en' ? 'City' : 'Ciudad'} *
                    </Label>
                    <Input
                      id={`city-${attendeeIndex}`}
                      value={attendee.city || ''}
                      onChange={(e) => updateAttendee(attendeeIndex, 'city', e.target.value)}
                      placeholder={i18n.language === 'en' ? 'Enter city' : 'Ingresa ciudad'}
                      required
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
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
                <Users className="mr-2 h-4 w-4" />
                {i18n.language === 'en' ? `Register ${numberOfTickets}` : `Registrar ${numberOfTickets}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

