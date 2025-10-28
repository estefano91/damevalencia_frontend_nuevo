import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { 
  Star, Trophy, Users, TrendingUp, Award, Zap, 
  CheckCircle, ArrowRight, Gift, Target
} from "lucide-react";

const BecomeReferrer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);

  const handleBecomeReferrer = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Llamar a la función para convertirse en referente
      const { data, error } = await supabase.rpc('become_referrer', {
        user_id: user.id
      });

      if (error) throw error;

      // Obtener el código generado
      const { data: profile } = await supabase
        .from('profiles')
        .select('referrer_code')
        .eq('id', user.id)
        .single();

      if (profile?.referrer_code) {
        setReferrerCode(profile.referrer_code);
        toast({
          title: "¡Felicitaciones!",
          description: "Ahora eres un Referente de AURA Sports",
        });
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

  const benefits = [
    {
      icon: Users,
      title: "Expande tu Red",
      description: "Ayuda a conectar talento con oportunidades y construye una red sólida"
    },
    {
      icon: TrendingUp,
      title: "Gana Reconocimiento",
      description: "Aparece en rankings y obtén badges exclusivos"
    },
    {
      icon: Gift,
      title: "Recibe Beneficios",
      description: "Obtén recompensas cuando tus contactos consiguen resultados"
    },
    {
      icon: Target,
      title: "Impacta el Ecosistema",
      description: "Contribuye al crecimiento de la comunidad deportiva"
    }
  ];

  const ranks = [
    { name: "Starter", points: 50, color: "text-gray-500" },
    { name: "Rising", points: 100, color: "text-blue-500" },
    { name: "Pro", points: 250, color: "text-green-500" },
    { name: "Expert", points: 500, color: "text-purple-500" },
    { name: "Legend", points: 1000, color: "text-yellow-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
            <Star className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Hazte Referente</h1>
          <p className="text-xl text-muted-foreground">
            Únete a una red de profesionales que conectan talento con oportunidades
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cómo Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Activa tu Modo Referente</h4>
                  <p className="text-sm text-muted-foreground">
                    Obtén tu código único de referencia y accede a tu panel personalizado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Comparte Oportunidades</h4>
                  <p className="text-sm text-muted-foreground">
                    Recomienda plazas, convocatorias y oportunidades a tu red
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Gana Reconocimiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Sube en el ranking y recibe recompensas cuando tus referidos consiguen plaza
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rankings System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Sistema de Rangos
            </CardTitle>
            <CardDescription>
              Progresa según tus puntos de referente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranks.map((rank) => (
                <div key={rank.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Award className={`h-5 w-5 ${rank.color}`} />
                    <span className="font-semibold">{rank.name}</span>
                  </div>
                  <Badge variant="outline">{rank.points} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardContent className="p-8 text-center">
            {referrerCode ? (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">¡Ya eres Referente!</h2>
                <p className="text-muted-foreground mb-4">
                  Tu código de referencia es:
                </p>
                <div className="bg-background p-4 rounded-lg border-2 border-dashed border-primary mb-4">
                  <code className="text-2xl font-mono font-bold">{referrerCode}</code>
                </div>
                <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/referrer/dashboard')} variant="outline">
                  Ir a Mi Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => navigate('/discover')}>
                  Descubrir Talentos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-2">¿Listo para ser Referente?</h2>
                <p className="text-muted-foreground">
                  Comienza a conectar talento y crece con la comunidad AURA Sports
                </p>
                <Button 
                  onClick={handleBecomeReferrer} 
                  disabled={loading}
                  size="lg"
                  className="mt-4"
                >
                  {loading ? (
                    "Activando..."
                  ) : (
                    <>
                      Convertirme en Referente
                      <Zap className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BecomeReferrer;

