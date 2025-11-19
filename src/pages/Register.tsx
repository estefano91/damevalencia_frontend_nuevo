import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Music, Heart, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { user, register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // Validaciones en tiempo real
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Validar email
  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      return i18n.language === 'en' ? 'Email is required' : 'El email es requerido';
    }
    if (!emailRegex.test(emailValue)) {
      return i18n.language === 'en' ? 'Invalid email format' : 'Formato de email inválido';
    }
    return null;
  };

  // Validar contraseña
  const validatePassword = (passwordValue: string) => {
    if (!passwordValue) {
      return i18n.language === 'en' ? 'Password is required' : 'La contraseña es requerida';
    }
    if (passwordValue.length < 6) {
      return i18n.language === 'en' ? 'Password must be at least 6 characters' : 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  // Validar confirmación de contraseña
  const validatePasswordConfirm = (passwordConfirmValue: string) => {
    if (!passwordConfirmValue) {
      return i18n.language === 'en' ? 'Password confirmation is required' : 'La confirmación de contraseña es requerida';
    }
    if (passwordConfirmValue !== password) {
      return i18n.language === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden';
    }
    return null;
  };

  // Validación en tiempo real
  const handleEmailChange = (value: string) => {
    setEmail(value);
    const error = validateEmail(value);
    setErrors(prev => ({ ...prev, email: error || undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, password: error || undefined }));
    // Revalidar confirmación si ya existe
    if (passwordConfirm) {
      const confirmError = validatePasswordConfirm(passwordConfirm);
      setErrors(prev => ({ ...prev, passwordConfirm: confirmError || undefined }));
    }
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    const error = validatePasswordConfirm(value);
    setErrors(prev => ({ ...prev, passwordConfirm: error || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar todos los campos
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordConfirmError = validatePasswordConfirm(passwordConfirm);

    if (emailError || passwordError || passwordConfirmError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
        passwordConfirm: passwordConfirmError || undefined,
      });
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        email,
        password,
        password_confirm: passwordConfirm,
      });

      if (result.success) {
        toast({ 
          title: i18n.language === 'en' ? "Account created successfully! ✨" : "¡Cuenta creada exitosamente! ✨",
          description: i18n.language === 'en' 
            ? "Welcome to DAME Valencia!" 
            : "¡Bienvenido/a a DAME Valencia!"
        });
        navigate("/");
      } else {
        throw new Error(result.error || (i18n.language === 'en' ? "Error registering user" : "Error al registrar usuario"));
      }
    } catch (error: any) {
      toast({
        title: i18n.language === 'en' ? "Error" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Criterios de contraseña
  const passwordCriteria = {
    minLength: password.length >= 6,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center space-x-2 text-4xl mb-2">
            <Palette className="text-purple-600" />
            <Music className="text-pink-600" />
            <Heart className="text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
            {i18n.language === 'en' ? 'Join DAME' : 'Únete a DAME'}
          </CardTitle>
          <CardDescription className="text-center">
            {i18n.language === 'en' 
              ? "Create your profile in the DAME Association - Art, Culture and Wellbeing" 
              : "Crea tu perfil en la Asociación DAME - Arte, Cultura y Bienestar"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {i18n.language === 'en' ? 'Email' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={i18n.language === 'en' ? 'your@email.com' : 'tu@email.com'}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
              {!errors.email && email && (
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'en' 
                    ? 'Username will be generated automatically from your email' 
                    : 'El username se generará automáticamente a partir de tu email'}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {i18n.language === 'en' ? 'Password' : 'Contraseña'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={i18n.language === 'en' ? '••••••••' : '••••••••'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
              {password && !errors.password && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {i18n.language === 'en' ? 'Password requirements:' : 'Requisitos de contraseña:'}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {passwordCriteria.minLength ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={passwordCriteria.minLength ? "text-green-600" : "text-muted-foreground"}>
                      {i18n.language === 'en' ? 'Minimum 6 characters' : 'Mínimo 6 caracteres'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {i18n.language === 'en' ? 'Confirm Password' : 'Confirmar Contraseña'}
              </Label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder={i18n.language === 'en' ? '••••••••' : '••••••••'}
                  value={passwordConfirm}
                  onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                  required
                  className={errors.passwordConfirm ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={loading}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.passwordConfirm}
                </p>
              )}
              {passwordConfirm && !errors.passwordConfirm && password === passwordConfirm && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {i18n.language === 'en' ? 'Passwords match' : 'Las contraseñas coinciden'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
              disabled={loading || !!errors.email || !!errors.password || !!errors.passwordConfirm}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {i18n.language === 'en' ? 'Create Account' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Footer */}
          <div className="space-y-4 mt-6">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {i18n.language === 'en' ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
              </span>
              <Link
                to="/auth"
                className="text-purple-600 hover:underline font-medium"
              >
                {i18n.language === 'en' ? 'Sign in' : 'Inicia sesión'}
              </Link>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-2">
              <p>
                {i18n.language === 'en' 
                  ? 'By creating an account, you agree to our Terms of Use and Privacy Policy.'
                  : 'Al crear tu cuenta, aceptas nuestros Términos de Uso y Política de Privacidad.'}
              </p>
              <p className="font-medium text-purple-600">
                {i18n.language === 'en' 
                  ? 'Join our community of over 10K members from 50+ countries!'
                  : '¡Únete a nuestra comunidad de más de 10K miembros de 50+ países!'}
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t mt-6">
            <p className="text-xs text-muted-foreground">
              DAME Association - Valencia, Spain
            </p>
            <p className="text-xs text-purple-600 font-medium">
              Art • Culture • Music • Wellbeing
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

