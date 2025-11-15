import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import {
  Music2,
  Paintbrush2,
  Dumbbell,
  BrainCircuit,
  List,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Flower2,
  PersonStanding,
  Castle
} from "lucide-react";

interface SidebarProps {
  userType?: string | null;
  onCategoryFilter?: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
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

const Sidebar = ({ userType, onCategoryFilter, selectedCategoryId = null, availableCategories = [], sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { i18n } = useTranslation();

  // Auto-colapsar sidebar al seleccionar una categoría en mobile
  const handleCategoryClick = (categoryId: number | null) => {
    if (onCategoryFilter) {
      onCategoryFilter(categoryId);
    }
    // Auto-colapsar en mobile (cuando sidebarOpen puede ser true)
    if (sidebarOpen && setSidebarOpen) {
      // Solo colapsar si estamos en mobile (detectado por la existencia de setSidebarOpen y sidebarOpen)
      // En desktop, sidebarOpen se gestiona manualmente
      const isMobileSidebar = window.innerWidth < 768;
      if (isMobileSidebar) {
        setSidebarOpen(false);
      }
    }
  };

  // Mapear iconos de la API a iconos más representativos y llamativos
  const getIconForCategory = (iconName: string, nameEs?: string) => {
    const iconMap: Record<string, any> = {
      'music_note': Music2, // 🎵 Música - Icono más dinámico
      'sports_kabaddi': PersonStanding, // 💃 Baile - PersonStanding
      'palette': Paintbrush2, // 🎨 Arte - Pincel más artístico
      'fitness_center': HeartPulse, // 🫀 Deporte - Pulso
      'psychology': BrainCircuit // 🧠 Bienestar Mental - Cerebro con circuitos
    };
    if (iconMap[iconName]) return iconMap[iconName];
    // Heurística por nombre cuando el backend no envía icono coherente
    const name = (nameEs || '').toLowerCase();
    if (name.includes('zen') || name.includes('yoga') || name.includes('mindfulness')) return Flower2; // 🧘 Zen/Yoga - Flor de loto
    if (name.includes('experienc')) return Castle;
    if (name.includes('baile') || name.includes('dance')) return PersonStanding;
    if (name.includes('deporte') || name.includes('fitness')) return HeartPulse;
    if (name.includes('música') || name.includes('musica') || name.includes('music')) return Music2;
    if (name.includes('arte') || name.includes('cultura') || name.includes('art')) return Paintbrush2;
    return Music2;
  };

  // Colores sólidos coherentes con la paleta DAME por tipo de categoría
  const getCategoryColors = (categoryId: number) => {
    const dameColors = [
      // Música - Morado sólido DAME
      {
        color: "text-white",
        iconColor: "text-purple-700",
        bgColor: "bg-purple-700",
        bgColorInactive: "bg-purple-200 dark:bg-purple-900/40",
        borderColor: "border-purple-600",
        hoverColor: "hover:bg-purple-800",
        ringColor: "ring-purple-200"
      },
      // Baile - Rosa sólido DAME  
      {
        color: "text-white",
        iconColor: "text-pink-700",
        bgColor: "bg-pink-700",
        bgColorInactive: "bg-pink-200 dark:bg-pink-900/40",
        borderColor: "border-pink-600",
        hoverColor: "hover:bg-pink-800",
        ringColor: "ring-pink-200"
      },
      // Arte - Índigo sólido
      {
        color: "text-white",
        iconColor: "text-indigo-700",
        bgColor: "bg-indigo-700",
        bgColorInactive: "bg-indigo-200 dark:bg-indigo-900/40", 
        borderColor: "border-indigo-600",
        hoverColor: "hover:bg-indigo-800",
        ringColor: "ring-indigo-200"
      },
      // Fitness - Verde sólido
      {
        color: "text-white",
        iconColor: "text-green-700",
        bgColor: "bg-green-700",
        bgColorInactive: "bg-green-200 dark:bg-green-900/40",
        borderColor: "border-green-600", 
        hoverColor: "hover:bg-green-800",
        ringColor: "ring-green-200"
      },
      // Apoyo - Azul sólido
      {
        color: "text-white",
        iconColor: "text-blue-700",
        bgColor: "bg-blue-700",
        bgColorInactive: "bg-blue-200 dark:bg-blue-900/40",
        borderColor: "border-blue-600",
        hoverColor: "hover:bg-blue-800",
        ringColor: "ring-blue-200"
      }
    ];
    
    return dameColors[(categoryId - 1) % dameColors.length];
  };

  // Determina colores por nombre de categoría (más fiable que el id)
  const getColorsForCategoryName = (nameEs?: string) => {
    const name = (nameEs || '').toLowerCase();
    if (name.includes('música') || name.includes('musica') || name.includes('music')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-purple-700', bgColorInactive: 'bg-purple-200', borderColor: 'border-purple-600', hoverColor: 'hover:bg-purple-800', ringColor: 'ring-purple-200' };
    }
    if (name.includes('baile') || name.includes('dance')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-pink-700', bgColorInactive: 'bg-pink-200', borderColor: 'border-pink-600', hoverColor: 'hover:bg-pink-800', ringColor: 'ring-pink-200' };
    }
    if (name.includes('arte') || name.includes('cultura') || name.includes('art')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-indigo-700', bgColorInactive: 'bg-indigo-200', borderColor: 'border-indigo-600', hoverColor: 'hover:bg-indigo-800', ringColor: 'ring-indigo-200' };
    }
    if (name.includes('fit') || name.includes('deporte') || name.includes('fitness')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-green-700', bgColorInactive: 'bg-green-200', borderColor: 'border-green-600', hoverColor: 'hover:bg-green-800', ringColor: 'ring-green-200' };
    }
    if (name.includes('zen') || name.includes('yoga') || name.includes('mindfulness')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-sky-500', bgColorInactive: 'bg-sky-200', borderColor: 'border-sky-400', hoverColor: 'hover:bg-sky-600', ringColor: 'ring-sky-200' };
    }
    if (name.includes('apoyo') || name.includes('comunidad') || name.includes('support') || name.includes('community')) {
      return { color: 'text-white', iconColor: 'text-white', bgColor: 'bg-blue-700', bgColorInactive: 'bg-blue-200', borderColor: 'border-blue-600', hoverColor: 'hover:bg-blue-800', ringColor: 'ring-blue-200' };
    }
    // Fallback al mapping por id
    return getCategoryColors((nameEs?.length || 0) % 5 + 1);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    handleCategoryClick(categoryId);
  };

  return (
    <div className="h-full bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex flex-col">
      {/* Flecha cuando está expandido - Barra completa */}
      {sidebarOpen && setSidebarOpen && (
        <Button
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full h-12 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/50 border-b-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all duration-200 rounded-none flex items-center justify-between group"
          title={i18n.language === 'en' ? 'Minimize menu' : 'Minimizar menú'}
        >
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-purple-600">
            {i18n.language === 'en' ? 'Sidebar menu' : 'Menú lateral'}
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
          title={i18n.language === 'en' ? 'Expand menu' : 'Expandir menú'}
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
                className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 ${
                  selectedCategoryId === null
                    ? 'bg-purple-700 border-purple-600 text-white shadow-lg border-4 ring-2 ring-white/70'
                    : 'bg-purple-700 border-purple-600 text-white border-2 hover:bg-purple-800 hover:border-purple-700'
                }`}
                onClick={() => handleCategoryFilter(null)}
              >
                <List className={`mr-3 h-5 w-5 text-white`} />
                <div className="text-left">
                  <div className={`font-bold text-sm ${selectedCategoryId === null ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {i18n.language === 'en' ? 'All events' : 'Todos los eventos'}
                  </div>
                  <div className={`text-xs ${selectedCategoryId === null ? 'text-purple-100' : 'text-gray-500'}`}>
                    {i18n.language === 'en' ? 'View all categories' : 'Ver todas las categorías'}
                  </div>
                </div>
              </Button>

              {/* Botones de Categorías */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                {availableCategories.map((category) => {
                  const CategoryIcon = getIconForCategory(category.icon, category.name_es);
                  const colors = getColorsForCategoryName(category.name_es);
                  const isSelected = selectedCategoryId === category.id;
                  
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? `${colors.bgColor} ${colors.borderColor} text-white shadow-lg border-4 ring-2 ${colors.ringColor}`
                    : `${colors.bgColor} ${colors.borderColor} text-white border-2 ${colors.hoverColor} hover:shadow-md`
                }`}
                      onClick={() => handleCategoryFilter(category.id)}
                    >
                      <CategoryIcon 
                        className={`mr-3 h-5 w-5 text-white`} 
                      />
                      <div className="text-left flex-1">
                        <div className={`font-bold text-sm ${
                          isSelected ? 'text-white' : 'text-white'
                        }`}>
                          {i18n.language === 'en' ? (category.name_en || category.name_es) : category.name_es}
                        </div>
                        <div className={`text-xs ${
                          isSelected ? 'text-white/90' : 'text-white/80'
                        }`}>
                          {i18n.language === 'en' 
                            ? `${category.total_events || 0} events`
                            : `${category.total_events || 0} eventos`}
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
              selectedCategoryId === null
                ? 'bg-purple-700 border-purple-600 text-white shadow-lg'
                : 'bg-purple-200 dark:bg-purple-900/40 border-purple-600 hover:border-purple-700 hover:bg-purple-300 dark:hover:bg-purple-800/60'
            }`}
            onClick={() => handleCategoryFilter(null)}
            title={i18n.language === 'en' ? 'All events' : 'Todos los eventos'}
          >
            <List className={`h-5 w-5 ${selectedCategoryId === null ? 'text-white' : 'text-purple-600'}`} />
          </Button>

          {/* Iconos de Categorías verticales */}
          {availableCategories.map((category) => {
            const CategoryIcon = getIconForCategory(category.icon, category.name_es);
            const colors = getColorsForCategoryName(category.name_es);
            const isSelected = selectedCategoryId === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? `${colors.bgColor} ${colors.borderColor} text-white shadow-lg border-4 ring-2 ${colors.ringColor}`
                    : `${colors.bgColor} ${colors.borderColor} text-white border-2 ${colors.hoverColor} hover:shadow-md`
                }`}
                onClick={() => handleCategoryFilter(category.id)}
                title={category.name_es}
              >
                <CategoryIcon 
                  className={`h-5 w-5 text-white`} 
                />
              </Button>
            );
          })}

          {/* Indicador de filtro activo cuando minimizado */}
          {selectedCategoryId && (
            <div className="mt-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title={i18n.language === 'en' ? 'Active filter' : 'Filtro activo'} />
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;