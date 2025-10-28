import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star } from "lucide-react";

const userTypes = [
  { value: "player", label: "Player" },
  { value: "coach", label: "Coach" },
  { value: "club", label: "Club" },
  { value: "agent", label: "Agent" },
  { value: "sponsor", label: "Sponsor" },
  { value: "investor", label: "Investor" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userType: "",
    fullName: "",
    bio: "",
    location: "",
    sport: "",
  });

  useEffect(() => {
    // Capturar código de referencia de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferrerCode(refCode);
    }

    const checkProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        navigate("/discover");
      }
    };
    checkProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          user_type: formData.userType as any,
          full_name: formData.fullName,
          bio: formData.bio,
          location: formData.location,
          sport: formData.sport,
        }
      ]);

      if (error) throw error;

      // Si hay código de referencia, crear la referencia
      if (referrerCode && user) {
        // Buscar el ID del referente por su código
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referrer_code', referrerCode)
          .single();

        if (referrerProfile) {
          // Crear la entrada de referencia
          await supabase.from('referrals').insert({
            referrer_id: referrerProfile.id,
            referred_user_id: user.id,
            status: 'applied'
          });
        }
      }

      toast({ title: "Profile created successfully!" });
      navigate("/discover");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-aura-gradient bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">Tell us about yourself</p>
        </div>

        {referrerCode && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">¡Un referente te invitó!</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Estás registrándote con el código de referencia de un miembro de la comunidad AURA Sports.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userType">I am a *</Label>
            <Select
              value={formData.userType}
              onValueChange={(value) => setFormData({ ...formData, userType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                placeholder="e.g., Football, Basketball"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Onboarding;
