
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
  const { leads, leadsLoading } = useLeads();
  
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
          <LeadStatsHeader />
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
