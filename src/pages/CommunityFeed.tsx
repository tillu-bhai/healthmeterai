import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  MoreVertical,
  Settings,
  Trash2,
  LogIn,
  BookOpen,
  TrendingUp,
  Clock,
  RefreshCw,
  UserPlus,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { PostCard } from "@/components/community/PostCard";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { ReportDialog } from "@/components/community/ReportDialog";
import { CommunityRulesDialog } from "@/components/community/CommunityRulesDialog";
import { ModeratorDashboard } from "@/components/community/ModeratorDashboard";
import { CommunityMembersSheet } from "@/components/community/CommunityMembersSheet";

interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  is_public: boolean;
  rules: string[] | null;
  created_at: string;
}

interface Post {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  content: string | null;
  media_urls: string[] | null;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  user_vote?: "like" | "dislike" | null;
}

const CommunityFeed = () => {
  const { communityId } = useParams();
  const { user } = useGoogleAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }>>({});
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string>("member");
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"new" | "top">("new");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "community" | "post"; id: string } | null>(null);
  const [reportDialog, setReportDialog] = useState<{ postId: string } | null>(null);
  const [isBanned, setIsBanned] = useState(false);

  const isOwner = user?.id === community?.created_by;
  const isModerator = memberRole === "moderator" || memberRole === "admin";
  const isOwnerOrMod = isOwner || isModerator;

  const fetchCommunity = async () => {
    if (!communityId) return;

    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();

    if (error) {
      console.error("Error fetching community:", error);
      toast.error("Community not found");
      navigate("/community");
      return;
    }

    setCommunity(data);
  };

  const fetchMembership = async () => {
    if (!communityId || !user) return;

    // Check if banned
    const { data: banData } = await supabase
      .from("community_bans")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .single();

    if (banData) {
      setIsBanned(true);
      return;
    }

    const { data, error } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setIsMember(true);
      setMemberRole(data.role);
    } else {
      setIsMember(false);
      setMemberRole("member");
    }
  };

  const fetchMemberCount = async () => {
    if (!communityId) return;

    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    setMemberCount(count || 0);
  };

  const fetchPosts = useCallback(async () => {
    if (!communityId) return;

    let query = supabase
      .from("posts")
      .select("*")
      .eq("community_id", communityId);

    if (sortBy === "new") {
      query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("is_pinned", { ascending: false }).order("like_count", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }

    // Fetch user votes if logged in
    let postsWithVotes = data || [];
    if (user && data && data.length > 0) {
      const postIds = data.map((p) => p.id);
      const { data: votesData } = await supabase
        .from("post_votes")
        .select("post_id, vote_type")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      if (votesData) {
        const voteMap: Record<string, "like" | "dislike"> = {};
        votesData.forEach((v) => {
          voteMap[v.post_id] = v.vote_type as "like" | "dislike";
        });

        postsWithVotes = data.map((p) => ({
          ...p,
          user_vote: voteMap[p.id] || null,
        }));
      }
    }

    setPosts(postsWithVotes);

    // Fetch profiles
    const userIds = [...new Set(data?.map((p) => p.user_id) || [])];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, email")
        .in("user_id", userIds);

      if (profilesData) {
        const profileMap: Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }> = {};
        profilesData.forEach((p) => {
          profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email };
        });
        setProfiles(profileMap);
      }
    }
  }, [communityId, sortBy, user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCommunity(), fetchMembership(), fetchMemberCount(), fetchPosts()]);
      setIsLoading(false);
    };

    loadData();

    // Subscribe to realtime posts
    const channel = supabase
      .channel(`posts-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, user, sortBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPosts(), fetchMemberCount()]);
    setIsRefreshing(false);
    toast.success("Refreshed!");
  };

  const handleJoin = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Joined community!");
      setIsMember(true);
      fetchMemberCount();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You're already a member");
      } else {
        toast.error("Failed to join community");
      }
    }
  };

  const handleLeave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Left community");
      setIsMember(false);
      setMemberRole("member");
      fetchMemberCount();
    } catch (error) {
      toast.error("Failed to leave community");
    }
  };

  const handleDeleteCommunity = async () => {
    if (!communityId || !isOwner) return;

    try {
      // Delete all related data
      await supabase.from("posts").delete().eq("community_id", communityId);
      await supabase.from("community_messages").delete().eq("community_id", communityId);
      await supabase.from("community_members").delete().eq("community_id", communityId);
      await supabase.from("community_bans").delete().eq("community_id", communityId);
      await supabase.from("reports").delete().eq("community_id", communityId);

      const { error } = await supabase.from("communities").delete().eq("id", communityId);

      if (error) throw error;

      toast.success("Community deleted");
      navigate("/community");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Failed to delete community");
    }
    setDeleteConfirm(null);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Delete comments first
      await supabase.from("comments").delete().eq("post_id", postId);
      await supabase.from("post_votes").delete().eq("post_id", postId);

      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      toast.success("Post deleted");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
    setDeleteConfirm(null);
  };

  const handlePinPost = async (postId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_pinned: !currentPinned })
        .eq("id", postId);

      if (error) throw error;

      toast.success(currentPinned ? "Post unpinned" : "Post pinned");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  if (isBanned) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="glass-card p-8 max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You have been banned from this community and cannot access its content.
            </p>
            <Button variant="outline" onClick={() => navigate("/community")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="glass-card p-8 max-w-md text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Community Not Found</h1>
            <Button variant="outline" onClick={() => navigate("/community")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Community Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container py-6">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/community")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Communities
            </Button>

            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                {community.image_url ? (
                  <img src={community.image_url} alt={community.name} className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-10 w-10 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{community.name}</h1>
                  <Badge variant={community.is_public ? "outline" : "secondary"}>
                    {community.is_public ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>

                {community.description && (
                  <p className="text-muted-foreground mb-3">{community.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {memberCount} members
                  </span>

                  <CommunityRulesDialog
                    communityId={communityId!}
                    currentRules={community.rules || []}
                    isOwner={isOwner}
                    onRulesUpdated={fetchCommunity}
                    trigger={
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Rules
                      </Button>
                    }
                  />

                  {user && (
                    <CommunityMembersSheet
                      communityId={communityId!}
                      communityOwnerId={community.created_by}
                      currentUserId={user.id}
                      isOwnerOrMod={isOwnerOrMod}
                    />
                  )}

                  {isOwnerOrMod && (
                    <ModeratorDashboard
                      communityId={communityId!}
                      currentUserId={user!.id}
                      isOwner={isOwner}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!user ? (
                  <Button variant="hero" onClick={() => navigate("/auth")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in to Join
                  </Button>
                ) : isMember || isOwner ? (
                  <>
                    <CreatePostDialog
                      communityId={communityId!}
                      userId={user.id}
                      onPostCreated={fetchPosts}
                    />
                    {!isOwner && (
                      <Button variant="outline" onClick={handleLeave}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave
                      </Button>
                    )}
                  </>
                ) : (
                  <Button variant="hero" onClick={handleJoin}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                )}

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/community/${communityId}/settings`)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteConfirm({ type: "community", id: communityId! })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Community
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="container py-6">
          <div className="max-w-3xl mx-auto">
            {/* Sort & Refresh */}
            <div className="flex items-center justify-between mb-6">
              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as "new" | "top")}>
                <TabsList>
                  <TabsTrigger value="new">
                    <Clock className="h-4 w-4 mr-2" />
                    New
                  </TabsTrigger>
                  <TabsTrigger value="top">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Top
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                {user && (isMember || isOwner) && (
                  <CreatePostDialog
                    communityId={communityId!}
                    userId={user.id}
                    onPostCreated={fetchPosts}
                    trigger={<Button variant="hero">Create First Post</Button>}
                  />
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    profile={profiles[post.user_id]}
                    currentUserId={user?.id}
                    isOwnerOrMod={isOwnerOrMod}
                    onClick={() => navigate(`/community/${communityId}/post/${post.id}`)}
                    onVote={fetchPosts}
                    onDelete={() => setDeleteConfirm({ type: "post", id: post.id })}
                    onPin={() => handlePinPost(post.id, post.is_pinned)}
                    onReport={() => setReportDialog({ postId: post.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteConfirm?.type === "community" ? "Community" : "Post"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {deleteConfirm?.type === "community" &&
                " All posts, comments, and member data will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm?.type === "community") {
                  handleDeleteCommunity();
                } else if (deleteConfirm?.type === "post") {
                  handleDeletePost(deleteConfirm.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      {reportDialog && user && (
        <ReportDialog
          open={!!reportDialog}
          onOpenChange={() => setReportDialog(null)}
          reportType="post"
          reporterId={user.id}
          communityId={communityId!}
          postId={reportDialog.postId}
        />
      )}
    </div>
  );
};

export default CommunityFeed;
