import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import EventDetail from "./components/EventDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
                  {/* Redirigir directamente al dashboard para desarrollo */}
                  <Route path="/" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  
                  {/* Vista detallada de eventos */}
                  <Route 
                    path="/eventos/:slug" 
                    element={
                      <ProtectedRoute hideSidebar>
                        <EventDetail />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route
                    path="/demo"
                    element={
                      <ProtectedRoute>
                        <Demo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Demo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <Demo />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  <Route path="/privacy" element={<Disclaimer />} />
                  <Route path="/terms" element={<Disclaimer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
