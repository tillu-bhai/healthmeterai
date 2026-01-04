import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MoreHorizontal,
  Flag,
  Trash2,
  Pin,
  PinOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface PostCardProps {
  post: Post;
  profile?: { full_name: string | null; avatar_url: string | null; email: string | null };
  currentUserId?: string;
  isOwnerOrMod?: boolean;
  onClick?: () => void;
  onVote?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onReport?: () => void;
}

export const PostCard = ({
  post,
  profile,
  currentUserId,
  isOwnerOrMod,
  onClick,
  onVote,
  onDelete,
  onPin,
  onReport,
}: PostCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.like_count);
  const [localDislikes, setLocalDislikes] = useState(post.dislike_count);
  const [localVote, setLocalVote] = useState<"like" | "dislike" | null>(post.user_vote || null);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Anonymous";
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const handleVote = async (voteType: "like" | "dislike", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || isVoting) return;

    setIsVoting(true);
    try {
      if (localVote === voteType) {
        // Remove vote
        await supabase
          .from("post_votes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);

        if (voteType === "like") {
          setLocalLikes((prev) => prev - 1);
        } else {
          setLocalDislikes((prev) => prev - 1);
        }
        setLocalVote(null);

        // Update post counts
        await supabase
          .from("posts")
          .update({
            like_count: voteType === "like" ? localLikes - 1 : localLikes,
            dislike_count: voteType === "dislike" ? localDislikes - 1 : localDislikes,
          })
          .eq("id", post.id);
      } else {
        // Upsert vote
        await supabase.from("post_votes").upsert(
          {
            post_id: post.id,
            user_id: currentUserId,
            vote_type: voteType,
          },
          { onConflict: "post_id,user_id" }
        );

        // Update counts
        let newLikes = localLikes;
        let newDislikes = localDislikes;

        if (localVote === "like") {
          newLikes--;
        } else if (localVote === "dislike") {
          newDislikes--;
        }

        if (voteType === "like") {
          newLikes++;
        } else {
          newDislikes++;
        }

        setLocalLikes(newLikes);
        setLocalDislikes(newDislikes);
        setLocalVote(voteType);

        await supabase
          .from("posts")
          .update({ like_count: newLikes, dislike_count: newDislikes })
          .eq("id", post.id);
      }
      onVote?.();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card
      className="glass-card p-4 hover:shadow-glow transition-all cursor-pointer"
      onClick={onClick}
    >
      {post.is_pinned && (
        <Badge variant="secondary" className="mb-2 text-xs">
          <Pin className="h-3 w-3 mr-1" />
          Pinned
        </Badge>
      )}

      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>

          {post.content && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.content}</p>
          )}

          {post.media_urls && post.media_urls.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {post.media_urls.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary"
                >
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={url} className="h-full w-full object-cover" />
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
              {post.media_urls.length > 4 && (
                <div className="h-20 w-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    +{post.media_urls.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${localVote === "like" ? "text-primary" : ""}`}
                onClick={(e) => handleVote("like", e)}
                disabled={!currentUserId || isVoting}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="ml-1 text-xs">{localLikes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${localVote === "dislike" ? "text-destructive" : ""}`}
                onClick={(e) => handleVote("dislike", e)}
                disabled={!currentUserId || isVoting}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="ml-1 text-xs">{localDislikes}</span>
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onClick}>
              <MessageCircle className="h-4 w-4" />
              <span className="ml-1 text-xs">{post.comment_count}</span>
            </Button>

            <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUserId && (
                    <DropdownMenuItem onClick={onReport}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                  {isOwnerOrMod && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onPin}>
                        {post.is_pinned ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {post.user_id === currentUserId && !isOwnerOrMod && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
