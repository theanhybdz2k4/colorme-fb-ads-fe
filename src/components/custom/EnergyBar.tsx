import * as React from "react";
import { cn } from "@/lib/utils";

interface EnergyBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const variantClasses = {
  default: "bg-gradient-to-r from-primary/80 to-primary",
  success: "bg-gradient-to-r from-emerald-600/80 to-emerald-500",
  warning: "bg-gradient-to-r from-amber-600/80 to-amber-500",
  danger: "bg-gradient-to-r from-red-600/80 to-red-500",
};

function getVariantFromValue(value: number): "success" | "warning" | "danger" | "default" {
  if (value >= 70) return "success";
  if (value >= 40) return "warning";
  if (value > 0) return "danger";
  return "default";
}

export function EnergyBar({ 
  value, 
  label,
  showValue = false,
  size = "md",
  variant,
  className 
}: EnergyBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const autoVariant = variant || getVariantFromValue(clampedValue);
  
  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium text-foreground">{clampedValue}%</span>}
        </div>
      )}
      <div className={cn(
        "relative w-full rounded-full bg-muted/50 overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            "animate-energy-fill",
            variantClasses[autoVariant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

interface EnergyBarGroupProps {
  items: {
    label: string;
    value: number;
  }[];
  className?: string;
}

export function EnergyBarGroup({ items, className }: EnergyBarGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <EnergyBar
          key={index}
          label={item.label}
          value={item.value}
          showValue
          size="sm"
        />
      ))}
    </div>
  );
}
