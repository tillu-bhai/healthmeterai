import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Pin,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { CommentThread } from "@/components/community/CommentThread";
import { ReportDialog } from "@/components/community/ReportDialog";

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
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  dislike_count: number;
  created_at: string;
  user_vote?: "like" | "dislike" | null;
  replies?: Comment[];
}

interface Community {
  id: string;
  name: string;
  created_by: string;
}

const PostDetail = () => {
  const { communityId, postId } = useParams();
  const { user } = useGoogleAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }>>({});
  const [memberRole, setMemberRole] = useState<string>("member");
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [localLikes, setLocalLikes] = useState(0);
  const [localDislikes, setLocalDislikes] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [reportDialog, setReportDialog] = useState<{ type: "post" | "comment"; id: string } | null>(null);

  const isOwner = user?.id === community?.created_by;
  const isModerator = memberRole === "moderator" || memberRole === "admin";
  const isOwnerOrMod = isOwner || isModerator;

  const fetchPost = async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      toast.error("Post not found");
      navigate(`/community/${communityId}`);
      return;
    }

    setPost(data);
    setLocalLikes(data.like_count);
    setLocalDislikes(data.dislike_count);

    // Fetch author profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, email")
      .eq("user_id", data.user_id)
      .single();

    if (profileData) {
      setProfiles((prev) => ({ ...prev, [profileData.user_id]: profileData }));
    }

    // Fetch user's vote
    if (user) {
      const { data: voteData } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (voteData) {
        setUserVote(voteData.vote_type as "like" | "dislike");
      }
    }
  };

  const fetchCommunity = async () => {
    if (!communityId) return;

    const { data } = await supabase
      .from("communities")
      .select("id, name, created_by")
      .eq("id", communityId)
      .single();

    if (data) {
      setCommunity(data);
    }
  };

  const fetchMembership = async () => {
    if (!communityId || !user) return;

    const { data } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setMemberRole(data.role);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    // Fetch user votes for comments
    let commentsWithVotes = data || [];
    if (user && data && data.length > 0) {
      const commentIds = data.map((c) => c.id);
      const { data: votesData } = await supabase
        .from("comment_votes")
        .select("comment_id, vote_type")
        .eq("user_id", user.id)
        .in("comment_id", commentIds);

      if (votesData) {
        const voteMap: Record<string, "like" | "dislike"> = {};
        votesData.forEach((v) => {
          voteMap[v.comment_id] = v.vote_type as "like" | "dislike";
        });

        commentsWithVotes = data.map((c) => ({
          ...c,
          user_vote: voteMap[c.id] || null,
        }));
      }
    }

    // Build comment tree
    const commentMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    commentsWithVotes.forEach((c) => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    commentsWithVotes.forEach((c) => {
      if (c.parent_id && commentMap[c.parent_id]) {
        commentMap[c.parent_id].replies!.push(commentMap[c.id]);
      } else if (!c.parent_id) {
        rootComments.push(commentMap[c.id]);
      }
    });

    setComments(rootComments);

    // Fetch profiles for all comment authors
    const userIds = [...new Set(data?.map((c) => c.user_id) || [])];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, email")
        .in("user_id", userIds);

      if (profilesData) {
        setProfiles((prev) => {
          const newProfiles = { ...prev };
          profilesData.forEach((p) => {
            newProfiles[p.user_id] = p;
          });
          return newProfiles;
        });
      }
    }
  }, [postId, user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPost(), fetchCommunity(), fetchMembership(), fetchComments()]);
      setIsLoading(false);
    };

    loadData();

    // Subscribe to realtime comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  const handleVote = async (voteType: "like" | "dislike") => {
    if (!user || !post) return;

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from("post_votes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (voteType === "like") {
          setLocalLikes((prev) => prev - 1);
        } else {
          setLocalDislikes((prev) => prev - 1);
        }
        setUserVote(null);

        await supabase
          .from("posts")
          .update({
            like_count: voteType === "like" ? localLikes - 1 : localLikes,
            dislike_count: voteType === "dislike" ? localDislikes - 1 : localDislikes,
          })
          .eq("id", post.id);
      } else {
        await supabase.from("post_votes").upsert(
          {
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType,
          },
          { onConflict: "post_id,user_id" }
        );

        let newLikes = localLikes;
        let newDislikes = localDislikes;

        if (userVote === "like") newLikes--;
        else if (userVote === "dislike") newDislikes--;

        if (voteType === "like") newLikes++;
        else newDislikes++;

        setLocalLikes(newLikes);
        setLocalDislikes(newDislikes);
        setUserVote(voteType);

        await supabase
          .from("posts")
          .update({ like_count: newLikes, dislike_count: newDislikes })
          .eq("id", post.id);
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !post || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      // Update comment count
      await supabase
        .from("posts")
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq("id", post.id);

      setNewComment("");
      fetchComments();
      setPost((prev) => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : null);
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user || !post) return;

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: user.id,
      parent_id: parentId,
      content,
    });

    if (error) throw error;

    await supabase
      .from("posts")
      .update({ comment_count: (post.comment_count || 0) + 1 })
      .eq("id", post.id);

    setPost((prev) => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : null);
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Delete replies first
      await supabase.from("comments").delete().eq("parent_id", commentId);
      await supabase.from("comment_votes").delete().eq("comment_id", commentId);

      const { error } = await supabase.from("comments").delete().eq("id", commentId);

      if (error) throw error;

      toast.success("Comment deleted");
      fetchComments();
    } catch (error) {
      toast.error("Failed to delete comment");
    }
    setDeleteConfirm(null);
  };

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

  if (!post || !community) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="glass-card p-8 max-w-md text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Post Not Found</h1>
            <Button variant="outline" onClick={() => navigate(`/community/${communityId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const authorProfile = profiles[post.user_id];
  const displayName = authorProfile?.full_name || authorProfile?.email?.split("@")[0] || "Anonymous";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(`/community/${communityId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {community.name}
          </Button>

          {/* Post */}
          <Card className="glass-card p-6 mb-6">
            {post.is_pinned && (
              <Badge variant="secondary" className="mb-3">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}

            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={authorProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{displayName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  {post.title}
                </h1>
              </div>
            </div>

            {post.content && (
              <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
            )}

            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {post.media_urls.map((url, index) => (
                  <div key={index} className="rounded-lg overflow-hidden bg-secondary aspect-video">
                    {url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={url} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${userVote === "like" ? "text-primary" : ""}`}
                  onClick={() => handleVote("like")}
                  disabled={!user}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="ml-1">{localLikes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${userVote === "dislike" ? "text-destructive" : ""}`}
                  onClick={() => handleVote("dislike")}
                  disabled={!user}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="ml-1">{localDislikes}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comment_count} comments</span>
              </div>
            </div>
          </Card>

          {/* Comment Input */}
          {user ? (
            <Card className="glass-card p-4 mb-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profiles[user.id]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(profiles[user.id]?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[80px] mb-2"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="glass-card p-4 mb-6 text-center">
              <p className="text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </Card>
          )}

          {/* Comments */}
          <div>
            <h2 className="font-semibold text-lg mb-4">
              Comments ({post.comment_count})
            </h2>

            {comments.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </Card>
            ) : (
              <Card className="glass-card divide-y divide-border">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    profile={profiles[comment.user_id]}
                    profiles={profiles}
                    currentUserId={user?.id}
                    isOwnerOrMod={isOwnerOrMod}
                    onReply={handleReply}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onReport={(id) => setReportDialog({ type: "comment", id })}
                    onVoteUpdate={fetchComments}
                  />
                ))}
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All replies to this comment will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDeleteComment(deleteConfirm)}
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
          reportType={reportDialog.type}
          reporterId={user.id}
          communityId={communityId!}
          postId={reportDialog.type === "post" ? postId : undefined}
          commentId={reportDialog.type === "comment" ? reportDialog.id : undefined}
        />
      )}
    </div>
  );
};

export default PostDetail;
