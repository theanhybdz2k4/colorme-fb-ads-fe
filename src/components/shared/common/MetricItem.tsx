import * as React from "react";
import { cn } from "@/lib/utils";
import Icon from "./Icon";
import { TrendIndicator } from "./TrendIndicator";
import { Bar, BarChart, ResponsiveContainer, YAxis } from "recharts";

interface MetricItemProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    trend?: {
        value: number;
        label?: string;
        isInverted?: boolean;
    };
    chart?: {
        data: any[];
        dataKey: string;
        color?: string;
    };
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
    variant?: 'card' | 'grouped-item';
}

export function MetricItem({
    title,
    value,
    subtitle,
    icon,
    iconColor = "var(--primary-01)",
    trend,
    chart,
    isActive,
    onClick,
    className,
    variant = 'card',
}: MetricItemProps) {
    if (variant === 'grouped-item') {
        return (
            <div
                onClick={onClick}
                className={cn(
                    "group flex-1 px-8 py-6 rounded-4xl cursor-pointer transition-all max-2xl:p-6 max-xl:pr-3 max-md:p-4",
                    isActive ? "bg-b-surface2 shadow-depth-toggle" : "",
                    className
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-3 mb-2 text-sub-title-1 transition-colors group-hover:text-t-primary max-md:mb-3 max-md:text-sub-title-2",
                        isActive ? "text-t-primary" : "text-t-secondary"
                    )}
                >
                    {icon && (
                        <Icon
                            name={icon}
                            className={cn(
                                "transition-colors group-hover:fill-t-primary",
                                isActive ? "fill-t-primary" : "fill-t-secondary"
                            )}
                        />
                    )}
                    <div className="">{title}</div>
                </div>
                <div className="flex items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-1">
                    <div className="text-h3 max-md:text-h5 whitespace-nowrap">
                        {value}
                    </div>
                    <div>
                        {trend !== undefined && <TrendIndicator value={trend.value} isInverted={trend.isInverted} />}
                        <div className="mt-1 text-body-2 text-t-secondary max-md:text-caption whitespace-nowrap">
                            {subtitle || "vs last month"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("card group", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div
                                className="size-8 rounded-2xl flex items-center justify-center bg-b-surface1 group-hover:scale-110 transition-transform duration-300 shadow-sm"
                                style={{ color: iconColor }}
                            >
                                <Icon name={icon} className="size-5 fill-current" />
                            </div>
                        )}
                        <span className="text-[11px] font-bold text-t-secondary uppercase tracking-widest leading-none">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                        <h2 className="text-h4 font-bold text-t-primary tracking-tight leading-none">
                            {value}
                        </h2>
                        {trend && <TrendIndicator value={trend.value} size="sm" isInverted={trend.isInverted} />}
                    </div>

                    {(subtitle || trend?.label) && (
                        <p className="text-caption text-t-tertiary font-medium">
                            {subtitle || trend?.label}
                        </p>
                    )}
                </div>

                {chart && (
                    <div className="w-24 h-16 shrink-0 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart.data}>
                                <Bar
                                    dataKey={chart.dataKey}
                                    fill={chart.color || "var(--primary-01)"}
                                    radius={[2, 2, 0, 0]}
                                    opacity={0.6}
                                />
                                <YAxis hide domain={['auto', 'auto']} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MetricGridProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'card' | 'grouped';
}

export function MetricGrid({ children, className, variant = 'card' }: MetricGridProps) {
    if (variant === 'grouped') {
        return (
            <div className={cn("flex flex-wrap xl:flex-nowrap mb-4 p-1.5 border border-s-subtle rounded-4xl bg-b-depth2", className)}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {children}
        </div>
    );
}
