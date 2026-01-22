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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {isFirstTime
              ? i18n.language === "en"
                ? "Select Your Interests"
                : "Selecciona Tus Intereses"
              : i18n.language === "en"
              ? "Edit Your Interests"
              : "Edita Tus Intereses"}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime
              ? i18n.language === "en"
                ? "Choose the topics that interest you to personalize your experience"
                : "Elige los temas que te interesan para personalizar tu experiencia"
              : i18n.language === "en"
              ? "Update your interests to see more relevant content"
              : "Actualiza tus intereses para ver contenido más relevante"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingTags ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : availableTags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
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
                    className={`cursor-pointer px-4 py-2 text-sm transition-all ${
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

        <DialogFooter>
          {isFirstTime ? (
            <>
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
                className="text-muted-foreground"
              >
                {i18n.language === "en" ? "Skip for now" : "Omitir por ahora"}
              </Button>
              <Button onClick={handleSave} disabled={loading || loadingTags}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {i18n.language === "en" ? "Saving..." : "Guardando..."}
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
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={loading || loadingTags}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {i18n.language === "en" ? "Saving..." : "Guardando..."}
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

