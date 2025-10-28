import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Heart, MessageCircle, Share2, MoreHorizontal,
  Award, Briefcase, Calendar, TrendingUp, Sparkles,
  MapPin, Clock, Target, DollarSign, Users, Zap
} from "lucide-react";

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  tags: string[];
  media_urls: string[] | null;
  is_boosted: boolean;
  boost_expires_at: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    full_name: string;
    user_type: string;
    avatar_url: string;
  };
  user_liked?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const [newPost, setNewPost] = useState({
    content: "",
    post_type: "general",
    tags: [] as string[],
    location: "",
    target_sport: "",
    start_date: "",
    end_date: ""
  });

  const postTypes = [
    { value: "general", label: "General", icon: MessageCircle },
    { value: "achievement", label: "Achievement", icon: Award },
    { value: "opportunity", label: "Opportunity", icon: Briefcase },
    { value: "sponsorship", label: "Sponsorship", icon: DollarSign },
    { value: "event", label: "Event", icon: Calendar },
    { value: "training", label: "Training", icon: Target }
  ];

  const tags = ["#Tryout", "#Sponsorship", "#Event", "#Training", "#Investment", "#Opportunity"];

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadPosts();
  }, [user, navigate]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(full_name, user_type, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedFilter !== "all") {
        query = query.eq('post_type', selectedFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading feed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedFilter]);

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPost.content,
          post_type: newPost.post_type,
          tags: newPost.tags,
          location: newPost.location || null,
          target_sport: newPost.target_sport || null,
          start_date: newPost.start_date || null,
          end_date: newPost.end_date || null
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });

      setShowCreatePost(false);
      setNewPost({
        content: "",
        post_type: "general",
        tags: [],
        location: "",
        target_sport: "",
        start_date: "",
        end_date: ""
      });

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user!.id });
        if (error) throw error;
      }
      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPostTypeIcon = (type: string) => {
    const typeInfo = postTypes.find(t => t.value === type);
    return typeInfo?.icon || MessageCircle;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Feed & Opportunities</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Discover news, achievements, and opportunities in sports
              </p>
            </div>
            
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4">
                  <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Create Post</span>
                  <span className="xs:hidden">Post</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Share news, achievements, or opportunities with the community
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Post Type</Label>
                    <Select
                      value={newPost.post_type}
                      onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {postTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="What's happening in sports?"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={newPost.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (newPost.tags.includes(tag)) {
                              setNewPost({
                                ...newPost,
                                tags: newPost.tags.filter(t => t !== tag)
                              });
                            } else {
                              setNewPost({
                                ...newPost,
                                tags: [...newPost.tags, tag]
                              });
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location (Optional)</Label>
                      <Input
                        placeholder="City, Country"
                        value={newPost.location}
                        onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sport (Optional)</Label>
                      <Input
                        placeholder="Football, Basketball..."
                        value={newPost.target_sport}
                        onChange={(e) => setNewPost({ ...newPost, target_sport: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreatePost(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.content.trim()}
                      className="flex-1"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              All Posts
            </Button>
            {postTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={selectedFilter === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(type.value)}
                  className="whitespace-nowrap text-xs sm:text-sm"
                >
                  <Icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{type.label}</span>
                  <span className="xs:hidden">{type.label.slice(0, 3)}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No posts yet</p>
                <p className="text-sm text-muted-foreground mt-2">Be the first to share something!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const Icon = getPostTypeIcon(post.post_type);
              return (
                <Card key={post.id} className={`overflow-hidden ${post.is_boosted ? 'border-2 border-yellow-500' : ''}`}>
                  {post.is_boosted && (
                    <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2 px-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" />
                      BOOSTED
                    </div>
                  )}
                  
                  <CardHeader className="pb-3 px-3 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                          {post.author?.full_name.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{post.author?.full_name || 'Unknown'}</h4>
                            <Badge variant="secondary" className="text-xs capitalize shrink-0">
                              {post.author?.user_type}
                            </Badge>
                            <Badge className="text-xs shrink-0">
                              {post.post_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(post.created_at) || 'Just now'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="px-3 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Content */}
                      <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{post.content}</p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      {(post.location || post.start_date || post.end_date) && (
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                          {post.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{post.location}</span>
                            </div>
                          )}
                          {post.start_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{formatDate(post.start_date)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLike(post.id, post.user_liked || false)}
                            className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10"
                          >
                            <Heart className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="hidden xs:inline">{post.likes_count}</span>
                            <span className="xs:hidden">{post.likes_count > 999 ? '999+' : post.likes_count}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                            <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            <span className="hidden xs:inline">{post.comments_count}</span>
                            <span className="xs:hidden">{post.comments_count > 999 ? '999+' : post.comments_count}</span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                          <Button variant="ghost" size="sm" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            <span className="hidden sm:inline ml-1 sm:ml-2">Share</span>
                          </Button>
                          {post.author_id === user?.id && (
                            <Button variant="ghost" size="sm" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                              <Zap className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                              <span className="hidden sm:inline ml-1 sm:ml-2">Boost</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Feed;


