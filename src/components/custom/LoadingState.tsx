import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
    className?: string;
    text?: string;
}

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "h-5 w-5 rounded-full border-2 border-muted-foreground/20 border-t-primary",
                "animate-spin",
                className
            )}
        />
    );
}

export function LoadingState({ className, text }: LoadingStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 gap-3", className)}>
            <LoadingSpinner className="h-8 w-8" />
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse-subtle">
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner className="h-10 w-10" />
        </div>
    );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-md animate-shimmer",
                className
            )}
            {...props}
        />
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b border-border/50">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20 ml-auto" />
                </div>
            ))}
        </div>
    );
}
