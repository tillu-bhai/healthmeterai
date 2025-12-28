import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface MembersSheetProps {
  communityId: string;
  currentUserId: string | undefined;
  onStartDM: (userId: string, userName: string) => void;
  trigger?: React.ReactNode;
}

export const MembersSheet = ({ communityId, currentUserId, onStartDM, trigger }: MembersSheetProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data: membersData, error } = await supabase
        .from("community_members")
        .select("user_id, role, joined_at")
        .eq("community_id", communityId);

      if (error) throw error;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, email")
          .in("user_id", userIds);

        const profileMap = new Map(
          profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email }])
        );

        const membersWithProfiles = membersData.map(m => ({
          ...m,
          profile: profileMap.get(m.user_id) || { full_name: null, avatar_url: null, email: null }
        }));

        setMembers(membersWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={(open) => open && fetchMembers()}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Members ({members.length})
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading members...</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.user_id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(member.profile?.full_name || member.profile?.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {member.profile?.full_name || member.profile?.email?.split('@')[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                  {member.user_id !== currentUserId && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onStartDM(member.user_id, member.profile?.full_name || member.profile?.email?.split('@')[0] || "User")}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
