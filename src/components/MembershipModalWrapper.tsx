import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MembershipModal } from "./MembershipModal";

export const MembershipModalWrapper = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("membershipModalDismissed");
    }
    return false;
  });
  const lastUserIdRef = useRef<string | null>(null);

  // No mostrar en páginas de auth o register
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/afiliarse";

  useEffect(() => {
    // No mostrar si está cargando
    if (loading) {
      return;
    }

    // No mostrar en páginas de auth
    if (isAuthPage) {
      setShowModal(false);
      return;
    }

    // Only check if user is logged in
    if (!user) {
      setShowModal(false);
      return;
    }

    // Si ya cerró el modal, no mostrar
    if (hasSeenModal) {
      setShowModal(false);
      return;
    }

    // Wait a bit for user data to be available after login
    const timer = setTimeout(() => {
      // Check if this is a new login (user ID changed)
      const currentUserId = user.id;
      const isNewLogin = lastUserIdRef.current !== currentUserId;
      
      // If it's the same user and we already checked, don't check again
      if (!isNewLogin && lastUserIdRef.current !== null) {
        return;
      }

      // Update the ref to track current user
      lastUserIdRef.current = currentUserId;

      // Show modal if user is NOT a member
      if (!user.member) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          setShowModal(true);
        }, 1500);
      } else {
        // User is a member, ensure modal is closed
        setShowModal(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading, isAuthPage, hasSeenModal]);

  const handleModalClose = (open: boolean) => {
    if (!open) {
      // User closed the modal, remember it
      localStorage.setItem("membershipModalDismissed", "true");
      setHasSeenModal(true);
    }
    setShowModal(open);
  };

  // No renderizar si no debería mostrarse
  if (!user || isAuthPage || loading || hasSeenModal || user.member) {
    return null;
  }

  return (
    <MembershipModal
      open={showModal}
      onOpenChange={handleModalClose}
    />
  );
};

