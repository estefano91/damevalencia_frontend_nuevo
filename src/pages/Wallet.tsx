import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { walletApi, type WalletTransaction } from '@/api/wallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  History,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [googleWalletLoading, setGoogleWalletLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const balance = user?.member?.wallet?.balance ?? '0';
  const hasWallet = Boolean(user?.member?.wallet);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!hasWallet) {
      navigate('/afiliarse');
      return;
    }
  }, [user, hasWallet, navigate]);

  useEffect(() => {
    if (!hasWallet) return;

    const fetchHistory = async (page?: number) => {
      if (page && page > 1) setLoadingPage(true);
      else setLoading(true);
      setError(null);

      const result = await walletApi.getHistory(page);

      if (result.ok && result.data) {
        setTransactions(result.data.results);
        setNextUrl(result.data.next);
        setPrevUrl(result.data.previous);
        setCount(result.data.count);
      } else {
        setError(result.error || (i18n.language === 'en' ? 'Error loading history' : 'Error al cargar historial'));
      }
      setLoading(false);
      setLoadingPage(false);
    };

    fetchHistory(currentPage);
  }, [hasWallet, currentPage, i18n.language]);

  const handlePrev = () => {
    if (prevUrl && currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNext = () => {
    if (nextUrl) setCurrentPage((p) => p + 1);
  };

  const handleAddToGoogleWallet = async () => {
    setGoogleWalletLoading(true);
    const result = await walletApi.createGoogleWallet();
    setGoogleWalletLoading(false);
    if (result.ok && result.data?.save_url) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        // iOS: misma pestaña para evitar ventana en blanco; el usuario puede volver atrás
        window.location.href = result.data.save_url;
      } else {
        window.open(result.data.save_url, '_blank', 'noopener,noreferrer');
      }
    } else if (!result.ok) {
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: result.error || (i18n.language === 'en' ? 'Could not create Google Wallet card' : 'No se pudo crear la tarjeta en Google Wallet'),
        variant: 'destructive',
      });
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || !hasWallet) {
    return null;
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-950/30 dark:to-amber-900/20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-40 w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-950/30 dark:to-amber-900/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {i18n.language === 'en' ? 'Back' : 'Volver'}
        </Button>

        {/* Hero: balance */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 p-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Coins className="h-12 w-12 text-white drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-bold text-white/95 tracking-tight mb-1">
              DameCoins
            </h1>
            <p className="text-white/80 text-sm mb-4">
              {i18n.language === 'en'
                ? 'Your reward balance'
                : 'Tu saldo de recompensas'}
            </p>
            <p className="text-5xl sm:text-6xl font-bold text-white tabular-nums drop-shadow-sm">
              {parseFloat(balance).toFixed(0)}
            </p>
            <p className="text-white/70 text-sm mt-2">
              {i18n.language === 'en' ? 'coins' : 'monedas'}
            </p>
          </div>
        </div>

        {/* Google Wallet - tarjeta de fidelización */}
        <Card className="mb-8 border-amber-200/60 dark:border-amber-800/40">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-foreground flex items-center gap-2">
                <img src="/googlewallet.png" alt="" className="h-6 w-auto object-contain" />
                {i18n.language === 'en' ? 'Google Wallet' : 'Google Wallet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {i18n.language === 'en'
                  ? 'Add your DAME loyalty card to Google Wallet.'
                  : 'Añade tu tarjeta de fidelización DAME a Google Wallet.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-12 px-4 rounded-full border-2 border-[#5f6368] bg-[#202124] hover:bg-[#303134] text-white hover:text-white border-gray-500 dark:border-gray-600 shrink-0"
              onClick={handleAddToGoogleWallet}
              disabled={googleWalletLoading}
            >
              {googleWalletLoading ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin shrink-0" />
              ) : (
                <img
                  src="/googlewallet.png"
                  alt="Google Wallet"
                  className="h-8 w-auto max-w-[120px] object-contain shrink-0"
                />
              )}
              <span className="ml-3 text-left font-medium whitespace-nowrap">
                {i18n.language === 'en' ? 'Add to Google Wallet' : 'Añadir a Google Wallet'}
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Historial */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold">
              {i18n.language === 'en' ? 'Transaction history' : 'Historial de transacciones'}
            </h2>
            {count > 0 && (
              <span className="text-sm text-muted-foreground">
                ({count} {i18n.language === 'en' ? 'total' : 'total'})
              </span>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingPage && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((t) => (
                <Skeleton key={t.id} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <Card className="border-amber-200/60 dark:border-amber-800/40">
              <CardContent className="py-12 text-center">
                <Coins className="h-12 w-12 mx-auto text-amber-400/60 dark:text-amber-500/60 mb-4" />
                <p className="text-muted-foreground font-medium mb-1">
                  {i18n.language === 'en'
                    ? 'No transactions yet'
                    : 'Aún no hay transacciones'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'en'
                    ? 'Your DameCoins activity will appear here'
                    : 'Tu actividad de DameCoins aparecerá aquí'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isAdd = tx.transaction_type === 'ADD';
                const amount = parseFloat(tx.amount);
                return (
                  <Card
                    key={tx.id}
                    className="overflow-hidden border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isAdd
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isAdd ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <ShoppingBag className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {tx.reason || tx.transaction_type_display}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                      <span
                        className={`text-lg font-semibold tabular-nums shrink-0 ${
                          isAdd
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isAdd ? '+' : '-'}{amount.toFixed(0)}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {(nextUrl || prevUrl) && transactions.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={!prevUrl}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {i18n.language === 'en' ? 'Previous' : 'Anterior'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {i18n.language === 'en' ? 'Page' : 'Página'} {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!nextUrl}
                className="gap-1"
              >
                {i18n.language === 'en' ? 'Next' : 'Siguiente'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
