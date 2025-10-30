import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const isEnglish = i18n.language === 'en' || i18n.language?.startsWith('en');
  const current = isEnglish ? { code: 'en', name: 'English', flag: '🇬🇧' } : { code: 'es', name: 'Español', flag: '🇪🇸' };
  const next = isEnglish ? { code: 'es', name: 'Español', flag: '🇪🇸' } : { code: 'en', name: 'English', flag: '🇬🇧' };

  const toggleLanguage = () => {
    i18n.changeLanguage(next.code);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={toggleLanguage}
      title={`Switch to ${next.name}`}
      aria-label={`Switch language to ${next.name}`}
    >
      <Globe className="h-4 w-4" />
      {/* Mostrar abreviatura del idioma destino en todas las pantallas */}
      <span className="text-xs font-semibold tracking-wide">{next.code.toUpperCase()}</span>
      <span className="sr-only">{next.flag} {next.name}</span>
    </Button>
  );
};

export default LanguageSelector;


