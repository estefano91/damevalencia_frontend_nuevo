import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProfileCard from "@/components/ProfileCard";

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
  elite_member?: boolean | null;
  endorsement_count?: number | null;
}

const Discover = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) return;

      // Check if user has profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        navigate("/onboarding");
        return;
      }

      // Load all profiles with all available fields
      const { data: allProfiles, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .order("aura_score", { ascending: false });

      if (error) {
        console.error("Error loading profiles:", error);
      } else {
        setProfiles(allProfiles || []);
        setFilteredProfiles(allProfiles || []);
      }
      setLoading(false);
    };

    loadProfiles();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = profiles;

    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.user_type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sport?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  }, [searchQuery, typeFilter, profiles]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Discover Professionals</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Connect with athletes, coaches, clubs, and industry professionals
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, sport, or keywords..."
                className="pl-10 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="player">Players</SelectItem>
                <SelectItem value="coach">Coaches</SelectItem>
                <SelectItem value="club">Clubs</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
                <SelectItem value="sponsor">Sponsors</SelectItem>
                <SelectItem value="investor">Investors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-sm sm:text-base">Loading profiles...</div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <div className="text-sm sm:text-base">No profiles found. Try adjusting your filters.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Discover;
