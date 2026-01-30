
import { useLeads } from '../context/LeadContext';
import { PageHeader } from '@/components/custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Loader2 } from 'lucide-react';

export function LeadHeader() {
    const {
        syncLeads,
        isSyncing,
        selectedPageId,
        setSelectedPageId,
        availablePages,
        pagesLoading
    } = useLeads();

    return (
        <div className="p-6 pb-2 flex items-start justify-between bg-background/50 backdrop-blur-md z-20">
            <div className="flex flex-col gap-4">
                <PageHeader
                    title="Lead Insights"
                    description="Quản lý khách hàng tiềm năng và phân bổ nhân sự xử lý tin nhắn."
                />

                <div className="flex gap-3 items-center">
                    <span className="text-sm font-semibold text-muted-foreground pr-1">Chọn Fanpage:</span>
                    <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={pagesLoading}>
                        <SelectTrigger className="h-9 w-[300px] bg-background border-primary/20 hover:border-primary/40 transition-colors rounded-xl shadow-sm">
                            {pagesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Tất cả Fanpage" />}
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả Fanpage</SelectItem>
                            {availablePages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button
                onClick={syncLeads}
                disabled={isSyncing}
                className="rounded-xl font-bold gap-2 animate-shimmer"
            >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync từ Facebook
            </Button>
        </div>
    );
}
