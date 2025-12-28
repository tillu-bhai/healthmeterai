import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === "email") fieldErrors.email = error.message;
          if (error.path[0] === "password") fieldErrors.password = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            throw error;
          }
          return;
        }

        toast({
          title: "Account Created!",
          description: "Welcome to MediScope. You're now signed in.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to access your health dashboard" 
                : "Join MediScope for personalized health insights"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 glass-button border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 glass-button border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 gradient-hero text-primary-foreground font-semibold rounded-xl shadow-glow hover:shadow-lg transition-all duration-300 metallic-shine"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
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
