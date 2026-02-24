import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Plus, Search, X } from 'lucide-react';
import { useChatbot } from '../context/ChatbotContext';
import { FlowCard } from '../components/FlowCard';

export function FlowsTab() {
    const {
        flows,
        flowsLoading,
        openEdit,
    } = useChatbot();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredFlows = useMemo(() => {
        if (!flows) return [];
        if (!searchQuery.trim()) return flows;

        const query = searchQuery.toLowerCase().trim();
        return flows.filter(flow =>
            flow.display_name.toLowerCase().includes(query) ||
            flow.flow_key.toLowerCase().includes(query) ||
            flow.content?.text?.toLowerCase().includes(query)
        );
    }, [flows, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">Flow Builder</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-primary/50" />
                        {flows?.length || 0} kịch bản đang hoạt động
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm kịch bản..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 h-11 rounded-xl bg-muted/50 border-border focus:bg-background transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={() => openEdit()}
                        className="gap-2 rounded-xl px-5 font-bold h-11 shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Thêm bước mới
                    </Button>
                </div>
            </div>

            {flowsLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-muted rounded-2xl border border-dashed border-border">
                    <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Đang khởi tạo các kịch bản...</p>
                </div>
            )}

            {/* Flow cards */}
            {!flowsLoading && filteredFlows.length > 0 && (
                <div className="grid gap-4">
                    {filteredFlows.map(flow => (
                        <FlowCard
                            key={flow.id}
                            flow={flow}
                        />
                    ))}
                </div>
            )}

            {!flowsLoading && searchQuery && filteredFlows.length === 0 && (
                <div className="text-center py-20 bg-muted/50 rounded-2xl border border-dashed border-border">
                    <p className="text-sm font-medium text-muted-foreground">Không tìm thấy kịch bản nào phù hợp với "{searchQuery}"</p>
                    <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-primary hover:text-primary/80"
                    >
                        Xóa tìm kiếm
                    </Button>
                </div>
            )}

            {flows?.length === 0 && !flowsLoading && !searchQuery && (
                <div className="text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border space-y-4">
                    <div className="inline-flex p-5 rounded-2xl bg-card border border-border mt-2">
                        <Bot className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-foreground">Chưa có logic nào được thiết lập</p>
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
