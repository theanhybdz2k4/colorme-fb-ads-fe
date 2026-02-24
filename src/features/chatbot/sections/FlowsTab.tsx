import { Button } from '@/components/ui/button';
import { Bot, Plus } from 'lucide-react';
import { useChatbot } from '../context/ChatbotContext';
import { FlowCard } from '../components/FlowCard';

export function FlowsTab() {
    const {
        flows,
        flowsLoading,
        openEdit,
    } = useChatbot();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">Flow Builder</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                        {flows?.length || 0} active nodes in the automation network
                    </p>
                </div>
                <Button
                    onClick={() => openEdit()}
                    className="gap-2 rounded-xl px-5 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 border-none h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" /> Thêm bước mới
                </Button>
            </div>

            {flowsLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                    <div className="relative">
                        <div className="animate-spin w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full" />
                        <div className="absolute inset-0 blur-sm animate-pulse bg-primary/20 rounded-full" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Initializing Flows...</p>
                </div>
            )}

            {/* Flow cards */}
            <div className="grid gap-4">
                {flows?.map(flow => (
                    <FlowCard
                        key={flow.id}
                        flow={flow}
                    />
                ))}
            </div>

            {flows?.length === 0 && !flowsLoading && (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40 space-y-4">
                    <div className="inline-flex p-5 rounded-3xl bg-card border border-border/50 shadow-inner">
                        <Bot className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-foreground/80">Chưa có logic nào được thiết lập</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Nhấn vào button "Thêm bước mới" bên trên để bắt đầu xây dựng kịch bản cho Chatbot của bạn.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => openEdit()}
                        className="mt-2 rounded-xl border-dashed hover:border-solid hover:bg-background transition-all"
                    >
                        Bắt đầu ngay
                    </Button>
                </div>
            )}
        </div>
    );
}
