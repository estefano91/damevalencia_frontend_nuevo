import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "./AppLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
  requireAuth?: boolean;
}

const ProtectedRoute = ({
  children,
  hideSidebar = false,
  requireAuth = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (requireAuth) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return (
        <Navigate
          to="/auth"
          state={{ from: location.pathname + location.search }}
          replace
        />
      );
    }
  }

  return <AppLayout hideSidebar={hideSidebar}>{children}</AppLayout>;
};

export default ProtectedRoute;
