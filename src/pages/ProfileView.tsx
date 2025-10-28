import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, Trophy, CheckCircle, Star, Award, GraduationCap, 
  ExternalLink, Twitter, Linkedin, Globe, Image, Sparkles,
  ArrowLeft, UserPlus
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

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

const ProfileView = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        navigate("/discover");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        navigate("/discover");
      } else if (!data) {
        toast({
          title: "Not Found",
          description: "Profile not found",
        });
        navigate("/discover");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
  }, [profileId, navigate, toast]);

  // Check if already following
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user || !profileId) return;
      
      const { data } = await supabase
        .from("connections")
        .select("*")
        .eq("requester_id", user.id)
        .eq("receiver_id", profileId)
        .eq("status", "accepted")
        .maybeSingle();

      if (data) setIsFollowing(true);
    };

    checkFollowing();
  }, [user, profileId]);

  const handleFollow = async () => {
    if (!profile || !user) return;

    setConnecting(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("connections")
          .delete()
          .eq("requester_id", user.id)
          .eq("receiver_id", profile.id);

        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "Unfollowed!" });
      } else {
        // Follow
        const { error } = await supabase
          .from("connections")
          .insert({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "accepted",
          });

        if (error) {
          // If already exists, just update status
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from("connections")
              .update({ status: "accepted" })
              .eq("requester_id", user.id)
              .eq("receiver_id", profile.id);

            if (updateError) throw updateError;
          } else {
            throw error;
          }
        }
        setIsFollowing(true);
        toast({ title: "Following!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
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
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/discover")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discover
        </Button>

        <Card className="mb-6">
          <CardHeader className="relative pb-12 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex items-start gap-6 flex-1">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  <AvatarFallback className={`${getUserTypeColor(profile.user_type)} text-white text-3xl`}>
                    {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-4xl">{profile.full_name}</CardTitle>
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
                  
                  <Badge className={`${getUserTypeColor(profile.user_type)} text-white capitalize text-sm px-3 py-1`}>
                    {profile.user_type}
                  </Badge>

                  <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-5 w-5" />
                      <span className={`font-bold text-2xl ${getAuraScoreColor(profile.aura_score)}`}>
                        {profile.aura_score}
                      </span>
                      <span className="text-sm ml-1">
                        {getAuraScoreLabel(profile.aura_score)} Aura
                      </span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.endorsement_count && profile.endorsement_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span>{profile.endorsement_count} endorsements</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFollow} 
                disabled={connecting} 
                size="lg"
                variant={isFollowing ? "outline" : "default"}
              >
                {connecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {connecting ? "..." : isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 mt-6">
            {profile.sport && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Sport</h3>
                <p className="text-xl font-semibold">{profile.sport}</p>
              </div>
            )}
            
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                <p className="text-base leading-relaxed">{profile.bio}</p>
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
                    <Badge key={idx} variant="outline" className="text-sm p-2">
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
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                      <Trophy className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
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
                    <Badge key={idx} variant="secondary" className="p-2">{skill}</Badge>
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
                      <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileView;

