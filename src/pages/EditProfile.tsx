import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  User, 
  MapPin, 
  Phone, 
  Instagram,
  Mail,
  FileText,
  Globe
} from "lucide-react";
import type { UpdateProfileData } from "@/integrations/dame-api/types";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    full_name: "",
    bio: "",
    location: "",
    phone: "",
    instagram: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Inicializar formulario con datos del usuario actual
    setFormData({
      full_name: user.full_name || "",
      bio: user.bio || "",
      location: user.location || "",
      phone: user.phone || "",
      instagram: user.instagram || "",
    });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('dame_access_token');
      if (!accessToken) {
        throw new Error(i18n.language === 'en' ? 'Authentication required' : 'Autenticación requerida');
      }

      // Intentar actualizar usando el endpoint del perfil del usuario actual
      const endpoint = `${import.meta.env.VITE_DAME_API_URL || 'https://organizaciondame.org/api'}/users/profile/`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {i18n.language === 'en' ? 'Edit Profile' : 'Editar Perfil'}
            </h1>
            <p className="text-muted-foreground">
              {i18n.language === 'en' 
                ? 'Update your personal information and preferences' 
                : 'Actualiza tu información personal y preferencias'}
            </p>
          </div>
        </div>

        {/* Avatar Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user?.full_name || user?.email}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
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
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {i18n.language === 'en' ? 'Basic Information' : 'Información Básica'}
                </CardTitle>
                <CardDescription>
                  {i18n.language === 'en' 
                    ? 'Your basic profile information' 
                    : 'Tu información de perfil básica'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {i18n.language === 'en' ? 'Full Name' : 'Nombre Completo'}
                  </Label>
                  <Input
                    id="full_name"
                    placeholder={i18n.language === 'en' ? 'Enter your full name' : 'Ingresa tu nombre completo'}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {i18n.language === 'en' ? 'Email' : 'Correo Electrónico'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {i18n.language === 'en' 
                      ? 'Email cannot be changed' 
                      : 'El correo electrónico no puede ser modificado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {i18n.language === 'en' ? 'Bio' : 'Biografía'}
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder={i18n.language === 'en' ? 'Tell us about yourself...' : 'Cuéntanos sobre ti...'}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio?.length || 0}/500 {i18n.language === 'en' ? 'characters' : 'caracteres'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {i18n.language === 'en' ? 'Contact Information' : 'Información de Contacto'}
                </CardTitle>
                <CardDescription>
                  {i18n.language === 'en' 
                    ? 'How others can reach you' 
                    : 'Cómo pueden contactarte'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {i18n.language === 'en' ? 'Location' : 'Ubicación'}
                  </Label>
                  <Input
                    id="location"
                    placeholder={i18n.language === 'en' ? 'City, Country' : 'Ciudad, País'}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {i18n.language === 'en' ? 'Phone' : 'Teléfono'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={i18n.language === 'en' ? '+34 123 456 789' : '+34 123 456 789'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder={i18n.language === 'en' ? '@username' : '@usuario'}
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

