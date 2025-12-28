import { useState } from "react";
import { CategoryTabs, type Category } from "./CategoryTabs";
import { HealthResultCard, type HealthResult } from "./HealthResultCard";
import { AISummary } from "./AISummary";
import { RelatedTopics, type RelatedTopic } from "./RelatedTopics";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { FileText } from "lucide-react";

interface SearchResultsProps {
  query: string;
  results: HealthResult[];
  summary: string;
  relatedTopics: RelatedTopic[];
  isLoading: boolean;
  onTopicClick: (topic: RelatedTopic) => void;
}

export const SearchResults = ({
  query,
  results,
  summary,
  relatedTopics,
  isLoading,
  onTopicClick,
}: SearchResultsProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredResults = activeCategory === "all"
    ? results
    : results.filter((r) => {
        const categoryMap: Record<Category, string[]> = {
          all: [],
          "clinical-guidelines": ["Clinical Guideline", "Guidelines"],
          research: ["Research Paper", "Systematic Review", "Case Study"],
          drugs: ["Drug Monograph", "Pharmacology"],
          conditions: ["Disease Info", "Condition Overview"],
          procedures: ["Medical Procedure", "Diagnostic Test"],
        };
        return categoryMap[activeCategory]?.some(c => 
          r.category.toLowerCase().includes(c.toLowerCase())
        );
      });

  const counts: Record<Category, number> = {
    all: results.length,
    "clinical-guidelines": results.filter(r => r.category.includes("Guideline")).length,
    research: results.filter(r => ["Research", "Review", "Study"].some(k => r.category.includes(k))).length,
    drugs: results.filter(r => r.category.includes("Drug")).length,
    conditions: results.filter(r => ["Disease", "Condition"].some(k => r.category.includes(k))).length,
    procedures: results.filter(r => ["Procedure", "Test"].some(k => r.category.includes(k))).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AISummary summary="" isLoading />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-12 bg-muted rounded-xl" />
                <div className="h-12 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Summary */}
      <AISummary summary={summary} />

      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory}
          counts={counts}
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{filteredResults.length} results for "<strong className="text-foreground">{query}</strong>"</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-4">
          {filteredResults.map((result, index) => (
            <HealthResultCard key={result.id} result={result} index={index} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RelatedTopics topics={relatedTopics} onTopicClick={onTopicClick} />
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
};
