import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Image as ImageIcon, 
  Mic, 
  Paperclip, 
  Link as LinkIcon,
  Check,
  CheckCheck,
  Play,
  Pause,
  X,
  MoreVertical,
  RefreshCw,
  Trash2,
  LogIn
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MembersSheet } from "@/components/MembersSheet";
import { FilePreview } from "@/components/FilePreview";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";

interface Message {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  message_type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
}

const CommunityChat = () => {
  const { communityId } = useParams();
  const { user } = useGoogleAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFilePreview, setPendingFilePreview] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Auto-refresh every 100ms (10 times per second)
  const fetchMessagesQuiet = useCallback(async () => {
    if (!communityId) return;

    const { data, error } = await supabase
      .from("community_messages")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(prev => {
      // Only update if there are new messages
      if (data && data.length !== prev.length) {
        // Fetch profiles for new users
        const existingUserIds = new Set(Object.keys(profiles));
        const newUserIds = [...new Set(data.map(m => m.user_id))]
          .filter(id => !existingUserIds.has(id));
        
        if (newUserIds.length > 0) {
          supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, email")
            .in("user_id", newUserIds)
            .then(({ data: profilesData }) => {
              if (profilesData) {
                setProfiles(prev => {
                  const newProfiles = { ...prev };
                  profilesData.forEach(p => {
                    newProfiles[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email };
                  });
                  return newProfiles;
                });
              }
            });
        }
        return data;
      }
      return prev;
    });
  }, [communityId, profiles]);

  useEffect(() => {
    if (!communityId || !user) return;

    fetchCommunity();
    fetchMessages();
    fetchMemberCount();

    // Set up auto-refresh interval (100ms = 10 times per second)
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchMessagesQuiet();
    }, 100);

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Fetch profile for new message
          if (!profiles[newMsg.user_id]) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url, email")
              .eq("user_id", newMsg.user_id)
              .single();
            
            if (profile) {
              setProfiles(prev => ({ ...prev, [newMsg.user_id]: { full_name: profile.full_name, avatar_url: profile.avatar_url, email: profile.email } }));
            }
          }
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [communityId, user, fetchMessagesQuiet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCommunity = async () => {
    if (!communityId) return;
    
    const { data, error } = await supabase
      .from("communities")
      .select("id, name, description, image_url, created_by")
      .eq("id", communityId)
      .single();

    if (error) {
      console.error("Error fetching community:", error);
      toast.error("Community not found");
      navigate("/community");
      return;
    }
    setCommunity(data);
  };

  const fetchMemberCount = async () => {
    if (!communityId) return;
    
    const { count, error } = await supabase
      .from("community_members")
      .select("*", { count: 'exact', head: true })
      .eq("community_id", communityId);

    if (!error && count !== null) {
      setMemberCount(count);
    }
  };

  const fetchMessages = async () => {
    if (!communityId) return;

    const { data, error } = await supabase
      .from("community_messages")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);

    // Fetch profiles for all users
    const userIds = [...new Set(data?.map(m => m.user_id) || [])];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, email")
        .in("user_id", userIds);

      if (profilesData) {
        const profileMap: Record<string, { full_name: string | null; avatar_url: string | null; email: string | null }> = {};
        profilesData.forEach(p => {
          profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email };
        });
        setProfiles(profileMap);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMessages(), fetchMemberCount()]);
    setIsRefreshing(false);
    toast.success("Refreshed!");
  };

  const handleDeleteCommunity = async () => {
    if (!community || !user || community.created_by !== user.id) {
      toast.error("Only the community creator can delete this community");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${community.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      // Delete all messages first
      await supabase
        .from("community_messages")
        .delete()
        .eq("community_id", communityId);

      // Delete all members
      await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId);

      // Delete the community
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", communityId);

      if (error) throw error;

      toast.success("Community deleted successfully");
      navigate("/community");
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Failed to delete community");
    }
  };

  const uploadMedia = async (file: File, type: string): Promise<string | null> => {
    if (!user || !communityId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${communityId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('community-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      toast.error("Failed to upload file");
      return null;
    }

    const { data } = supabase.storage
      .from('community-attachments')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSendMessage = async (
    content: string = newMessage.trim(), 
    messageType: string = 'text', 
    mediaUrl: string | null = null
  ) => {
    if ((!content && !mediaUrl && !pendingFile) || !user || !communityId) return;

    setIsSending(true);
    try {
      let finalMediaUrl = mediaUrl;
      let finalMessageType = messageType;
      let finalContent = content;

      // If there's a pending file, upload it first
      if (pendingFile) {
        finalMediaUrl = await uploadMedia(pendingFile, pendingFile.type.startsWith('image/') ? 'image' : 'file');
        finalMessageType = pendingFile.type.startsWith('image/') ? 'image' : 'file';
        finalContent = content || (pendingFile.type.startsWith('image/') ? '📷 Image' : `📎 ${pendingFile.name}`);
        clearPendingFile();
      }

      const { error } = await supabase
        .from("community_messages")
        .insert({
          community_id: communityId,
          user_id: user.id,
          content: finalContent || '',
          message_type: finalMessageType,
          media_url: finalMediaUrl,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImage && !file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setPendingFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPendingFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPendingFilePreview(null);
    }
    
    setShowAttachMenu(false);
  };

  const clearPendingFile = () => {
    setPendingFile(null);
    setPendingFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (generalFileInputRef.current) generalFileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        
        const mediaUrl = await uploadMedia(audioFile, 'voice');
        if (mediaUrl) {
          await handleSendMessage(`🎤 Voice message (${formatTime(recordingTime)})`, 'voice', mediaUrl);
        }
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (audioRef.current) {
      if (playingAudio === audioUrl) {
        audioRef.current.pause();
        setPlayingAudio(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(audioUrl);
      }
    }
  };

  const detectLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const getDisplayName = (userId: string) => {
    const profile = profiles[userId];
    if (profile?.full_name) return profile.full_name;
    if (profile?.email) return profile.email.split('@')[0];
    // For Google auth users, use the current user's name if it's their message
    if (user && userId === user.id) return user.name;
    return "User";
  };

  const getAvatar = (userId: string) => {
    const profile = profiles[userId];
    if (profile?.avatar_url) return profile.avatar_url;
    // For Google auth users, use the current user's picture if it's their message
    if (user && userId === user.id) return user.picture;
    return null;
  };

  // Show login prompt if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass-card p-8 max-w-md text-center">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access community chat.
          </p>
          <Button variant="hero" onClick={() => navigate("/auth")} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container flex items-center gap-3 h-16">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/community")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
            {community?.image_url ? (
              <img src={community.image_url} alt={community.name} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-foreground truncate">
              {community?.name || "Loading..."}
            </h1>
            <p className="text-xs text-muted-foreground">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {community && (
            <MembersSheet 
              communityId={community.id} 
              currentUserId={user?.id}
              onStartDM={() => {}}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleManualRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
              {community && user?.id === community.created_by && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDeleteCommunity}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Community
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            const displayName = getDisplayName(message.user_id);
            const avatarUrl = getAvatar(message.user_id);
            
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1 px-1">
                      {displayName}
                    </p>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'glass-card rounded-bl-sm'
                    }`}
                  >
                    {message.message_type === 'image' && message.media_url && (
                      <img 
                        src={message.media_url} 
                        alt="Shared image" 
                        className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(message.media_url!, '_blank')}
                      />
                    )}
                    
                    {message.message_type === 'voice' && message.media_url && (
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePlayAudio(message.media_url!)}
                        >
                          {playingAudio === message.media_url ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1 h-1 bg-secondary rounded-full">
                          <div className="h-full w-0 bg-primary rounded-full" />
                        </div>
                      </div>
                    )}
                    
                    {message.message_type === 'file' && message.media_url && (
                      <a 
                        href={message.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline mb-2"
                      >
                        <Paperclip className="h-4 w-4" />
                        Download File
                      </a>
                    )}
                    
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {detectLinks(message.content)}
                    </p>
                    
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                        message.is_read ? (
                          <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="h-3 w-3 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
                
                {isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={user?.picture || undefined} />
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {pendingFile && (
        <FilePreview 
          file={pendingFile} 
          preview={pendingFilePreview || undefined} 
          onRemove={clearPendingFile} 
        />
      )}

      {/* Input */}
      <div className="sticky bottom-0 glass border-t border-border/30 p-4">
        <div className="container max-w-4xl mx-auto">
          {isRecording ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={cancelRecording}>
                <X className="h-5 w-5 text-destructive" />
              </Button>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-3 w-3 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
              <Button variant="hero" size="icon" onClick={stopRecording}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 glass-card rounded-lg p-2 flex flex-col gap-1 min-w-[140px]">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                      onClick={() => generalFileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                      File
                    </button>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, true)}
              />
              <input
                ref={generalFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e, false)}
              />
              
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isSending}
              />
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={startRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="hero" 
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={isSending || (!newMessage.trim() && !pendingFile)}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />
    </div>
  );
};

export default CommunityChat;
