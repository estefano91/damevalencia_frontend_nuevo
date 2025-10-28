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
  CheckCircle, Clock, Users, TrendingUp, AlertTriangle,
  ArrowLeft, Star, Award, Building2
} from "lucide-react";

interface ReferralRecord {
  id: string;
  referrer_id: string;
  player_id: string;
  interaction_status: string;
  validation_state: string;
  club_confirmed_at: string | null;
  created_at: string;
  referrer_profile?: {
    full_name: string;
    avatar_url: string;
    referrer_code: string;
  };
  player_profile?: {
    full_name: string;
    avatar_url: string;
    sport: string;
    level: string;
  };
}

const ClubReferrals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadReferrals();
  }, [user, navigate]);

  const loadReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_records')
        .select(`
          *,
          referrer_profile:profiles!referrer_id(id, full_name, avatar_url, referrer_code),
          player_profile:profiles!player_id(id, full_name, avatar_url, sport, level)
        `)
        .eq('club_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading referrals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (referralId: string, status: 'contracted' | 'trial') => {
    setConfirming(referralId);
    try {
      const { error } = await supabase.rpc('confirm_hire_by_club', {
        p_referral_id: referralId,
        p_status: status
      });

      if (error) throw error;

      toast({
        title: "¡Contratación confirmada!",
        description: "El referente ha sido notificado de este éxito.",
      });

      loadReferrals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(null);
    }
  };

  const getStatusBadge = (status: string, validation: string) => {
    if (validation === 'confirmed_by_club') {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
    }
    if (validation === 'pending_validation') {
      return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
    if (status === 'contracted') {
      return <Badge className="bg-blue-500">Contracted</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const unconfirmedCount = referrals.filter(r => r.validation_state === 'unconfirmed').length;
  const confirmedCount = referrals.filter(r => r.validation_state === 'confirmed_by_club').length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/discover')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Manage Club Referrals</h1>
          </div>
          <p className="text-muted-foreground">
            Confirm hiring results from referrals and give credit to referrers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{referrals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unconfirmed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{unconfirmedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Confirmed Hires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Legal Disclaimer
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  By confirming this hire, you acknowledge that <strong>Aura does not validate or mediate 
                  financial transactions</strong>. This confirmation is for community recognition purposes only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <div className="space-y-4">
          {referrals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No referral records yet</p>
              </CardContent>
            </Card>
          ) : (
            referrals.map((referral) => (
              <Card key={referral.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Player Info */}
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {referral.player_profile?.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{referral.player_profile?.full_name}</h3>
                          {getStatusBadge(referral.interaction_status, referral.validation_state)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{referral.player_profile?.sport}</span>
                          {referral.player_profile?.level && (
                            <span>• {referral.player_profile.level}</span>
                          )}
                          <span>• {new Date(referral.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referrer Info */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold">Referred by:</span>
                      <span className="font-bold">{referral.referrer_profile?.full_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: <code className="bg-background px-2 py-1 rounded">{referral.referrer_profile?.referrer_code}</code>
                    </div>
                  </div>

                  {/* Actions */}
                  {referral.validation_state === 'unconfirmed' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirm(referral.id, 'contracted')}
                        disabled={confirming === referral.id}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {confirming === referral.id ? 'Confirming...' : 'Confirm Permanent Hire'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleConfirm(referral.id, 'trial')}
                        disabled={confirming === referral.id}
                        className="flex-1"
                      >
                        Confirm Trial
                      </Button>
                    </div>
                  )}

                  {referral.validation_state === 'confirmed_by_club' && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Confirmed on {new Date(referral.club_confirmed_at!).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        The referrer has been notified and received recognition for this successful hire.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubReferrals;


