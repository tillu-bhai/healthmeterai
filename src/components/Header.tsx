import { Activity, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/30">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform animate-glow-pulse">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Medi<span className="text-gradient">Scope</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {["Diseases", "Drugs", "Symptoms", "Research"].map((item) => (
            <a 
              key={item}
              href="#" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {item}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-1/2 transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-button rounded-full">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground truncate max-w-32">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="hidden md:inline-flex gradient-hero text-primary-foreground shadow-glow hover:shadow-lg transition-all metallic-shine"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
          
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
        <div className="md:hidden glass border-t border-border/30 animate-slide-up">
          <nav className="container py-4 flex flex-col gap-1">
            {["Diseases", "Drugs", "Symptoms", "Research"].map((item) => (
              <a 
                key={item}
                href="#" 
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="flex gap-2 mt-4 px-4">
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 glass-button border-0"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 glass-button border-0"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 gradient-hero text-primary-foreground"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
