import { createContext, useContext, useEffect, useState } from "react";
import { dameApi } from "@/integrations/dame-api/client";
import type { DameProfile } from "@/integrations/dame-api/types";

interface AuthContextType {
  user: DameProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  user_type: 'participant' | 'instructor' | 'artist' | 'volunteer' | 'coordinator' | 'sponsor';
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DameProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el usuario actual
  const refreshUser = async () => {
    if (!dameApi.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await dameApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token inválido o usuario no encontrado
        setUser(null);
        await dameApi.logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      await dameApi.logout();
    } finally {
      setLoading(false);
    }
  };

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      const response = await dameApi.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Error de inicio de sesión' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  };

  // Función de registro
  const register = async (data: RegisterData) => {
    try {
      const response = await dameApi.register(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Error en el registro' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  };

  // Función de logout
  const logout = async () => {
    await dameApi.logout();
    setUser(null);
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    refreshUser();
  }, []);

  // Auto-refresh del token cada 30 minutos si el usuario está logueado
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await refreshUser();
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
