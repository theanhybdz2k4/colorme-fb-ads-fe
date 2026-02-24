import { GripVertical, MessageSquare, Pencil, Trash2, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatbotFlow } from '@/types/chatbot.types';
import { MESSAGE_TYPE_LABELS } from './FlowEditDialog';
import { useChatbot } from '../context/ChatbotContext';

interface FlowCardProps {
    flow: ChatbotFlow;
}

export function FlowCard({ flow }: FlowCardProps) {
    const { openEdit, handleDeleteFlow, handleToggleFlow } = useChatbot();

    const typeInfo = MESSAGE_TYPE_LABELS[flow.message_type];
    const TypeIcon = typeInfo?.icon || MessageSquare;

    return (
        <div
            className={cn(
                "group relative border bg-card p-5 transition-all",
                !flow.is_active && "opacity-60 grayscale-[0.5]",
                flow.is_entry_point
                    ? "border-primary/40 bg-primary/5 rounded-xl shadow-sm"
                    : flow.is_active ? "border-border hover:border-border/80 rounded-xl" : "border-border/50 rounded-xl"
            )}
        >
            <div className="flex items-start gap-4 relative">
                {/* Drag Handle */}
                <div className="mt-1.5 text-muted-foreground/20 cursor-grab hover:text-primary transition-colors">
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-bold tracking-tight text-foreground">{flow.display_name}</h4>

                        <div className="flex gap-1.5 items-center">
                            {flow.is_entry_point && (
                                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                    Entry Point
                                </span>
                            )}
                            {flow.content?.handoff && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                                    Handoff
                                </span>
                            )}
                            <span className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight bg-muted border border-border",
                                typeInfo?.color
                            )}>
                                <TypeIcon className="h-3 w-3" />
                                {typeInfo?.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground border border-border">
                            key: {flow.flow_key}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 font-mono">
                            #{flow.id}
                        </span>
                    </div>

                    {/* Triggers */}
                    {(flow.trigger_payloads?.length > 0 || flow.trigger_keywords?.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                            {flow.trigger_payloads?.map(p => (
                                <span key={p} className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-[10px] font-mono font-bold text-yellow-600 dark:text-yellow-500" >
                                    <Zap className="h-2.5 w-2.5 text-yellow-500" />{p}
                                </span>
                            ))}
                            {flow.trigger_keywords?.map(k => (
                                <span key={k} className="px-2 py-1 rounded-md bg-secondary text-[10px] font-semibold text-secondary-foreground border border-border">
                                    "{k}"
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Content preview */}
                    <div className="relative group/preview mt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pl-3 border-l-2 border-border">
                            {flow.content?.text || flow.content?.text_before || '(no message content)'}
                        </p>
                    </div>

                    {/* Quick replies / buttons preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {flow.content?.quick_replies && flow.content.quick_replies.map((qr, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-md border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                                💬 {qr.title}
                            </div>
                        ))}
                        {flow.content?.buttons && flow.content.buttons.map((btn, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-md border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                                🔘 {btn.title}
                            </div>
                        ))}
                        {flow.content?.elements && flow.content.elements.map((el, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-md border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                                🃏 {el.title?.substring(0, 25)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-1 self-center">
                    <button
                        onClick={() => handleToggleFlow(flow)}
                        className={cn(
                            "rounded-xl transition-all active:scale-90 cursor-pointer",
                            flow.is_active
                                ? "text-green-500"
                                : "text-muted-foreground/30 bg-muted"
                        )}
                        title={flow.is_active ? 'Active — click to pause' : 'Paused — click to resume'}
                    >
                        {flow.is_active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openEdit(flow)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors group/btn cursor-pointer"
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground group-hover/btn:text-foreground" />
                        </button>
                        <button
                            onClick={() => handleDeleteFlow(flow.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group/btn cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover/btn:text-red-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
