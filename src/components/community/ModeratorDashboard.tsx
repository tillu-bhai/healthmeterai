import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Shield, Flag, UserX, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  report_type: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface BannedUser {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
}

interface ModeratorDashboardProps {
  communityId: string;
  currentUserId: string;
  isOwner: boolean;
  trigger?: React.ReactNode;
}

export const ModeratorDashboard = ({
  communityId,
  currentUserId,
  isOwner,
  trigger,
}: ModeratorDashboardProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "resolve" | "dismiss" | "delete" | "unban";
    id: string;
    title: string;
    description: string;
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Fetch banned users
      const { data: bansData, error: bansError } = await supabase
        .from("community_bans")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (bansError) throw bansError;
      setBannedUsers(bansData || []);

      // Fetch profiles for all users
      const userIds = new Set<string>();
      reportsData?.forEach((r) => {
        userIds.add(r.reporter_id);
        if (r.reported_user_id) userIds.add(r.reported_user_id);
      });
      bansData?.forEach((b) => {
        userIds.add(b.user_id);
        userIds.add(b.banned_by);
      });

      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .in("user_id", Array.from(userIds));

        if (profilesData) {
          const profileMap: Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }> = {};
          profilesData.forEach((p) => {
            profileMap[p.user_id] = { full_name: p.full_name, email: p.email, avatar_url: p.avatar_url };
          });
          setProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error("Error fetching moderation data:", error);
      toast.error("Failed to load moderation data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communityId]);

  const handleReportAction = async (reportId: string, action: "resolved" | "dismissed") => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: action,
          reviewed_by: currentUserId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast.success(`Report ${action}`);
      fetchData();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    }
    setConfirmAction(null);
  };

  const handleDeleteContent = async (report: Report) => {
    try {
      if (report.report_type === "post" && report.post_id) {
        await supabase.from("posts").delete().eq("id", report.post_id);
      } else if (report.report_type === "comment" && report.comment_id) {
        await supabase.from("comments").delete().eq("id", report.comment_id);
      }

      await handleReportAction(report.id, "resolved");
      toast.success("Content deleted and report resolved");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
    setConfirmAction(null);
  };

  const handleUnban = async (banId: string) => {
    try {
      const { error } = await supabase
        .from("community_bans")
        .delete()
        .eq("id", banId);

      if (error) throw error;

      toast.success("User unbanned");
      fetchData();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
    setConfirmAction(null);
  };

  const getDisplayName = (userId: string) => {
    const profile = profiles[userId];
    return profile?.full_name || profile?.email?.split("@")[0] || "Unknown User";
  };

  const pendingReports = reports.filter((r) => r.status === "pending");
  const resolvedReports = reports.filter((r) => r.status !== "pending");

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Moderation
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {pendingReports.length}
                </Badge>
              )}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Moderation Dashboard
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="reports" className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="reports" className="flex-1">
                <Flag className="h-4 w-4 mr-2" />
                Reports
                {pendingReports.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                    {pendingReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bans" className="flex-1">
                <UserX className="h-4 w-4 mr-2" />
                Bans ({bannedUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pendingReports.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending reports</p>
                </div>
              ) : (
                pendingReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {report.report_type}
                        </Badge>
                        <Badge
                          variant={
                            report.reason === "abuse" || report.reason === "harassment"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {report.reason}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm mb-3">
                      <span className="text-muted-foreground">Reported by: </span>
                      <span className="font-medium">{getDisplayName(report.reporter_id)}</span>
                    </p>

                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-3 bg-secondary/50 p-2 rounded">
                        "{report.description}"
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setConfirmAction({
                            type: "dismiss",
                            id: report.id,
                            title: "Dismiss Report",
                            description: "Are you sure you want to dismiss this report? The content will remain visible.",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      {(report.report_type === "post" || report.report_type === "comment") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setConfirmAction({
                              type: "delete",
                              id: report.id,
                              title: "Delete Content",
                              description: `Are you sure you want to delete this ${report.report_type}? This action cannot be undone.`,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: "resolve",
                            id: report.id,
                            title: "Resolve Report",
                            description: "Mark this report as resolved?",
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="bans" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : bannedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No banned users</p>
                </div>
              ) : (
                bannedUsers.map((ban) => (
                  <Card key={ban.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profiles[ban.user_id]?.avatar_url || undefined} />
                          <AvatarFallback className="bg-destructive/10 text-destructive">
                            {getDisplayName(ban.user_id).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getDisplayName(ban.user_id)}</p>
                          <p className="text-xs text-muted-foreground">
                            Banned {formatDistanceToNow(new Date(ban.created_at), { addSuffix: true })}
                          </p>
                          {ban.reason && (
                            <p className="text-xs text-muted-foreground mt-1">Reason: {ban.reason}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setConfirmAction({
                            type: "unban",
                            id: ban.id,
                            title: "Unban User",
                            description: `Are you sure you want to unban ${getDisplayName(ban.user_id)}?`,
                          })
                        }
                      >
                        Unban
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "resolve") {
                  handleReportAction(confirmAction.id, "resolved");
                } else if (confirmAction.type === "dismiss") {
                  handleReportAction(confirmAction.id, "dismissed");
                } else if (confirmAction.type === "delete") {
                  const report = reports.find((r) => r.id === confirmAction.id);
                  if (report) handleDeleteContent(report);
                } else if (confirmAction.type === "unban") {
                  handleUnban(confirmAction.id);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
