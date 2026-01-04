import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Plus, X, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommunityRulesDialogProps {
  communityId: string;
  currentRules: string[];
  isOwner: boolean;
  onRulesUpdated: () => void;
  trigger?: React.ReactNode;
}

export const CommunityRulesDialog = ({
  communityId,
  currentRules,
  isOwner,
  onRulesUpdated,
  trigger,
}: CommunityRulesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<string[]>(currentRules || []);
  const [newRule, setNewRule] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addRule = () => {
    if (!newRule.trim()) return;
    if (rules.length >= 10) {
      toast.error("Maximum 10 rules allowed");
      return;
    }
    setRules([...rules, newRule.trim()]);
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("communities")
        .update({ rules })
        .eq("id", communityId);

      if (error) throw error;

      toast.success("Community rules updated");
      onRulesUpdated();
      setOpen(false);
    } catch (error) {
      console.error("Error updating rules:", error);
      toast.error("Failed to update rules");
    } finally {
      setIsSaving(false);
    }
  };

  // View-only mode for non-owners
  if (!isOwner) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              View Rules
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Community Rules</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {currentRules && currentRules.length > 0 ? (
              <ol className="space-y-3">
                {currentRules.map((rule, index) => (
                  <li key={index} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                    <span className="font-semibold text-primary">{index + 1}.</span>
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No rules have been set for this community yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Rules
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Community Rules</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label>Add a Rule</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="e.g., Be respectful to all members"
                onKeyDown={(e) => e.key === "Enter" && addRule()}
              />
              <Button onClick={addRule} disabled={!newRule.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Current Rules ({rules.length}/10)</Label>
            <div className="mt-2 space-y-2">
              {rules.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No rules yet. Add rules to help guide your community.
                </p>
              ) : (
                rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
                    <span className="font-semibold text-primary text-sm">{index + 1}.</span>
                    <span className="flex-1 text-sm">{rule}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Rules"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
