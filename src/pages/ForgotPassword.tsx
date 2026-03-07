import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import logoDame from "@/assets/1.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authApi.passwordRecoveryRequest(email.trim());
      if (result.ok && result.data?.success) {
        setSent(true);
        const message =
          result.data.message ||
          (i18n.language === "en"
            ? "If that email is in our system, you will receive instructions in your inbox."
            : "Si el correo existe en nuestra base de datos recibirás instrucciones en tu bandeja.");
        toast({
          title: i18n.language === "en" ? "Email sent" : "Correo enviado",
          description: message,
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.error || (i18n.language === "en" ? "Invalid email" : "Introduce un correo válido."),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t("common.error"),
        description: i18n.language === "en" ? "Could not send recovery email" : "No se pudo enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md p-5 space-y-4 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent pointer-events-none" />

        <div className="text-center space-y-2 pt-1 relative z-10">
          <div className="flex justify-center mb-1">
            <img src={logoDame} alt="DAME Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            {i18n.language === "en" ? "Recover password" : "Recuperar contraseña"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {i18n.language === "en"
              ? "Enter your email and we'll send you a link to reset your password."
              : "Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña."}
          </p>
        </div>

        <CardContent className="pt-2 relative z-10">
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {i18n.language === "en"
                  ? "If that email is in our database, you will receive instructions in your inbox. Check your spam folder."
                  : "Si el correo existe en nuestra base de datos recibirás instrucciones en tu bandeja. Revisa la carpeta de spam."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {i18n.language === "en" ? "Back to login" : "Volver al inicio de sesión"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t("auth.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={i18n.language === "en" ? "your@email.com" : "tu@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
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
                {i18n.language === "en" ? "Send recovery link" : "Enviar enlace de recuperación"}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
