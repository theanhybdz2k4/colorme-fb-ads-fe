import * as React from "react";
import { cn } from "@/lib/utils";
import Icon from "./Icon";
import { TrendIndicator } from "./TrendIndicator";
import { StatusBadge, type StatusType } from "./StatusBadge";

interface PerformanceItemProps {
    rank?: number;
    title: string;
    subtitle?: string;
    value: string | number;
    progress?: number; // 0-100
    trend?: number;
    icon?: string;
    secondaryStats?: { label: string; value: string | number }[];
    status?: StatusType | string;
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
    return (
        <div className={cn("group relative flex items-center py-4 px-4 -mx-4 rounded-3xl cursor-pointer transition-all duration-500 hover:z-10", className)}>
            <div className="box-hover shadow-depth-menu opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {rank !== undefined && (
                <div className="relative z-2 w-8 shrink-0 text-button font-black text-t-primary/20 group-hover:text-primary-01/40 transition-colors duration-500">
                    {rank.toString().padStart(2, '0')}
                </div>
            )}

            {icon && (
                <div className="relative z-2 size-11 rounded-2xl flex items-center justify-center mr-4 shrink-0 bg-b-surface1 shadow-sm border border-s-subtle group-hover:border-primary-01/20 group-hover:scale-110 transition-all duration-500">
                    <Icon name={icon} className="size-5.5 fill-t-primary group-hover:fill-primary-01 transition-colors duration-500" />
                </div>
            )}

            <div className="relative z-2 flex-1 min-w-0 mr-4">
                <h4 className="text-body-2 font-bold text-t-primary truncate leading-tight group-hover:text-primary-01 transition-colors duration-500">
                    {title}
                </h4>
                {(subtitle || (secondaryStats && secondaryStats.length > 0)) && (
                    <div className="flex items-center gap-2 mt-1.5">
                        {subtitle && <p className="text-[11px] text-t-tertiary truncate font-bold uppercase tracking-wider opacity-70">{subtitle}</p>}
                        {subtitle && secondaryStats && secondaryStats.length > 0 && <span className="text-t-tertiary/20">|</span>}
                        {secondaryStats?.map((stat, i) => (
                            <span key={stat.label} className="text-[10px] text-t-tertiary font-black uppercase tracking-tighter opacity-60">
                                {stat.label}: <span className="text-t-secondary">{stat.value}</span>
                                {i < secondaryStats.length - 1 && <span className="mx-1 opacity-20">/</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative z-2 flex items-center gap-4 shrink-0">
                <div className="text-right">
                    <div className="text-body-1 font-black text-t-primary whitespace-nowrap tracking-tight">
                        {value}
                    </div>
                    {trend !== undefined && (
                        <div className="mt-0.5">
                            <TrendIndicator value={trend} size="sm" />
                        </div>
                    )}
                </div>
                {status && (
                    <StatusBadge status={status} dot={false} className="h-6 px-3 text-[10px] font-black" />
                )}
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
