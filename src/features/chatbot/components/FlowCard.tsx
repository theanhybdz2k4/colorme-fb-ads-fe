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
                "group relative rounded-2xl border bg-card/60 backdrop-blur-md p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5",
                !flow.is_active && "opacity-60 grayscale-[0.5]",
                flow.is_entry_point
                    ? "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/10"
                    : flow.is_active ? "border-border/50 hover:border-blue-500/30" : "border-border/30"
            )}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-500 pointer-events-none" />

            <div className="flex items-start gap-4 relative">
                {/* Drag Handle */}
                <div className="mt-1.5 text-muted-foreground/20 cursor-grab hover:text-blue-500/40 transition-colors">
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-bold tracking-tight text-foreground/90">{flow.display_name}</h4>

                        <div className="flex gap-1.5 items-center">
                            {flow.is_entry_point && (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                                    Entry Point
                                </span>
                            )}
                            {flow.content?.handoff && (
                                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">
                                    Handoff
                                </span>
                            )}
                            <span className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-muted/50 border border-border/50",
                                typeInfo?.color
                            )}>
                                <TypeIcon className="h-3 w-3" />
                                {typeInfo?.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-muted/80 text-[10px] font-mono text-muted-foreground border border-border/40">
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
                                <span key={p} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-[10px] font-mono font-bold text-yellow-500/80 border border-yellow-500/20">
                                    <Zap className="h-2.5 w-2.5 text-yellow-400" />{p}
                                </span>
                            ))}
                            {flow.trigger_keywords?.map(k => (
                                <span key={k} className="px-2 py-1 rounded-lg bg-blue-500/10 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                                    "{k}"
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Content preview */}
                    <div className="relative group/preview mt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic pl-3 border-l-2 border-border/50">
                            {flow.content?.text || flow.content?.text_before || '(no message content)'}
                        </p>
                    </div>

                    {/* Quick replies / buttons preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {flow.content?.quick_replies && flow.content.quick_replies.map((qr, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-bold text-blue-400/80 shadow-sm">
                                💬 {qr.title}
                            </div>
                        ))}
                        {flow.content?.buttons && flow.content.buttons.map((btn, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-[10px] font-bold text-purple-400/80 shadow-sm">
                                🔘 {btn.title}
                            </div>
                        ))}
                        {flow.content?.elements && flow.content.elements.map((el, i) => (
                            <div key={i} className="px-2.5 py-1 rounded-lg border border-orange-500/20 bg-orange-500/5 text-[10px] font-bold text-orange-400/80 shadow-sm">
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
                            "rounded-xl transition-all duration-300 active:scale-90 cursor-pointer",
                            flow.is_active
                                ? "text-green-400"
                                : "text-muted-foreground/30 bg-muted hover:bg-muted/80"
                        )}
                        title={flow.is_active ? 'Active — click to pause' : 'Paused — click to resume'}
                    >
                        {flow.is_active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => openEdit(flow)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors group/btn cursor-pointer"
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground group-hover/btn:text-blue-400" />
                        </button>
                        <button
                            onClick={() => handleDeleteFlow(flow.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group/btn cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover/btn:text-red-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
