import { Bot, Sparkles } from "lucide-react";

interface AISummaryProps {
  summary: string;
  isLoading?: boolean;
}

export const AISummary = ({ summary, isLoading = false }: AISummaryProps) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="h-6 w-32 bg-muted rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-md overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 gradient-hero opacity-5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            AI Summary
            <Sparkles className="h-4 w-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground">Powered by MediScope AI</p>
        </div>
      </div>
      
      <p className="text-foreground/90 leading-relaxed">
        {summary}
      </p>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          ℹ️ This summary is generated for educational purposes only.
        </p>
      </div>
    </div>
  );
};
