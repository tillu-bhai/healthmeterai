import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Sparkles, Lock } from "lucide-react";
import { useGoogleAuth, GoogleSignInButton } from "@/contexts/GoogleAuthContext";

const Auth = () => {
  const { user, isLoading } = useGoogleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden noise-overlay">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <a href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform animate-glow-pulse">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-3xl text-foreground">
              Medi<span className="text-gradient">Scope</span>
            </span>
          </a>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 animate-slide-up stagger-1">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Welcome to MediScope
            </h1>
            <p className="text-muted-foreground">
              Sign in to access personalized health insights and community features
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex flex-col items-center gap-4">
            <GoogleSignInButton className="w-full flex justify-center" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-slide-up stagger-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
