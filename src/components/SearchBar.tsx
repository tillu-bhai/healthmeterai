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
        <div className="relative flex-1 group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-50 blur transition-opacity duration-500" />
          
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors ${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
            <Input
              type="text"
              placeholder="Search diseases, drugs, symptoms, procedures..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${isLarge ? "h-16 pl-12 pr-4 text-lg" : "h-12 pl-11 pr-4"} rounded-2xl glass-card border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all`}
            />
          </div>
        </div>
        <Button 
          type="submit" 
          size={isLarge ? "lg" : "default"}
          disabled={isLoading || !query.trim()}
          className={`shrink-0 gradient-hero text-primary-foreground shadow-glow hover:shadow-lg transition-all duration-300 metallic-shine ${isLarge ? "h-16 px-8 rounded-2xl" : "h-12 px-6 rounded-xl"}`}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 font-semibold">Search</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
