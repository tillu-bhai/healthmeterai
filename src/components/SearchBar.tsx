import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  size?: "default" | "large";
}

export const SearchBar = ({ onSearch, isLoading = false, size = "default" }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative flex items-center gap-3 ${isLarge ? "max-w-3xl" : "max-w-2xl"} mx-auto`}>
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
          <Input
            type="text"
            placeholder="Search diseases, drugs, symptoms, procedures..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${isLarge ? "h-14 pl-12 pr-4 text-lg rounded-2xl" : "h-12 pl-11 pr-4 rounded-xl"} bg-card border-border/60 shadow-md focus:shadow-lg transition-shadow`}
          />
        </div>
        <Button 
          type="submit" 
          variant="hero" 
          size={isLarge ? "xl" : "lg"}
          disabled={isLoading || !query.trim()}
          className="shrink-0"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
