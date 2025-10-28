import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AppLayout from "./AppLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // En modo desarrollo, no mostrar loading y siempre permitir acceso
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // En modo desarrollo, siempre renderizar el contenido
  // if (!user) {
  //   return <Navigate to="/auth" replace />;
  // }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
