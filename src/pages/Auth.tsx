import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Music, Heart } from "lucide-react";
import type { DameUserType } from "@/integrations/dame-api/types";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<DameUserType>("participant");

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
        const result = await register({
          email,
          password,
          full_name: fullName,
          user_type: userType,
        });
        if (result.success) {
          toast({ title: "¡Cuenta creada! Completa tu perfil. ✨" });
          navigate("/demo");
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">¿Cómo te defines?</Label>
                <Select value={userType} onValueChange={(value: DameUserType) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">🎭 Participante - Quiero aprender y disfrutar</SelectItem>
                    <SelectItem value="instructor">👨‍🏫 Instructor/a - Enseño baile, música o arte</SelectItem>
                    <SelectItem value="artist">🎨 Artista - Creador/a y performer</SelectItem>
                    <SelectItem value="volunteer">🤝 Voluntario/a - Quiero colaborar</SelectItem>
                    <SelectItem value="coordinator">📋 Coordinador/a - Organizo actividades</SelectItem>
                    <SelectItem value="sponsor">💼 Patrocinador/a - Apoyo la organización</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

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

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                // Limpiar campos al cambiar modo
                setEmail("");
                setPassword("");
                setFullName("");
                setUserType("participant");
              }}
              className="text-purple-600 hover:underline font-medium"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
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
