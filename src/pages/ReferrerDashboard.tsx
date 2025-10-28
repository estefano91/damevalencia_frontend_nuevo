import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { 
  Copy, Share2, QrCode, Users, TrendingUp, Award, CheckCircle, 
  Clock, XCircle, Trophy, Star, ExternalLink, ArrowLeft
} from "lucide-react";

interface ReferrerProfile {
  is_referrer: boolean;
  referrer_code: string | null;
  total_referrals: number;
  successful_referrals: number;
  referrer_points: number;
  referrer_rank: string | null;
}

interface ReferralTrackingStats {
  total_referrals: number;
  confirmed_hires: number;
  community_verified: number;
  pending_validation: number;
}

interface Referral {
  id: string;
  referred_user_id: string | null;
  status: string;
  referral_date: string;
  success_date: string | null;
  notes: string | null;
  referred_profile?: {
    full_name: string;
    user_type: string;
    sport: string | null;
  };
}

const ReferrerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ReferrerProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [trackingStats, setTrackingStats] = useState<ReferralTrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Cargar perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_referrer, referrer_code, total_referrals, successful_referrals, referrer_points, referrer_rank")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        // Si no es referente, redirigir
        if (!profileData.is_referrer) {
          navigate("/referrer");
          return;
        }
      }

      // Cargar referencias
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(`
          *,
          referred_profile:profiles!referrals_referred_user_id_fkey(id, full_name, user_type, sport)
        `)
        .eq("referrer_id", user.id)
        .order("referral_date", { ascending: false });

      if (referralsData) {
        setReferrals(referralsData as any[]);
      }

      // Cargar stats de referral tracking
      const { data: statsData } = await supabase.rpc('get_referrer_stats', {
        p_referrer_id: user.id
      });

      if (statsData && statsData.length > 0) {
        setTrackingStats(statsData[0] as any);
      }

      setLoading(false);
    };

    loadData();
  }, [user, navigate]);

  const getShareLink = () => {
    if (!profile?.referrer_code) return "";
    return `${window.location.origin}?ref=${profile.referrer_code}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    toast({ title: "¡Código copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralCode = () => {
    const text = `¡Únete a AURA Sports con mi código de referente! 🏆\n\nUsa este enlace: ${getShareLink()}\n\nCódigo: ${profile?.referrer_code}`;
    
    if (navigator.share) {
      navigator.share({ text, url: getShareLink() });
    } else {
      copyToClipboard();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'applied': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      case 'applied': return 'Aplicado';
      default: return 'Pendiente';
    }
  };

  const getRankInfo = (rank: string | null) => {
    const ranks = {
      starter: { color: 'text-gray-600', icon: '🌱' },
      rising: { color: 'text-blue-600', icon: '📈' },
      pro: { color: 'text-green-600', icon: '💼' },
      expert: { color: 'text-purple-600', icon: '⭐' },
      legend: { color: 'text-yellow-600', icon: '👑' }
    };
    return ranks[rank as keyof typeof ranks] || { color: 'text-gray-600', icon: '⭐' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!profile?.is_referrer) return null;

  const rankInfo = getRankInfo(profile.referrer_rank);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel de Referente</h1>
            <p className="text-muted-foreground">
              Gestiona tus referencias y conecta talento con oportunidades
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/discover")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {trackingStats && (
            <>
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Confirmed Hires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{trackingStats.confirmed_hires}</div>
                  <div className="text-xs text-muted-foreground">Club verified</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    Community Verified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{trackingStats.community_verified}</div>
                  <div className="text-xs text-muted-foreground">Validated</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending Validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{trackingStats.pending_validation}</div>
                  <div className="text-xs text-muted-foreground">Awaiting</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Total Referrals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{trackingStats.total_referrals}</div>
                  <div className="text-xs text-muted-foreground">All time</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {trackingStats && trackingStats.total_referrals === 0 && (
            <Card className="md:col-span-2 bg-muted/50">
              <CardContent className="pt-6 text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">Start sharing your referral code to track successes!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Original Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Código de Referencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono mb-2">
                {profile.referrer_code}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareReferralCode}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Referidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.total_referrals}</div>
              <div className="text-xs text-muted-foreground">Personas</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Éxitos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {profile.successful_referrals}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile.total_referrals > 0 
                  ? `${Math.round((profile.successful_referrals / profile.total_referrals) * 100)}% tasa`
                  : "0% tasa"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Puntos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.referrer_points}</div>
              <Badge variant="outline" className={`${rankInfo.color} mt-1`}>
                {rankInfo.icon} {profile.referrer_rank || "Starter"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Compartir Código */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comparte Tu Código</CardTitle>
            <CardDescription>
              Comparte tu enlace de referencia y obtén puntos cuando alguien se registre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enlace de Referencia</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareLink()}
                    className="flex-1 px-3 py-2 border rounded-md bg-muted"
                  />
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={shareReferralCode} className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir Enlace
                </Button>
                <Button variant="outline" className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generar QR
                </Button>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
                💡 Gana 10 puntos por cada referido que se registre, y 50 puntos adicionales 
                cuando consigan plaza exitosamente
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Referidos */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Referencias</CardTitle>
            <CardDescription>
              Personas que se registraron con tu código
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tienes referencias aún</p>
                <p className="text-sm">Comparte tu código para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(referral.status)}`} />
                      
                      {referral.referred_profile ? (
                        <div className="flex-1">
                          <div className="font-semibold">
                            {referral.referred_profile.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {referral.referred_profile.user_type}
                            {referral.referred_profile.sport && ` • ${referral.referred_profile.sport}`}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-muted-foreground">
                          ID: {referral.referred_user_id}
                        </div>
                      )}
                      
                      <Badge variant="outline" className="capitalize">
                        {getStatusLabel(referral.status)}
                      </Badge>
                      
                      <div className="text-xs text-muted-foreground min-w-[100px] text-right">
                        {new Date(referral.referral_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cómo Usar */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle>💡 Cómo Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </span>
                  <h4 className="font-semibold">Comparte Tu Código</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comparte tu enlace único con deportistas, entrenadores y profesionales
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </span>
                  <h4 className="font-semibold">Ellos Se Registran</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cuando alguien usa tu código, se registra automáticamente como tu referido
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </span>
                  <h4 className="font-semibold">Gana Puntos</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Obtén puntos cuando tus referidos consigan oportunidades exitosamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReferrerDashboard;

