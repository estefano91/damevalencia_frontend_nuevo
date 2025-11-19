import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Award, UserPlus, CheckCircle, Star, Sparkles, Eye, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface ProfileCardProps {
  profile: {
    id: string;
    user_type: string;
    full_name: string;
    bio: string | null;
    location: string | null;
    aura_score: number;
    avatar_url: string | null;
    sport: string | null;
    verified: boolean;
    elite_member?: boolean | null;
    endorsement_count?: number | null;
  };
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if already following
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("connections")
        .select("*")
        .eq("requester_id", user.id)
        .eq("receiver_id", profile.id)
        .eq("status", "accepted")
        .maybeSingle();

      if (data) setIsFollowing(true);
    };

    checkFollowing();
  }, [user, profile.id]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Please sign in to follow",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
        // Follow (create connection with accepted status immediately)
        const { error } = await supabase
          .from("connections")
          .insert({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "accepted", // Direct follow, no approval needed
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
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Try to find existing chat
      const { data: myChats, error: myChatsError } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id);

      if (myChatsError) throw myChatsError;

      if (myChats && myChats.length > 0) {
        const chatIds = myChats.map(cm => cm.chat_id);
        
        // Check if other user is in any of my chats
        const { data: theirChats, error: theirChatsError } = await supabase
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', profile.id)
          .in('chat_id', chatIds);

        if (theirChatsError) throw theirChatsError;

        if (theirChats && theirChats.length > 0) {
          // Navigate to existing chat
          navigate(`/messages?chat=${theirChats[0].chat_id}`);
          setLoading(false);
          return;
        }
      }

      // No existing chat, create new one manually
      console.log("Creating new chat...");
      
      // Step 1: Create the chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'private',
          created_by: user.id
        })
        .select('id')
        .single();

      if (chatError) throw chatError;

      // Step 2: Add both users to chat_members
      const { error: membersError } = await supabase
        .from('chat_members')
        .insert([
          { chat_id: newChat.id, user_id: user.id },
          { chat_id: newChat.id, user_id: profile.id }
        ]);

      if (membersError) throw membersError;

      console.log("Chat created:", newChat.id);
      
      navigate(`/messages?chat=${newChat.id}`);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Opening messages...",
        description: error.message || "Navigating to messages",
      });
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      player: "bg-blue-500",
      coach: "bg-green-500",
      club: "bg-purple-500",
      agent: "bg-orange-500",
      sponsor: "bg-pink-500",
      investor: "bg-yellow-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getAuraScoreColor = (score: number) => {
    if (score >= 900) return "text-emerald-600";
    if (score >= 750) return "text-green-600";
    if (score >= 600) return "text-yellow-600";
    if (score >= 400) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="h-full p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col">
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Header: Avatar + Info + Score */}
        <div className="flex items-start gap-2 min-w-0">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full ${getUserTypeColor(profile.user_type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {profile.full_name.charAt(0).toUpperCase()}
          </div>

          {/* Name, badges, and type */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Name with badges */}
            <div className="flex items-start gap-1">
              <h3 className="font-semibold text-sm truncate">
                {profile.full_name}
              </h3>
              <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                {profile.verified && (
                  <Badge variant="secondary" className="bg-accent text-white px-1 py-0 h-4">
                    <CheckCircle className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {profile.elite_member && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1 py-0 h-4">
                    <Sparkles className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            </div>

            {/* User type */}
            <Badge className={`${getUserTypeColor(profile.user_type)} text-white text-[9px] capitalize`}>
              {profile.user_type}
            </Badge>
          </div>

          {/* Aura Score */}
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <div className={`flex items-center gap-0.5 ${getAuraScoreColor(profile.aura_score)}`}>
              <Award className="h-3.5 w-3.5" />
              <span className="font-bold text-sm">{profile.aura_score}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
          {profile.sport && (
            <p className="text-xs font-medium truncate">{profile.sport}</p>
          )}
          {profile.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 break-words leading-snug">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 sm:gap-1.5 md:gap-2 pt-2 mt-2 border-t">
        <Button
          variant="outline"
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="flex-1 text-[10px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 md:h-10 px-1 xs:px-1.5 sm:px-2 md:px-3"
          size="sm"
        >
          <Eye className="mr-0.5 xs:mr-1 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:hidden md:inline">View</span>
          <span className="xs:hidden sm:inline md:hidden">V</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleSendMessage}
          disabled={loading}
          className="flex-1 text-[10px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 md:h-10 px-1 xs:px-1.5 sm:px-2 md:px-3"
          size="sm"
        >
          <MessageSquare className="mr-0.5 xs:mr-1 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:hidden md:inline">Msg</span>
          <span className="xs:hidden sm:inline md:hidden">M</span>
        </Button>
        <Button
          onClick={handleFollow}
          disabled={loading}
          className={`flex-1 text-[10px] xs:text-xs sm:text-sm h-7 xs:h-8 sm:h-9 md:h-10 px-1 xs:px-1.5 sm:px-2 md:px-3 ${isFollowing ? 'bg-muted hover:bg-muted' : ''}`}
          size="sm"
        >
          <UserPlus className="mr-0.5 xs:mr-1 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:hidden md:inline">{loading ? "..." : isFollowing ? "Following" : "Follow"}</span>
          <span className="xs:hidden sm:inline md:hidden">{loading ? "..." : isFollowing ? "✓" : "F"}</span>
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCard;
