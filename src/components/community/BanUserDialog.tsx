import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  userIdToBan: string;
  userNameToBan: string;
  bannedBy: string;
  onBanned: () => void;
}

export const BanUserDialog = ({
  open,
  onOpenChange,
  communityId,
  userIdToBan,
  userNameToBan,
  bannedBy,
  onBanned,
}: BanUserDialogProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBan = async () => {
    setIsSubmitting(true);
    try {
      // Add to bans table
      const { error: banError } = await supabase.from("community_bans").insert({
        community_id: communityId,
        user_id: userIdToBan,
        banned_by: bannedBy,
        reason: reason.trim() || null,
      });

      if (banError) {
        if (banError.code === "23505") {
          toast.error("This user is already banned");
          onOpenChange(false);
          return;
        }
        throw banError;
      }

      // Remove from community members
      await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userIdToBan);

      toast.success(`${userNameToBan} has been banned from the community`);
      onOpenChange(false);
      setReason("");
      onBanned();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban <strong>{userNameToBan}</strong> from this community?
            They will not be able to view or participate in this community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this user being banned?"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={isSubmitting}>
              {isSubmitting ? "Banning..." : "Ban User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
