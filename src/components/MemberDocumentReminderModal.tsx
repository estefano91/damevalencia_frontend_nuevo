import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import type { DameProfile } from "@/integrations/dame-api/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  isMemberDocumentReminderDismissedForUser,
  setMemberDocumentReminderDismissedForUser,
} from "@/lib/memberDocumentReminderStorage";

function memberNeedsDocument(user: DameProfile | null): boolean {
  if (!user?.member) return false;
  return !String(user.member.document_number ?? "").trim();
}

/**
 * Miembros sin número de documento: aviso al iniciar sesión (se puede cerrar;
 * se limpia el “cerrado” en cada nuevo login desde AuthContext).
 */
export function MemberDocumentReminderModal() {
  const { user, loading } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  /** Evita marcar "cerrado" en sessionStorage al ir a /editar-miembro (solo cerrar el modal). */
  const skipDismissStorageRef = useRef(false);

  const isEn = i18n.language === "en" || i18n.language?.startsWith("en");

  useEffect(() => {
    if (loading) return;
    if (!memberNeedsDocument(user)) {
      setOpen(false);
      return;
    }
    if (pathname === "/editar-miembro") {
      setOpen(false);
      return;
    }
    if (isMemberDocumentReminderDismissedForUser(user.id)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [user, loading, pathname]);

  const persistDismiss = () => {
    if (user?.id) setMemberDocumentReminderDismissedForUser(user.id);
    setOpen(false);
  };

  const handleDismiss = () => {
    persistDismiss();
  };

  const handleComplete = () => {
    skipDismissStorageRef.current = true;
    setOpen(false);
    navigate("/editar-miembro");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    if (skipDismissStorageRef.current) {
      skipDismissStorageRef.current = false;
      return;
    }
    persistDismiss();
  };

  if (!memberNeedsDocument(user)) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" aria-hidden />
            <DialogTitle>
              {isEn ? "Complete your member ID" : "Completa tu documento de miembro"}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {isEn
              ? "Reminder to register your member ID document to use membership and QR."
              : "Aviso para registrar tu documento de miembro y poder usar la membresía y el QR."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-left text-sm text-muted-foreground">
          <p>
            {isEn
              ? "You have an active membership, but your ID document and number are not registered (or are incomplete)."
              : "Tienes la membresía activa, pero no consta tu documento de identidad y número (o está incompleto)."}
          </p>
          <p className="text-foreground font-medium">
            {isEn
              ? "Without this information you will not have a member QR code, and your membership cannot be used to identify you at DAME events and activities."
              : "Sin estos datos no tendrás código QR de miembro y tu membresía no servirá para identificarte en eventos y actividades de DAME."}
          </p>
          <p>
            {isEn
              ? "You can close this message for now, but we recommend completing your details as soon as possible."
              : "Puedes cerrar este mensaje por ahora, pero te recomendamos completar los datos cuanto antes."}
          </p>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleDismiss}>
            {isEn ? "Close" : "Cerrar"}
          </Button>
          <Button type="button" onClick={handleComplete}>
            {isEn ? "Complete now" : "Completar ahora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
