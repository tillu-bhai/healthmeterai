import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, HeartPulse, Brain, Bone, Eye, Ear, Stethoscope, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const symptomCategories = [
  { 
    icon: HeartPulse, 
    name: "Cardiovascular", 
    description: "Heart and circulation symptoms",
    examples: ["Chest Pain", "Palpitations", "Shortness of Breath", "Swelling"],
    color: "text-red-400"
  },
  { 
    icon: Brain, 
    name: "Neurological", 
    description: "Brain and nervous system symptoms",
    examples: ["Headache", "Dizziness", "Numbness", "Memory Loss"],
    color: "text-purple-400"
  },
  { 
    icon: Stethoscope, 
    name: "Respiratory", 
    description: "Breathing and lung symptoms",
    examples: ["Cough", "Wheezing", "Difficulty Breathing", "Congestion"],
    color: "text-blue-400"
  },
  { 
    icon: Thermometer, 
    name: "General", 
    description: "Common body-wide symptoms",
    examples: ["Fever", "Fatigue", "Weight Loss", "Night Sweats"],
    color: "text-orange-400"
  },
  { 
    icon: Bone, 
    name: "Musculoskeletal", 
    description: "Bone, joint, and muscle symptoms",
    examples: ["Back Pain", "Joint Pain", "Muscle Weakness", "Stiffness"],
    color: "text-cyan-400"
  },
  { 
    icon: Eye, 
    name: "Skin & Eyes", 
    description: "Skin and vision symptoms",
    examples: ["Rash", "Itching", "Vision Changes", "Eye Pain"],
    color: "text-pink-400"
  },
  { 
    icon: Ear, 
    name: "ENT", 
    description: "Ear, nose, and throat symptoms",
    examples: ["Sore Throat", "Ear Pain", "Hearing Loss", "Nosebleed"],
    color: "text-green-400"
  },
  { 
    icon: AlertTriangle, 
    name: "Digestive", 
    description: "Stomach and intestinal symptoms",
    examples: ["Nausea", "Abdominal Pain", "Diarrhea", "Bloating"],
    color: "text-yellow-400"
  },
];

const emergencySymptoms = [
  "Sudden severe headache",
  "Chest pain or pressure",
  "Difficulty breathing",
  "Sudden confusion or difficulty speaking",
  "Sudden numbness or weakness on one side",
  "Severe abdominal pain",
  "Uncontrolled bleeding",
  "Signs of stroke (FAST: Face, Arms, Speech, Time)",
];

const Symptoms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleSymptomClick = (symptom: string) => {
    navigate(`/?search=${encodeURIComponent(symptom)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 glass-button border-0">Symptom Checker</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Understand Your <span className="text-gradient">Symptoms</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Search for symptoms to learn about possible causes, when to seek care, 
                and what questions to ask your doctor.
              </p>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Emergency Warning */}
        <section className="container pb-8">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-destructive">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Seek Emergency Care Immediately For:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {emergencySymptoms.map((symptom) => (
                    <span key={symptom} className="text-sm text-muted-foreground">
                      • {symptom}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-destructive mt-3 font-medium">
                  Call 911 or your local emergency number if you experience any of these symptoms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container pb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Browse Symptoms by Body System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {symptomCategories.map((category) => (
              <Card 
                key={category.name}
                className="glass-card p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl glass-button">
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example) => (
                    <button
                      key={example}
                      onClick={() => handleSymptomClick(example)}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="container pb-20">
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              This symptom information is for educational purposes only and is not a substitute for 
              professional medical diagnosis or treatment. Always consult a healthcare provider for 
              medical advice.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Symptoms;
