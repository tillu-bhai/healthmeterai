import type { HealthResult } from "@/components/HealthResultCard";
import type { RelatedTopic } from "@/components/RelatedTopics";

const capitalize = (str: string): string => {
  return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const generateTitle = (query: string, category: string, index: number): string => {
  const templates = [
    `${category}: Comprehensive Guide to ${capitalize(query)}`,
    `Understanding ${capitalize(query)}: Evidence-Based Overview`,
    `${capitalize(query)} - Diagnosis, Treatment, and Management`,
    `Current Research on ${capitalize(query)}: A ${category}`,
    `${category} for ${capitalize(query)} in Clinical Practice`,
    `${capitalize(query)}: Latest Updates and Recommendations`,
    `Evidence-Based Approach to ${capitalize(query)}`,
    `${capitalize(query)} Prevention and Risk Factors`,
  ];
  return templates[index % templates.length];
};

const generateDescription = (query: string, category: string): string => {
  return `This ${category.toLowerCase()} provides comprehensive information about ${query}, including current evidence-based practices, clinical recommendations, and latest research findings from authoritative medical sources.`;
};

export const generateMockResults = (query: string): HealthResult[] => {
  const sources = [
    { name: "WHO", url: "https://www.who.int", authority: "high" as const },
    { name: "NIH", url: "https://www.nih.gov", authority: "high" as const },
    { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", authority: "high" as const },
    { name: "CDC", url: "https://www.cdc.gov", authority: "high" as const },
    { name: "Mayo Clinic", url: "https://www.mayoclinic.org", authority: "high" as const },
    { name: "MedlinePlus", url: "https://medlineplus.gov", authority: "high" as const },
    { name: "FDA", url: "https://www.fda.gov", authority: "high" as const },
    { name: "Cochrane Library", url: "https://www.cochranelibrary.com", authority: "high" as const },
    { name: "NHS", url: "https://www.nhs.uk", authority: "medium" as const },
    { name: "UpToDate", url: "https://www.uptodate.com", authority: "high" as const },
  ];

  const categories = [
    "Clinical Guideline",
    "Research Paper",
    "Drug Monograph",
    "Disease Info",
    "Systematic Review",
    "Case Study",
    "Medical Procedure",
    "Diagnostic Test",
  ];

  const results: HealthResult[] = [];
  const normalizedQuery = query.toLowerCase();

  for (let i = 0; i < 24; i++) {
    const source = sources[i % sources.length];
    const category = categories[i % categories.length];
    const year = 2020 + Math.floor(Math.random() * 5);

    results.push({
      id: `result-${i}`,
      title: generateTitle(normalizedQuery, category, i),
      source: source.name,
      sourceUrl: source.url,
      description: generateDescription(normalizedQuery, category),
      year,
      authorityLevel: source.authority,
      category,
    });
  }

  return results;
};

export const generateMockSummary = (query: string): string => {
  return `${capitalize(query)} is a medical topic that requires careful understanding. Based on authoritative sources from WHO, NIH, and peer-reviewed research, this condition/topic encompasses various aspects including diagnosis, treatment options, and preventive measures. The information presented here is compiled from verified medical databases and clinical guidelines. Always consult a healthcare professional for personalized medical advice.`;
};

export const generateRelatedTopics = (query: string): RelatedTopic[] => {
  const topics: RelatedTopic[] = [
    { id: "1", name: "Related Symptoms", type: "symptom", relation: "Common symptoms" },
    { id: "2", name: "First-Line Medications", type: "drug", relation: "Treatment options" },
    { id: "3", name: "Diagnostic Tests", type: "test", relation: "Recommended tests" },
    { id: "4", name: "Related Conditions", type: "disease", relation: "Associated conditions" },
    { id: "5", name: "Alternative Treatments", type: "drug", relation: "Other medications" },
    { id: "6", name: "Risk Factors", type: "symptom", relation: "Contributing factors" },
  ];
  return topics;
};
