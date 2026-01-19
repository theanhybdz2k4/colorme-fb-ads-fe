import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    width?: string;
}

interface FilterBarProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: FilterConfig[];
    onClear?: () => void;
    hasActiveFilters?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function FilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = [],
    onClear,
    hasActiveFilters,
    className,
    children,
}: FilterBarProps) {
    return (
        <div
            className={cn(
                "rounded-lg bg-card border border-border/50 p-4",
                "shadow-lg",
                className
            )}
        >
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                {onSearchChange && (
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="pl-9 bg-muted/30 border-border/50 focus:bg-muted/50 transition-colors"
                        />
                    </div>
                )}

                {/* Filters */}
                {filters.map((filter) => (
                    <Select
                        key={filter.key}
                        value={filter.value}
                        onValueChange={filter.onChange}
                    >
                        <SelectTrigger
                            className={cn(
                                "bg-muted/30 border-border/50 cursor-pointer",
                                "focus:bg-muted/50 transition-colors",
                                filter.width || "w-40"
                            )}
                        >
                            <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                            {filter.options.map((option) => (
                                <SelectItem color="primary" className="cursor-pointer" key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}

                {/* Custom children */}
                {children}

                {/* Clear button */}
                {hasActiveFilters && onClear && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

// Expandable filter panel for advanced filtering
interface FilterPanelProps {
    children: React.ReactNode;
    title?: string;
    expanded?: boolean;
    onToggle?: () => void;
    className?: string;
}

export function FilterPanel({
    children,
    title = "Filters",
    expanded = false,
    onToggle,
    className,
}: FilterPanelProps) {
    return (
        <div className={cn("rounded-lg bg-card border border-border/50 overflow-hidden", className)}>
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <div
                    className={cn(
                        "h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center",
                        "transition-transform duration-200",
                        expanded && "rotate-180"
                    )}
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Content */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-4 pt-0 border-t border-border/50">
                    {children}
                </div>
            </div>
        </div>
    );
}
