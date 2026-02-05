
import { useState, useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import { LoadingState } from '@/components/custom/LoadingState';
import { LeadStatsHeader } from '../components/LeadStatsHeader';
import { LeadList } from '../components/LeadList';
import { ChatWindow } from '../components/ChatWindow';
import { LeadDetails } from '../components/LeadDetails';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart2, Filter, Star } from 'lucide-react';

import { LeadHeader } from '../components/LeadHeader';

const TABS_STORAGE_KEY = 'lead-insights-active-tab';

export function LeadInsights() {
  const { leads, leadsLoading, selectedLeadId, stats, setSelectedLeadId } = useLeads();

  // Source filter: all, ads, organic
  const [sourceFilter, setSourceFilter] = useState<'all' | 'ads' | 'organic'>('all');

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

  // Helper to detect if a lead is from ads
  // Helper to detect if a lead is from ads
  const isFromAds = (lead: any) => {
    return !!lead.source_campaign_id || !!lead.is_qualified;
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];
    
    // 1. Filter by source
    if (sourceFilter === 'ads') {
      result = result.filter(isFromAds);
    } else if (sourceFilter === 'organic') {
      result = result.filter(l => !isFromAds(l));
    }
    
    // 2. Sort: Potential first, then by last message time
    return result.sort((a, b) => {
      // Prioritize Potential (Star)
      if (a.is_potential && !b.is_potential) return -1;
      if (!a.is_potential && b.is_potential) return 1;
      
      // Secondary: Last message time
      const timeA = new Date(a.last_message_at || 0).getTime();
      const timeB = new Date(b.last_message_at || 0).getTime();
      return timeB - timeA;
    });
  }, [leads, sourceFilter]);

  // Count by source (fallback if stats not available)
  const adsCount = useMemo(() => leads.filter(isFromAds).length, [leads]);
  const organicCount = useMemo(() => leads.filter(l => !isFromAds(l)).length, [leads]);

  if (leadsLoading && !leads.length) {
    return <LoadingState text="Đang tải hệ thống CRM..." />;
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-screen overflow-hidden bg-background">
      <LeadHeader onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <TabsContent value="stats" className="overflow-y-auto p-4 md:p-6 pt-0 mt-0 flex-1 bg-white border-t-2 scrollbar-hide">
          <LeadStatsHeader />

          {/* Lead List with latest messages */}
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Khách hàng mới trong kỳ</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2.5 py-0.5 rounded-full bg-muted font-medium">
                    {stats?.todayLeads ?? leads.length} tổng
                  </span>
                  <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium whitespace-nowrap">
                    {stats?.todayQualified ?? adsCount} Ads
                  </span>
                  <span className="text-sm px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium whitespace-nowrap">
                    {stats?.todayNewOrganic ?? organicCount} Tự nhiên
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
                  <SelectTrigger className="w-[180px] h-9 bg-card">
                    <Filter className="h-3.5 w-3.5 mr-2 opacity-50" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ({leads.length})</SelectItem>
                    <SelectItem value="ads">Hiển thị Ads ({stats?.todayQualified ?? adsCount})</SelectItem>
                    <SelectItem value="organic">Hiển thị Tự nhiên ({stats?.todayNewOrganic ?? organicCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              {filteredLeads.slice(0, 100).map((lead, index) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    handleTabChange('chat');
                  }}
                >
                  {/* Sequence Number */}
                  <div className="shrink-0 w-8 text-sm font-medium text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Avatar */}
                  <img
                    src={lead.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.customer_name || 'User')}&background=random`}
                    alt={lead.customer_name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-background shadow-sm"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-semibold text-foreground truncate max-w-[200px] flex items-center gap-1.5">
                          {lead.customer_name || 'Khách hàng'}
                          {lead.is_potential && (
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0 animate-pulse-subtle" />
                          )}
                        </span>
                        {isFromAds(lead) ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider shrink-0">Ads</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-bold uppercase tracking-wider shrink-0">Organic</span>
                        )}
                        {/* Account & Campaign Info */}
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground/70">
                          <span className="truncate max-w-[120px] font-medium opacity-80">
                            • {lead.platform_accounts?.name}
                          </span>
                          {lead.source_campaign_name && lead.source_campaign_name !== 'Tự nhiên' && (
                            <span className="truncate max-w-[200px] text-blue-500/60 font-medium">
                              → {lead.source_campaign_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
                        {lead.first_contact_at ? new Date(lead.first_contact_at).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        }) : ''}
                      </span>
                    </div>

                    {/* Priority: AI Summary -> FB Snippet -> Default */}
                    <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">
                      {(() => {
                        if (lead.ai_analysis) {
                          // Try to find "Tóm tắt" or "Summary"
                          const summaryMatch = lead.ai_analysis.match(/(?:Tóm tắt|Summary):\s*([^\n]+(?:\n(?![A-Z][^:]+:)[^\n]+)*)/i);
                          if (summaryMatch && summaryMatch[1]) {
                            return `✨ AI: ${summaryMatch[1].trim()}`;
                          }
                          
                          // Fallback: If it's a "Tổng điểm" format, try to find "Giai đoạn" or "Mức độ quan tâm"
                          const interestMatch = lead.ai_analysis.match(/(?:Giai đoạn|Mức độ quan tâm):\s*([^\n]+)/i);
                          if (interestMatch && interestMatch[1]) {
                             return `✨ AI: ${interestMatch[1].trim()}`;
                          }

                          // Final fallback: First 150 chars
                          return `✨ AI: ${lead.ai_analysis.substring(0, 150)}...`;
                        }
                        return lead.platform_data?.snippet || lead.last_message_content || 'Bắt đầu cuộc trò chuyện...';
                      })()}
                    </p>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mb-4 opacity-10" />
                  <p>Không có khách hàng mới trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
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
      </div>
    </Tabs>
  );
}
