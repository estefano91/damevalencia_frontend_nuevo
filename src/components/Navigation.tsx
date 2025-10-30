import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  User, 
  MessageSquare,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
// Logos DAME para light y dark mode
import logoDameLight from "@/assets/1.png";
import logoDameDark from "@/assets/2.png";

interface NavigationProps {
  isMobile: boolean;
}

const Navigation = ({ isMobile }: NavigationProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-card fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {/* Logo DAME - Más grande y centrado */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 ml-4"
              onClick={() => navigate("/demo")}
            >
              <img 
                src={theme === 'dark' ? logoDameDark : logoDameLight}
                alt="DAME Logo"
                className="h-14 w-auto sm:h-16 md:h-20 lg:h-24 transition-all duration-300"
                style={{ 
                  filter: theme === 'dark' ? 'brightness(1.1)' : 'brightness(1)',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          {/* Center - Navigation Menu - Visible on all screens */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Inicio */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/demo")}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              title={i18n.language === 'en' ? 'Home' : 'Inicio'}
              aria-label={i18n.language === 'en' ? 'Home' : 'Inicio'}
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:inline">{i18n.language === 'en' ? 'Home' : 'Inicio'}</span>
            </Button>

            {/* Comunidad */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/comunidad")}
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              title={i18n.language === 'en' ? 'Community' : 'Comunidad'}
              aria-label={i18n.language === 'en' ? 'Community' : 'Comunidad'}
            >
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">{i18n.language === 'en' ? 'Community' : 'Comunidad'}</span>
            </Button>
          </div>

          {/* Right side - Theme + Language + Mi Perfil */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Mi Perfil - Dropdown - Movido a la derecha */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{i18n.language === 'en' ? 'My Profile' : 'Mi Perfil'}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.full_name}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate("/perfil")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'View my profile' : 'Ver mi perfil'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/mensajes")}
                  className="cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Messages' : 'Mensajes'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/notificaciones")}
                  className="cursor-pointer"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Notifications' : 'Notificaciones'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/configuracion")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Settings' : 'Configuración'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Log out' : 'Cerrar sesión'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;