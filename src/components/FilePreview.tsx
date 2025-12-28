import { X, File, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  preview?: string;
  onRemove: () => void;
}

export const FilePreview = ({ file, preview, onRemove }: FilePreviewProps) => {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="relative inline-flex items-center gap-2 bg-secondary/50 rounded-lg p-2 max-w-[200px]">
      {isImage && preview ? (
        <img 
          src={preview} 
          alt="Preview" 
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
          {isImage ? (
            <ImageIcon className="h-6 w-6 text-primary" />
          ) : (
            <File className="h-6 w-6 text-primary" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 absolute -top-2 -right-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
