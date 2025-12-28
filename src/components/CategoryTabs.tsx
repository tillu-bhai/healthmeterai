import { cn } from "@/lib/utils";

export type Category = 
  | "all"
  | "clinical-guidelines"
  | "research"
  | "drugs"
  | "conditions"
  | "procedures";

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  counts?: Record<Category, number>;
}

const categories: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "All Results", icon: "📋" },
  { id: "clinical-guidelines", label: "Guidelines", icon: "📖" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "drugs", label: "Drugs", icon: "💊" },
  { id: "conditions", label: "Conditions", icon: "🩺" },
  { id: "procedures", label: "Procedures", icon: "⚕️" },
];

export const CategoryTabs = ({ activeCategory, onCategoryChange, counts }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
          {counts && counts[cat.id] > 0 && (
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              activeCategory === cat.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {counts[cat.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
