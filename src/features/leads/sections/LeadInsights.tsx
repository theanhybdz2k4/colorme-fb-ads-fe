
import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { LoadingState } from '@/components/custom/LoadingState';
import { LeadStatsHeader } from '../components/LeadStatsHeader';
import { LeadList } from '../components/LeadList';
import { ChatWindow } from '../components/ChatWindow';
import { LeadDetails } from '../components/LeadDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, MessageSquare } from 'lucide-react';

import { LeadHeader } from '../components/LeadHeader';

const TABS_STORAGE_KEY = 'lead-insights-active-tab';

export function LeadInsights() {
  const { leads, leadsLoading, selectedLeadId } = useLeads();
  
  // Restore tab from localStorage
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TABS_STORAGE_KEY) || 'stats';
    }
    return 'stats';
  });

  // Save tab to localStorage when changed
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(TABS_STORAGE_KEY, value);
  };

  if (leadsLoading && !leads.length) {
    return <LoadingState text="Đang tải hệ thống CRM..." />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <LeadHeader />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 md:px-6 mb-2 md:mb-4">
          <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-4 md:px-6 gap-2 text-xs md:text-sm">
              <BarChart2 className="h-4 w-4" />
              Số liệu
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-4 md:px-6 gap-2 text-xs md:text-sm">
              <MessageSquare className="h-4 w-4" />
              Tin nhắn
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stats" className="overflow-y-auto p-4 md:p-6 pt-0 mt-0">
          <LeadStatsHeader />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-hidden border-t mt-0 data-[state=active]:flex">
          {/* Column 1: Lead List - Show if no lead selected on mobile, or always on desktop */}
          <div className={`${selectedLeadId ? 'hidden lg:block' : 'block'} w-full lg:w-[360px] border-r shrink-0`}>
            <LeadList />
          </div>

          {/* Column 2: Chat Interface - Show if lead selected on mobile, or always on desktop */}
          <div className={`${selectedLeadId ? 'flex' : 'hidden lg:flex'} flex-1 flex-col h-full bg-muted/5 min-w-0`}>
            <ChatWindow />
          </div>

          {/* Column 3: Customer Information - Always hidden on mobile, show on desktop if lead exists */}
          <div className="hidden xl:block">
            <LeadDetails />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
