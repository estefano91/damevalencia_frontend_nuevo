import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import logoDame from "@/assets/1.png";

interface MembershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MembershipModal = ({
  open,
  onOpenChange,
}: MembershipModalProps) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleJoin = () => {
    onOpenChange(false);
    navigate("/afiliarse");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-0 w-[calc(100vw-2rem)] sm:w-full">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent pointer-events-none rounded-lg" />

        <div className="relative p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          {/* Logo */}
          <div className="flex justify-center mb-1 sm:mb-2">
            <img 
              src={logoDame} 
              alt="DAME Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <DialogHeader className="text-center space-y-1.5 sm:space-y-2">
            <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
              <span>
                {i18n.language === 'en' 
                  ? 'Become a DAME Member!' 
                  : '¡Hazte Miembro DAME!'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 pt-1 sm:pt-2 leading-relaxed">
              {i18n.language === 'en' ? (
                <>
                  Join our community and enjoy exclusive benefits, discounts, and priority access to events in Valencia.
                </>
              ) : (
                <>
                  Únete a nuestra comunidad y disfruta de beneficios exclusivos, descuentos y acceso prioritario a eventos en Valencia.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Crown className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span>
                {i18n.language === 'en' 
                  ? 'Exclusive discounts on events' 
                  : 'Descuentos exclusivos en eventos'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Crown className="h-4 w-4 text-pink-600 flex-shrink-0" />
              <span>
                {i18n.language === 'en' 
                  ? 'Priority access to events' 
                  : 'Acceso prioritario a eventos'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Crown className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span>
                {i18n.language === 'en' 
                  ? 'Special member benefits' 
                  : 'Beneficios especiales para miembros'}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-1 sm:pt-2 space-y-2 sm:space-y-3">
            <Button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 py-4 sm:py-5 md:py-6 text-sm sm:text-base group"
              size="lg"
            >
              {i18n.language === 'en' ? 'Become a Member' : 'Hazte Miembro'}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Optional: Skip link */}
            <div className="text-center pb-1 sm:pb-0">
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
              >
                {i18n.language === 'en' ? 'Maybe later' : 'Quizás más tarde'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

