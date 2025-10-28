import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import BecomeReferrer from "./pages/BecomeReferrer";
import ReferrerDashboard from "./pages/ReferrerDashboard";
import ClubReferrals from "./pages/ClubReferrals";
import PlayerReferrals from "./pages/PlayerReferrals";
import Messages from "./pages/Messages";
import Feed from "./pages/Feed";
import NetworkingEvents from "./pages/NetworkingEvents";
import Premium from "./pages/Premium";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <Connections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:profileId"
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referrer"
              element={
                <ProtectedRoute>
                  <BecomeReferrer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referrer/dashboard"
              element={
                <ProtectedRoute>
                  <ReferrerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/club/referrals"
              element={
                <ProtectedRoute>
                  <ClubReferrals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/referrals"
              element={
                <ProtectedRoute>
                  <PlayerReferrals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <NetworkingEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/premium"
              element={
                <ProtectedRoute>
                  <Premium />
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
