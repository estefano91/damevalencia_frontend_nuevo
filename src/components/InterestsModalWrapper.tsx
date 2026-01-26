import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { interestsApi } from "@/api/interests";
import { InterestsModal } from "./InterestsModal";

export const InterestsModalWrapper = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [checkingInterests, setCheckingInterests] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  // No mostrar en páginas de auth o register
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    const checkInterests = async () => {
      // Only check if user is logged in and not loading
      if (!user || loading) {
        setShowModal(false);
        return;
      }

      // No mostrar en páginas de auth
      if (isAuthPage) {
        setShowModal(false);
        return;
      }

      // IMPORTANT: Only show interests modal if user IS a member
      if (!user.member) {
        console.log("InterestsModal: User is not a member, not showing interests modal.");
        setShowModal(false);
        return;
      }

      // Wait a bit for token to be available after login
      await new Promise(resolve => setTimeout(resolve, 1000));

      const accessToken = localStorage.getItem("dame_access_token");
      if (!accessToken) {
        console.log("InterestsModal: No access token found");
        return;
      }

      // Check if this is a new login (user ID changed)
      const currentUserId = user.id;
      const isNewLogin = lastUserIdRef.current !== currentUserId;
      
      // If it's the same user and we already checked, don't check again
      if (!isNewLogin && lastUserIdRef.current !== null) {
        console.log("InterestsModal: Same user, already checked");
        return;
      }

      // Update the ref to track current user
      lastUserIdRef.current = currentUserId;

      try {
        setCheckingInterests(true);
        console.log("InterestsModal: Checking interests for user", currentUserId);
        const result = await interestsApi.getInterests(accessToken);

        console.log("InterestsModal: API result", result);

        if (result.ok && result.data) {
          // Show modal if user has no interests (count === 0)
          if (result.data.count === 0) {
            console.log("InterestsModal: User has no interests, showing modal");
            // Small delay to ensure UI is ready
            setTimeout(() => {
              setShowModal(true);
            }, 500);
          } else {
            console.log("InterestsModal: User has interests, count:", result.data.count);
            // User has interests, ensure modal is closed
            setShowModal(false);
          }
        } else if (result.ok && !result.data) {
          // If no data, assume user has no interests
          console.log("InterestsModal: No data returned, showing modal");
          setTimeout(() => {
            setShowModal(true);
          }, 500);
        } else {
          // API error, but show modal anyway
          console.log("InterestsModal: API error, showing modal anyway", result.error);
          setTimeout(() => {
            setShowModal(true);
          }, 500);
        }
      } catch (error) {
        console.error("InterestsModal: Error checking interests:", error);
        // On error, show modal to let user set interests
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      } finally {
        setCheckingInterests(false);
      }
    };

    checkInterests();
  }, [user, loading, isAuthPage]);

  const handleSuccess = async () => {
    // After interests are saved, verify that user now has interests
    const accessToken = localStorage.getItem("dame_access_token");
    if (accessToken) {
      try {
        const result = await interestsApi.getInterests(accessToken);
        if (result.ok && result.data && result.data.count > 0) {
          // User now has interests, close modal
          setShowModal(false);
        }
      } catch (error) {
        console.error("Error verifying interests after save:", error);
      }
    }
  };

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
  };

  // Debug log
  useEffect(() => {
    if (showModal) {
      console.log("InterestsModal: Modal state changed to open");
    }
  }, [showModal]);

  // No renderizar si el usuario no es miembro, está en página de auth, o no está logueado
  if (!user || !user.member || isAuthPage || loading) {
    return null;
  }

  return (
    <InterestsModal
      open={showModal}
      onOpenChange={handleModalClose}
      onSuccess={handleSuccess}
      isFirstTime={true}
    />
  );
};
