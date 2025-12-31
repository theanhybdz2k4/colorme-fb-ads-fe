import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-4",
            "animate-float-up",
            className
        )}>
            {/* Icon container */}
            {icon && (
                <div className="mb-4 p-3 rounded-full bg-muted/50">
                    <div className="text-muted-foreground">
                        {icon}
                    </div>
                </div>
            )}

            {/* Text */}
            <h3 className="text-base font-medium text-foreground mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {description}
                </p>
            )}

            {/* Action */}
            {action && (
                <Button
                    onClick={action.onClick}
                    className="mt-4"
                    size="sm"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
