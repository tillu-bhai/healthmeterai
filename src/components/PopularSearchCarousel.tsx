import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface PopularSearchCarouselProps {
  onSearch: (query: string) => void;
}

// Trending 2025 health topics
const healthTopics2025 = [
  "Type 2 Diabetes", "Hypertension", "Obesity", "Heart Disease", "COPD", "Asthma", "Arthritis",
  "Anxiety Disorder", "Depression Treatment", "PTSD Therapy", "ADHD in Adults", "Burnout Syndrome",
  "COVID-19 Variants 2025", "RSV Vaccine", "Influenza A H5N1", "Long COVID Syndrome",
  "Ozempic", "Wegovy", "Mounjaro", "Metformin", "Jardiance", "Tirzepatide", "Keytruda",
  "Menopause Symptoms", "PCOS Treatment", "Endometriosis", "Breast Cancer Screening",
  "Prostate Cancer", "Erectile Dysfunction", "Low Testosterone", "BPH Treatment",
  "Immunotherapy 2025", "CAR-T Cell Therapy", "Lung Cancer Screening", "Melanoma Treatment",
  "Intermittent Fasting", "Mediterranean Diet", "Gut Microbiome", "Vitamin D Deficiency",
  "Alzheimer's Prevention", "Parkinson's Disease", "Multiple Sclerosis", "Migraine Treatment",
  "AI in Healthcare", "Telehealth Services", "Wearable Health Tech", "Personalized Medicine",
  "Back Pain Relief", "Knee Replacement", "Osteoporosis Prevention", "Sciatica Treatment",
  "Lupus Symptoms", "Rheumatoid Arthritis", "Crohn's Disease", "Psoriasis Treatment",
];

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

  const duplicatedTopics = [...healthTopics2025, ...healthTopics2025];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex items-center gap-3 mb-6 px-6">
        <div className="p-2 rounded-lg glass-button">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Trending Health Topics 2025</span>
        <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
      </div>
      
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
      
      {/* Second row - opposite direction */}
      <div className="mt-4">
        <SecondaryCarousel topics={healthTopics2025} onSearch={onSearch} />
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

  const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);
  const duplicatedTopics = [...shuffledTopics, ...shuffledTopics];

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
            "hover:bg-secondary hover:border-accent/30",
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
