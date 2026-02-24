import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface AiToggleProps {
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export const AiToggle: React.FC<AiToggleProps> = ({
    enabled,
    onChange,
    disabled,
    label,
    description
}) => {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={cn(
                "group relative flex items-center gap-3 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-500 overflow-hidden",
                "border shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                enabled
                    ? "bg-linear-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-blue-500/40 text-blue-400 shadow-blue-500/10"
                    : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-500/50 shadow-black/20"
            )}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Animated Glow effect for enabled state */}
            {enabled && (
                <div className="absolute -inset-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-md group-hover:opacity-30 animate-pulse transition-opacity" />
            )}

            <div className="relative flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center p-1.5 rounded-lg transition-colors duration-500",
                    enabled ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-500"
                )}>
                    {enabled ? (
                        <div className="relative">
                            <ToggleRight className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
                            <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-yellow-300 animate-bounce" />
                        </div>
                    ) : (
                        <ToggleLeft className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
                    )}
                </div>

                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm tracking-tight">
                        {label || (enabled ? 'CHATBOT ACTIVE' : 'CHATBOT PAUSED')}
                    </span>
                    {description && (
                        <span className="text-[10px] uppercase font-bold opacity-60 mt-0.5">
                            {description}
                        </span>
                    )}
                </div>
            </div>

            {/* Orbiting particles simulation (CSS only) */}
            {enabled && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 transform scale-75 opacity-40">
                    <div className="w-1 h-1 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 h-1 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '600ms' }} />
                </div>
            )}
        </button>
    );
};
