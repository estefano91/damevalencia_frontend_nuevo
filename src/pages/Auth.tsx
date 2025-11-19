import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Music, Heart } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, loginWithGoogle, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/demo");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({ title: "¡Bienvenido/a de vuelta! 🎉" });
          navigate("/demo");
        } else {
          throw new Error(result.error);
        }
      } else {
        // Validar contraseñas antes de enviar
        if (password !== passwordConfirm) {
          throw new Error("Las contraseñas no coinciden");
        }

        const result = await register({
          email,
          password,
          password_confirm: passwordConfirm,
        });
        if (result.success) {
          toast({ title: "¡Cuenta creada exitosamente! ✨" });
          navigate("/demo");
        } else {
          throw new Error(result.error || "Error al registrar usuario");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast({
        title: "Error",
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
          title: result.isNewUser ? "¡Cuenta conectada con Google!" : "¡Bienvenido/a con Google! 🎉",
        });
        navigate("/demo");
      } else {
        throw new Error(result.error || "No se pudo iniciar sesión con Google");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo conectar con Google";
      toast({
        title: "Error con Google",
        description: message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    toast({
      title: "Google Sign-In",
      description: message,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2 text-4xl mb-2">
            <Palette className="text-purple-600" />
            <Music className="text-pink-600" />
            <Heart className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isLogin ? "¡Bienvenido/a!" : "Únete a DAME"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin 
              ? "Inicia sesión en la comunidad de arte y cultura de Valencia" 
              : "Crea tu perfil en la Asociación DAME - Arte, Cultura y Bienestar"
            }
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground">
                El username se generará automáticamente a partir de tu email
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-muted" />
          <span className="text-xs uppercase text-muted-foreground">o</span>
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
              Verificando tu cuenta con Google...
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm space-y-2">
            {isLogin ? (
              <>
                <div>
                  <span className="text-muted-foreground">¿No tienes cuenta? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setEmail("");
                      setPassword("");
                      setPasswordConfirm("");
                    }}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Regístrate aquí
                  </button>
                </div>
                <div>
                  <span className="text-muted-foreground">O </span>
                  <Link
                    to="/register"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    crea una cuenta nueva
                  </Link>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setEmail("");
                  setPassword("");
                  setPasswordConfirm("");
                }}
                className="text-purple-600 hover:underline font-medium"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
          </div>

          {!isLogin && (
            <div className="text-xs text-center text-muted-foreground space-y-2">
              <p>Al crear tu cuenta, aceptas nuestros términos de uso y política de privacidad.</p>
              <p className="font-medium text-purple-600">
                ¡Únete a nuestra comunidad de más de 10K miembros de 50+ países!
              </p>
            </div>
          )}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Asociación DAME - Valencia, España
          </p>
          <p className="text-xs text-purple-600 font-medium">
            Arte • Cultura • Música • Bienestar
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
