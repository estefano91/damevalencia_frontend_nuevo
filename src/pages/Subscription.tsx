import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, Crown, Star, Sparkles, AlertCircle } from "lucide-react";
import type { SubscriptionType } from "@types/auth";

interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

const Subscription = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionType>("FREE");

  const plans: SubscriptionPlan[] = [
    {
      type: "FREE",
      name: "Miembro FREE",
      nameEn: "FREE Member",
      price: 0,
      description: "Plan básico gratuito para todos los miembros",
      descriptionEn: "Basic free plan for all members",
      features: [
        "Acceso a eventos",
        "Código de miembro único",
        "Participación en actividades",
      ],
      featuresEn: [
        "Access to events",
        "Unique member code",
        "Participation in activities",
      ],
      icon: <Star className="h-6 w-6" />,
      color: "text-gray-600",
      borderColor: "border-gray-300",
    },
    {
      type: "VIP",
      name: "Miembro VIP",
      nameEn: "VIP Member",
      price: 9.99,
      description: "Plan premium con beneficios exclusivos",
      descriptionEn: "Premium plan with exclusive benefits",
      features: [
        "Todo lo del plan FREE",
        "Descuentos exclusivos",
        "Acceso prioritario a eventos",
        "Soporte prioritario",
      ],
      featuresEn: [
        "Everything from FREE plan",
        "Exclusive discounts",
        "Priority access to events",
        "Priority support",
      ],
      icon: <Crown className="h-6 w-6" />,
      color: "text-purple-600",
      borderColor: "border-purple-400",
    },
    {
      type: "SUPER",
      name: "SuperMiembro",
      nameEn: "SuperMember",
      price: 19.99,
      description: "Plan máximo con todos los beneficios",
      descriptionEn: "Maximum plan with all benefits",
      features: [
        "Todo lo del plan VIP",
        "Descuentos adicionales",
        "Acceso VIP a eventos especiales",
        "Soporte premium 24/7",
        "Beneficios exclusivos",
      ],
      featuresEn: [
        "Everything from VIP plan",
        "Additional discounts",
        "VIP access to special events",
        "Premium 24/7 support",
        "Exclusive benefits",
      ],
      icon: <Sparkles className="h-6 w-6" />,
      color: "text-yellow-600",
      borderColor: "border-yellow-400",
    },
  ];

  useEffect(() => {
    if (user?.member) {
      // Si no hay subscription_type, se trata como FREE (por defecto)
      setCurrentSubscription((user.member.subscription_type || "FREE") as SubscriptionType);
    } else {
      setCurrentSubscription("FREE");
    }
  }, [user]);

  const handleChangeSubscription = async (planType: SubscriptionType) => {
    if (planType === currentSubscription) {
      toast({
        title: i18n.language === 'en' ? 'Already subscribed' : 'Ya estás suscrito',
        description: i18n.language === 'en' 
          ? `You are already on the ${plans.find(p => p.type === planType)?.nameEn} plan`
          : `Ya estás en el plan ${plans.find(p => p.type === planType)?.name}`,
        variant: "default",
      });
      return;
    }

    if (planType === "SUPER") {
      toast({
        title: i18n.language === 'en' ? 'Coming Soon' : 'Próximamente',
        description: i18n.language === 'en' 
          ? 'SuperMember plan will be available soon'
          : 'El plan SuperMiembro estará disponible próximamente',
        variant: "default",
      });
      return;
    }

    if (planType === "FREE") {
      toast({
        title: i18n.language === 'en' ? 'Cannot downgrade' : 'No se puede degradar',
        description: i18n.language === 'en' 
          ? 'Please contact support to change your subscription'
          : 'Por favor contacta con soporte para cambiar tu suscripción',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('dame_access_token');
      if (!accessToken) {
        throw new Error(i18n.language === 'en' ? 'Authentication required' : 'Autenticación requerida');
      }

      const result = await authApi.updateSubscription(accessToken, planType);

      if (!result.ok || !result.data?.success) {
        throw new Error(result.error || result.data?.message || (i18n.language === 'en' ? 'Error updating subscription' : 'Error al actualizar suscripción'));
      }

      toast({
        title: i18n.language === 'en' ? 'Subscription updated!' : '¡Suscripción actualizada!',
        description: i18n.language === 'en' 
          ? `You are now a ${plans.find(p => p.type === planType)?.nameEn}`
          : `Ahora eres ${plans.find(p => p.type === planType)?.name}`,
      });

      await refreshUser();
      navigate("/perfil");
    } catch (error: any) {
      toast({
        title: i18n.language === 'en' ? 'Error' : 'Error',
        description: error.message || (i18n.language === 'en' ? 'Error updating subscription' : 'Error al actualizar suscripción'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEnglish = i18n.language === 'en';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-900 dark:to-gray-950">
      <nav className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/perfil")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isEnglish ? 'Subscription Plans' : 'Planes de Suscripción'}
            </p>
            <p className="text-base sm:text-lg font-semibold leading-tight">
              {isEnglish ? 'Choose Your Plan' : 'Elige Tu Plan'}
            </p>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-6">
        {/* Current Subscription Alert */}
        {user.member && (
          <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              <strong>{isEnglish ? 'Current Plan:' : 'Plan Actual:'}</strong>{" "}
              {isEnglish 
                ? plans.find(p => p.type === (user.member?.subscription_type || "FREE"))?.nameEn
                : plans.find(p => p.type === (user.member?.subscription_type || "FREE"))?.name}
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.type === currentSubscription;
            const isUpgrade = 
              (currentSubscription === "FREE" && plan.type === "VIP") ||
              (currentSubscription === "VIP" && plan.type === "SUPER" && false); // SuperMiembro aún no disponible
            const isComingSoon = plan.type === "SUPER";

            return (
              <Card
                key={plan.type}
                className={`relative ${
                  isCurrent 
                    ? `${plan.borderColor} border-2 shadow-lg scale-105` 
                    : plan.borderColor
                } transition-all hover:shadow-md`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                    {isEnglish ? 'Current Plan' : 'Plan Actual'}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">
                    {isEnglish ? plan.nameEn : plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {isEnglish ? plan.descriptionEn : plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    {plan.type === "SUPER" ? (
                      <span className="text-xl font-bold text-muted-foreground">
                        {isEnglish ? 'Coming Soon' : 'Próximamente'}
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{plan.price.toFixed(2)}€</span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground text-sm ml-1">
                            {isEnglish ? '/month' : '/mes'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {(isEnglish ? plan.featuresEn : plan.features).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      isCurrent || isComingSoon
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isUpgrade
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={loading || isCurrent || !isUpgrade || isComingSoon}
                    onClick={() => handleChangeSubscription(plan.type)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEnglish ? 'Processing...' : 'Procesando...'}
                      </>
                    ) : isCurrent ? (
                      isEnglish ? 'Current Plan' : 'Plan Actual'
                    ) : isComingSoon ? (
                      isEnglish ? 'Coming Soon' : 'Próximamente'
                    ) : isUpgrade ? (
                      isEnglish ? 'Upgrade Now' : 'Actualizar Ahora'
                    ) : (
                      isEnglish ? 'Contact Support' : 'Contactar Soporte'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isEnglish 
              ? 'Subscription changes will be processed immediately. For downgrades or cancellations, please contact support.'
              : 'Los cambios de suscripción se procesarán inmediatamente. Para degradaciones o cancelaciones, por favor contacta con soporte.'}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Subscription;

