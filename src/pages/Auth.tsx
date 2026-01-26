import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import logoDame from "@/assets/1.png";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md p-5 space-y-4 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent pointer-events-none" />
        
        <div className="text-center space-y-2 pt-1 relative z-10">
          <div className="flex justify-center mb-1">
            <img 
              src={logoDame} 
              alt="DAME Logo" 
              className="h-14 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            {t("auth.welcome")}
          </h1>
        </div>

        <CardContent className="pt-2 relative z-10">
          {/* Google Sign In Button - First */}
          <div className="space-y-2 mb-4">
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

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
            <span className="text-xs uppercase text-muted-foreground font-medium px-2">{t("auth.or")}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
                className="transition-all duration-200 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                disabled={loading || googleLoading}
              />
            </div>

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="transition-all duration-200 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                disabled={loading || googleLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={loading || googleLoading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.signIn")}
            </Button>
          </form>

          <div className="space-y-2 mt-4">
            <div className="text-center text-xs">
              <span className="text-muted-foreground">
                {t("auth.noAccount")} 
              </span>
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/register")}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium transition-colors p-0 h-auto ml-1"
              >
                {t("auth.createAccount")}
              </Button>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
            <p className="text-xs text-muted-foreground">
              {t("auth.association")}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              {t("auth.tagline")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
