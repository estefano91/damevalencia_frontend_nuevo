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
  Crown, Zap, TrendingUp, BarChart, CheckCircle, Sparkles,
  Gift, Star, DollarSign, Award, Building2, Users, Calendar, Search, Handshake
} from "lucide-react";

interface PremiumPlan {
  id: string;
  name: string;
  tier: string;
  monthly_price: number;
  yearly_price: number | null;
  features: any;
  max_boosts_per_month: number;
  advanced_analytics: boolean;
}

interface UserCredits {
  balance: number;
  total_earned: number;
  total_spent: number;
}

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      // Load plans
      const { data: plansData } = await supabase
        .from('premium_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (plansData) setPlans(plansData);

      // Load user subscription
      const { data: subData } = await supabase
        .from('premium_subscriptions')
        .select('*, plan:premium_plans(*)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();

      if (subData) setSubscription(subData);

      // Load user credits
      const { data: creditsData } = await supabase
        .from('aura_credits')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (creditsData) setCredits(creditsData);

    } catch (error: any) {
      toast({
        title: "Error loading premium data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Premium upgrade",
      description: "Integration with payment gateway coming soon",
    });
  };

  const handlePurchaseCredits = () => {
    toast({
      title: "Purchase Auras",
      description: "Credit purchase system coming soon",
    });
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
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">Premium & Monetization</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Unlock advanced features, boost your visibility, and earn rewards
          </p>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Current Subscription */}
          <Card className={subscription ? 'border-2 border-yellow-500' : ''}>
            <CardHeader>
              <CardDescription>Current Plan</CardDescription>
              <CardTitle className="text-2xl">
                {subscription?.plan?.name || 'Free'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                  <Badge className="bg-yellow-500">
                    <Crown className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
              {!subscription && (
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock premium features
                </p>
              )}
            </CardContent>
          </Card>

          {/* Aura Credits */}
          <Card>
            <CardHeader>
              <CardDescription>Aura Credits</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-500" />
                {credits?.balance || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-semibold">{credits?.total_earned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Spent:</span>
                  <span className="font-semibold">{credits?.total_spent || 0}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handlePurchaseCredits}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Buy More
              </Button>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardDescription>Affiliate Rewards</CardDescription>
              <CardTitle className="text-xl">Refer & Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Get credits for each referral</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Earn from successful partnerships</span>
                </div>
                <Button variant="outline" className="w-full">
                  View Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${
                  plan.tier === 'elite' ? 'border-2 border-yellow-500 scale-105' : 
                  plan.tier === 'professional' ? 'border-2 border-blue-500' : ''
                }`}
              >
                {plan.tier === 'elite' && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className={`h-6 w-6 ${
                      plan.tier === 'elite' ? 'text-yellow-500' :
                      plan.tier === 'professional' ? 'text-blue-500' :
                      'text-gray-500'
                    }`} />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.monthly_price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {plan.yearly_price && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.yearly_price}/year (save ${(plan.monthly_price * 12 - plan.yearly_price).toFixed(2)})
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Verified Aura Badge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{plan.max_boosts_per_month} Boosts/month</span>
                      </div>
                      {plan.advanced_analytics && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Advanced Analytics</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {plan.tier === 'elite' ? 'Concierge Support' :
                           plan.tier === 'professional' ? 'Priority Support' :
                           'Basic Support'}
                        </span>
                      </div>
                      {plan.tier === 'elite' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Exclusive Events Access</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full"
                      variant={plan.tier === 'elite' ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {subscription?.plan_id === plan.id ? 'Current Plan' : 'Upgrade Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Credit System */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Aura Credits System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  Earn Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Successful Referral</span>
                    </div>
                    <Badge>+50 Auras</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Handshake className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Partnership Deal</span>
                    </div>
                    <Badge>+100 Auras</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">Elite Member Upgrade</span>
                    </div>
                    <Badge>+200 Auras</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  Spend Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Boost Post</span>
                    </div>
                    <Badge variant="destructive">-25 Auras</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Priority Placement</span>
                    </div>
                    <Badge variant="destructive">-50 Auras</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Premium Connections</span>
                    </div>
                    <Badge variant="destructive">-10 Auras</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sponsorship Packages */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-2xl">Sponsorship Packages for Brands</CardTitle>
            </div>
            <CardDescription>
              Reach targeted audiences with precision marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Feed Ads</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Promoted posts in the feed with targeting
                </p>
                <p className="text-2xl font-bold">$499/mo</p>
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold">Profile Boost</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Increase visibility in discovery and search
                </p>
                <p className="text-2xl font-bold">$299/mo</p>
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">Event Sponsorship</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Sponsor networking events and reach attendees
                </p>
                <p className="text-2xl font-bold">$1,999/event</p>
              </div>
            </div>

            <Button className="w-full mt-6" size="lg">
              Learn More About Sponsorship
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Premium;

