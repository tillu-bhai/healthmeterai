import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SearchResults } from "@/components/SearchResults";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { generateMockResults, generateMockSummary, generateRelatedTopics } from "@/data/mockData";
import type { HealthResult } from "@/components/HealthResultCard";
import type { RelatedTopic } from "@/components/RelatedTopics";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<HealthResult[]>([]);
  const [summary, setSummary] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setResults(generateMockResults(query));
    setSummary(generateMockSummary(query));
    setRelatedTopics(generateRelatedTopics(query));
    setIsLoading(false);
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
