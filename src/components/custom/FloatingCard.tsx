import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

export function FloatingCard({
    children,
    className,
    hover = true,
    padding = "md",
    ...props
}: FloatingCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg bg-card border border-border/50",
                "shadow-lg",
                "transition-all duration-300 ease-out",
                hover && "hover:-translate-y-0.5 hover:shadow-xl hover:border-border/80",
                paddingClasses[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface FloatingCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function FloatingCardHeader({ children, className, ...props }: FloatingCardHeaderProps) {
    return (
        <div className={cn("pb-3 border-b border-border/50", className)} {...props}>
            {children}
        </div>
    );
}

interface FloatingCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export function FloatingCardTitle({ children, className, ...props }: FloatingCardTitleProps) {
    return (
        <h3 className={cn("text-sm font-medium text-foreground", className)} {...props}>
            {children}
        </h3>
    );
}

interface FloatingCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function FloatingCardContent({ children, className, ...props }: FloatingCardContentProps) {
    return (
        <div className={cn("pt-3", className)} {...props}>
            {children}
        </div>
    );
}
