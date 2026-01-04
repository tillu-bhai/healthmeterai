import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, Shield, ShieldOff, UserX, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BanUserDialog } from "./BanUserDialog";

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

interface CommunityMembersSheetProps {
  communityId: string;
  communityOwnerId: string;
  currentUserId: string;
  isOwnerOrMod: boolean;
  trigger?: React.ReactNode;
}

export const CommunityMembersSheet = ({
  communityId,
  communityOwnerId,
  currentUserId,
  isOwnerOrMod,
  trigger,
}: CommunityMembersSheetProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banDialog, setBanDialog] = useState<{ userId: string; userName: string } | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data: membersData, error } = await supabase
        .from("community_members")
        .select("user_id, role, joined_at")
        .eq("community_id", communityId)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles
      const userIds = membersData?.map((m) => m.user_id) || [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, email")
          .in("user_id", userIds);

        const profileMap: Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }> = {};
        profilesData?.forEach((p) => {
          profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email };
        });

        const enrichedMembers = membersData.map((m) => ({
          ...m,
          profile: profileMap[m.user_id],
        }));

        setMembers(enrichedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [communityId]);

  const isOwner = currentUserId === communityOwnerId;

  const handlePromoteMod = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("community_members")
        .update({ role: "moderator" })
        .eq("community_id", communityId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User promoted to moderator");
      fetchMembers();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    }
  };

  const handleDemoteMod = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("community_members")
        .update({ role: "member" })
        .eq("community_id", communityId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User demoted to member");
      fetchMembers();
    } catch (error) {
      console.error("Error demoting user:", error);
      toast.error("Failed to demote user");
    }
  };

  const getDisplayName = (member: Member) => {
    return member.profile?.full_name || member.profile?.email?.split("@")[0] || "Anonymous";
  };

  const getRoleBadge = (member: Member) => {
    if (member.user_id === communityOwnerId) {
      return (
        <Badge variant="default" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          Owner
        </Badge>
      );
    }
    if (member.role === "admin" || member.role === "moderator") {
      return (
        <Badge variant="secondary" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Mod
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Members ({members.length})
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Members ({members.length})
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getDisplayName(member).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{getDisplayName(member)}</span>
                          {getRoleBadge(member)}
                        </div>
                        {member.profile?.email && (
                          <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                        )}
                      </div>
                    </div>

                    {isOwner && member.user_id !== currentUserId && member.user_id !== communityOwnerId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === "member" ? (
                            <DropdownMenuItem onClick={() => handlePromoteMod(member.user_id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleDemoteMod(member.user_id)}>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remove Moderator
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setBanDialog({
                                userId: member.user_id,
                                userName: getDisplayName(member),
                              })
                            }
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {isOwnerOrMod &&
                      !isOwner &&
                      member.user_id !== currentUserId &&
                      member.user_id !== communityOwnerId &&
                      member.role === "member" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setBanDialog({
                              userId: member.user_id,
                              userName: getDisplayName(member),
                            })
                          }
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {banDialog && (
        <BanUserDialog
          open={!!banDialog}
          onOpenChange={() => setBanDialog(null)}
          communityId={communityId}
          userIdToBan={banDialog.userId}
          userNameToBan={banDialog.userName}
          bannedBy={currentUserId}
          onBanned={fetchMembers}
        />
      )}
    </>
  );
};
