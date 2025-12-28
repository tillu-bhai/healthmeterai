import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PopularSearchCarouselProps {
  onSearch: (query: string) => void;
}

// 100+ trending 2025 health topics organized by category
const healthTopics2025 = [
  // Chronic Conditions
  "Type 2 Diabetes", "Hypertension", "Obesity", "Heart Disease", "COPD", "Asthma", "Arthritis", "Chronic Kidney Disease",
  "Fatty Liver Disease", "Metabolic Syndrome", "Insulin Resistance", "Prediabetes", "Atherosclerosis", "Peripheral Neuropathy",
  
  // Mental Health 2025
  "Anxiety Disorder", "Depression Treatment", "PTSD Therapy", "ADHD in Adults", "Burnout Syndrome", "Sleep Disorders",
  "Bipolar Disorder", "OCD Treatment", "Social Anxiety", "Panic Attacks", "Seasonal Affective Disorder", "Digital Detox",
  
  // Infectious Diseases 2025
  "COVID-19 Variants 2025", "RSV Vaccine", "Influenza A H5N1", "Mpox Prevention", "Lyme Disease", "Long COVID Syndrome",
  "Dengue Fever", "Measles Outbreak 2025", "Tuberculosis", "Hepatitis C Treatment", "HIV PrEP", "Norovirus",
  
  // Medications & Treatments
  "Ozempic", "Wegovy", "Mounjaro", "Metformin", "Jardiance", "Xanax Alternatives", "Zepbound", "Tirzepatide",
  "Keytruda", "Dupixent", "Humira Biosimilars", "Lecanemab", "Donanemab", "Paxlovid",
  
  // Women's Health
  "Menopause Symptoms", "PCOS Treatment", "Endometriosis", "Breast Cancer Screening", "HPV Vaccine", "Ovarian Cysts",
  "Fibroids Treatment", "Fertility Preservation", "Postpartum Depression", "Prenatal Vitamins", "Gestational Diabetes",
  
  // Men's Health
  "Prostate Cancer", "Erectile Dysfunction", "Low Testosterone", "BPH Treatment", "Testicular Cancer Screening",
  "Male Pattern Baldness", "Vasectomy", "Andropause", "PSA Test",
  
  // Cancer & Oncology
  "Immunotherapy 2025", "CAR-T Cell Therapy", "Lung Cancer Screening", "Colorectal Cancer", "Melanoma Treatment",
  "Pancreatic Cancer", "Leukemia Treatment", "Lymphoma", "Liver Cancer", "Brain Tumor Symptoms",
  
  // Nutrition & Lifestyle
  "Intermittent Fasting", "Mediterranean Diet", "Gut Microbiome", "Probiotics Benefits", "Vitamin D Deficiency",
  "Omega-3 Supplements", "Plant-Based Diet", "Anti-Inflammatory Foods", "Collagen Supplements", "Magnesium Benefits",
  
  // Neurology & Brain Health
  "Alzheimer's Prevention", "Parkinson's Disease", "Multiple Sclerosis", "Migraine Treatment", "Epilepsy Management",
  "Concussion Recovery", "Neuropathy Treatment", "Brain Fog Causes", "Dementia Early Signs", "Stroke Prevention",
  
  // Pediatric Health
  "Childhood Vaccines 2025", "Autism Spectrum", "Pediatric RSV", "Childhood Obesity", "ADHD in Children",
  "Childhood Allergies", "Growth Disorders", "Pediatric Asthma", "Developmental Delays",
  
  // Diagnostic Tests
  "Blood Glucose Test", "Lipid Panel", "A1C Test", "Thyroid Function", "Colonoscopy Prep", "Mammogram Guidelines",
  "MRI vs CT Scan", "Genetic Testing", "Allergy Testing", "Kidney Function Test",
  
  // Emerging Health Topics 2025
  "AI in Healthcare", "Telehealth Services", "Wearable Health Tech", "Personalized Medicine", "Gene Therapy",
  "CRISPR Treatment", "Digital Therapeutics", "Mental Health Apps", "Remote Patient Monitoring", "Health Data Privacy",
  
  // Orthopedic & Musculoskeletal
  "Back Pain Relief", "Knee Replacement", "Osteoporosis Prevention", "Rotator Cuff Injury", "Carpal Tunnel",
  "Sciatica Treatment", "Hip Replacement", "Spinal Stenosis", "Plantar Fasciitis", "Tendinitis",
  
  // Autoimmune Conditions
  "Lupus Symptoms", "Rheumatoid Arthritis", "Hashimoto's Disease", "Celiac Disease", "Crohn's Disease",
  "Ulcerative Colitis", "Psoriasis Treatment", "Sjögren's Syndrome", "Ankylosing Spondylitis",
  
  // Eye & Vision
  "Macular Degeneration", "Glaucoma Treatment", "Cataracts Surgery", "Dry Eye Syndrome", "Diabetic Retinopathy",
  
  // Skin & Dermatology
  "Eczema Treatment", "Acne Solutions", "Rosacea", "Skin Cancer Signs", "Psoriasis Biologics", "Vitiligo",
  
  // Cardiovascular 2025
  "Heart Failure Treatment", "Atrial Fibrillation", "Statin Therapy", "Blood Pressure Medication", "Cholesterol Management",
  "Pacemaker Technology", "Heart Valve Disease", "Cardiac Rehabilitation"
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
        
        // Reset when we've scrolled half (since content is duplicated)
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

  // Duplicate items for seamless loop
  const duplicatedTopics = [...healthTopics2025, ...healthTopics2025];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex items-center gap-2 mb-4 px-4">
        <span className="text-sm font-medium text-muted-foreground">🔥 Trending Health Topics 2025</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTopics.map((topic, index) => (
          <button
            key={`${topic}-${index}`}
            onClick={() => onSearch(topic)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium",
              "bg-secondary/80 text-secondary-foreground",
              "hover:bg-primary hover:text-primary-foreground",
              "border border-border/50 hover:border-primary",
              "transition-all duration-300 hover:scale-105 hover:shadow-glow",
              "whitespace-nowrap"
            )}
          >
            {topic}
          </button>
        ))}
      </div>
      
      {/* Second row - opposite direction */}
      <div className="mt-3">
        <SecondaryCarousel topics={healthTopics2025} onSearch={onSearch} />
      </div>
    </div>
  );
};

// Secondary carousel moving in opposite direction
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

    // Start from middle
    scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
    let scrollPosition = scrollContainer.scrollWidth / 2;
    let animationId: number;
    const scrollSpeed = 0.4;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition -= scrollSpeed; // Opposite direction
        
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

  // Shuffle topics for variety and duplicate
  const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);
  const duplicatedTopics = [...shuffledTopics, ...shuffledTopics];

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {duplicatedTopics.map((topic, index) => (
        <button
          key={`secondary-${topic}-${index}`}
          onClick={() => onSearch(topic)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium",
            "bg-muted/60 text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground",
            "border border-transparent hover:border-accent",
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
