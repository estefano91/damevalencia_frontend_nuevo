import { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

// Context para el filtro de categorías
interface CategoryFilterContextType {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (categoryId: number | null) => void;
  setAvailableCategories: (categories: Array<{
    id: number;
    name_es: string;
    name_en: string;
    icon: string;
    total_events?: number;
  }>) => void;
}

const CategoryFilterContext = createContext<CategoryFilterContextType>({
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},
  setAvailableCategories: () => {},
});

export const useCategoryFilter = () => {
  const context = useContext(CategoryFilterContext);
  if (!context) {
    throw new Error("useCategoryFilter must be used within CategoryFilterProvider");
  }
  return context;
};

interface AppLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const AppLayout = ({ children, hideSidebar = false }: AppLayoutProps) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar abierto por defecto
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{
    id: number;
    name_es: string;
    name_en: string;
    icon: string;
    total_events?: number;
  }>>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      // Use the user type from the auth context directly
      setUserType(user.user_type);
    }
  }, [user]);

  // Close sidebar when screen becomes mobile, open when desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true); // Abrir automáticamente en desktop
    }
  }, [isMobile]);

  return (
    <CategoryFilterContext.Provider value={{ selectedCategoryId, setSelectedCategoryId, setAvailableCategories }}>
      <div className="min-h-screen bg-background">
        <Navigation
          isMobile={isMobile}
        />
        
        <div className="flex">
        {/* Sidebar - Desktop */}
        {!hideSidebar && !isMobile && (
          <div className={`fixed top-20 sm:top-24 md:top-28 left-0 h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] bg-card border-r shadow-lg transition-all duration-300 z-40 ${
            sidebarOpen ? 'w-64' : 'w-12'
          }`}>
            <Sidebar
              userType={userType}
              onCategoryFilter={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
              availableCategories={availableCategories}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        )}

        {/* Sidebar - Mobile: rail siempre visible; overlay al expandir */}
        {!hideSidebar && isMobile && !sidebarOpen && (
          <div className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-12 bg-card border-r shadow-lg z-40">
            <Sidebar
              userType={userType}
              onCategoryFilter={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
              availableCategories={availableCategories}
              sidebarOpen={false}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        )}

        {/* Sidebar - Mobile con overlay cuando está expandido */}
        {!hideSidebar && isMobile && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 top-20"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-card border-r shadow-lg z-40">
              <Sidebar
                userType={userType}
                onCategoryFilter={setSelectedCategoryId}
                selectedCategoryId={selectedCategoryId}
                availableCategories={availableCategories}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </div>
          </>
        )}

        {/* Main content con margin automático */}
        <main className={`flex-1 pt-20 sm:pt-24 md:pt-28 min-h-screen transition-all duration-300 ${
          hideSidebar
            ? 'ml-0'
            : isMobile
              ? (sidebarOpen ? 'ml-0' : 'ml-12')
              : (sidebarOpen ? 'ml-64' : 'ml-12')
        }`}>
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CategoryFilterContext.Provider>
  );
};

export default AppLayout;