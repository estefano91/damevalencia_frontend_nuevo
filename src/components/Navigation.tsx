import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, User, LogOut, Star, LayoutDashboard, Search, Zap, Building2, Award, Eye, MessageSquare, Rss, Calendar, Crown, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
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
import { useTheme } from "@/providers/ThemeProvider";
import logoLight from "@/assets/1.png";
import logoDark from "@/assets/2.png";

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Navigation = ({ sidebarOpen, setSidebarOpen, isMobile }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isReferrer, setIsReferrer] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [simulatedType, setSimulatedType] = useState<string | null>(null);
  
  // Select logo based on theme
  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  // Load simulated type from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('simulated_user_type');
    if (stored) {
      setSimulatedType(stored);
    }
  }, []);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('is_referrer, user_type')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setIsReferrer(data.is_referrer || false);
        // Use simulated type if set, otherwise use real type
        setUserType(simulatedType || data.user_type);
      }
    };

    checkUserProfile();
  }, [user, simulatedType]);

  const handleSimulateType = (type: string) => {
    if (type === 'real') {
      setSimulatedType(null);
      localStorage.removeItem('simulated_user_type');
      toast({
        title: "Simulation disabled",
        description: "Showing your real user type",
      });
    } else {
      setSimulatedType(type);
      localStorage.setItem('simulated_user_type', type);
      toast({
        title: "Simulating user type",
        description: `Showing navigation as: ${type}`,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  // Navigation items moved to Sidebar, only keeping essential items in top nav

  return (
    <nav className="border-b bg-card fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-28">
          {/* Left side - Menu button (mobile) + Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu (mobile only) */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
            
            {/* Logo - responsive sizes */}
            <img 
              src={currentLogo} 
              alt="Aura" 
              className="h-12 sm:h-16 md:h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/feed")}
            />
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Language Selector - always visible but compact on small screens */}
            <LanguageSelector />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Simulation Dropdown - simplified on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs p-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1">
                    {simulatedType ? `Sim: ${simulatedType}` : 'View as'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>View navigation as:</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSimulateType('real')}>
                  <User className="mr-2 h-4 w-4" />
                  Real User Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSimulateType('player')}>
                  <Award className="mr-2 h-4 w-4" />
                  Player
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulateType('coach')}>
                  <Users className="mr-2 h-4 w-4" />
                  Coach
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulateType('club')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Club
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulateType('agent')}>
                  <User className="mr-2 h-4 w-4" />
                  Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulateType('sponsor')}>
                  <Star className="mr-2 h-4 w-4" />
                  Sponsor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulateType('investor')}>
                  <Users className="mr-2 h-4 w-4" />
                  Investor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/connections")}>
                  <Users className="mr-2 h-4 w-4" />
                  Followers & Following
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Type-specific items */}
                {userType === 'club' && (
                  <DropdownMenuItem onClick={() => navigate("/club/referrals")}>
                    <Building2 className="mr-2 h-4 w-4" />
                    My Referrals
                  </DropdownMenuItem>
                )}
                
                {userType === 'player' && (
                  <DropdownMenuItem onClick={() => navigate("/player/referrals")}>
                    <Award className="mr-2 h-4 w-4" />
                    My Contracts
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {/* Referrer section */}
                {isReferrer ? (
                  <DropdownMenuItem onClick={() => navigate("/referrer/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-yellow-500" />
                    Referrer Dashboard
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/referrer")}>
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    Become a Referrer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 p-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
