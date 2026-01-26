import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Función para determinar el tema basado en la hora del día
const getThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  // Día: 6 AM - 8 PM (6-20) → tema claro
  // Noche: 8 PM - 6 AM (20-6) → tema oscuro
  return hour >= 6 && hour < 20 ? 'light' : 'dark';
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // Verificar si el usuario ha guardado una preferencia manual
      const stored = localStorage.getItem('theme');
      const hasManualPreference = localStorage.getItem('theme_manual') === 'true';
      
      // Si hay una preferencia manual, respetarla
      if (hasManualPreference && (stored === 'dark' || stored === 'light')) {
        return stored;
      }
      
      // Si no hay preferencia manual, usar la hora del día
      return getThemeByTime();
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Solo guardar en localStorage si es una preferencia manual
    const hasManualPreference = localStorage.getItem('theme_manual') === 'true';
    if (hasManualPreference) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Actualizar el tema automáticamente cuando cambia la hora del día
  useEffect(() => {
    // Función para verificar si hay preferencia manual
    const checkManualPreference = () => {
      return localStorage.getItem('theme_manual') === 'true';
    };

    // Función para actualizar el tema según la hora
    const updateThemeByTime = () => {
      // Verificar si hay preferencia manual antes de actualizar
      if (checkManualPreference()) {
        return;
      }
      const timeBasedTheme = getThemeByTime();
      setTheme(timeBasedTheme);
    };

    // Actualizar inmediatamente si no hay preferencia manual
    if (!checkManualPreference()) {
      updateThemeByTime();
    }

    // Calcular cuánto tiempo falta hasta el próximo cambio (6 AM o 8 PM)
    const calculateNextChange = () => {
      const now = new Date();
      const currentHour = now.getHours();
      let nextChangeHour: number;
      
      if (currentHour < 6) {
        // Es de noche, próximo cambio a las 6 AM
        nextChangeHour = 6;
      } else if (currentHour < 20) {
        // Es de día, próximo cambio a las 8 PM
        nextChangeHour = 20;
      } else {
        // Es de noche, próximo cambio a las 6 AM del día siguiente
        nextChangeHour = 6;
      }

      const nextChange = new Date();
      nextChange.setHours(nextChangeHour, 0, 0, 0);
      
      // Si el próximo cambio es al día siguiente
      if (nextChange <= now) {
        nextChange.setDate(nextChange.getDate() + 1);
      }

      return nextChange.getTime() - now.getTime();
    };

    // Configurar intervalo para verificar cada minuto y actualizar si es necesario
    const intervalId = setInterval(() => {
      // Solo actualizar si no hay preferencia manual
      if (!checkManualPreference()) {
        updateThemeByTime();
      }
    }, 60 * 1000); // Cada minuto

    // Programar actualización para el próximo cambio exacto
    const msUntilNextChange = calculateNextChange();
    const timeoutId = setTimeout(() => {
      updateThemeByTime();
    }, msUntilNextChange);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const toggleTheme = () => {
    // Cuando el usuario cambia manualmente, marcar como preferencia manual
    localStorage.setItem('theme_manual', 'true');
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


