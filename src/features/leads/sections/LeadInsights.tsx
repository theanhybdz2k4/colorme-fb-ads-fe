
import { useLeads } from '../context/LeadContext';
import { LoadingState } from '@/components/custom/LoadingState';
import { LeadStatsHeader } from '../components/LeadStatsHeader';
import { LeadList } from '../components/LeadList';
import { ChatWindow } from '../components/ChatWindow';
import { LeadDetails } from '../components/LeadDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/custom/PageHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, BarChart2, MessageSquare } from 'lucide-react';

export function LeadInsights() {
  const { leads, leadsLoading, syncLeads, isSyncing } = useLeads();

  if (leadsLoading && !leads.length) {
    return <LoadingState text="Đang tải hệ thống CRM..." />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="p-6 pb-2 flex items-start justify-between bg-background/50 backdrop-blur-md z-20">
        <PageHeader
          title="Lead Insights"
          description="Quản lý khách hàng tiềm năng và phân bổ nhân sự xử lý tin nhắn."
        />
        <Button
          onClick={syncLeads}
          disabled={isSyncing}
          className="rounded-xl font-bold gap-2 animate-shimmer"
        >
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync Lead từ Facebook
        </Button>
      </div>

      <Tabs defaultValue="stats" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 mb-4">
          <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6 gap-2">
              <BarChart2 className="h-4 w-4" />
              Số liệu
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6 gap-2">
              <MessageSquare className="h-4 w-4" />
              Tin nhắn
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stats" className="overflow-y-auto p-6 pt-0 mt-0">
          <LeadStatsHeader showOnlyStats />
        </TabsContent>

        <TabsContent value="chat" className="flex overflow-hidden border-t mt-0 data-[state=active]:flex">
          {/* Column 1: Lead List */}
          <LeadList />

          {/* Column 2: Chat Interface */}
          <ChatWindow />

          {/* Column 3: Customer Information */}
          <LeadDetails />
        </TabsContent>
      </Tabs>
    </div>
  );
}
