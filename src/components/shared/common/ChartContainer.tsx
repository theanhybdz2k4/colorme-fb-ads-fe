import * as React from "react";
import { cn } from "@/lib/utils";
import Icon from "./Icon";

interface ChartContainerProps {
    title?: string;
    subtitle?: string;
    icon?: string;
    action?: React.ReactNode;
    height?: number | string;
    children: React.ReactNode;
    className?: string;
}

export function ChartContainer({
    title,
    subtitle,
    icon,
    action,
    height = 350,
    children,
    className,
}: ChartContainerProps) {
    return (
        <div className={cn("card p-6 flex flex-col gap-6", className)}>
            {(title || icon || action) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="size-10 rounded-xl bg-b-surface2 flex items-center justify-center border border-s-border">
                                <Icon name={icon} className="size-5 text-primary-01" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            {title && (
                                <span className="text-sm font-bold text-t-primary uppercase tracking-widest leading-none">
                                    {title}
                                </span>
                            )}
                            {subtitle && (
                                <span className="text-[11px] font-medium text-t-tertiary mt-1.5 leading-none">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>
                    {action}
                </div>
            )}

            <div
                className="w-full flex-1 min-h-0"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                {children}
            </div>
        </div>
    );
}

export const ChartTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-b-surface2/90 backdrop-blur-md border border-s-border p-4 rounded-2xl shadow-2xl min-w-[160px] animate-in fade-in zoom-in duration-200">
                <div className="text-[11px] font-bold text-t-tertiary uppercase tracking-widest mb-3 border-b border-s-border pb-2">
                    {label}
                </div>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: entry.color || entry.fill }}
                                />
                                <span className="text-xs font-medium text-t-secondary whitespace-nowrap">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-t-primary font-mono">
                                {formatter ? formatter(entry.value) : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};
