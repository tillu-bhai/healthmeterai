import { ArrowRight, Pill, Stethoscope, TestTube, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RelatedTopic {
  id: string;
  name: string;
  type: "disease" | "drug" | "symptom" | "test";
  relation: string;
}

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  onTopicClick: (topic: RelatedTopic) => void;
}

const typeConfig = {
  disease: {
    icon: Activity,
    color: "text-coral-500 bg-coral-500/10",
  },
  drug: {
    icon: Pill,
    color: "text-primary bg-primary/10",
  },
  symptom: {
    icon: Stethoscope,
    color: "text-amber-600 bg-amber-100",
  },
  test: {
    icon: TestTube,
    color: "text-violet-600 bg-violet-100",
  },
};

export const RelatedTopics = ({ topics, onTopicClick }: RelatedTopicsProps) => {
  if (topics.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
          🔗
        </span>
        Knowledge Graph
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map((topic) => {
          const config = typeConfig[topic.type];
          const Icon = config.icon;
          
          return (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic)}
              className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 text-left"
            >
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {topic.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.relation}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
