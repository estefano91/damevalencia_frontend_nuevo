import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  User,
} from "lucide-react";

interface SidebarProps {
  userType?: string | null;
}

const Sidebar = ({ userType }: SidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "inicio",
      icon: Home,
      label: "Inicio",
      path: "/demo",
      color: "text-blue-600"
    },
    {
      id: "comunidad",
      icon: Users,
      label: "Comunidad",
      path: "/demo",
      color: "text-purple-600"
    },
    {
      id: "eventos",
      icon: Calendar,
      label: "Eventos",
      path: "/demo",
      color: "text-green-600"
    },
    {
      id: "mensajes",
      icon: MessageSquare,
      label: "Mensajes",
      path: "/demo",
      color: "text-pink-600"
    },
    {
      id: "perfil",
      icon: User,
      label: "Mi Perfil",
      path: "/demo",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="h-full bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4 flex flex-col">
      {/* Navegación Principal - Sin header ni usuario demo */}
      <div className="flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-auto py-3 px-3 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg border border-transparent hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200"
              onClick={() => navigate(item.path)}
            >
              <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Info - Minimalista */}
      <div className="mt-auto pt-4 border-t border-purple-200 dark:border-purple-700">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">📞 (+34) 64 40 70 282</p>
          <p className="text-xs text-muted-foreground">📧 admin@organizaciondame.org</p>
          <p className="text-xs text-muted-foreground">📍 Valencia, España</p>
          <p className="text-xs font-medium dame-text-gradient">Arte • Cultura • Bienestar</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;