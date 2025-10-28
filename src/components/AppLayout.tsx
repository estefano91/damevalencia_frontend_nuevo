import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadUserType = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (data) {
        const stored = localStorage.getItem('simulated_user_type');
        setUserType(stored || data.user_type);
      }
    };

    loadUserType();
  }, [user]);

  // Close sidebar when screen becomes mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
        userType={userType}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 top-16 sm:top-20 md:top-28"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content - responsive margins and padding */}
      <main className={`
        transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : 'ml-64'} 
        mt-16 sm:mt-20 md:mt-28 
        p-3 sm:p-4 md:p-6
        min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-7rem)]
      `}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

