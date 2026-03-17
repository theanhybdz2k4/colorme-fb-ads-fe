import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash, Gift, BarChart3 } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { EventCodeManager } from './EventCodeManager';
import { EventRewardManager } from './EventRewardManager';
import { EventStatsPanel } from './EventStatsPanel';

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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-10 w-10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold tracking-tight">{event.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                            {sc.label}
                        </span>
                    </div>
                    {event.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'codes' && <EventCodeManager eventId={eventId} />}
            {activeTab === 'rewards' && <EventRewardManager eventId={eventId} />}
            {activeTab === 'stats' && <EventStatsPanel eventId={eventId} />}
        </div>
    );
}
