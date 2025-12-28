import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, ArrowLeft, Shield, Globe, BookOpen, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const sources: Record<string, {
  name: string;
  fullName: string;
  url: string;
  description: string;
  established: string;
  type: string;
  coverage: string[];
  icon: typeof Globe;
  color: string;
}> = {
  who: {
    name: "WHO",
    fullName: "World Health Organization",
    url: "https://www.who.int",
    description: "The World Health Organization is a specialized agency of the United Nations responsible for international public health. WHO works worldwide to promote health, keep the world safe, and serve the vulnerable.",
    established: "1948",
    type: "International Organization",
    coverage: ["Global Health Guidelines", "Disease Outbreak Information", "Health Statistics", "Research Publications"],
    icon: Globe,
    color: "text-blue-400",
  },
  nih: {
    name: "NIH",
    fullName: "National Institutes of Health",
    url: "https://www.nih.gov",
    description: "The National Institutes of Health is the primary agency of the United States government responsible for biomedical and public health research. NIH is the largest biomedical research agency in the world.",
    established: "1887",
    type: "U.S. Government Agency",
    coverage: ["Biomedical Research", "Clinical Trials", "Health Information", "Research Funding"],
    icon: FileText,
    color: "text-purple-400",
  },
  pubmed: {
    name: "PubMed",
    fullName: "PubMed / MEDLINE",
    url: "https://pubmed.ncbi.nlm.nih.gov",
    description: "PubMed is a free search engine accessing primarily the MEDLINE database of references and abstracts on life sciences and biomedical topics. It contains over 35 million citations for biomedical literature.",
    established: "1996",
    type: "Biomedical Database",
    coverage: ["Peer-Reviewed Articles", "Clinical Studies", "Meta-Analyses", "Systematic Reviews"],
    icon: BookOpen,
    color: "text-cyan-400",
  },
  cdc: {
    name: "CDC",
    fullName: "Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov",
    description: "The CDC is the national public health agency of the United States. It conducts and supports health promotion, prevention, and preparedness activities with the goal of improving overall public health.",
    established: "1946",
    type: "U.S. Federal Agency",
    coverage: ["Disease Prevention", "Health Statistics", "Vaccination Guidelines", "Emergency Preparedness"],
    icon: Shield,
    color: "text-green-400",
  },
  clinicaltrials: {
    name: "ClinicalTrials.gov",
    fullName: "ClinicalTrials.gov",
    url: "https://clinicaltrials.gov",
    description: "ClinicalTrials.gov is a database of privately and publicly funded clinical studies conducted around the world. It provides patients, families, and healthcare professionals access to information on clinical studies.",
    established: "2000",
    type: "Clinical Trials Registry",
    coverage: ["Ongoing Clinical Trials", "Completed Studies", "Study Results", "Participant Information"],
    icon: FileText,
    color: "text-orange-400",
  },
  cochrane: {
    name: "Cochrane Library",
    fullName: "Cochrane Library",
    url: "https://www.cochranelibrary.com",
    description: "The Cochrane Library is a collection of databases containing high-quality, independent evidence to inform healthcare decision-making. Cochrane Reviews represent the highest level of evidence.",
    established: "1993",
    type: "Evidence Database",
    coverage: ["Systematic Reviews", "Clinical Trials", "Methods Studies", "Health Technology Assessments"],
    icon: BookOpen,
    color: "text-pink-400",
  },
};

const SourceRedirect = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const [countdown, setCountdown] = useState(10);
  const source = sourceId ? sources[sourceId] : null;

  useEffect(() => {
    if (!source) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.open(source.url, '_blank', 'noopener,noreferrer');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [source]);

  if (!source) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Source Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested source could not be found.</p>
          <Link to="/">
            <Button variant="default">Return Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = source.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background noise-overlay">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          
          <div className="container relative max-w-4xl">
            <Link to="/research" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Research
            </Link>

            <Card className="glass-card p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl glass-button">
                  <IconComponent className={`h-10 w-10 ${source.color}`} />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {source.fullName}
                  </h1>
                  <p className="text-muted-foreground">
                    {source.type} · Est. {source.established}
                  </p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {source.description}
              </p>

              <div className="mb-8">
                <h3 className="font-display font-semibold text-foreground mb-4">Coverage Areas:</h3>
                <div className="flex flex-wrap gap-2">
                  {source.coverage.map((item) => (
                    <span 
                      key={item}
                      className="px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-foreground font-medium">
                    Redirecting to {source.name} in {countdown} seconds...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {source.url}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCountdown(0)}
                    className="glass-button border-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                    className="gradient-hero text-primary-foreground"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Now
                  </Button>
                </div>
              </div>
            </Card>

            {/* Trust Indicator */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-muted-foreground">
                  Verified trusted medical source used by MediScope AI
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SourceRedirect;
