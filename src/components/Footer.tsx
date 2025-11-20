import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isEnglish ? 'Privacy Policy' : 'Política de Privacidad'}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isEnglish ? 'Terms of Service' : 'Términos y Condiciones'}
            </Link>
            <Link
              to="/cookies"
              className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isEnglish ? 'Cookie Policy' : 'Política de Cookies'}
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} DAME Valencia. {isEnglish ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isEnglish 
              ? 'DAME Valencia - Association for Diversity and Cultural Integration'
              : 'DAME Valencia - Asociación de Diversidad e Integración Cultural'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


