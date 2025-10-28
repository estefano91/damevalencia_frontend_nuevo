import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar abierto por defecto
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
    <div className="min-h-screen bg-background">
      <Navigation 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div className={`fixed top-16 sm:top-20 left-0 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-64 bg-card border-r shadow-lg transition-transform duration-300 z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar userType={userType} />
          </div>
        )}
        
        {/* Sidebar - Mobile con overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card border-r shadow-lg z-40">
              <Sidebar userType={userType} />
            </div>
          </>
        )}
        
        {/* Main content con margin automático */}
        <main className={`flex-1 pt-16 sm:pt-20 min-h-screen transition-all duration-300 ${
          !isMobile && sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;