import { SearchBar } from "./SearchBar";
import { PopularSearchCarousel } from "./PopularSearchCarousel";
import { Sparkles, Shield, BookOpen, Database, Zap } from "lucide-react";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const features = [
  { icon: Database, label: "300+ Sources" },
  { icon: Shield, label: "Verified Data" },
  { icon: BookOpen, label: "Evidence-Based" },
  { icon: Zap, label: "AI-Powered" },
];

export const HeroSection = ({ onSearch, isLoading }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden noise-overlay">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-20 w-2 h-2 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute top-48 right-32 w-3 h-3 bg-primary/60 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-primary/80 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
      
      <div className="container relative py-20 md:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-button text-sm font-medium mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-foreground">Trusted Health Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] animate-slide-up stagger-1 tracking-tight">
            Your Gateway to{" "}
            <span className="text-primary">Medical Knowledge</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up stagger-2 leading-relaxed">
            Search diseases, drugs, symptoms, and procedures. Get AI-powered summaries 
            backed by verified sources from WHO, NIH, PubMed, and more.
          </p>

          {/* Search Bar */}
          <div className="mb-12 animate-slide-up stagger-3">
            <SearchBar onSearch={onSearch} isLoading={isLoading} size="large" />
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 animate-slide-up stagger-4">
            {features.map((feature) => (
              <div 
                key={feature.label}
                className="flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg glass-button group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-width Carousel Section */}
      <div className="relative animate-slide-up stagger-5 pb-16">
        <PopularSearchCarousel onSearch={onSearch} />
      </div>
    </section>
  );
};
