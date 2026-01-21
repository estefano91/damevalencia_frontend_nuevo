import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users,
  User,
  LogOut,
  Settings,
  Edit2,
  LogIn,
  Plus,
  IdCard,
  Ticket,
  Tag,
  Moon,
  Sun,
  Globe,
  Crown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Logos DAME para light y dark mode
import logoDameLight from "@/assets/1.png";
import logoDameDark from "@/assets/2.png";

interface NavigationProps {
  isMobile: boolean;
}

const Navigation = ({ isMobile }: NavigationProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const isEnglish = i18n.language === 'en' || i18n.language?.startsWith('en');
  const currentLang = isEnglish ? { code: 'en', name: 'English', flag: '🇬🇧' } : { code: 'es', name: 'Español', flag: '🇪🇸' };
  const nextLang = isEnglish ? { code: 'es', name: 'Español', flag: '🇪🇸' } : { code: 'en', name: 'English', flag: '🇬🇧' };

  const toggleLanguage = () => {
    i18n.changeLanguage(nextLang.code);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-card fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {/* Logo DAME - Más grande y centrado */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 ml-4"
              onClick={() => navigate("/")}
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
              onClick={() => navigate("/")}
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

            {/* Club DAME */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/club-dame")}
              className="flex items-center gap-2"
              title={i18n.language === 'en' ? 'DAME Club' : 'Club DAME'}
              aria-label={i18n.language === 'en' ? 'DAME Club' : 'Club DAME'}
            >
              <Crown className="h-4 w-4" />
              <span className="hidden lg:inline">{i18n.language === 'en' ? 'DAME Club' : 'Club DAME'}</span>
            </Button>
          </div>

          {/* Right side - Configuración + Profile */}
          <div className="flex items-center space-x-2">
            {/* Botón Configuración */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  title={i18n.language === 'en' ? 'Settings' : 'Configuración'}
                  aria-label={i18n.language === 'en' ? 'Settings' : 'Configuración'}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{i18n.language === 'en' ? 'Settings' : 'Configuración'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'Light Mode' : 'Modo Claro'}
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'Dark Mode' : 'Modo Oscuro'}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleLanguage}>
                  <Globe className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'Language' : 'Idioma'}: {nextLang.flag} {nextLang.name}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mi Perfil / Invitado */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.full_name || user.email || "User"} />
                      ) : null}
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.full_name || user.email || "User"} />
                      ) : null}
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'Profile' : 'Mi Perfil'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/mis-entradas")}>
                    <Ticket className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'My Tickets' : 'Mis Entradas'}
                  </DropdownMenuItem>
                  {user.member && (
                    <DropdownMenuItem onClick={() => navigate("/club-dame")}>
                      <Tag className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'My Promotions' : 'Mis Promociones'}
                    </DropdownMenuItem>
                  )}
                  {!user.member && (
                    <DropdownMenuItem 
                      onClick={() => navigate("/afiliarse")}
                      className="bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600 focus:text-white cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'Become DAME Member' : 'Hazte Miembro DAME'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'Logout' : 'Cerrar Sesión'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 rounded-full"
                    aria-label={i18n.language === 'en' ? 'Sign in' : 'Iniciar sesión'}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-foreground flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-foreground flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {i18n.language === 'en' ? 'Guest user' : 'Usuario anónimo'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i18n.language === 'en'
                          ? 'Sign in to access your profile'
                          : 'Inicia sesión para acceder a tu perfil'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/auth")}
                    className="text-purple-600 focus:text-purple-600"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {i18n.language === 'en' ? 'Log in' : 'Iniciar sesión'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;