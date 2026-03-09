import Icon from "./Icon";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
    value: number;
    className?: string;
    size?: "sm" | "md";
    label?: string;
    isInverted?: boolean;
}

export function TrendIndicator({ value, className, size = "md", label, isInverted = false }: TrendIndicatorProps) {
    const isPositive = value >= 0;
    const isGood = isInverted ? !isPositive : isPositive;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div
                className={cn(
                    "inline-flex items-center justify-center font-bold tracking-wide rounded-md whitespace-nowrap",
                    size === "sm" ? "px-1.5 h-5 text-[11px]" : "h-9 text-body-1 max-md:h-7 max-md:text-button px-1.5",
                    isGood ? "label-green" : "label-red"
                )}
            >
                <Icon
                    name="arrow-percent"
                    className={cn("size-3.5!", isPositive ? "fill-inherit rotate-180" : "fill-inherit")}
                />
                <span className="ml-px">{Math.abs(value).toFixed(2)}%</span>
            </div>
            {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
        </div>
    );
}
