import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash, Gift, BarChart3 } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { EventCodeManager } from './EventCodeManager';
import { EventRewardManager } from './EventRewardManager';
import { EventStatsPanel } from './EventStatsPanel';
import { EventRecipientsPanel } from './EventRecipientsPanel';
import { Users } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Nháp', color: 'text-gray-400', bg: 'bg-gray-500/10' },
    active: { label: 'Đang chạy', color: 'text-green-400', bg: 'bg-green-500/10' },
    paused: { label: 'Tạm dừng', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ended: { label: 'Đã kết thúc', color: 'text-red-400', bg: 'bg-red-500/10' },
};

interface Props {
    eventId: string;
    onBack: () => void;
}

const TABS = [
    { key: 'codes', label: 'Mã Code', icon: Hash },
    { key: 'rewards', label: 'Ưu đãi', icon: Gift },
    { key: 'recipients', label: 'Người nhận', icon: Users },
    { key: 'stats', label: 'Thống kê', icon: BarChart3 },
] as const;

type TabKey = typeof TABS[number]['key'];

export function EventDetailView({ eventId, onBack }: Props) {
    const { data: event, isLoading } = useEvent(eventId);
    const [activeTab, setActiveTab] = useState<TabKey>('codes');

    if (isLoading || !event) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
                <p className="text-xs font-medium text-muted-foreground">Đang tải...</p>
            </div>
        );
    }

    const sc = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-2xl h-11 w-11 hover:bg-white/50 hover:shadow-sm border border-transparent hover:border-border transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-extrabold tracking-tight text-foreground">{event.name}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.color} shadow-sm border border-current/10`}>
                            {sc.label}
                        </span>
                    </div>
                    {event.description && (
                        <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                    )}
                </div>
            </div>

            {/* Tab Navigation (Unified Style) */}
            <div className="relative inline-flex gap-1 p-1 bg-muted/60 backdrop-blur-xl border border-border rounded-2xl shadow-sm">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                                ${isActive
                                    ? 'bg-white dark:bg-zinc-800 text-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/40'
                                }`}
                        >
                            <Icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'codes' && <EventCodeManager eventId={eventId} />}
            {activeTab === 'rewards' && <EventRewardManager eventId={eventId} />}
            {activeTab === 'recipients' && <EventRecipientsPanel eventId={eventId} />}
            {activeTab === 'stats' && <EventStatsPanel eventId={eventId} />}
        </div>
    );
}
