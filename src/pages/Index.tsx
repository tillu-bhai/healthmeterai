import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SearchResults } from "@/components/SearchResults";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HealthResult } from "@/components/HealthResultCard";
import type { RelatedTopic } from "@/components/RelatedTopics";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<HealthResult[]>([]);
  const [summary, setSummary] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('health-search', {
        body: { query }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform results to match our types
      const transformedResults: HealthResult[] = (data.results || []).map((result: any, index: number) => ({
        id: result.id || `result-${index}`,
        title: result.title,
        source: result.source,
        sourceUrl: result.url || `https://www.${result.source?.toLowerCase().replace(/\s+/g, '')}.org`,
        description: result.snippet || result.description,
        year: parseInt(result.year) || 2024,
        authorityLevel: result.authorityLevel || 'medium',
        category: formatCategory(result.category),
      }));

      // Transform related topics
      const transformedTopics: RelatedTopic[] = [];
      const topics = data.relatedTopics || {};
      
      if (topics.diseases) {
        topics.diseases.forEach((name: string, i: number) => {
          transformedTopics.push({ id: `disease-${i}`, name, type: 'disease', relation: 'Related condition' });
        });
      }
      if (topics.drugs) {
        topics.drugs.forEach((name: string, i: number) => {
          transformedTopics.push({ id: `drug-${i}`, name, type: 'drug', relation: 'Related medication' });
        });
      }
      if (topics.symptoms) {
        topics.symptoms.forEach((name: string, i: number) => {
          transformedTopics.push({ id: `symptom-${i}`, name, type: 'symptom', relation: 'Associated symptom' });
        });
      }
      if (topics.tests) {
        topics.tests.forEach((name: string, i: number) => {
          transformedTopics.push({ id: `test-${i}`, name, type: 'test', relation: 'Diagnostic test' });
        });
      }

      setResults(transformedResults);
      setSummary(data.summary || '');
      setRelatedTopics(transformedTopics.slice(0, 8));

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to fetch health information. Please try again.",
        variant: "destructive",
      });
      setResults([]);
      setSummary('');
      setRelatedTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCategory = (category: string): string => {
    if (!category) return 'General';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleTopicClick = (topic: RelatedTopic) => {
    handleSearch(topic.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {!hasSearched ? (
          <HeroSection onSearch={handleSearch} isLoading={isLoading} />
        ) : (
          <div className="container py-8">
            {/* Compact Search Bar */}
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Results */}
            <SearchResults
              query={searchQuery}
              results={results}
              summary={summary}
              relatedTopics={relatedTopics}
              isLoading={isLoading}
              onTopicClick={handleTopicClick}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
