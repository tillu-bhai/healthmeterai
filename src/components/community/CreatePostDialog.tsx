import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image, Video, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePostDialogProps {
  communityId: string;
  userId: string;
  onPostCreated: () => void;
  trigger?: React.ReactNode;
}

export const CreatePostDialog = ({
  communityId,
  userId,
  onPostCreated,
  trigger,
}: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 10) {
      toast.error("Maximum 10 media files allowed");
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/")).length) {
            setMediaPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of mediaFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${communityId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("community-attachments")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from("community-attachments")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia();
      }

      const { error } = await supabase.from("posts").insert({
        community_id: communityId,
        user_id: userId,
        title: title.trim(),
        content: content.trim() || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      });

      if (error) throw error;

      toast.success("Post created successfully!");
      setOpen(false);
      setTitle("");
      setContent("");
      setMediaFiles([]);
      setMediaPreviews([]);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="mt-1"
              maxLength={300}
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, experiences, or questions..."
              className="mt-1 min-h-[150px]"
            />
          </div>

          <div>
            <Label>Media (optional)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {mediaPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary"
                >
                  {mediaFiles[index]?.type.startsWith("video/") ? (
                    <video src={preview} className="h-full w-full object-cover" />
                  ) : (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {mediaFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                >
                  <Image className="h-6 w-6" />
                  <span className="text-xs">Add Media</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supports images and videos. Max 10 files.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
