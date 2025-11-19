import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@api/auth";
import type { ApiUser } from "@types/auth";
import type { DameProfile } from "@/integrations/dame-api/types";

interface AuthResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: DameProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Helper para convertir user de API a DameProfile
const convertApiUserToProfile = (apiUser?: ApiUser | null): DameProfile | null => {
  if (!apiUser) return null;
  
  return {
    id: apiUser.id.toString(),
    user_type: "participant", // Default, puede actualizarse desde API si está disponible
    full_name: apiUser.full_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
    email: apiUser.email,
    bio: "",
    avatar_url: "",
    cover_url: "",
    location: "",
    projects: [],
    skills: [],
    interests: [],
    languages: [],
    experience_level: "beginner",
    phone: "",
    instagram: "",
    notifications_enabled: true,
    public_profile: true,
    verified: false,
    active: apiUser.status === "ACTIVE",
    member_since: apiUser.date_joined.split('T')[0],
    created_at: apiUser.date_joined,
    updated_at: apiUser.date_joined
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DameProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay tokens guardados al inicializar
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('dame_access_token');
      const refreshToken = localStorage.getItem('dame_refresh_token');
      
      if (accessToken && refreshToken) {
        // Intentar obtener el usuario actual usando el token
        try {
          const result = await authApi.me(accessToken);

          if (result.ok && result.data?.user) {
            const profile = convertApiUserToProfile(result.data.user);
            if (profile) {
              setUser(profile);
            }
          } else {
            // Token inválido, limpiar
            localStorage.removeItem('dame_access_token');
            localStorage.removeItem('dame_refresh_token');
          }
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          localStorage.removeItem('dame_access_token');
          localStorage.removeItem('dame_refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Función para refrescar usuario desde la API
  const refreshUser = async () => {
    const accessToken = localStorage.getItem('dame_access_token');
    if (!accessToken) {
      setUser(null);
      return;
    }

    try {
      const result = await authApi.me(accessToken);

      if (result.ok && result.data?.user) {
        const profile = convertApiUserToProfile(result.data.user);
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
        localStorage.removeItem('dame_access_token');
        localStorage.removeItem('dame_refresh_token');
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      setUser(null);
    }
  };

  // Función de login real con la API
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Usar email como username (según la especificación)
      const username = email;

      // Llamar a la API de login
      const response = await authApi.login({
        username,
        password,
      });

      if (!response.ok || !response.data?.tokens || !response.data.user) {
        const errorMessage = response.error
          || response.data?.message
          || 'Error al iniciar sesión';
        return { success: false, error: errorMessage };
      }

      if (response.data.tokens && response.data.user) {
        // Guardar tokens
        localStorage.setItem('dame_refresh_token', response.data.tokens.refresh);
        localStorage.setItem('dame_access_token', response.data.tokens.access);

        // Actualizar el usuario
        const profile = convertApiUserToProfile(response.data.user);
        if (profile) {
          setUser(profile);
        }

        return { success: true };
      }

      return { 
        success: false, 
        error: response.error || 'Error desconocido al iniciar sesión' 
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión. Intenta nuevamente' 
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      setLoading(true);

      const response = await authApi.loginWithGoogle({
        id_token: idToken,
      });

      if (!response.ok || !response.data?.tokens || !response.data.user) {
        const errorMessage = response.error
          || response.data?.message
          || 'No se pudo iniciar sesión con Google';
        return { success: false, error: errorMessage };
      }

      if (response.data.tokens?.access && response.data.tokens?.refresh && response.data.user) {
        localStorage.setItem('dame_refresh_token', response.data.tokens.refresh);
        localStorage.setItem('dame_access_token', response.data.tokens.access);

        const profile = convertApiUserToProfile(response.data.user);
        if (profile) {
          setUser(profile);
        }

        return { success: true, isNewUser: Boolean(response.data.is_new_user) };
      }

      return { success: false, error: 'Respuesta inválida desde el servidor' };
    } catch (error) {
      console.error('Error en login con Google:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión. Intenta nuevamente',
      };
    } finally {
      setLoading(false);
    }
  };

  // Función de registro real con la API
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);

      // Validar que las contraseñas coincidan
      if (data.password !== data.password_confirm) {
        return { 
          success: false, 
          error: 'Las contraseñas no coinciden' 
        };
      }

      // Generar username copiando el email
      const username = data.email;

      // Preparar el request según la API
      const requestData = {
        username,
        email: data.email,
        first_name: "",
        last_name: "",
        password: data.password,
        password_confirm: data.password_confirm,
      };

      // Llamar a la API
      const response = await authApi.register(requestData);

      if (!response.ok || !response.data?.tokens) {
        // Manejar diferentes tipos de errores
        const errorMessage = response.error || 'Error al registrar usuario';
        return { success: false, error: errorMessage };
      }

      // Verificar que la respuesta tenga el formato esperado
      if (response.data.tokens) {
        // Guardar tokens
        localStorage.setItem('dame_refresh_token', response.data.tokens.refresh);
        localStorage.setItem('dame_access_token', response.data.tokens.access);

        // Actualizar el usuario
        if (response.data.user) {
          const profile = convertApiUserToProfile(response.data.user);
          if (profile) {
            setUser(profile);
          }
        }

        return { success: true };
      }

      return { 
        success: false, 
        error: response.error || response.data?.message || 'Error desconocido al registrar usuario' 
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión. Intenta nuevamente' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout real
  const logout = async () => {
    // Limpiar tokens
    localStorage.removeItem('dame_access_token');
    localStorage.removeItem('dame_refresh_token');
    
    // Limpiar usuario
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithGoogle,
      register, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
