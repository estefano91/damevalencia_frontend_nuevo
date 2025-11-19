import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, IdCard, AlertCircle, CheckCircle } from "lucide-react";
import type { CreateMemberPayload } from "@types/auth";

const Membership = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMemberPayload>({
    document_type: "DNI",
    document_number: "",
    birth_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validaciones de formato de documento
  const validateDocument = (type: string, number: string): string | null => {
    const trimmed = number.trim().toUpperCase();
    
    if (type === "DNI") {
      // DNI: 8 dígitos + letra
      const dniRegex = /^\d{8}[A-Z]$/;
      if (!dniRegex.test(trimmed)) {
        return i18n.language === 'en' 
          ? "Invalid DNI format (8 digits + letter)"
          : "Formato de DNI inválido (8 dígitos + letra)";
      }
    } else if (type === "NIE") {
      // NIE: X/Y/Z + 7 dígitos + letra
      const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
      if (!nieRegex.test(trimmed)) {
        return i18n.language === 'en'
          ? "Invalid NIE format (X/Y/Z + 7 digits + letter)"
          : "Formato de NIE inválido (X/Y/Z + 7 dígitos + letra)";
      }
    } else if (type === "PASAPORTE") {
      // PASAPORTE: Mínimo 6 caracteres
      if (trimmed.length < 6) {
        return i18n.language === 'en'
          ? "Passport must have at least 6 characters"
          : "El pasaporte debe tener al menos 6 caracteres";
      }
    }
    
    return null;
  };

  const validateBirthDate = (date: string): string | null => {
    if (!date) {
      return i18n.language === 'en' ? "Birth date is required" : "La fecha de nacimiento es requerida";
    }
    
    const birthDate = new Date(date);
    const today = new Date();
    
    if (birthDate > today) {
      return i18n.language === 'en'
        ? "Birth date cannot be in the future"
        : "La fecha de nacimiento no puede ser futura";
    }
    
    // Validar que la edad sea razonable (máximo 150 años)
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) {
      return i18n.language === 'en'
        ? "Please enter a valid birth date"
        : "Por favor ingresa una fecha de nacimiento válida";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validaciones
    const docError = validateDocument(formData.document_type, formData.document_number);
    const dateError = validateBirthDate(formData.birth_date);

    if (docError || dateError) {
      setErrors({
        ...(docError && { document_number: docError }),
        ...(dateError && { birth_date: dateError }),
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('dame_access_token');
      if (!accessToken) {
        throw new Error(i18n.language === 'en' ? 'Authentication required' : 'Autenticación requerida');
      }

      const result = await authApi.createMember(accessToken, {
        ...formData,
        document_number: formData.document_number.trim().toUpperCase(),
      });

      if (!result.ok || !result.data?.success) {
        // Extraer errores del response
        const errorMessages: Record<string, string> = {};
        
        // Intentar extraer errores de result.data.errors
        if (result.data?.errors) {
          Object.entries(result.data.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              errorMessages[key] = messages[0];
            } else if (typeof messages === 'string') {
              errorMessages[key] = messages;
            }
          });
        }
        
        // También intentar extraer del raw response
        if (result.raw && typeof result.raw === 'object' && 'errors' in result.raw) {
          const rawErrors = (result.raw as { errors?: Record<string, string[]> }).errors;
          if (rawErrors) {
            Object.entries(rawErrors).forEach(([key, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                errorMessages[key] = messages[0];
              } else if (typeof messages === 'string') {
                errorMessages[key] = messages;
              }
            });
          }
        }
        
        if (Object.keys(errorMessages).length > 0) {
          setErrors(errorMessages);
        } else {
          const errorMsg = result.error || result.data?.message || (i18n.language === 'en' ? 'Error creating member' : 'Error al crear miembro');
          toast({
            title: i18n.language === 'en' ? 'Error' : 'Error',
            description: errorMsg,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: i18n.language === 'en' ? 'Success!' : '¡Éxito!',
        description: result.data.message || (i18n.language === 'en' ? 'Member created/linked successfully' : 'Miembro creado/vinculado exitosamente'),
      });

      // Refrescar el perfil para obtener el nuevo miembro
      await refreshUser();

      // Redirigir al perfil
      navigate("/perfil");
    } catch (error: any) {
      console.error('Error creating member:', error);
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: error.message || (i18n.language === 'en' ? 'Failed to create member' : 'Error al crear miembro'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario ya tiene un miembro, mostrar mensaje
  if (user?.member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {i18n.language === 'en' ? 'Already a Member' : 'Ya eres miembro'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'en'
                ? 'You are already affiliated with the program.'
                : 'Ya estás afiliado al programa de beneficios.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <IdCard className="h-4 w-4" />
              <AlertTitle>{i18n.language === 'en' ? 'Member Information' : 'Información del miembro'}</AlertTitle>
              <AlertDescription>
                {i18n.language === 'en'
                  ? `Document: ${user.member.document_type} ${user.member.document_number}`
                  : `Documento: ${user.member.document_type} ${user.member.document_number}`}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {i18n.language === 'en' ? 'Back' : 'Volver'}
              </Button>
              <Button onClick={() => navigate("/perfil")} className="flex-1">
                {i18n.language === 'en' ? 'View Profile' : 'Ver Perfil'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <IdCard className="h-6 w-6 text-primary" />
              {i18n.language === 'en' ? 'Join Benefits Program' : 'Afiliarse al Programa de Beneficios'}
            </CardTitle>
            <CardDescription className="mt-2">
              {i18n.language === 'en'
                ? 'Create or link your membership to access exclusive benefits'
                : 'Crea o vincula tu membresía para acceder a beneficios exclusivos'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document_type">
              {i18n.language === 'en' ? 'Document Type' : 'Tipo de Documento'} *
            </Label>
            <Select
              value={formData.document_type}
              onValueChange={(value: "DNI" | "PASAPORTE" | "NIE") =>
                setFormData({ ...formData, document_type: value, document_number: "" })
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
            {formData.document_type === "DNI" && (
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'en'
                  ? 'Format: 8 digits + letter (e.g., 12345678A)'
                  : 'Formato: 8 dígitos + letra (ej: 12345678A)'}
              </p>
            )}
            {formData.document_type === "NIE" && (
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'en'
                  ? 'Format: X/Y/Z + 7 digits + letter (e.g., X1234567A)'
                  : 'Formato: X/Y/Z + 7 dígitos + letra (ej: X1234567A)'}
              </p>
            )}
            {formData.document_type === "PASAPORTE" && (
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'en'
                  ? 'Minimum 6 characters'
                  : 'Mínimo 6 caracteres'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_number">
              {i18n.language === 'en' ? 'Document Number' : 'Número de Documento'} *
            </Label>
            <Input
              id="document_number"
              value={formData.document_number}
              onChange={(e) =>
                setFormData({ ...formData, document_number: e.target.value.toUpperCase() })
              }
              placeholder={
                formData.document_type === "DNI"
                  ? "12345678A"
                  : formData.document_type === "NIE"
                  ? "X1234567A"
                  : i18n.language === 'en' ? "Passport number" : "Número de pasaporte"
              }
              className={errors.document_number ? "border-red-500" : ""}
            />
            {errors.document_number && (
              <p className="text-xs text-red-500">{errors.document_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">
              {i18n.language === 'en' ? 'Birth Date' : 'Fecha de Nacimiento'} *
            </Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={errors.birth_date ? "border-red-500" : ""}
            />
            {errors.birth_date && (
              <p className="text-xs text-red-500">{errors.birth_date}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {i18n.language === 'en' ? 'Processing...' : 'Procesando...'}
              </>
            ) : (
              i18n.language === 'en' ? 'Join Program' : 'Afiliarse'
            )}
          </Button>
        </form>

        <Alert variant="secondary">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{i18n.language === 'en' ? 'Important' : 'Importante'}</AlertTitle>
          <AlertDescription className="text-xs">
            {i18n.language === 'en'
              ? 'If your document is already registered, it will be linked to your account. Each user can only have one membership.'
              : 'Si tu documento ya está registrado, se vinculará a tu cuenta. Cada usuario solo puede tener una membresía.'}
          </AlertDescription>
        </Alert>
      </Card>
    </div>
  );
};

export default Membership;

