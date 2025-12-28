import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Syringe, Droplet, Tablets, Heart, Brain, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const drugCategories = [
  { 
    icon: Heart, 
    name: "Cardiovascular", 
    description: "Blood pressure, cholesterol, heart medications",
    examples: ["Lisinopril", "Atorvastatin", "Metoprolol", "Amlodipine"],
    color: "text-red-400"
  },
  { 
    icon: Pill, 
    name: "Diabetes", 
    description: "Glucose control and insulin medications",
    examples: ["Metformin", "Ozempic", "Jardiance", "Insulin Glargine"],
    color: "text-cyan-400"
  },
  { 
    icon: Brain, 
    name: "Neurological", 
    description: "Antidepressants, anxiolytics, antipsychotics",
    examples: ["Sertraline", "Escitalopram", "Gabapentin", "Duloxetine"],
    color: "text-purple-400"
  },
  { 
    icon: Shield, 
    name: "Antibiotics", 
    description: "Bacterial infection treatments",
    examples: ["Amoxicillin", "Azithromycin", "Ciprofloxacin", "Doxycycline"],
    color: "text-green-400"
  },
  { 
    icon: Droplet, 
    name: "Pain & Inflammation", 
    description: "NSAIDs, analgesics, and anti-inflammatory",
    examples: ["Ibuprofen", "Acetaminophen", "Naproxen", "Prednisone"],
    color: "text-orange-400"
  },
  { 
    icon: Syringe, 
    name: "Biologics", 
    description: "Immunotherapy and targeted treatments",
    examples: ["Humira", "Keytruda", "Dupixent", "Enbrel"],
    color: "text-pink-400"
  },
  { 
    icon: Tablets, 
    name: "Respiratory", 
    description: "Asthma, COPD, and allergy medications",
    examples: ["Albuterol", "Montelukast", "Fluticasone", "Symbicort"],
    color: "text-blue-400"
  },
  { 
    icon: Zap, 
    name: "Weight Management", 
    description: "FDA-approved weight loss medications",
    examples: ["Wegovy", "Mounjaro", "Zepbound", "Contrave"],
    color: "text-yellow-400"
  },
];

const Drugs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleDrugClick = (drug: string) => {
    navigate(`/?search=${encodeURIComponent(drug)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 glass-button border-0">Drug Database</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Comprehensive <span className="text-gradient">Drug Information</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Access FDA-approved medication data including dosages, interactions, 
                side effects, and clinical guidelines from trusted sources.
              </p>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container pb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Drug Class
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {drugCategories.map((category) => (
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
                      onClick={() => handleDrugClick(example)}
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

        {/* Safety Notice */}
        <section className="container pb-20">
          <div className="glass-card rounded-2xl p-8 border-l-4 border-accent">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              ⚠️ Important Safety Information
            </h3>
            <p className="text-muted-foreground">
              Drug information provided is for educational purposes only. Always consult your healthcare 
              provider or pharmacist before starting, stopping, or changing any medication. Never disregard 
              professional medical advice based on information found here.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Drugs;
