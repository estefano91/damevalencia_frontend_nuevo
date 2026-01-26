import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Demo from "./pages/Demo";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import EventDetail from "./components/EventDetail";
import CommunityLinks from "./pages/CommunityLinks";
import TShirtDesigner from "./pages/TShirtDesigner";
import EditProfile from "./pages/EditProfile";
import CookieBanner from "./components/CookieBanner";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";
import WhatsAppButton from "./components/WhatsAppButton";
import UserProfile from "./pages/UserProfile";
import Membership from "./pages/Membership";
import EditMember from "./pages/EditMember";
import MyTickets from "./pages/MyTickets";
import MyUpcomingEvents from "./pages/MyUpcomingEvents";
import ClubDame from "./pages/ClubDame";
import TicketHashLookup from "./pages/TicketHashLookup";
import MonthlyEvents from "./pages/MonthlyEvents";
import Alquiler from "./pages/Alquiler";
import Subscription from "./pages/Subscription";
import { InterestsModalWrapper } from "./components/InterestsModalWrapper";
import { MembershipModalWrapper } from "./components/MembershipModalWrapper";
import RegisterPopup from "./components/RegisterPopup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CookieBanner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <InterestsModalWrapper />
          <MembershipModalWrapper />
          <RegisterPopup />
          <Routes>
                  {/* Redirigir directamente al dashboard para desarrollo */}
                  <Route path="/" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Vista detallada de eventos */}
                  <Route 
                    path="/eventos/:slug" 
                    element={
                      <ProtectedRoute hideSidebar>
                        <EventDetail />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Página de enlaces de comunidad */}
                  <Route
                    path="/comunidad"
                    element={
                      <ProtectedRoute hideSidebar>
                        <CommunityLinks />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Diseñador de camisetas */}
                  <Route
                    path="/camiseta"
                    element={
                      <ProtectedRoute hideSidebar>
                        <TShirtDesigner />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Editar perfil */}
                  <Route
                    path="/editar-perfil"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <EditProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Mis entradas */}
                  <Route
                    path="/mis-entradas"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <MyTickets />
                      </ProtectedRoute>
                    }
                  />
                  {/* Club DAME */}
                  <Route
                    path="/club-dame"
                    element={
                      <ProtectedRoute hideSidebar requireAuth requireMember>
                        <ClubDame />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mis-eventos"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <MyUpcomingEvents />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Afiliarse al programa de beneficios */}
                  <Route
                    path="/afiliarse"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <Membership />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Editar información de miembro */}
                  <Route
                    path="/editar-miembro"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <EditMember />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Cambiar suscripción */}
                  <Route
                    path="/suscripcion"
                    element={
                      <ProtectedRoute hideSidebar requireAuth>
                        <Subscription />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/"
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
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/sobre-nosotros" element={<AboutUs />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/tickets/hash/:hash" element={<TicketHashLookup />} />
                  <Route path="/ticket-hash" element={<TicketHashLookup />} />
                  
                  {/* Eventos mensuales */}
                  <Route
                    path="/monthly"
                    element={
                      <ProtectedRoute hideSidebar>
                        <MonthlyEvents />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Alquiler de material */}
                  <Route
                    path="/alquiler"
                    element={
                      <ProtectedRoute hideSidebar>
                        <Alquiler />
                      </ProtectedRoute>
                    }
                  />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
