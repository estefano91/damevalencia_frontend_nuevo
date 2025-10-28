import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, MapPin, Trophy, CheckCircle, Edit2, Save, Star, Award, 
  GraduationCap, ExternalLink, Twitter, Linkedin, Globe, Image, Sparkles,
  Users, UserPlus
} from "lucide-react";
import Navigation from "@/components/Navigation";

const userTypes = [
  { value: "player", label: "Player" },
  { value: "coach", label: "Coach" },
  { value: "club", label: "Club" },
  { value: "agent", label: "Agent" },
  { value: "sponsor", label: "Sponsor" },
  { value: "investor", label: "Investor" },
];

interface Profile {
  id: string;
  user_type: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  aura_score: number;
  avatar_url: string | null;
  sport: string | null;
  verified: boolean;
  elite_member: boolean | null;
  badge_type: string | null;
  endorsement_count: number | null;
  engagement_score: number | null;
  achievements: string[] | null;
  certifications: string[] | null;
  skills: string[] | null;
  media_urls: string[] | null;
  portfolio_url: string | null;
  social_links: { [key: string]: string } | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [formData, setFormData] = useState({
    userType: "",
    fullName: "",
    bio: "",
    location: "",
    sport: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else if (!data) {
        navigate("/onboarding");
      } else {
        setProfile(data);
        setFormData({
          userType: data.user_type,
          fullName: data.full_name,
          bio: data.bio || "",
          location: data.location || "",
          sport: data.sport || "",
        });

        // Load followers and following counts
        const { count: followers } = await supabase
          .from("connections")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("status", "accepted");

        const { count: following } = await supabase
          .from("connections")
          .select("*", { count: "exact", head: true })
          .eq("requester_id", user.id)
          .eq("status", "accepted");

        setFollowersCount(followers || 0);
        setFollowingCount(following || 0);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user, navigate, toast]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          user_type: formData.userType as any,
          full_name: formData.fullName,
          bio: formData.bio,
          location: formData.location,
          sport: formData.sport,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getUserTypeColor = (userType: string) => {
    const colors: Record<string, string> = {
      player: "bg-blue-500",
      coach: "bg-green-500",
      club: "bg-purple-500",
      agent: "bg-orange-500",
      sponsor: "bg-yellow-500",
      investor: "bg-red-500",
    };
    return colors[userType] || "bg-gray-500";
  };

  const getAuraScoreColor = (score: number) => {
    if (score >= 900) return "text-emerald-500";
    if (score >= 750) return "text-green-500";
    if (score >= 600) return "text-yellow-500";
    if (score >= 400) return "text-orange-500";
    return "text-red-500";
  };

  const getAuraScoreLabel = (score: number) => {
    if (score >= 900) return "Legendary";
    if (score >= 750) return "Elite";
    if (score >= 600) return "Advanced";
    if (score >= 400) return "Rising";
    return "Starting";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-6xl">
        {/* Header Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="relative pb-6 sm:pb-8 md:pb-12 bg-gradient-to-r from-primary/10 to-accent/10 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 ring-2 sm:ring-4 ring-background self-center sm:self-start">
                  <AvatarFallback className={`${getUserTypeColor(profile.user_type)} text-white text-lg sm:text-xl md:text-2xl`}>
                    {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl">{profile.full_name}</CardTitle>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {profile.verified && (
                        <Badge variant="secondary" className="bg-accent">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profile.elite_member && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Elite
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={`${getUserTypeColor(profile.user_type)} text-white capitalize text-xs sm:text-sm`}>
                    {profile.user_type}
                  </Badge>

                  <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-muted-foreground flex-wrap text-sm sm:text-base">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className={`font-bold text-base sm:text-lg ${getAuraScoreColor(profile.aura_score)}`}>
                        {profile.aura_score}
                      </span>
                      <span className="text-xs sm:text-sm">
                        {getAuraScoreLabel(profile.aura_score)} Aura
                      </span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors" 
                      onClick={() => navigate("/connections")}
                    >
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-semibold">{followingCount}</span>
                      <span className="text-xs sm:text-sm">following</span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors" 
                      onClick={() => navigate("/connections")}
                    >
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-semibold">{followersCount}</span>
                      <span className="text-xs sm:text-sm">followers</span>
                    </div>
                    
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm truncate">{profile.location}</span>
                      </div>
                    )}
                    {profile.endorsement_count && profile.endorsement_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs sm:text-sm">{profile.endorsement_count} endorsements</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                disabled={saving}
                className="w-full sm:w-auto text-sm"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Edit2 className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 mt-4 px-3 sm:px-6">
            {!isEditing ? (
              <>
                {profile.sport && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sport</h3>
                    <p className="text-base sm:text-lg font-semibold">{profile.sport}</p>
                  </div>
                )}
                
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                    <p className="text-sm sm:text-base leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs sm:text-sm">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {profile.achievements && profile.achievements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Achievements
                    </h3>
                    <div className="space-y-2">
                      {profile.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                          <p className="text-sm">{achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {profile.portfolio_url && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Portfolio</h3>
                    <Button variant="outline" asChild>
                      <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portfolio
                      </a>
                    </Button>
                  </div>
                )}

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Social Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.social_links.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </a>
                        </Button>
                      )}
                      {profile.social_links.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {Object.entries(profile.social_links).map(([key, value]) => 
                        key !== 'twitter' && key !== 'linkedin' ? (
                          <Button key={key} variant="outline" size="sm" asChild>
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 mr-2" />
                              {key}
                            </a>
                          </Button>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Media Gallery */}
                {profile.media_urls && profile.media_urls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Media Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                      {profile.media_urls.map((url, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!profile.bio && !profile.achievements?.length && !profile.certifications?.length && (
                  <p className="text-muted-foreground text-center py-8">
                    Click "Edit Profile" to add more information
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType" className="text-sm">I am a *</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) => setFormData({ ...formData, userType: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sport" className="text-sm">Sport</Label>
                    <Input
                      id="sport"
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      placeholder="e.g., Football, Basketball"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1 text-sm">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        userType: profile.user_type,
                        fullName: profile.full_name,
                        bio: profile.bio || "",
                        location: profile.location || "",
                        sport: profile.sport || "",
                      });
                    }}
                    disabled={saving}
                    className="flex-1 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
