import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, User, LogOut, Star, Menu, X, Heart, Palette, Music, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Navigation = ({ sidebarOpen, setSidebarOpen, isMobile }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Sesión cerrada exitosamente 👋" });
    navigate("/");
  };

  const getUserTypeIcon = () => {
    if (!user) return <User className="h-5 w-5" />;
    
    switch (user.user_type) {
      case 'instructor': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'artist': return <Palette className="h-5 w-5 text-purple-500" />;
      case 'coordinator': return <Users className="h-5 w-5 text-blue-500" />;
      case 'volunteer': return <Heart className="h-5 w-5 text-red-500" />;
      case 'sponsor': return <Star className="h-5 w-5 text-green-500" />;
      default: return <Music className="h-5 w-5 text-pink-500" />;
    }
  };

  const getUserTypeLabel = () => {
    if (!user) return 'Usuario';
    
    switch (user.user_type) {
      case 'participant': return '🎭 Participante';
      case 'instructor': return '👨‍🏫 Instructor/a';
      case 'artist': return '🎨 Artista';
      case 'volunteer': return '🤝 Voluntario/a';
      case 'coordinator': return '📋 Coordinador/a';
      case 'sponsor': return '💼 Patrocinador/a';
      default: return user.user_type;
    }
  };

  return (
    <nav className="border-b bg-card fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left side - Menu button (mobile) + Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Menu Toggle - Visible en todos los tamaños */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 border-2 transition-all duration-200 ${
                sidebarOpen 
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              title={sidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-purple-600" />
              ) : (
                <Menu className="h-5 w-5 text-purple-600" />
              )}
            </Button>
            
            {/* Logo DAME */}
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/demo")}
            >
              <div className="flex space-x-1">
                <Palette className="h-8 w-8 text-purple-600" />
                <Music className="h-8 w-8 text-pink-600" />
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                DAME Valencia
              </span>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Navigation Links for Desktop */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/demo")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Inicio
                </Button>
              </div>
            )}

            {/* WhatsApp Contact Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://wa.me/34658236665?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20DAME%20Valencia', '_blank')}
              className="flex items-center gap-2 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              title="Contactar por WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">WhatsApp</span>
            </Button>

            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
                    {getUserTypeIcon()}
                    <span className="hidden sm:inline">{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{getUserTypeLabel()}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate("/demo")}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate("/demo")}>
                    <Users className="mr-2 h-4 w-4" />
                    Comunidad
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate("/demo")}>
                    <Star className="mr-2 h-4 w-4" />
                    Proyectos DAME
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate("/demo")}>
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Logout Button */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Salir</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;