import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Lock } from "lucide-react";
import logoDame from "@/assets/1.png";

const PASSWORD_MIN_LENGTH = 8;
const hasUpperCase = (s: string) => /[A-Z]/.test(s);
const hasLowerCase = (s: string) => /[a-z]/.test(s);
const hasNumber = (s: string) => /\d/.test(s);

const RecoveryPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [noCode, setNoCode] = useState(false);

  useEffect(() => {
    if (!codeFromUrl.trim()) setNoCode(true);
  }, [codeFromUrl]);

  const isValidPassword = (p: string) =>
    p.length >= PASSWORD_MIN_LENGTH && hasUpperCase(p) && hasLowerCase(p) && hasNumber(p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeFromUrl.trim()) return;

    if (newPassword !== newPasswordConfirm) {
      toast({
        title: t("common.error"),
        description: i18n.language === "en" ? "Passwords do not match" : "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    if (!isValidPassword(newPassword)) {
      toast({
        title: t("common.error"),
        description:
          i18n.language === "en"
            ? "Password must be at least 8 characters with one uppercase, one lowercase and one number."
            : "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.passwordRecoveryConfirm({
        code: codeFromUrl.trim(),
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      if (result.ok && result.data?.success) {
        toast({
          title: i18n.language === "en" ? "Password updated" : "Contraseña actualizada",
          description:
            result.data.message ||
            (i18n.language === "en" ? "You can now sign in with your new password." : "Ya puedes iniciar sesión con tu nueva contraseña."),
        });
        navigate("/auth", { replace: true });
      } else {
        toast({
          title: t("common.error"),
          description: result.error || (i18n.language === "en" ? "Could not update password" : "No se pudo actualizar la contraseña"),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("common.error"),
        description: i18n.language === "en" ? "An error occurred" : "Ocurrió un error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (noCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md p-6 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {i18n.language === "en"
                ? "This page requires a valid recovery link. Request a new one from the login page."
                : "Esta página requiere un enlace de recuperación válido. Solicita uno nuevo desde la página de inicio de sesión."}
            </p>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              {i18n.language === "en" ? "Request recovery link" : "Solicitar enlace de recuperación"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {i18n.language === "en" ? "Back to login" : "Volver al inicio de sesión"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md p-5 space-y-4 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent pointer-events-none" />

        <div className="text-center space-y-2 pt-1 relative z-10">
          <div className="flex justify-center mb-1">
            <img src={logoDame} alt="DAME Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            {i18n.language === "en" ? "Set new password" : "Nueva contraseña"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {i18n.language === "en"
              ? "Enter your new password (min 8 characters, one uppercase, one lowercase, one number)."
              : "Introduce tu nueva contraseña (mín. 8 caracteres, una mayúscula, una minúscula y un número)."}
          </p>
        </div>

        <CardContent className="pt-2 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="new_password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {i18n.language === "en" ? "New password" : "Nueva contraseña"}
              </label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new_password_confirm" className="text-sm font-medium text-foreground">
                {i18n.language === "en" ? "Confirm password" : "Confirmar contraseña"}
              </label>
              <Input
                id="new_password_confirm"
                type="password"
                placeholder="••••••••"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {i18n.language === "en" ? "Update password" : "Actualizar contraseña"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => navigate("/auth")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {i18n.language === "en" ? "Back to login" : "Volver al inicio de sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryPassword;
