import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Brain, Bone, Eye, Stethoscope, Baby, Users, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const diseaseCategories = [
  { 
    icon: Heart, 
    name: "Cardiovascular", 
    description: "Heart disease, hypertension, stroke, arrhythmias",
    examples: ["Heart Disease", "Hypertension", "Atrial Fibrillation", "Heart Failure"],
    color: "text-red-500"
  },
  { 
    icon: Brain, 
    name: "Neurological", 
    description: "Brain and nervous system disorders",
    examples: ["Alzheimer's", "Parkinson's", "Multiple Sclerosis", "Epilepsy"],
    color: "text-purple-500"
  },
  { 
    icon: Activity, 
    name: "Metabolic", 
    description: "Diabetes, thyroid disorders, metabolic syndrome",
    examples: ["Type 2 Diabetes", "Hypothyroidism", "Obesity", "Metabolic Syndrome"],
    color: "text-primary"
  },
  { 
    icon: Bone, 
    name: "Musculoskeletal", 
    description: "Bones, joints, and connective tissue",
    examples: ["Osteoarthritis", "Rheumatoid Arthritis", "Osteoporosis", "Fibromyalgia"],
    color: "text-orange-500"
  },
  { 
    icon: Stethoscope, 
    name: "Respiratory", 
    description: "Lungs and breathing disorders",
    examples: ["Asthma", "COPD", "Pneumonia", "Pulmonary Fibrosis"],
    color: "text-blue-500"
  },
  { 
    icon: Eye, 
    name: "Autoimmune", 
    description: "Immune system attacking the body",
    examples: ["Lupus", "Crohn's Disease", "Psoriasis", "Celiac Disease"],
    color: "text-pink-500"
  },
  { 
    icon: Baby, 
    name: "Infectious", 
    description: "Viral, bacterial, and parasitic diseases",
    examples: ["COVID-19", "Influenza", "Tuberculosis", "HIV/AIDS"],
    color: "text-green-500"
  },
  { 
    icon: Users, 
    name: "Mental Health", 
    description: "Psychiatric and psychological conditions",
    examples: ["Depression", "Anxiety", "Bipolar Disorder", "PTSD"],
    color: "text-indigo-500"
  },
];

const Diseases = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setAiResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('health-search', {
        body: { query: `disease information: ${query}` }
      });

      if (error) throw error;
      setAiResult(data);
    } catch (error: any) {
      console.error("Search error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        toast.error("Search failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiseaseClick = (disease: string) => {
    handleSearch(disease);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 glass-button border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Disease Library
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Comprehensive <span className="text-primary">Disease Database</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore evidence-based information on thousands of medical conditions, 
                sourced from WHO, NIH, CDC, and peer-reviewed research.
              </p>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* AI Results */}
        {(isLoading || aiResult) && (
          <section className="container pb-12">
            <Card className="glass-card p-6 md:p-8 max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Searching medical databases...</span>
                </div>
              ) : aiResult && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">
                      AI Summary: {searchQuery}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {aiResult.summary}
                  </p>
                  
                  {aiResult.results && aiResult.results.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground text-sm">Top Sources:</h4>
                      {aiResult.results.slice(0, 5).map((result: any, index: number) => (
                        <a
                          key={index}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground text-sm">{result.title}</span>
                            <Badge variant="outline" className="text-xs">{result.source}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Categories Grid */}
        <section className="container pb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diseaseCategories.map((category) => (
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
                      onClick={() => handleDiseaseClick(example)}
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

        {/* Trusted Sources */}
        <section className="container pb-20">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Information Sourced From
            </h3>
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
              {["World Health Organization", "National Institutes of Health", "Centers for Disease Control", "PubMed", "Mayo Clinic"].map((source) => (
                <span key={source} className="text-sm">{source}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Diseases;
