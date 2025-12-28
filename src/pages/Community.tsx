import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Search, MessageCircle, UserPlus, LogOut, Lock, Globe, Image as ImageIcon, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

const CommunityPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [membershipIds, setMembershipIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    is_public: true,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCommunities(session.user.id);
      } else {
        fetchCommunities();
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Refetch communities when auth state changes
      setTimeout(() => {
        if (session?.user) {
          fetchCommunities(session.user.id);
        } else {
          fetchCommunities();
        }
      }, 0);
    });

    // Subscribe to realtime community updates
    const channel = supabase
      .channel('communities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities',
        },
        async () => {
          // Get fresh user session for realtime updates
          const { data: { session } } = await supabase.auth.getSession();
          fetchCommunities(session?.user?.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCommunities = async (userId?: string) => {
    try {
      // Fetch all communities
      const { data: allCommunities, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCommunities(allCommunities || []);

      // Fetch user's memberships if logged in
      if (userId) {
        const { data: memberData, error: memberError } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", userId);

        if (memberError) {
          console.error("Error fetching member data:", memberError);
          setMembershipIds(new Set());
          setMyCommunities([]);
          return;
        }

        const memberCommunityIdList = memberData?.map(m => m.community_id) || [];
        const memberSet = new Set(memberCommunityIdList);
        setMembershipIds(memberSet);

        // Filter "my communities" = member OR creator
        const myComms = (allCommunities || []).filter(
          c => memberSet.has(c.id) || c.created_by === userId
        );
        setMyCommunities(myComms);
      } else {
        setMembershipIds(new Set());
        setMyCommunities([]);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchCommunities(session?.user?.id);
      toast.success("Communities refreshed");
    } catch (error) {
      console.error("Error refreshing communities:", error);
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCommunityImage = async (communityId: string): Promise<string | null> => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${communityId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('community-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCreateCommunity = async () => {
    if (!user) {
      toast.error("Please sign in to create a community");
      navigate("/auth");
      return;
    }

    if (!newCommunity.name.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    setIsCreating(true);
    try {
      const { data: community, error } = await supabase
        .from("communities")
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          created_by: user.id,
          is_public: newCommunity.is_public,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload image if selected
      if (imageFile) {
        const imageUrl = await uploadCommunityImage(community.id);
        if (imageUrl) {
          await supabase
            .from("communities")
            .update({ image_url: imageUrl })
            .eq("id", community.id);
        }
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      toast.success("Community created successfully!");
      setDialogOpen(false);
      setNewCommunity({ name: "", description: "", is_public: true });
      setImageFile(null);
      setImagePreview(null);
      fetchCommunities(user.id);
    } catch (error) {
      console.error("Error creating community:", error);
      toast.error("Failed to create community");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast.error("Please sign in to join a community");
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("community_members")
        .insert({
          community_id: communityId,
          user_id: user.id,
        });

      if (error) throw error;
      toast.success("Joined community successfully!");
      fetchCommunities(user.id);
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You're already a member of this community");
      } else {
        console.error("Error joining community:", error);
        toast.error("Failed to join community");
      }
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Left community");
      fetchCommunities(user.id);
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave community");
    }
  };

  const openCommunityChat = async (communityId: string, communityCreator: string) => {
    // Self-heal: ensure creator has a membership row before navigating
    if (user && user.id === communityCreator) {
      try {
        await supabase
          .from("community_members")
          .upsert(
            { community_id: communityId, user_id: user.id, role: "admin" },
            { onConflict: "community_id,user_id", ignoreDuplicates: true }
          );
      } catch (err) {
        // Ignore errors - they might already be a member
      }
    }
    navigate(`/community/${communityId}`);
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMember = (communityId: string, creatorId: string) => {
    return membershipIds.has(communityId) || (user?.id === creatorId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Badge className="mb-2 glass-button border-0">Health Communities</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Connect & Share
              </h1>
              <p className="text-muted-foreground mt-2">
                Join health communities to share experiences and support each other
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Image Upload */}
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Community" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">Click to add community photo</p>

                  <div>
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Diabetes Support Group"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is this community about?"
                      className="mt-1"
                    />
                  </div>

                  {/* Public/Private Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {newCommunity.is_public ? (
                        <Globe className="h-5 w-5 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {newCommunity.is_public ? "Public Community" : "Private Community"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {newCommunity.is_public 
                            ? "Anyone can view and join" 
                            : "Only invited members can join"
                          }
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={newCommunity.is_public}
                      onCheckedChange={(checked) => 
                        setNewCommunity(prev => ({ ...prev, is_public: checked }))
                      }
                    />
                  </div>

                  <Button onClick={handleCreateCommunity} disabled={isCreating} className="w-full">
                    {isCreating ? "Creating..." : "Create Community"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search + Refresh */}
          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              title="Refresh communities"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* My Communities */}
          {user && myCommunities.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                My Communities
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCommunities.map((community) => (
                  <Card key={community.id} className="glass-card p-5 hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                        {community.image_url ? (
                          <img src={community.image_url} alt={community.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {community.is_public ? (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{community.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {community.description || "No description"}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openCommunityChat(community.id, community.created_by)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Open Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleLeaveCommunity(community.id)}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Communities */}
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Discover Communities
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No communities found. Create the first one!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunities.map((community) => (
                  <Card key={community.id} className="glass-card p-5 hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                        {community.image_url ? (
                          <img src={community.image_url} alt={community.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      {community.is_public ? (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{community.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {community.description || "No description"}
                    </p>
                    {isMember(community.id, community.created_by) ? (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => openCommunityChat(community.id, community.created_by)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Open Chat
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Join Community
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityPage;