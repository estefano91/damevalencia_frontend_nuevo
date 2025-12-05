import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';
import type { StripeCheckoutResponse, PaymentStatusResponse, Ticket } from '@/types/tickets';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripeCheckoutProps {
  clientSecret: string;
  publishableKey: string;
  orderId: number;
  onSuccess: (tickets: Ticket[]) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

// Componente interno que usa los hooks de Stripe
const StripePaymentForm = ({ orderId, onSuccess, onError, onCancel }: {
  orderId: number;
  onSuccess: (tickets: Ticket[]) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setIsProcessing(true);

    try {
      // Confirmar el pago
      console.log('💳 Confirmando pago con Stripe...');
      
      // Construir URLs de redirección para diferentes casos
      const baseUrl = window.location.origin + window.location.pathname;
      const returnUrl = new URL(baseUrl, window.location.href);
      returnUrl.searchParams.set('order_id', orderId.toString());
      returnUrl.searchParams.set('return_from_stripe', 'true');
      returnUrl.searchParams.set('payment_status', 'success');
      
      // URL para cancelación (si el usuario cancela durante el proceso)
      const cancelUrl = new URL(baseUrl, window.location.href);
      cancelUrl.searchParams.set('order_id', orderId.toString());
      cancelUrl.searchParams.set('return_from_stripe', 'true');
      cancelUrl.searchParams.set('payment_status', 'canceled');
      
      console.log('🔗 URLs de redirección configuradas:');
      console.log('  - return_url (éxito):', returnUrl.toString());
      console.log('  - cancel_url (cancelación):', cancelUrl.toString());
      
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
          // Stripe también puede usar payment_method_data para configuraciones adicionales
        },
        redirect: 'if_required', // Solo redirige si es necesario (ej: 3D Secure)
      });

      if (confirmError) {
        console.error('❌ Stripe payment error:', confirmError);
        toast({
          title: i18n.language === 'en' ? 'Payment failed' : 'Pago fallido',
          description: confirmError.message || (i18n.language === 'en' ? 'Could not process payment' : 'No se pudo procesar el pago'),
          variant: 'destructive',
        });
        onError(confirmError.message || 'Payment failed');
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      // Log del resultado de la confirmación
      if (paymentIntent) {
        console.log('✅ PaymentIntent confirmado:', {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

        // Si el PaymentIntent ya está succeeded, esperar un poco antes de verificar
        // para dar tiempo al webhook del backend de procesar
        if (paymentIntent.status === 'succeeded') {
          console.log('⏳ PaymentIntent succeeded, esperando 2 segundos para que el webhook procese...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Si llegamos aquí, el pago fue confirmado por Stripe
      // Ahora verificamos el estado con polling
      console.log(`🔄 Iniciando verificación del estado del pago para orden ${orderId}...`);
      await checkPaymentStatus(orderId, onSuccess, onError, i18n.language);
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError(errorMessage);
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isProcessing}
            className="flex-1"
          >
            {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || !elements || loading || isProcessing}
          className={onCancel ? 'flex-1' : 'w-full'}
        >
          {loading || isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {i18n.language === 'en' ? 'Processing...' : 'Procesando...'}
            </>
          ) : (
            i18n.language === 'en' ? 'Pay now' : 'Pagar ahora'
          )}
        </Button>
      </div>
    </form>
  );
};

// Función para verificar el estado del pago con polling
const checkPaymentStatus = async (
  orderId: number,
  onSuccess: (tickets: Ticket[]) => void,
  onError: (error: string) => void,
  language: string = 'es',
  maxAttempts: number = 20,
  intervalMs: number = 2000
): Promise<void> => {
  console.log(`🔄 Iniciando verificación de pago para orden ${orderId} (máximo ${maxAttempts} intentos, intervalo ${intervalMs}ms)`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt + 1}/${maxAttempts} - Verificando estado del pago...`);
      const response = await dameTicketsAPI.getPaymentStatus(orderId);
      
      if (!response.success) {
        console.error(`❌ Error en respuesta del API:`, response.error);
        onError(response.error || (language === 'en' ? 'Could not verify payment status' : 'No se pudo verificar el estado del pago'));
        return;
      }

      if (!response.data || !response.data.order) {
        console.error(`❌ Respuesta del API sin datos de orden`);
        onError(language === 'en' ? 'Invalid response from server' : 'Respuesta inválida del servidor');
        return;
      }

      const { order } = response.data;
      console.log(`📊 Estado del pago: ${order.status}`);

      if (order.status === 'SUCCEEDED') {
        // Pago exitoso, los tickets están listos
        console.log(`✅ Pago exitoso! Tickets encontrados: ${order.tickets?.length || 0}`);
        if (order.tickets && order.tickets.length > 0) {
          onSuccess(order.tickets);
          return;
        } else {
          console.warn(`⚠️ Pago exitoso pero no hay tickets en la respuesta`);
          onError(language === 'en' 
            ? 'Payment succeeded but no tickets found. Please contact support.' 
            : 'El pago fue exitoso pero no se encontraron tickets. Por favor contacta con soporte.');
          return;
        }
      } else if (order.status === 'FAILED') {
        console.error(`❌ Pago fallido: ${order.error_message || 'Unknown error'}`);
        onError(order.error_message || (language === 'en' ? 'Payment failed' : 'El pago falló'));
        return;
      } else if (order.status === 'CANCELLED') {
        console.warn(`⚠️ Pago cancelado`);
        onError(language === 'en' ? 'Payment was cancelled' : 'El pago fue cancelado');
        return;
      } else if (order.status === 'PENDING') {
        // Continuar polling
        if (attempt < maxAttempts - 1) {
          const elapsedTime = (attempt + 1) * intervalMs / 1000;
          console.log(`⏳ Pago pendiente (${elapsedTime.toFixed(1)}s transcurridos), esperando ${intervalMs}ms antes del siguiente intento...`);
          console.log(`📋 Detalles de la orden:`, {
            order_id: order.id,
            payment_intent_id: order.stripe_payment_intent_id,
            created_at: order.created_at,
            updated_at: order.updated_at,
          });
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          continue;
        } else {
          const totalTime = maxAttempts * intervalMs / 1000;
          console.error(`❌ Tiempo de espera agotado después de ${maxAttempts} intentos (${totalTime.toFixed(1)}s)`);
          console.error(`📋 Estado final de la orden:`, {
            order_id: order.id,
            status: order.status,
            payment_intent_id: order.stripe_payment_intent_id,
            created_at: order.created_at,
            updated_at: order.updated_at,
          });
          onError(language === 'en' 
            ? `Payment verification timeout after ${totalTime.toFixed(0)} seconds. The payment may still be processing. Please check your tickets or contact support with order ID: ${order.id}` 
            : `Tiempo de espera agotado después de ${totalTime.toFixed(0)} segundos. El pago puede estar procesándose aún. Por favor verifica tus entradas o contacta con soporte con el ID de orden: ${order.id}`);
          return;
        }
      } else {
        console.warn(`⚠️ Estado desconocido: ${order.status}`);
        // Si el estado no es reconocido, continuar polling
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          continue;
        } else {
          onError(language === 'en' 
            ? 'Payment status verification timeout' 
            : 'Tiempo de espera agotado al verificar el estado del pago');
          return;
        }
      }
    } catch (error) {
      console.error(`❌ Error en intento ${attempt + 1}:`, error);
      if (attempt === maxAttempts - 1) {
        onError(error instanceof Error 
          ? error.message 
          : (language === 'en' ? 'Unknown error occurred' : 'Ocurrió un error desconocido'));
        return;
      }
      // En caso de error de red, esperar un poco más antes de reintentar
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  // Si llegamos aquí, se agotaron todos los intentos sin éxito
  console.error(`❌ Se agotaron todos los intentos sin obtener un resultado definitivo`);
  onError(language === 'en' 
    ? 'Payment verification timeout. Please check your tickets or contact support.' 
    : 'Tiempo de espera agotado. Por favor verifica tus entradas o contacta con soporte.');
};

// Componente principal
export const StripeCheckout = ({
  clientSecret,
  publishableKey,
  orderId,
  onSuccess,
  onError,
  onCancel,
}: StripeCheckoutProps) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Cargar Stripe con el publishable_key
    const loadStripeInstance = async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        setStripePromise(Promise.resolve(stripe));
      } catch (error) {
        console.error('❌ Error loading Stripe:', error);
        onError(error instanceof Error ? error.message : 'Failed to load Stripe');
      }
    };

    loadStripeInstance();
  }, [publishableKey, onError]);

  // Detectar si el usuario regresó de una redirección de Stripe
  useEffect(() => {
    const checkReturnFromRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntent = urlParams.get('payment_intent');
      const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
      const redirectStatus = urlParams.get('redirect_status');
      const paymentStatus = urlParams.get('payment_status'); // Nuestro parámetro personalizado
      const returnFromStripe = urlParams.get('return_from_stripe');
      const orderIdFromUrl = urlParams.get('order_id');

      // Verificar si viene de una redirección de Stripe
      if (paymentIntent || paymentIntentClientSecret || redirectStatus || returnFromStripe) {
        console.log('🔄 Usuario regresó de redirección de Stripe:', {
          payment_intent: paymentIntent,
          payment_intent_client_secret: paymentIntentClientSecret ? '***' + paymentIntentClientSecret.slice(-10) : null,
          redirect_status: redirectStatus,
          payment_status: paymentStatus,
          order_id_from_url: orderIdFromUrl,
          order_id_actual: orderId,
        });

        // Validar que el order_id coincida
        if (orderIdFromUrl && parseInt(orderIdFromUrl) !== orderId) {
          console.warn('⚠️ El order_id de la URL no coincide con el order_id actual');
        }

        // Limpiar los parámetros de la URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        // Manejar diferentes casos según los parámetros
        if (paymentStatus === 'canceled') {
          console.log('🚫 Usuario canceló el pago');
          if (onCancel) {
            onCancel();
          } else {
            onError(i18n.language === 'en' ? 'Payment was cancelled' : 'El pago fue cancelado');
          }
          return;
        }

        if (redirectStatus === 'succeeded' || paymentStatus === 'success') {
          console.log('✅ Redirección exitosa, verificando estado del pago...');
          await checkPaymentStatus(orderId, onSuccess, onError, i18n.language);
        } else if (redirectStatus === 'failed') {
          console.error('❌ Redirección fallida');
          onError(i18n.language === 'en' ? 'Payment failed during redirect' : 'El pago falló durante la redirección');
        } else {
          // Si no hay estado claro, verificar de todas formas
          console.log('⚠️ Estado de redirección desconocido, verificando estado del pago...');
          await checkPaymentStatus(orderId, onSuccess, onError, i18n.language);
        }
      }
    };

    checkReturnFromRedirect();
  }, [orderId, onSuccess, onError, onCancel, i18n.language]);

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{i18n.language === 'en' ? 'Loading payment form...' : 'Cargando formulario de pago...'}</span>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
    locale: i18n.language === 'en' ? 'en' : 'es',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm orderId={orderId} onSuccess={onSuccess} onError={onError} onCancel={onCancel} />
    </Elements>
  );
};

