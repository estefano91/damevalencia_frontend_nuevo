import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface TicketReserveTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketReserveTerms = ({ open, onOpenChange }: TicketReserveTermsProps) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEnglish ? 'Reservation Terms and Conditions' : 'Términos y Condiciones de Reserva'}
          </DialogTitle>
          <DialogDescription>
            {isEnglish 
              ? 'Please read and understand the following terms before making a reservation'
              : 'Por favor lee y comprende los siguientes términos antes de realizar una reserva'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '1. Reservation Process' : '1. Proceso de Reserva'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish 
                  ? 'Reservations are confirmed upon completion of this form and receipt of a confirmation code.'
                  : 'Las reservas se confirman al completar este formulario y recibir un código de confirmación.'}
              </li>
              <li>
                {isEnglish
                  ? 'This reservation does not require immediate payment. Payment instructions will be provided separately if required.'
                  : 'Esta reserva no requiere pago inmediato. Las instrucciones de pago se proporcionarán por separado si es necesario.'}
              </li>
              <li>
                {isEnglish
                  ? 'You will receive a confirmation email with your ticket code and event details.'
                  : 'Recibirás un email de confirmación con tu código de entrada y los detalles del evento.'}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '2. Cancellation Policy' : '2. Política de Cancelación'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish
                  ? 'Cancellations must be made at least 24 hours before the event start time.'
                  : 'Las cancelaciones deben realizarse al menos 24 horas antes de la hora de inicio del evento.'}
              </li>
              <li>
                {isEnglish
                  ? 'To cancel, contact us through the provided contact methods with your ticket code.'
                  : 'Para cancelar, contáctanos a través de los métodos de contacto proporcionados con tu código de entrada.'}
              </li>
              <li>
                {isEnglish
                  ? 'Late cancellations or no-shows may affect your ability to make future reservations.'
                  : 'Las cancelaciones tardías o las ausencias pueden afectar tu capacidad para realizar reservas futuras.'}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '3. Event Changes' : '3. Cambios en el Evento'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish
                  ? 'DAME Valencia reserves the right to modify, postpone, or cancel events due to unforeseen circumstances.'
                  : 'DAME Valencia se reserva el derecho de modificar, posponer o cancelar eventos debido a circunstancias imprevistas.'}
              </li>
              <li>
                {isEnglish
                  ? 'In case of event cancellation, you will be notified via email and offered a refund or alternative event.'
                  : 'En caso de cancelación del evento, serás notificado por email y se te ofrecerá un reembolso o evento alternativo.'}
              </li>
              <li>
                {isEnglish
                  ? 'Changes to event time or location will be communicated with at least 48 hours notice.'
                  : 'Los cambios en la hora o ubicación del evento se comunicarán con al menos 48 horas de anticipación.'}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '4. Data Protection' : '4. Protección de Datos'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish
                  ? 'Your personal information will be used solely for event management and communication purposes.'
                  : 'Tu información personal se utilizará únicamente para la gestión del evento y fines de comunicación.'}
              </li>
              <li>
                {isEnglish
                  ? 'We comply with GDPR and Spanish data protection regulations.'
                  : 'Cumplimos con el GDPR y las regulaciones españolas de protección de datos.'}
              </li>
              <li>
                {isEnglish
                  ? 'Your data will not be shared with third parties without your explicit consent.'
                  : 'Tus datos no serán compartidos con terceros sin tu consentimiento explícito.'}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '5. Code of Conduct' : '5. Código de Conducta'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish
                  ? 'All participants are expected to respect other attendees, organizers, and venue staff.'
                  : 'Se espera que todos los participantes respeten a otros asistentes, organizadores y personal del lugar.'}
              </li>
              <li>
                {isEnglish
                  ? 'Disruptive behavior may result in removal from the event without refund.'
                  : 'El comportamiento disruptivo puede resultar en la expulsión del evento sin reembolso.'}
              </li>
              <li>
                {isEnglish
                  ? 'DAME Valencia promotes an inclusive and respectful environment for all.'
                  : 'DAME Valencia promueve un ambiente inclusivo y respetuoso para todos.'}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">
              {isEnglish ? '6. Liability' : '6. Responsabilidad'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                {isEnglish
                  ? 'Participants attend events at their own risk. DAME Valencia is not liable for personal injury or property damage.'
                  : 'Los participantes asisten a los eventos bajo su propio riesgo. DAME Valencia no es responsable de lesiones personales o daños a la propiedad.'}
              </li>
              <li>
                {isEnglish
                  ? 'Participants are responsible for their personal belongings during the event.'
                  : 'Los participantes son responsables de sus pertenencias personales durante el evento.'}
              </li>
              <li>
                {isEnglish
                  ? 'DAME Valencia acts as a platform connecting users with event organizers. The platform is not responsible for situations, incidents, or issues caused by external organizers or third parties during events organized by them.'
                  : 'DAME Valencia actúa como una plataforma que conecta usuarios con organizadores de eventos. La plataforma no se responsabiliza por situaciones, incidentes o problemas causados por organizadores externos o terceros durante eventos organizados por ellos.'}
              </li>
              <li>
                {isEnglish
                  ? 'Any claims, disputes, or issues related to events organized by external parties should be directed to the respective event organizer, not to DAME Valencia.'
                  : 'Cualquier reclamación, disputa o problema relacionado con eventos organizados por partes externas debe dirigirse al organizador del evento correspondiente, no a DAME Valencia.'}
              </li>
            </ul>
          </section>

          <section className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? 'By accepting these terms, you acknowledge that you have read, understood, and agree to comply with all the conditions stated above.'
                : 'Al aceptar estos términos, reconoces que has leído, comprendido y aceptas cumplir con todas las condiciones indicadas anteriormente.'}
            </p>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            {isEnglish ? 'Close' : 'Cerrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

