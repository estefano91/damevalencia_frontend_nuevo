import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Music2,
  Paintbrush2,
  Dumbbell,
  BrainCircuit,
  Filter,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  HeartPulse
} from "lucide-react";
import { Handshake, Castle } from "lucide-react";

interface SidebarProps {
  userType?: string | null;
  onCategoryFilter?: (categoryId: number | null) => void;
  availableCategories?: Array<{
    id: number;
    name_es: string;
    name_en: string;
    icon: string;
    total_events?: number;
  }>;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Sidebar = ({ userType, onCategoryFilter, availableCategories = [], sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Mapear iconos de la API a iconos más representativos y llamativos
  const getIconForCategory = (iconName: string, nameEs?: string) => {
    const iconMap: Record<string, any> = {
      'music_note': Music2, // 🎵 Música - Icono más dinámico
      'sports_kabaddi': Handshake, // 🤝 Baile - Handshake
      'palette': Paintbrush2, // 🎨 Arte - Pincel más artístico
      'fitness_center': HeartPulse, // 🫀 Deporte - Pulso
      'psychology': BrainCircuit // 🧠 Bienestar Mental - Cerebro con circuitos
    };
    if (iconMap[iconName]) return iconMap[iconName];
    // Heurística por nombre cuando el backend no envía icono coherente
    const name = (nameEs || '').toLowerCase();
    if (name.includes('experienc')) return Castle;
    if (name.includes('baile') || name.includes('dance')) return Handshake;
    if (name.includes('deporte') || name.includes('fitness')) return HeartPulse;
    if (name.includes('música') || name.includes('musica') || name.includes('music')) return Music2;
    if (name.includes('arte') || name.includes('cultura') || name.includes('art')) return Paintbrush2;
    return Music2;
  };

  // Colores sólidos coherentes con la paleta DAME
  const getCategoryColors = (categoryId: number) => {
    const dameColors = [
      // Música - Morado sólido DAME
      {
        color: "text-white",
        bgColor: "bg-purple-600",
        bgColorInactive: "bg-purple-100 dark:bg-purple-900/30",
        borderColor: "border-purple-500",
        hoverColor: "hover:bg-purple-700"
      },
      // Baile - Rosa sólido DAME  
      {
        color: "text-white",
        bgColor: "bg-pink-600",
        bgColorInactive: "bg-pink-100 dark:bg-pink-900/30",
        borderColor: "border-pink-500",
        hoverColor: "hover:bg-pink-700"
      },
      // Arte - Índigo sólido
      {
        color: "text-white",
        bgColor: "bg-indigo-600",
        bgColorInactive: "bg-indigo-100 dark:bg-indigo-900/30", 
        borderColor: "border-indigo-500",
        hoverColor: "hover:bg-indigo-700"
      },
      // Fitness - Verde sólido
      {
        color: "text-white",
        bgColor: "bg-green-600",
        bgColorInactive: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-500", 
        hoverColor: "hover:bg-green-700"
      },
      // Apoyo - Azul sólido
      {
        color: "text-white",
        bgColor: "bg-blue-600",
        bgColorInactive: "bg-blue-100 dark:bg-blue-900/30",
        borderColor: "border-blue-500",
        hoverColor: "hover:bg-blue-700"
      }
    ];
    
    return dameColors[(categoryId - 1) % dameColors.length];
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (onCategoryFilter) {
      onCategoryFilter(categoryId);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex flex-col">
      {/* Flecha cuando está expandido - Barra completa */}
      {sidebarOpen && setSidebarOpen && (
        <Button
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full h-12 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/50 border-b-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all duration-200 rounded-none flex items-center justify-between group"
          title="Minimizar menú"
        >
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-purple-600">
            Menú lateral
          </span>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Flecha cuando está minimizado - Botón centrado */}
      {!sidebarOpen && setSidebarOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 h-10 w-10 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg border-2 border-purple-300 hover:border-purple-500 transition-all duration-200 shadow-md hover:shadow-lg z-10"
          title="Expandir menú"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Contenido cuando está expandido */}
      {sidebarOpen && (
        <>
          {/* Sin botón de limpiar filtro; usar "Todos los eventos" */}

          {/* Filtros por Categoría */}
          <div className="flex-1 min-h-0 px-3 pt-4">
            <div className="h-full flex flex-col space-y-2">
              {/* Botón "Todos los eventos" */}
              <Button
                variant="ghost"
                className={`w-full justify-start h-auto py-3 px-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                    : 'bg-purple-100 dark:bg-purple-900/30 border-gray-300 hover:border-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/50'
                }`}
                onClick={() => handleCategoryFilter(null)}
              >
                <Filter className={`mr-3 h-5 w-5 ${selectedCategory === null ? 'text-white' : 'text-purple-600'}`} />
                <div className="text-left">
                  <div className={`font-bold text-sm ${selectedCategory === null ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    Todos los eventos
                  </div>
                  <div className={`text-xs ${selectedCategory === null ? 'text-purple-100' : 'text-gray-500'}`}>
                    Ver todas las categorías
                  </div>
                </div>
              </Button>

              {/* Botones de Categorías */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                {availableCategories.map((category) => {
                  const CategoryIcon = getIconForCategory(category.icon, category.name_es);
                  const colors = getCategoryColors(category.id);
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={`w-full justify-start h-auto py-3 px-3 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? `${colors.bgColor} ${colors.borderColor} text-white shadow-lg`
                          : `${colors.bgColorInactive} border-gray-300 ${colors.hoverColor} hover:shadow-md`
                      }`}
                      onClick={() => handleCategoryFilter(category.id)}
                    >
                      <CategoryIcon 
                        className={`mr-3 h-5 w-5 ${colors.color}`} 
                      />
                      <div className="text-left flex-1">
                        <div className={`font-bold text-sm ${
                          isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {category.name_es}
                        </div>
                        <div className={`text-xs ${
                          isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {category.total_events || 0} eventos
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-2 text-white">
                          ✓
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

        </>
      )}

      {/* Iconos de categorías cuando está minimizado */}
      {!sidebarOpen && (
        <div className="flex-1 flex flex-col items-center pt-14 space-y-3 px-1">
          {/* Botón "Todos los eventos" minimizado */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-10 p-0 rounded-lg border-2 transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                : 'bg-purple-100 dark:bg-purple-900/30 border-gray-300 hover:border-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/50'
            }`}
            onClick={() => handleCategoryFilter(null)}
            title="Todos los eventos"
          >
            <Filter className={`h-5 w-5 ${selectedCategory === null ? 'text-white' : 'text-purple-600'}`} />
          </Button>

          {/* Iconos de Categorías verticales */}
          {availableCategories.map((category) => {
            const CategoryIcon = getIconForCategory(category.icon, category.name_es);
            const colors = getCategoryColors(category.id);
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={`h-10 w-10 p-0 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `${colors.bgColor} ${colors.borderColor} text-white shadow-lg`
                    : `${colors.bgColorInactive} border-gray-300 ${colors.hoverColor} hover:shadow-md`
                }`}
                onClick={() => handleCategoryFilter(category.id)}
                title={category.name_es}
              >
                <CategoryIcon 
                  className={`h-5 w-5 ${colors.color}`} 
                />
              </Button>
            );
          })}

          {/* Indicador de filtro activo cuando minimizado */}
          {selectedCategory && (
            <div className="mt-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Filtro activo" />
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;