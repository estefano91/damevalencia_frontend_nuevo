import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  IdCard,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditMember = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    document_type: "DNI" as "DNI" | "PASAPORTE" | "NIE",
    document_number: "",
    birth_date: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!user.member) {
      navigate("/perfil");
      toast({
        title: i18n.language === 'en' ? 'No member information' : 'Sin información de miembro',
        description: i18n.language === 'en'
          ? 'You need to be a member to edit member information'
          : 'Necesitas ser miembro para editar la información del miembro',
        variant: "destructive",
      });
      return;
    }

    // Inicializar formulario con datos del miembro actual
    const member = user.member;
    setFormData({
      document_type: (member.document_type as "DNI" | "PASAPORTE" | "NIE") || "DNI",
      document_number: member.document_number || "",
      birth_date: member.birth_date ? member.birth_date.split('T')[0] : "",
    });
  }, [user, navigate, toast, i18n]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.member) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('dame_access_token');
      if (!accessToken) {
        throw new Error(i18n.language === 'en' ? 'Authentication required' : 'Autenticación requerida');
      }

      const payload: {
        document_type?: "DNI" | "PASAPORTE" | "NIE";
        document_number?: string;
        birth_date?: string;
      } = {};

      // Solo incluir campos que han cambiado
      if (formData.document_type !== user.member.document_type) {
        payload.document_type = formData.document_type;
      }
      if (formData.document_number.trim() !== user.member.document_number) {
        payload.document_number = formData.document_number.trim().toUpperCase();
      }
      if (formData.birth_date && formData.birth_date !== user.member.birth_date.split('T')[0]) {
        payload.birth_date = formData.birth_date;
      }

      // Si no hay cambios, no hacer la petición
      if (Object.keys(payload).length === 0) {
        toast({
          title: i18n.language === 'en' ? 'No changes' : 'Sin cambios',
          description: i18n.language === 'en'
            ? 'No changes were made'
            : 'No se realizaron cambios',
        });
        setSaving(false);
        return;
      }

      const result = await authApi.updateMember(accessToken, payload);

      if (!result.ok || !result.data?.success) {
        const errorMessages: Record<string, string> = {};
        
        if (result.data?.errors) {
          Object.entries(result.data.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              errorMessages[key] = messages[0];
            } else if (typeof messages === 'string') {
              errorMessages[key] = messages;
            }
          });
        }

        if (Object.keys(errorMessages).length > 0) {
          const firstError = Object.values(errorMessages)[0];
          throw new Error(firstError);
        } else {
          throw new Error(result.error || (i18n.language === 'en' ? 'Error updating member' : 'Error al actualizar miembro'));
        }
      }

      toast({
        title: i18n.language === 'en' ? 'Success!' : '¡Éxito!',
        description: result.data.message || (i18n.language === 'en' ? 'Member information updated successfully' : 'Información del miembro actualizada exitosamente'),
      });

      // Refrescar el perfil para obtener los nuevos datos
      await refreshUser();

      // Redirigir al perfil
      navigate("/perfil");
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: error.message || (i18n.language === 'en' ? 'Failed to update member information' : 'Error al actualizar la información del miembro'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/perfil")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {i18n.language === 'en' ? 'Back to Profile' : 'Volver al Perfil'}
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {i18n.language === 'en' ? 'Edit Member Information' : 'Editar Información de Miembro'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {i18n.language === 'en' 
              ? 'Update your member information'
              : 'Actualiza tu información de miembro'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              {i18n.language === 'en' ? 'Member Information' : 'Información del Miembro'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'en' 
                ? 'Update your document and personal information'
                : 'Actualiza tu documento e información personal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document_type">
                  {i18n.language === 'en' ? 'Document Type' : 'Tipo de Documento'}
                </Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value: "DNI" | "PASAPORTE" | "NIE") =>
                    setFormData({ ...formData, document_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="NIE">NIE</SelectItem>
                    <SelectItem value="PASAPORTE">
                      {i18n.language === 'en' ? 'Passport' : 'Pasaporte'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_number">
                  {i18n.language === 'en' ? 'Document Number' : 'Número de Documento'}
                </Label>
                <Input
                  id="document_number"
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder={i18n.language === 'en' ? 'Enter document number' : 'Ingresa el número de documento'}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  {i18n.language === 'en' ? 'Birth Date' : 'Fecha de Nacimiento'}
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/perfil")}
                  className="flex-1"
                >
                  {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {i18n.language === 'en' ? 'Saving...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditMember;





