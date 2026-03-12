import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, XCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dameTicketsAPI } from '@/integrations/dame-api/tickets';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 25;

/**
 * Handles return from Stripe redirect (e.g. 3D Secure) when the user lands
 * with return_from_stripe and order_id in the URL. The purchase modal is no longer
 * open, so we verify payment here and show success/failure.
 */
export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const orderIdParam = searchParams.get('order_id');
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;
  const paymentStatus = searchParams.get('payment_status');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled' | 'timeout'>('loading');
  const [message, setMessage] = useState<string>('');
  const [ticketsCount, setTicketsCount] = useState<number>(0);

  useEffect(() => {
    if (!orderIdParam || !orderId || Number.isNaN(orderId)) {
      setStatus('failed');
      setMessage(i18n.language === 'en' ? 'Invalid return URL' : 'URL de retorno no válida');
      return;
    }

    if (paymentStatus === 'canceled') {
      setStatus('cancelled');
      setMessage(i18n.language === 'en' ? 'Payment was cancelled' : 'El pago fue cancelado');
      return;
    }

    let cancelled = false;
    const language = i18n.language === 'en' ? 'en' : 'es';

    const poll = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const response = await dameTicketsAPI.getPaymentStatus(orderId);
          if (cancelled) return;

          if (!response.success || !response.data?.order) {
            setStatus('failed');
            setMessage(response.error || (language === 'en' ? 'Could not verify payment' : 'No se pudo verificar el pago'));
            return;
          }

          const { order } = response.data;
          if (order.status === 'SUCCEEDED') {
            setTicketsCount(order.tickets?.length ?? 0);
            setStatus('success');
            return;
          }
          if (order.status === 'FAILED') {
            setStatus('failed');
            setMessage(order.error_message || (language === 'en' ? 'Payment failed' : 'El pago falló'));
            return;
          }
          if (order.status === 'CANCELLED') {
            setStatus('cancelled');
            setMessage(language === 'en' ? 'Payment was cancelled' : 'El pago fue cancelado');
            return;
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        } catch (err) {
          if (cancelled) return;
          console.error('Payment status poll error:', err);
          setStatus('failed');
          setMessage(language === 'en' ? 'Connection error. Please check My Tickets or try again.' : 'Error de conexión. Revisa Mis entradas o inténtalo de nuevo.');
          return;
        }
      }

      if (!cancelled) {
        setStatus('timeout');
        setMessage(language === 'en'
          ? 'Verification is taking longer than usual. Please check My Tickets or contact support.'
          : 'La verificación está tardando más de lo habitual. Revisa Mis entradas o contacta con soporte.');
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [orderIdParam, orderId, paymentStatus, i18n.language]);

  // Clean URL so refreshing doesn't re-trigger
  useEffect(() => {
    if (orderIdParam && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [orderIdParam]);

  const isEn = i18n.language === 'en';

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold mb-2">
          {isEn ? 'Verifying your payment...' : 'Verificando tu pago...'}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {isEn ? 'Please wait. Do not close this page.' : 'Por favor espera. No cierres esta página.'}
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">
          {isEn ? 'Payment successful' : '¡Pago realizado!'}
        </h1>
        <p className="text-muted-foreground max-w-md mb-6">
          {isEn
            ? `You have ${ticketsCount} ticket${ticketsCount !== 1 ? 's' : ''}. You can view them in My Tickets.`
            : `Tienes ${ticketsCount} entrada${ticketsCount !== 1 ? 's' : ''}. Puedes verlas en Mis entradas.`}
        </p>
        <Button onClick={() => navigate('/mis-entradas')} className="gap-2">
          <Ticket className="h-4 w-4" />
          {isEn ? 'View my tickets' : 'Ver mis entradas'}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <XCircle className="h-14 w-14 text-destructive mb-4" />
      <h1 className="text-xl font-semibold mb-2">
        {status === 'cancelled'
          ? (isEn ? 'Payment cancelled' : 'Pago cancelado')
          : (isEn ? 'Something went wrong' : 'Algo ha ido mal')}
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {isEn ? 'If you were charged, check My Tickets or contact support.' : 'Si se te ha cobrado, revisa Mis entradas o contacta con soporte.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => navigate('/mis-entradas')} variant="outline">
          {isEn ? 'My tickets' : 'Mis entradas'}
        </Button>
        <Button onClick={() => navigate('/')}>{isEn ? 'Go home' : 'Ir al inicio'}</Button>
      </div>
    </div>
  );
}
