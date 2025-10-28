import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Zap,
  MessageSquare,
  Users,
  Calendar,
  Crown,
  Rss,
} from "lucide-react";

const navigation = [
  {
    name: "Feed",
    icon: Rss,
    path: "/feed",
    section: "main",
  },
  {
    name: "Discover",
    icon: Home,
    path: "/discover",
    section: "discover",
  },
  {
    name: "Events",
    icon: Calendar,
    path: "/events",
    section: "social",
  },
  {
    name: "Premium",
    icon: Crown,
    path: "/premium",
    section: "other",
  },
];

interface SidebarProps {
  userType: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Sidebar = ({ userType, sidebarOpen, setSidebarOpen, isMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const sections = [
    {
      title: "Main",
      items: navigation.filter((item) => item.section === "main"),
    },
    {
      title: "Discover",
      items: navigation.filter((item) => item.section === "discover"),
    },
    {
      title: "Social",
      items: navigation.filter((item) => item.section === "social"),
    },
    {
      title: "Others",
      items: navigation.filter((item) => item.section === "other"),
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar after navigation on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside 
      className={cn(
        "w-64 border-r bg-card h-screen fixed left-0 z-40 overflow-y-auto transition-transform duration-300",
        // Position after header for all screen sizes
        "top-16 sm:top-20 md:top-28",
        // Desktop: always visible
        "md:translate-x-0",
        // Mobile: slide from left, controlled by state  
        isMobile ? (
          sidebarOpen 
            ? "translate-x-0" 
            : "-translate-x-full"
        ) : "translate-x-0"
      )}
    >
      <nav className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 sm:mb-3 px-2 sm:px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive && "text-primary-foreground")} />
                    <span className="text-xs sm:text-sm">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

