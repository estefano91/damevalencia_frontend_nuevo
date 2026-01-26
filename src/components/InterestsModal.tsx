import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { interestsApi } from "@/api/interests";
import type { AvailableTag } from "@/types/interests";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface InterestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isFirstTime?: boolean;
}

export const InterestsModal = ({
  open,
  onOpenChange,
  onSuccess,
  isFirstTime = false,
}: InterestsModalProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Load available tags when modal opens
  useEffect(() => {
    if (open && user) {
      loadAvailableTags();
    }
  }, [open, user]);

  const loadAvailableTags = async () => {
    const accessToken = localStorage.getItem("dame_access_token");
    if (!accessToken) {
      setLoadingTags(false);
      return;
    }

    try {
      setLoadingTags(true);
      const result = await interestsApi.getAvailableTags(accessToken);

      if (result.ok && result.data) {
        setAvailableTags(result.data.tags);
        // Pre-select tags that are already selected
        const selectedIds = result.data.tags
          .filter((tag) => tag.is_selected)
          .map((tag) => tag.id);
        setSelectedTagIds(selectedIds);
      } else {
        toast({
          title: i18n.language === "en" ? "Error" : "Error",
          description:
            result.error ||
            (i18n.language === "en"
              ? "Could not load available tags"
              : "No se pudieron cargar los tags disponibles"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading tags:", error);
      toast({
        title: i18n.language === "en" ? "Error" : "Error",
        description:
          i18n.language === "en"
            ? "An error occurred while loading tags"
            : "Ocurrió un error al cargar los tags",
        variant: "destructive",
      });
    } finally {
      setLoadingTags(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (selectedTagIds.length === 0) {
      toast({
        title:
          i18n.language === "en"
            ? "Selection required"
            : "Selección requerida",
        description:
          i18n.language === "en"
            ? "Please select at least one interest"
            : "Por favor selecciona al menos un interés",
        variant: "destructive",
      });
      return;
    }

    const accessToken = localStorage.getItem("dame_access_token");
    if (!accessToken) {
      toast({
        title: i18n.language === "en" ? "Error" : "Error",
        description:
          i18n.language === "en"
            ? "Authentication required"
            : "Autenticación requerida",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await interestsApi.updateInterests(accessToken, {
        tag_ids: selectedTagIds,
      });

      if (result.ok && result.data) {
        toast({
          title:
            i18n.language === "en"
              ? "Interests updated"
              : "Intereses actualizados",
          description:
            i18n.language === "en"
              ? "Your interests have been saved successfully"
              : "Tus intereses se han guardado exitosamente",
        });
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: i18n.language === "en" ? "Error" : "Error",
          description:
            result.error ||
            (i18n.language === "en"
              ? "Could not update interests"
              : "No se pudieron actualizar los intereses"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving interests:", error);
      toast({
        title: i18n.language === "en" ? "Error" : "Error",
        description:
          i18n.language === "en"
            ? "An error occurred while saving interests"
            : "Ocurrió un error al guardar los intereses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Close modal, but it will appear again on next login if user still has no interests
    onOpenChange(false);
  };

  const getTagName = (tag: AvailableTag) => {
    return i18n.language === "en" ? tag.name_en : tag.name_es;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-0 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
            <span className="leading-tight">
              {isFirstTime
                ? i18n.language === "en"
                  ? "Select Your Interests"
                  : "Selecciona Tus Intereses"
                : i18n.language === "en"
                ? "Edit Your Interests"
                : "Edita Tus Intereses"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm pt-1 leading-relaxed">
            {isFirstTime
              ? i18n.language === "en"
                ? "Choose the topics that interest you to personalize your experience"
                : "Elige los temas que te interesan para personalizar tu experiencia"
              : i18n.language === "en"
              ? "Update your interests to see more relevant content"
              : "Actualiza tus intereses para ver contenido más relevante"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-3 px-4 sm:px-5 md:px-6 py-2 sm:py-3 overflow-y-auto flex-1 min-h-0">
          {loadingTags ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
            </div>
          ) : availableTags.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              {i18n.language === "en"
                ? "No tags available"
                : "No hay tags disponibles"}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {getTagName(tag)}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 pt-3 sm:pt-4 border-t flex-shrink-0 gap-2">
          {isFirstTime ? (
            <>
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
              >
                {i18n.language === "en" ? "Skip" : "Omitir"}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading || loadingTags}
                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">{i18n.language === "en" ? "Saving..." : "Guardando..."}</span>
                    <span className="sm:hidden">{i18n.language === "en" ? "Saving" : "Guardando"}</span>
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
              >
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading || loadingTags}
                className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">{i18n.language === "en" ? "Saving..." : "Guardando..."}</span>
                    <span className="sm:hidden">{i18n.language === "en" ? "Saving" : "Guardando"}</span>
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

