import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight } from 'lucide-react';

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
                "group relative flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold transition-all",
                "border active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                enabled
                    ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            )}
        >
            <div className="relative flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center p-1.5 rounded-lg transition-colors",
                    enabled ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                )}>
                    {enabled ? (
                        <ToggleRight className="h-5 w-5" />
                    ) : (
                        <ToggleLeft className="h-5 w-5" />
                    )}
                </div>

                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm tracking-tight text-current uppercase">
                        {label || (enabled ? 'Chatbot Active' : 'Chatbot Paused')}
                    </span>
                    {description && (
                        <span className="text-[10px] uppercase font-bold opacity-60 mt-0.5">
                            {description}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};
