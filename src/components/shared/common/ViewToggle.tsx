import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-lg bg-muted/50 p-1",
      "border border-border/50",
      className
    )}>
      <button
        onClick={() => onChange('grid')}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-1.5",
          "text-sm font-medium transition-all duration-200",
          value === 'grid'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-1.5",
          "text-sm font-medium transition-all duration-200",
          value === 'list'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="List View"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
