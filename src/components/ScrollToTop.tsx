import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que hace scroll al inicio de la página cuando cambia la ruta
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Hacer scroll al inicio cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

