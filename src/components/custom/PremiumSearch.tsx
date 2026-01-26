"use client"

import * as React from "react"
import { Search, X, Command, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
    showShortcut?: boolean;
    isLoading?: boolean;
}

export const PremiumSearch = React.forwardRef<HTMLInputElement, PremiumSearchProps>(
    ({ className, onClear, showShortcut = true, isLoading, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const hasValue = Boolean(value);

        return (
            <div
                className={cn(
                    "relative group flex items-center w-full transition-all duration-300",
                    isFocused ? "scale-[1.01]" : "scale-100"
                )}
            >
                {/* Background & Glow */}
                <div 
                    className={cn(
                        "absolute inset-0 rounded-xl transition-all duration-500 blur-md opacity-0",
                        isFocused && "bg-primary/20 opacity-100"
                    )} 
                />
                
                <div className={cn(
                    "relative flex items-center w-full rounded-xl border transition-all duration-300",
                    "bg-muted/20 backdrop-blur-md",
                    isFocused 
                        ? "border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-muted/40" 
                        : "border-border/40 hover:border-border/80 group-hover:bg-muted/30"
                )}>
                    {/* Icon */}
                    <div className="pl-4 flex items-center justify-center pointer-events-none">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <Search className={cn(
                                "h-4 w-4 transition-colors duration-300",
                                isFocused ? "text-primary" : "text-muted-foreground"
                            )} />
                        )}
                    </div>

                    {/* Input */}
                    <input
                        {...props}
                        ref={ref}
                        value={value}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            "flex-1 h-11 bg-transparent border-none focus:outline-none focus:ring-0",
                            "px-3 text-sm placeholder:text-muted-foreground/50",
                            className
                        )}
                    />

                    {/* Right Elements (Clear / Shortcut) */}
                    <div className="pr-3 flex items-center gap-2">
                        {hasValue && onClear && (
                            <button
                                onClick={onClear}
                                className="p-1 rounded-md hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                type="button"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        
                        {!hasValue && showShortcut && (
                            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 text-[10px] font-medium text-muted-foreground/60 select-none">
                                <Command className="h-2.5 w-2.5" />
                                <span>K</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

PremiumSearch.displayName = "PremiumSearch";
