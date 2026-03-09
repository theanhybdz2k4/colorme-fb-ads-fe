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
        if (trend.value > 0) return <TrendingUp className="h-3 w-3 mr-1" />;
        if (trend.value < 0) return <TrendingDown className="h-3 w-3 mr-1" />;
        return <Minus className="h-3 w-3 mr-1" />;
    };

    const getTrendColorClass = () => {
        if (!trend) return "label-gray";
        if (trend.value > 0) return "label-green";
        if (trend.value < 0) return "label-red";
        return "label-gray";
    };

    return (
        <div
            className={cn(
                "card relative group hover:scale-[1.02] active:scale-[0.98]",
                className
            )}
        >
            {/* Icon - top right, subtle */}
            {icon && (
                <div className="absolute top-4 right-4 p-2 rounded-xl bg-b-surface1/50 text-t-tertiary group-hover:text-t-primary transition-all shadow-sm">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="space-y-2">
                <p className="text-overline text-t-tertiary uppercase tracking-widest font-bold">
                    {title}
                </p>
                <p className="text-h5 font-bold text-t-primary tracking-tight">
                    {value}
                </p>

                {/* Trend & Subtitle */}
                <div className="flex items-center gap-2 pt-1">
                    {trend && (
                        <span className={cn("label py-0.5 h-5", getTrendColorClass())}>
                            {getTrendIcon()}
                            {trend.value > 0 ? "+" : ""}{trend.value}%
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-caption text-t-tertiary">
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
    columns?: 2 | 3 | 4 | 5 | 6;
    className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
        6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns], className)}>
            {children}
        </div>
    );
}
