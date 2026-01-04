import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ReportReason = "spam" | "abuse" | "misinformation" | "harassment" | "inappropriate" | "other";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: "post" | "comment" | "user";
  reporterId: string;
  communityId: string;
  postId?: string;
  commentId?: string;
  reportedUserId?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "spam", label: "Spam", description: "Unsolicited advertising or repetitive content" },
  { value: "abuse", label: "Abuse", description: "Threatening or harmful behavior" },
  { value: "misinformation", label: "Misinformation", description: "False or misleading health information" },
  { value: "harassment", label: "Harassment", description: "Bullying or targeting individuals" },
  { value: "inappropriate", label: "Inappropriate", description: "Content that violates community guidelines" },
  { value: "other", label: "Other", description: "Another issue not listed above" },
];

export const ReportDialog = ({
  open,
  onOpenChange,
  reportType,
  reporterId,
  communityId,
  postId,
  commentId,
  reportedUserId,
}: ReportDialogProps) => {
  const [reason, setReason] = useState<ReportReason>("spam");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        report_type: reportType,
        reason,
        description: description.trim() || null,
        community_id: communityId,
        post_id: postId || null,
        comment_id: commentId || null,
        reported_user_id: reportedUserId || null,
      });

      if (error) throw error;

      toast.success("Report submitted. Thank you for helping keep the community safe.");
      onOpenChange(false);
      setReason("spam");
      setDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {reportType === "user" ? "User" : reportType === "post" ? "Post" : "Comment"}</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong. Reports are reviewed by moderators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-base font-medium">Reason for report</Label>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
              className="mt-3 space-y-2"
            >
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer"
                  onClick={() => setReason(r.value)}
                >
                  <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
