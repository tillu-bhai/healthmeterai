import { SearchBar } from "./SearchBar";
import { Sparkles, Shield, BookOpen, Database } from "lucide-react";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const features = [
  { icon: Database, label: "300+ Sources" },
  { icon: Shield, label: "Verified Data" },
  { icon: BookOpen, label: "Evidence-Based" },
  { icon: Sparkles, label: "AI-Powered" },
];

const popularSearches = [
  "Diabetes Type 2",
  "Metformin",
  "Hypertension",
  "COVID-19 Vaccine",
  "Migraine Symptoms",
];

export const HeroSection = ({ onSearch, isLoading }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
      
      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-slide-up">
            <Sparkles className="h-4 w-4" />
            <span>Trusted Health Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-up stagger-1">
            Your Gateway to{" "}
            <span className="text-gradient">Medical Knowledge</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up stagger-2">
            Search diseases, drugs, symptoms, and procedures. Get AI-powered summaries 
            backed by verified sources from WHO, NIH, PubMed, and more.
          </p>

          {/* Search Bar */}
          <div className="mb-8 animate-slide-up stagger-3">
            <SearchBar onSearch={onSearch} isLoading={isLoading} size="large" />
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-slide-up stagger-4">
            <span className="text-sm text-muted-foreground mr-2">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => onSearch(term)}
                className="px-3 py-1.5 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 animate-slide-up stagger-5">
            {features.map((feature) => (
              <div 
                key={feature.label}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
