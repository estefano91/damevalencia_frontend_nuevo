import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, MapPin, Trophy } from "lucide-react";
import Navigation from "@/components/Navigation";

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
}

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadFollowersAndFollowing = async () => {
      // Get followers (users who follow me)
      const { data: followersData } = await supabase
        .from("connections")
        .select(`
          requester:profiles!connections_requester_id_fkey(id, user_type, full_name, bio, location, aura_score, avatar_url, sport, verified)
        `)
        .eq("receiver_id", user.id)
        .eq("status", "accepted");

      // Get following (users I follow)
      const { data: followingData } = await supabase
        .from("connections")
        .select(`
          receiver:profiles!connections_receiver_id_fkey(id, user_type, full_name, bio, location, aura_score, avatar_url, sport, verified)
        `)
        .eq("requester_id", user.id)
        .eq("status", "accepted");

      if (followersData) {
        setFollowers(followersData.map((f: any) => f.requester).filter(Boolean));
      }
      if (followingData) {
        setFollowing(followingData.map((f: any) => f.receiver).filter(Boolean));
      }
      setLoading(false);
    };

    loadFollowersAndFollowing();
  }, [user, toast]);

  const handleUnfollow = async (userId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("requester_id", user.id)
      .eq("receiver_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Unfollowed successfully" });
      setFollowing(following.filter(f => f.id !== userId));
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

  const renderProfile = (profile: Profile) => (
    <Card key={profile.id} className="hover:shadow-aura transition-all duration-smooth">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate(`/profile/${profile.id}`)}>
            <AvatarFallback className={`${getUserTypeColor(profile.user_type)} text-white text-lg`}>
              {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${profile.id}`)}>
                {profile.full_name}
              </h3>
              {profile.verified && <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />}
            </div>
            
            <Badge className={`${getUserTypeColor(profile.user_type)} text-white mb-2`}>
              {profile.user_type}
            </Badge>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{profile.aura_score} Aura</span>
              </div>
              {profile.sport && <span>• {profile.sport}</span>}
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Followers & Following</h1>
          <p className="text-muted-foreground">Manage your network</p>
        </div>

        <Tabs defaultValue="following" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="following" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Followers ({followers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            {following.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Not following anyone yet</p>
                  <Button onClick={() => navigate("/discover")}>Discover Professionals</Button>
                </CardContent>
              </Card>
            ) : (
              following.map(renderProfile)
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            {followers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No followers yet</p>
                </CardContent>
              </Card>
            ) : (
              followers.map(renderProfile)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Connections;
