import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AppLayout from "./AppLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const ProtectedRoute = ({ children, hideSidebar = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout hideSidebar={hideSidebar}>{children}</AppLayout>;
};

export default ProtectedRoute;
