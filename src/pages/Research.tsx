import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Microscope, TrendingUp, Users, Beaker, Globe, Award } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const researchAreas = [
  { 
    icon: Microscope, 
    name: "Clinical Trials", 
    description: "Ongoing and completed clinical research studies",
    examples: ["Cancer Immunotherapy", "Alzheimer's Treatment", "Gene Therapy", "Vaccine Development"],
    color: "text-cyan-400"
  },
  { 
    icon: Beaker, 
    name: "Drug Development", 
    description: "New medications in development pipeline",
    examples: ["GLP-1 Agonists", "CRISPR Therapies", "CAR-T Cell Therapy", "mRNA Vaccines"],
    color: "text-purple-400"
  },
  { 
    icon: TrendingUp, 
    name: "Epidemiology", 
    description: "Disease patterns and public health research",
    examples: ["COVID-19 Variants", "Antimicrobial Resistance", "Obesity Trends", "Mental Health Crisis"],
    color: "text-orange-400"
  },
  { 
    icon: FileText, 
    name: "Systematic Reviews", 
    description: "Evidence synthesis and meta-analyses",
    examples: ["Cochrane Reviews", "NICE Guidelines", "Treatment Efficacy", "Prevention Strategies"],
    color: "text-green-400"
  },
  { 
    icon: Users, 
    name: "Population Health", 
    description: "Community and demographic health studies",
    examples: ["Health Disparities", "Aging Research", "Pediatric Studies", "Global Health"],
    color: "text-pink-400"
  },
  { 
    icon: Globe, 
    name: "Digital Health", 
    description: "Technology and AI in healthcare",
    examples: ["AI Diagnostics", "Telemedicine", "Wearable Devices", "Health Apps"],
    color: "text-blue-400"
  },
];

const trustedSources = [
  { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", description: "30M+ biomedical articles" },
  { name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/", description: "400K+ clinical studies" },
  { name: "Cochrane Library", url: "https://www.cochranelibrary.com/", description: "Systematic reviews" },
  { name: "WHO Publications", url: "https://www.who.int/publications", description: "Global health guidelines" },
];

const Research = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleTopicClick = (topic: string) => {
    navigate(`/?search=${encodeURIComponent(topic + " research")}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 glass-button border-0">Research Portal</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Medical <span className="text-gradient">Research Hub</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore the latest peer-reviewed research, clinical trials, and evidence-based 
                medical literature from the world's leading institutions.
              </p>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Trusted Sources */}
        <section className="container pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trustedSources.map((source) => (
              <Link
                key={source.name}
                to={`/source/${source.name.toLowerCase().replace(/\s+/g, '-').replace('.gov', '').replace('.', '')}`}
                className="glass-card p-4 rounded-xl hover:shadow-glow transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {source.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{source.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Research Areas */}
        <section className="container pb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Explore Research Areas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchAreas.map((area) => (
              <Card 
                key={area.name}
                className="glass-card p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl glass-button">
                    <area.icon className={`h-6 w-6 ${area.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {area.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {area.examples.map((example) => (
                    <button
                      key={example}
                      onClick={() => handleTopicClick(example)}
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

        {/* Research Note */}
        <section className="container pb-20">
          <div className="glass-card rounded-2xl p-8 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Evidence-Based Information
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All research summaries are generated from peer-reviewed sources and verified databases. 
              We prioritize accuracy and cite original sources so you can verify the information.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Research;
