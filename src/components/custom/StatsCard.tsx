import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        label?: string;
    };
    icon?: React.ReactNode;
    className?: string;
}

export function StatsCard({
    title,
    value,
    subtitle,
    trend,
    icon,
    className,
}: StatsCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
        if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
        return <Minus className="h-3 w-3" />;
    };

    const getTrendColor = () => {
        if (!trend) return "";
        if (trend.value > 0) return "text-emerald-400";
        if (trend.value < 0) return "text-red-400";
        return "text-muted-foreground";
    };

    return (
        <div
            className={cn(
                "relative rounded-lg bg-card border border-border/50",
                "p-4 shadow-lg",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 hover:shadow-xl",
                "group",
                className
            )}
        >
            {/* Icon - top right, subtle */}
            {icon && (
                <div className="absolute top-3 right-3 p-2 rounded-md bg-muted/50 text-muted-foreground group-hover:text-foreground transition-colors">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </p>
                <p className="text-2xl font-semibold text-foreground tracking-tight">
                    {value}
                </p>

                {/* Trend & Subtitle */}
                <div className="flex items-center gap-2 pt-1">
                    {trend && (
                        <span className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                            {getTrendIcon()}
                            {trend.value > 0 ? "+" : ""}{trend.value}%
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-xs text-muted-foreground">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

interface StatsGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4 | 5;
    className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns], className)}>
            {children}
        </div>
    );
}
