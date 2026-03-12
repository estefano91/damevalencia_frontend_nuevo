import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches React errors so the app shows a friendly message instead of a blank screen.
 * Especially helpful on mobile browsers where JS errors can leave the page blank.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-background">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" aria-hidden />
          <h1 className="text-xl font-semibold mb-2">
            Algo ha ido mal
          </h1>
          <p className="text-muted-foreground max-w-md mb-6">
            Si acabas de intentar comprar entradas, no te preocupes: revisa la sección{' '}
            <strong>Mis entradas</strong> o tu correo. Si el problema continúa, contacta con nosotros.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={this.handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Volver a intentar
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
