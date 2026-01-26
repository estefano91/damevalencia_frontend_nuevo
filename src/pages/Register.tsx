import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import logoDame from "@/assets/1.png";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { user, register, login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
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
        // Verificar si el error indica que el usuario ya existe
        const errorMessage = result.error?.toLowerCase() || '';
        const isUserExists = 
          errorMessage.includes('already exists') ||
          errorMessage.includes('ya existe') ||
          errorMessage.includes('already registered') ||
          errorMessage.includes('ya registrado') ||
          errorMessage.includes('email') && (errorMessage.includes('taken') || errorMessage.includes('ocupado') || errorMessage.includes('en uso')) ||
          errorMessage.includes('username') && (errorMessage.includes('taken') || errorMessage.includes('ocupado') || errorMessage.includes('en uso'));

        if (isUserExists) {
          // Intentar hacer login automáticamente
          const loginResult = await login(email, password);
          
          if (loginResult.success) {
            toast({ 
              title: i18n.language === 'en' ? "Welcome back! ✨" : "¡Bienvenido de nuevo! ✨",
              description: i18n.language === 'en' 
                ? "You've been logged in successfully" 
                : "Has iniciado sesión exitosamente"
            });
            navigate("/");
            return;
          } else {
            // Si el login falla, mostrar el error del login
            throw new Error(loginResult.error || (i18n.language === 'en' ? "Invalid credentials" : "Credenciales inválidas"));
          }
        } else {
          // Si no es un error de usuario existente, mostrar el error original
          throw new Error(result.error || (i18n.language === 'en' ? "Error registering user" : "Error al registrar usuario"));
        }
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

  const handleGoogleToken = async (idToken: string) => {
    if (!idToken || googleLoading) return;

    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        toast({ 
          title: result.isNewUser 
            ? (i18n.language === 'en' ? "Account created successfully! ✨" : "¡Cuenta creada exitosamente! ✨")
            : (i18n.language === 'en' ? "Welcome back! ✨" : "¡Bienvenido de nuevo! ✨"),
          description: i18n.language === 'en' 
            ? "Welcome to DAME Valencia!" 
            : "¡Bienvenido/a a DAME Valencia!"
        });
        navigate("/");
      } else {
        throw new Error(result.error || (i18n.language === 'en' ? "Error registering with Google" : "Error al registrar con Google"));
      }
    } catch (error: any) {
      toast({
        title: i18n.language === 'en' ? "Error" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    toast({
      title: i18n.language === 'en' ? "Google Sign-In Error" : "Error de Google Sign-In",
      description: message,
      variant: "destructive",
    });
  };

  // Criterios de contraseña
  const passwordCriteria = {
    minLength: password.length >= 6,
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
            {i18n.language === 'en' ? 'Join DAME' : 'Únete a DAME'}
          </h1>
        </div>

        <CardContent className="pt-2 relative z-10">
          {/* Google Sign In Button - First */}
          <div className="space-y-2 mb-4">
            <GoogleSignInButton
              onToken={handleGoogleToken}
              onError={handleGoogleError}
              disabled={loading || googleLoading}
              buttonText="signup_with"
            />
            {googleLoading && (
              <p className="text-xs text-center text-muted-foreground">
                {i18n.language === 'en' ? 'Verifying with Google...' : 'Verificando con Google...'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
            <span className="text-xs uppercase text-muted-foreground font-medium px-2">{i18n.language === 'en' ? 'OR' : 'O'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="space-y-1">
              <Input
                id="email"
                type="email"
                placeholder={i18n.language === 'en' ? 'Email' : 'Email'}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                autoComplete="off"
                required
                className={`transition-all duration-200 ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                }`}
                disabled={loading || googleLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={i18n.language === 'en' ? 'Password' : 'Contraseña'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  className={`transition-all duration-200 pr-10 ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  disabled={loading || googleLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || googleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder={i18n.language === 'en' ? 'Confirm Password' : 'Confirmar Contraseña'}
                  value={passwordConfirm}
                  onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                  required
                  className={`transition-all duration-200 pr-10 ${
                    errors.passwordConfirm 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : passwordConfirm && password === passwordConfirm
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  disabled={loading || googleLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={loading || googleLoading}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.passwordConfirm}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={loading || googleLoading || !!errors.email || !!errors.password || !!errors.passwordConfirm}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {i18n.language === 'en' ? 'Create Account' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Footer */}
          <div className="space-y-2 mt-4">
            <div className="text-center text-xs">
              <span className="text-muted-foreground">
                {i18n.language === 'en' ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
              </span>
              <Link
                to="/auth"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium transition-colors"
              >
                {i18n.language === 'en' ? 'Sign in' : 'Inicia sesión'}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

