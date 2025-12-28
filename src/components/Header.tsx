import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">
            Medi<span className="text-primary">Scope</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Diseases
          </a>
          <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Drugs
          </a>
          <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Symptoms
          </a>
          <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Research
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Sign In
          </Button>
          <Button variant="default" size="sm" className="hidden md:inline-flex">
            Get Started
          </Button>
          
          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-slide-up">
          <nav className="container py-4 flex flex-col gap-1">
            <a href="#" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              Diseases
            </a>
            <a href="#" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              Drugs
            </a>
            <a href="#" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              Symptoms
            </a>
            <a href="#" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              Research
            </a>
            <div className="flex gap-2 mt-2 px-4">
              <Button variant="ghost" size="sm" className="flex-1">
                Sign In
              </Button>
              <Button variant="default" size="sm" className="flex-1">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
