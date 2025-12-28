import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Send, 
  MessageSquare,
  Check,
  CheckCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Header } from "@/components/Header";

interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Inbox = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string; avatar: string | null } | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Check for DM params
      const dmUserId = searchParams.get("user");
      const dmUserName = searchParams.get("name");
      if (dmUserId && dmUserName) {
        setSelectedPartner({ id: dmUserId, name: dmUserName, avatar: null });
      }
    };
    getUser();
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    // Subscribe to realtime DMs
    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          if (newMsg.sender_id === user.id || newMsg.recipient_id === user.id) {
            if (selectedPartner && (newMsg.sender_id === selectedPartner.id || newMsg.recipient_id === selectedPartner.id)) {
              setMessages(prev => [...prev, newMsg]);
            }
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedPartner]);

  useEffect(() => {
    if (selectedPartner && user) {
      fetchMessages(selectedPartner.id);
      markMessagesAsRead(selectedPartner.id);
    }
  }, [selectedPartner, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    // Group by partner
    const partnerMap = new Map<string, { messages: DirectMessage[]; unread: number }>();
    data?.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, { messages: [], unread: 0 });
      }
      const entry = partnerMap.get(partnerId)!;
      entry.messages.push(msg);
      if (!msg.is_read && msg.recipient_id === user.id) {
        entry.unread++;
      }
    });

    // Fetch profiles
    const partnerIds = Array.from(partnerMap.keys());
    if (partnerIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", partnerIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

    const convs: Conversation[] = partnerIds.map(partnerId => {
      const entry = partnerMap.get(partnerId)!;
      const profile = profileMap.get(partnerId);
      const lastMsg = entry.messages[0];
      
      return {
        partnerId,
        partnerName: profile?.full_name || "Unknown",
        partnerAvatar: profile?.avatar_url || null,
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.created_at,
        unreadCount: entry.unread
      };
    });

    setConversations(convs.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    ));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const markMessagesAsRead = async (partnerId: string) => {
    if (!user) return;

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("sender_id", partnerId)
      .eq("recipient_id", user.id)
      .eq("is_read", false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedPartner) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          recipient_id: selectedPartner.id,
          content: newMessage.trim(),
          message_type: "text",
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Inbox</h1>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="border border-border/30 rounded-lg overflow-hidden">
            <div className="p-3 bg-secondary/30 border-b border-border/30">
              <h2 className="font-medium text-sm">Conversations</h2>
            </div>
            <ScrollArea className="h-[calc(100%-48px)]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {conversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => setSelectedPartner({ 
                        id: conv.partnerId, 
                        name: conv.partnerName, 
                        avatar: conv.partnerAvatar 
                      })}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors text-left ${
                        selectedPartner?.id === conv.partnerId ? "bg-secondary/50" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.partnerAvatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.partnerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conv.partnerName}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="border border-border/30 rounded-lg overflow-hidden flex flex-col">
            {selectedPartner ? (
              <>
                <div className="p-3 bg-secondary/30 border-b border-border/30 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedPartner.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selectedPartner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-medium text-sm">{selectedPartner.name}</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-tr-sm" 
                              : "bg-secondary text-secondary-foreground rounded-tl-sm"
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                              <span className="text-[10px] opacity-70">
                                {formatTime(msg.created_at)}
                              </span>
                              {isOwn && (
                                <span className="opacity-70">
                                  {msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full"
                      disabled={isSending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      size="icon"
                      className="rounded-full"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
