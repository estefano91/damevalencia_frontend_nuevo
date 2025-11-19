import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import logoDame from "@/assets/2.png";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const from = (location.state as { from?: string })?.from || "/";
  const { toast } = useToast();
  const { user, login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({ title: t("auth.welcomeBack") });
        navigate(from);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.unexpectedError");
      toast({
        title: t("common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleToken = async (idToken: string) => {
    if (!idToken || googleLoading) return;

    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        toast({
          title: result.isNewUser ? t("auth.accountConnected") : t("auth.welcomeGoogle"),
        });
        navigate(from);
      } else {
        throw new Error(result.error || t("auth.googleLoginError"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.googleConnectionError");
      toast({
        title: t("auth.googleSignInError"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    toast({
      title: t("auth.googleSignInTitle"),
      description: message,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl relative">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">{t("auth.home")}</span>
        </Button>
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src={logoDame} 
              alt="DAME Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("auth.welcome")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.welcomeDesc")}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.signIn")}
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-muted" />
          <span className="text-xs uppercase text-muted-foreground">{t("auth.or")}</span>
          <div className="h-px flex-1 bg-muted" />
        </div>

        <div className="space-y-2">
          <GoogleSignInButton
            onToken={handleGoogleToken}
            onError={handleGoogleError}
            disabled={loading || googleLoading}
          />
          {googleLoading && (
            <p className="text-xs text-center text-muted-foreground">
              {t("auth.verifyingGoogle")}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t("auth.noAccount")}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/register")}
              className="w-full"
            >
              {t("auth.createAccount")}
            </Button>
          </div>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {t("auth.association")}
          </p>
          <p className="text-xs text-purple-600 font-medium">
            {t("auth.tagline")}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
