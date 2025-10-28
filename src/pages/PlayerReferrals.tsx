import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { 
  CheckCircle, Clock, AlertTriangle, User, Upload,
  ArrowLeft, Star, Building2, Award
} from "lucide-react";

interface ReferralRecord {
  id: string;
  referrer_id: string;
  club_id: string;
  opportunity_id: string | null;
  interaction_status: string;
  validation_state: string;
  evidence_links: string[] | null;
  player_confirmed_at: string | null;
  club_confirmed_at: string | null;
  created_at: string;
  referrer_profile?: {
    full_name: string;
    referrer_code: string;
  };
  club_profile?: {
    full_name: string;
    sport: string;
  };
}

const PlayerReferrals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<string | null>(null);
  const [evidenceLink, setEvidenceLink] = useState("");

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
          referrer_profile:profiles!referrer_id(id, full_name, referrer_code),
          club_profile:profiles!club_id(id, full_name, sport)
        `)
        .eq('player_id', user.id)
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

  const handleReport = async (referralId: string) => {
    setReporting(referralId);
    try {
      const evidenceLinks = evidenceLink ? [evidenceLink] : null;
      
      const { error } = await supabase.rpc('self_confirm_by_player', {
        p_referral_id: referralId,
        p_evidence_links: evidenceLinks
      });

      if (error) throw error;

      toast({
        title: "Success Reported!",
        description: "Your successful contract has been recorded.",
      });

      setEvidenceLink("");
      loadReferrals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReporting(null);
    }
  };

  const getStatusBadge = (validation: string) => {
    if (validation === 'confirmed_by_club') {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed by Club</Badge>;
    }
    if (validation === 'confirmed_by_player') {
      return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Self-Reported</Badge>;
    }
    if (validation === 'community_verified') {
      return <Badge className="bg-purple-500"><Award className="h-3 w-3 mr-1" />Community Verified</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Referrals</h1>
          </div>
          <p className="text-muted-foreground">
            Track your contract successes and give credit to referrers
          </p>
        </div>

        {/* Important Disclaimer */}
        <Card className="mb-8 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                  Legal Notice
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This confirmation is <strong>user-declared and not verified by Aura</strong>. Aura does not 
                  validate contracts or financial agreements. Any information you report is for community 
                  recognition purposes only.
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
                <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No referral records yet</p>
              </CardContent>
            </Card>
          ) : (
            referrals.map((referral) => (
              <Card key={referral.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Club Info */}
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{referral.club_profile?.full_name}</h3>
                          {getStatusBadge(referral.validation_state)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{referral.club_profile?.sport}</span>
                          <span>• {new Date(referral.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referrer Info */}
                  {referral.referrer_profile && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">You were referred by <strong>{referral.referrer_profile.full_name}</strong></span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Code: <code className="bg-background px-2 py-1 rounded">{referral.referrer_profile.referrer_code}</code>
                      </div>
                    </div>
                  )}

                  {/* Evidence if self-reported */}
                  {referral.validation_state === 'confirmed_by_player' && referral.evidence_links && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-semibold">Evidence Provided:</span>
                      </div>
                      <div className="space-y-1">
                        {referral.evidence_links.map((link, idx) => (
                          <a href={link} target="_blank" rel="noopener noreferrer" key={idx} className="text-xs text-blue-600 hover:underline block">
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {referral.validation_state === 'unconfirmed' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Evidence Link (Optional)</label>
                        <Input
                          placeholder="https://example.com/contract or public announcement"
                          value={evidenceLink}
                          onChange={(e) => setEvidenceLink(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide a public link to verify your contract (optional)
                        </p>
                      </div>
                      <Button
                        onClick={() => handleReport(referral.id)}
                        disabled={reporting === referral.id}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {reporting === referral.id ? 'Reporting...' : 'Report Successful Contract'}
                      </Button>
                    </div>
                  )}

                  {referral.validation_state === 'confirmed_by_player' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Reported on {new Date(referral.player_confirmed_at!).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        The referrer has been notified of your successful contract.
                      </p>
                    </div>
                  )}

                  {referral.validation_state === 'confirmed_by_club' && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Confirmed by {referral.club_profile?.full_name}</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Officially verified on {new Date(referral.club_confirmed_at!).toLocaleDateString()}
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

export default PlayerReferrals;


