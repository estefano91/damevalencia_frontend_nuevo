import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  User, 
  Mail
} from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Inicializar formulario con datos del usuario actual
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: i18n.language === 'en' ? 'Required fields' : 'Campos requeridos',
        description: i18n.language === 'en'
          ? 'Please complete your first and last name'
          : 'Por favor completa tu nombre y apellido',
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('dame_access_token');
      if (!accessToken) {
        throw new Error(i18n.language === 'en' ? 'Authentication required' : 'Autenticación requerida');
      }

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: user.email,
        username: user.username || user.email,
      };

      // Actualizar usando el endpoint oficial
      const endpoint = `${import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api'}/users/profile/update/`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores de autenticación
        if (response.status === 401 || response.status === 403) {
          // Token inválido o expirado
          localStorage.removeItem('dame_access_token');
          localStorage.removeItem('dame_refresh_token');
          toast({
            title: i18n.language === 'en' ? 'Session expired' : 'Sesión expirada',
            description: i18n.language === 'en' 
              ? 'Please log in again' 
              : 'Por favor, inicia sesión nuevamente',
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        let errorMessage = i18n.language === 'en' ? 'Error updating profile' : 'Error al actualizar perfil';
        
        if (result.message) {
          errorMessage = result.message;
        } else if (result.detail) {
          errorMessage = result.detail;
        } else if (result.error) {
          errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        }

        throw new Error(errorMessage);
      }

      toast({
        title: i18n.language === 'en' ? 'Profile updated successfully!' : '¡Perfil actualizado exitosamente!',
      });

      // Refrescar el usuario actualizado
      await refreshUser();

      // Redirigir a la página principal después de guardar
      navigate("/");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: error.message || (i18n.language === 'en' ? 'Failed to update profile' : 'Error al actualizar perfil'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:to-gray-900">
      <div className="mx-auto w-full max-w-3xl px-3 sm:px-5 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {i18n.language === 'en' ? 'Edit Profile' : 'Editar Perfil'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {i18n.language === 'en' 
                ? 'Update your personal information and preferences' 
                : 'Actualiza tu información personal y preferencias'}
            </p>
          </div>
        </div>

        {/* Avatar Section */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-semibold break-words">{user?.full_name || user?.email}</h3>
                <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {i18n.language === 'en' 
                    ? 'Avatar updates coming soon' 
                    : 'Actualización de avatar próximamente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {i18n.language === 'en' ? 'Personal information' : 'Información personal'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'en'
                  ? 'Only fields allowed by the official profile API.'
                  : 'Únicos campos permitidos por la API oficial.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{i18n.language === 'en' ? 'First name' : 'Nombre'}</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{i18n.language === 'en' ? 'Last name' : 'Apellido'}</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {i18n.language === 'en' ? 'Email (read only)' : 'Correo (solo lectura)'}
                </Label>
                <Input id="email" value={user?.email || ""} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {i18n.language === 'en' ? 'Username (read only)' : 'Usuario (solo lectura)'}
                </Label>
                <Input value={user?.username || user?.email || ""} readOnly className="bg-muted" />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {i18n.language === 'en' ? 'Saving...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {i18n.language === 'en' ? 'Save changes' : 'Guardar cambios'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

