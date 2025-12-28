import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Flame, Sparkles, Activity } from "lucide-react";

interface PopularSearchCarouselProps {
  onSearch: (query: string) => void;
}

// Comprehensive 2025 health topics organized by category
const trendingTopics2025 = {
  breakthrough: [
    "GLP-1 Agonists Revolution",
    "Ozempic Weight Loss",
    "Wegovy vs Mounjaro",
    "Tirzepatide Benefits",
    "CRISPR Gene Therapy 2025",
    "CAR-T Cell Therapy Cancer",
    "mRNA Vaccine Technology",
    "AI Diagnosis Tools",
  ],
  chronic: [
    "Type 2 Diabetes Management",
    "Hypertension Guidelines 2025",
    "Heart Failure Treatment",
    "COPD New Therapies",
    "Rheumatoid Arthritis Biologics",
    "Psoriasis Breakthrough",
    "Crohn's Disease Treatment",
    "Lupus Management 2025",
  ],
  mentalHealth: [
    "Anxiety Treatment Options",
    "Depression New Medications",
    "PTSD Therapy Advances",
    "ADHD in Adults",
    "Burnout Recovery",
    "Ketamine Therapy Depression",
    "Psychedelic Therapy Research",
    "Digital Mental Health Tools",
  ],
  prevention: [
    "Alzheimer's Prevention",
    "Cancer Screening Guidelines",
    "Heart Disease Prevention",
    "Diabetes Prevention",
    "Stroke Risk Factors",
    "Osteoporosis Prevention",
    "Immunization Schedule 2025",
    "Gut Microbiome Health",
  ],
  womensHealth: [
    "Menopause Hormone Therapy",
    "PCOS Latest Research",
    "Endometriosis Treatment",
    "Breast Cancer Screening",
    "Fertility Treatments 2025",
    "Postpartum Depression",
    "Ovarian Cancer Markers",
    "Prenatal Care Updates",
  ],
  mensHealth: [
    "Prostate Cancer Screening",
    "Erectile Dysfunction Solutions",
    "Low Testosterone Treatment",
    "BPH Management",
    "Male Fertility Issues",
    "Heart Health Men",
    "Testicular Cancer Awareness",
    "Hair Loss Treatments",
  ],
  infectious: [
    "COVID-19 Variants 2025",
    "RSV Vaccine Updates",
    "Influenza H5N1 Bird Flu",
    "Long COVID Treatment",
    "Antibiotic Resistance",
    "Mpox Prevention",
    "Tuberculosis Treatment",
    "Lyme Disease Updates",
  ],
  nutrition: [
    "Intermittent Fasting Science",
    "Mediterranean Diet Benefits",
    "Keto Diet Research",
    "Plant-Based Nutrition",
    "Vitamin D Optimization",
    "Omega-3 Supplements",
    "Probiotics Benefits",
    "Anti-Inflammatory Foods",
  ],
};

const allTopics = Object.values(trendingTopics2025).flat();

export const PopularSearchCarousel = ({ onSearch }: PopularSearchCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const duplicatedTopics = [...allTopics, ...allTopics];

  return (
    <div className="w-full overflow-hidden py-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 px-6">
        <div className="p-2.5 rounded-xl bg-primary/10 shadow-glow">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            Trending Health Topics 2025
            <Flame className="h-4 w-4 text-orange-500" />
          </span>
          <p className="text-xs text-muted-foreground">What people are searching for</p>
        </div>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      
      {/* Category Badges */}
      <div className="flex flex-wrap gap-2 px-6 mb-4">
        {[
          { label: "Breakthrough", icon: Sparkles, color: "text-yellow-500" },
          { label: "Mental Health", icon: Activity, color: "text-purple-500" },
          { label: "Prevention", icon: TrendingUp, color: "text-green-500" },
        ].map((cat) => (
          <span 
            key={cat.label}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-secondary/50 text-muted-foreground"
          >
            <cat.icon className={`h-3 w-3 ${cat.color}`} />
            {cat.label}
          </span>
        ))}
      </div>

      {/* Main Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-hidden cursor-pointer px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTopics.map((topic, index) => (
          <button
            key={`${topic}-${index}`}
            onClick={() => onSearch(topic)}
            className={cn(
              "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium",
              "glass-button",
              "text-muted-foreground hover:text-foreground",
              "hover:shadow-glow hover:border-primary/50",
              "transition-all duration-300 hover:scale-105",
              "whitespace-nowrap metallic-shine"
            )}
          >
            {topic}
          </button>
        ))}
      </div>
      
      {/* Second Row - Reverse Direction */}
      <div className="mt-4">
        <SecondaryCarousel topics={trendingTopics2025.breakthrough.concat(trendingTopics2025.mentalHealth)} onSearch={onSearch} />
      </div>

      {/* Third Row - Mixed Topics */}
      <div className="mt-4">
        <TertiaryCarousel topics={trendingTopics2025.prevention.concat(trendingTopics2025.nutrition)} onSearch={onSearch} />
      </div>
    </div>
  );
};

const SecondaryCarousel = ({ 
  topics, 
  onSearch 
}: { 
  topics: string[]; 
  onSearch: (query: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
    let scrollPosition = scrollContainer.scrollWidth / 2;
    let animationId: number;
    const scrollSpeed = 0.4;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition -= scrollSpeed;
        
        if (scrollPosition <= 0) {
          scrollPosition = scrollContainer.scrollWidth / 2;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const duplicatedTopics = [...topics, ...topics];

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-hidden cursor-pointer px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {duplicatedTopics.map((topic, index) => (
        <button
          key={`secondary-${topic}-${index}`}
          onClick={() => onSearch(topic)}
          className={cn(
            "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium",
            "bg-secondary/50 border border-border/30",
            "text-muted-foreground/80 hover:text-foreground",
            "hover:bg-secondary hover:border-primary/30",
            "transition-all duration-300 hover:scale-105",
            "whitespace-nowrap"
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

const TertiaryCarousel = ({ 
  topics, 
  onSearch 
}: { 
  topics: string[]; 
  onSearch: (query: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.35;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const duplicatedTopics = [...topics, ...topics];

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-hidden cursor-pointer px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {duplicatedTopics.map((topic, index) => (
        <button
          key={`tertiary-${topic}-${index}`}
          onClick={() => onSearch(topic)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium",
            "bg-primary/5 border border-primary/20",
            "text-primary/80 hover:text-primary",
            "hover:bg-primary/10 hover:border-primary/40",
            "transition-all duration-300 hover:scale-105",
            "whitespace-nowrap"
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};
