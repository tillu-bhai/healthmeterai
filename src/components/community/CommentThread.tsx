import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal, Flag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface CommentThreadProps {
  comment: Comment;
  profile?: { full_name: string | null; avatar_url: string | null; email: string | null };
  profiles: Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }>;
  currentUserId?: string;
  isOwnerOrMod?: boolean;
  depth?: number;
  onReply?: (parentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onVoteUpdate?: () => void;
}

export const CommentThread = ({
  comment,
  profile,
  profiles,
  currentUserId,
  isOwnerOrMod,
  depth = 0,
  onReply,
  onDelete,
  onReport,
  onVoteUpdate,
}: CommentThreadProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.like_count);
  const [localDislikes, setLocalDislikes] = useState(comment.dislike_count);
  const [localVote, setLocalVote] = useState<"like" | "dislike" | null>(comment.user_vote || null);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Anonymous";
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const maxDepth = 4;

  const handleVote = async (voteType: "like" | "dislike") => {
    if (!currentUserId || isVoting) return;

    setIsVoting(true);
    try {
      if (localVote === voteType) {
        await supabase
          .from("comment_votes")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", currentUserId);

        if (voteType === "like") {
          setLocalLikes((prev) => prev - 1);
        } else {
          setLocalDislikes((prev) => prev - 1);
        }
        setLocalVote(null);

        await supabase
          .from("comments")
          .update({
            like_count: voteType === "like" ? localLikes - 1 : localLikes,
            dislike_count: voteType === "dislike" ? localDislikes - 1 : localDislikes,
          })
          .eq("id", comment.id);
      } else {
        await supabase.from("comment_votes").upsert(
          {
            comment_id: comment.id,
            user_id: currentUserId,
            vote_type: voteType,
          },
          { onConflict: "comment_id,user_id" }
        );

        let newLikes = localLikes;
        let newDislikes = localDislikes;

        if (localVote === "like") newLikes--;
        else if (localVote === "dislike") newDislikes--;

        if (voteType === "like") newLikes++;
        else newDislikes++;

        setLocalLikes(newLikes);
        setLocalDislikes(newDislikes);
        setLocalVote(voteType);

        await supabase
          .from("comments")
          .update({ like_count: newLikes, dislike_count: newDislikes })
          .eq("id", comment.id);
      }
      onVoteUpdate?.();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l border-border" : ""}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 ${localVote === "like" ? "text-primary" : ""}`}
                onClick={() => handleVote("like")}
                disabled={!currentUserId || isVoting}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="ml-1 text-xs">{localLikes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 ${localVote === "dislike" ? "text-destructive" : ""}`}
                onClick={() => handleVote("dislike")}
                disabled={!currentUserId || isVoting}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="ml-1 text-xs">{localDislikes}</span>
              </Button>

              {currentUserId && depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply className="h-3 w-3" />
                  <span className="ml-1 text-xs">Reply</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUserId && (
                    <DropdownMenuItem onClick={() => onReport?.(comment.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                  {(isOwnerOrMod || comment.user_id === currentUserId) && (
                    <DropdownMenuItem
                      onClick={() => onDelete?.(comment.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isReplying && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSubmitReply} disabled={isSubmitting || !replyContent.trim()}>
                    {isSubmitting ? "Posting..." : "Reply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              profile={profiles[reply.user_id]}
              profiles={profiles}
              currentUserId={currentUserId}
              isOwnerOrMod={isOwnerOrMod}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              onVoteUpdate={onVoteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
