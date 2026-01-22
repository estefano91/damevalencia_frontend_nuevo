import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { interestsApi } from "@/api/interests";
import { InterestsModal } from "./InterestsModal";

export const InterestsModalWrapper = () => {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checkingInterests, setCheckingInterests] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkInterests = async () => {
      // Only check if user is logged in and not loading
      if (!user || loading) {
        return;
      }

      const accessToken = localStorage.getItem("dame_access_token");
      if (!accessToken) {
        return;
      }

      // Check if this is a new login (user ID changed)
      const currentUserId = user.id;
      const isNewLogin = lastUserIdRef.current !== currentUserId;
      
      // If it's the same user and we already checked, don't check again
      if (!isNewLogin) {
        return;
      }

      // Update the ref to track current user
      lastUserIdRef.current = currentUserId;

      try {
        setCheckingInterests(true);
        const result = await interestsApi.getInterests(accessToken);

        if (result.ok && result.data) {
          // Show modal if user has no interests (count === 0)
          if (result.data.count === 0) {
            setShowModal(true);
          } else {
            // User has interests, ensure modal is closed
            setShowModal(false);
          }
        }
      } catch (error) {
        console.error("Error checking interests:", error);
      } finally {
        setCheckingInterests(false);
      }
    };

    checkInterests();
  }, [user, loading]);

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

  return (
    <InterestsModal
      open={showModal}
      onOpenChange={handleModalClose}
      onSuccess={handleSuccess}
      isFirstTime={true}
    />
  );
};
