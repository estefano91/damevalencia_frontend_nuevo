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
  // Usuario de demostración automático para desarrollo
  const demoUser: DameProfile = {
    id: "demo-user-123",
    user_type: "participant",
    full_name: "Usuario Demo DAME",
    email: "demo@damevalencia.es",
    bio: "Usuario de demostración para desarrollo del frontend de DAME Valencia",
    avatar_url: "",
    cover_url: "",
    location: "Valencia, España",
    projects: ["casino", "bachata", "fit", "arte"],
    skills: ["baile", "música", "arte", "fotografía"],
    interests: ["cultura", "arte", "música", "danza", "comunidad"],
    languages: ["español", "inglés"],
    experience_level: "intermediate",
    phone: "+34 644 070 282",
    instagram: "@dame.valencia",
    notifications_enabled: true,
    public_profile: true,
    verified: true,
    active: true,
    member_since: "2023-01-01",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-10-28T22:00:00Z"
  };

  const [user, setUser] = useState<DameProfile | null>(demoUser); // Usuario demo por defecto
  const [loading, setLoading] = useState(false); // Sin loading para desarrollo

  // Función simplificada para desarrollo - no hace llamadas reales
  const refreshUser = async () => {
    // En modo desarrollo, siempre mantener usuario demo
    setUser(demoUser);
  };

  // Función de login simulada
  const login = async (email: string, password: string) => {
    // Simular login exitoso
    setUser(demoUser);
    return { success: true };
  };

  // Función de registro simulada
  const register = async (data: RegisterData) => {
    // Crear usuario demo basado en los datos del formulario
    const newDemoUser = {
      ...demoUser,
      full_name: data.full_name,
      email: data.email,
      user_type: data.user_type
    };
    setUser(newDemoUser);
    return { success: true };
  };

  // Función de logout simulada
  const logout = async () => {
    // En modo desarrollo, mantener usuario para facilitar desarrollo
    // setUser(null); // Comentado para desarrollo
    console.log('Logout simulado - usuario mantenido para desarrollo');
  };

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
