import { ExternalLink, Calendar, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthResult {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  description: string;
  year: number;
  authorityLevel: "high" | "medium";
  category: string;
}

interface HealthResultCardProps {
  result: HealthResult;
  index: number;
}

const authorityConfig = {
  high: {
    label: "High Authority",
    icon: ShieldCheck,
    className: "bg-teal-100 text-teal-700 border-teal-200",
  },
  medium: {
    label: "Medium Authority",
    icon: Shield,
    className: "bg-secondary text-secondary-foreground border-border",
  },
};

export const HealthResultCard = ({ result, index }: HealthResultCardProps) => {
  const authority = authorityConfig[result.authorityLevel];
  const AuthorityIcon = authority.icon;

  return (
    <article 
      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 animate-slide-up opacity-0"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
              {result.category}
            </span>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1",
              authority.className
            )}>
              <AuthorityIcon className="h-3 w-3" />
              {authority.label}
            </span>
          </div>
          
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {result.title}
            </a>
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {result.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {result.year}
            </span>
            <a 
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              {result.source}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
