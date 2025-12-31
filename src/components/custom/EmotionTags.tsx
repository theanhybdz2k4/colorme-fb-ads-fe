import * as React from "react";
import { cn } from "@/lib/utils";

type EmotionType =
    | "scroll-stopper"
    | "trust"
    | "curiosity"
    | "urgency"
    | "social-proof"
    | "authority"
    | "emotion"
    | "benefit"
    | "pain-point";

interface EmotionTagProps {
    type: EmotionType | string;
    className?: string;
}

const emotionStyles: Record<string, { bg: string; text: string; glow?: string }> = {
    "scroll-stopper": {
        bg: "bg-violet-500/15",
        text: "text-violet-400",
        glow: "hover:shadow-[0_0_12px_hsl(270_50%_50%/0.2)]"
    },
    "trust": {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        glow: "hover:shadow-[0_0_12px_hsl(160_50%_50%/0.2)]"
    },
    "curiosity": {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        glow: "hover:shadow-[0_0_12px_hsl(40_50%_50%/0.2)]"
    },
    "urgency": {
        bg: "bg-red-500/15",
        text: "text-red-400",
        glow: "hover:shadow-[0_0_12px_hsl(0_50%_50%/0.2)]"
    },
    "social-proof": {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        glow: "hover:shadow-[0_0_12px_hsl(210_50%_50%/0.2)]"
    },
    "authority": {
        bg: "bg-indigo-500/15",
        text: "text-indigo-400",
        glow: "hover:shadow-[0_0_12px_hsl(240_50%_50%/0.2)]"
    },
    "emotion": {
        bg: "bg-pink-500/15",
        text: "text-pink-400",
        glow: "hover:shadow-[0_0_12px_hsl(330_50%_50%/0.2)]"
    },
    "benefit": {
        bg: "bg-teal-500/15",
        text: "text-teal-400",
        glow: "hover:shadow-[0_0_12px_hsl(175_50%_50%/0.2)]"
    },
    "pain-point": {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        glow: "hover:shadow-[0_0_12px_hsl(25_50%_50%/0.2)]"
    },
};

const defaultStyle = {
    bg: "bg-muted",
    text: "text-muted-foreground",
    glow: ""
};

export function EmotionTag({ type, className }: EmotionTagProps) {
    const style = emotionStyles[type] || defaultStyle;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                "transition-all duration-200",
                "border border-transparent",
                style.bg,
                style.text,
                style.glow,
                "hover:border-current/20",
                className
            )}
        >
            {type}
        </span>
    );
}

interface EmotionTagsProps {
    tags: string[];
    className?: string;
    max?: number;
}

export function EmotionTags({ tags, className, max = 5 }: EmotionTagsProps) {
    const displayTags = tags.slice(0, max);
    const remaining = tags.length - max;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {displayTags.map((tag, index) => (
                <EmotionTag key={index} type={tag} />
            ))}
            {remaining > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-muted-foreground bg-muted/50">
                    +{remaining}
                </span>
            )}
        </div>
    );
}
