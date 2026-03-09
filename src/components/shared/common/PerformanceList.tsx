import * as React from "react";
import { cn } from "@/lib/utils";
import Icon from "./Icon";
import { TrendIndicator } from "./TrendIndicator";

interface PerformanceItemProps {
    rank?: number;
    title: string;
    subtitle?: string;
    value: string | number;
    progress?: number; // 0-100
    trend?: number;
    icon?: string;
    secondaryStats?: { label: string; value: string | number }[];
    status?: 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
}

export function PerformanceItem({
    rank,
    title,
    subtitle,
    value,
    trend,
    icon,
    secondaryStats,
    status = 'neutral',
    className,
}: PerformanceItemProps) {
    const getStatusIconStyles = () => {
        switch (status) {
            case 'success': return 'bg-accent-green/10 [&>svg]:fill-accent-green';
            case 'warning': return 'bg-accent-orange/10 [&>svg]:fill-accent-orange';
            case 'danger': return 'bg-accent-red/10 [&>svg]:fill-accent-red';
            default: return 'bg-b-depth2 [&>svg]:fill-primary-01';
        }
    };

    const getStatusTitleStyles = () => {
        switch (status) {
            case 'success': return 'group-hover:text-accent-green';
            case 'warning': return 'group-hover:text-accent-orange';
            case 'danger': return 'group-hover:text-accent-red';
            default: return 'group-hover:text-primary-01';
        }
    };

    return (
        <div className={cn("group relative flex items-center py-4 px-3 -mx-3 rounded-2xl cursor-pointer transition-all duration-300", className)}>
            <div className="box-hover"></div>

            {rank !== undefined && (
                <div className={cn("relative z-2 w-10 shrink-0 text-button font-bold text-t-primary/40 transition-colors", getStatusTitleStyles())}>
                    {rank.toString().padStart(2, '0')}
                </div>
            )}

            {icon && (
                <div className={cn("relative z-2 size-10 rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-sm transition-transform group-hover:scale-105", getStatusIconStyles())}>
                    <Icon name={icon} className="size-5" />
                </div>
            )}

            <div className="relative z-2 flex-1 min-w-0 mr-4">
                <h4 className={cn("text-body-2 font-bold text-t-primary truncate leading-tight transition-colors", getStatusTitleStyles())}>
                    {title}
                </h4>
                {(subtitle || (secondaryStats && secondaryStats.length > 0)) && (
                    <div className="flex items-center gap-2 mt-1">
                        {subtitle && <p className="text-caption text-t-tertiary truncate font-medium">{subtitle}</p>}
                        {subtitle && secondaryStats && secondaryStats.length > 0 && <span className="text-t-tertiary/30">|</span>}
                        {secondaryStats?.map((stat, i) => (
                            <span key={stat.label} className="text-[10px] text-t-tertiary font-bold uppercase tracking-tighter">
                                {stat.label}: {stat.value}
                                {i < secondaryStats.length - 1 && <span className="mx-1 opacity-30">/</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative z-2 text-right shrink-0">
                <div className="flex flex-col items-end">
                    <span className="text-body-2 font-bold text-t-primary whitespace-nowrap">
                        {value}
                    </span>
                    {trend !== undefined && (
                        <div className="mt-0.5">
                            <TrendIndicator value={trend} size="sm" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function PerformanceList({
    children,
    title,
    icon,
    action,
    className
}: {
    children: React.ReactNode;
    title?: string;
    icon?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("card m-0 p-0 overflow-hidden", className)}>
            {(title || icon) && (
                <div className="flex items-center justify-between px-6 h-12 bg-b-depth2/10">
                    <div className="flex items-center gap-3">
                        {icon && <Icon name={icon} className="size-5 fill-primary-01" />}
                        <span className="text-h6 font-bold text-t-primary leading-none">
                            {title}
                        </span>
                    </div>
                    {action}
                </div>
            )}
            <div className="px-6 py-2 flex flex-col">
                {children}
            </div>
        </div>
    );
}
