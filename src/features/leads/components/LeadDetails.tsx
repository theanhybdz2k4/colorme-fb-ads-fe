
import { useLeads } from '../context/LeadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Info, Phone, StickyNote, Tag, Target, ExternalLink, RefreshCw } from 'lucide-react';

export function LeadDetails() {
    const {
        leads,
        selectedLeadId,
        updateLead
    } = useLeads();

    const selectedLead = leads?.find((l: any) => l.id === selectedLeadId);

    if (!selectedLead) return null;

    return (
        <div className="w-[320px] border-l bg-background flex flex-col animate-slide-in-right overflow-hidden h-full">
            <div className="p-4 border-b flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">THÔNG TIN KHÁCH HÀNG</h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-5 space-y-6">
                    <div className="text-center pb-2">
                        <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-muted/30">
                            <AvatarImage src={selectedLead.customer_avatar} />
                            <AvatarFallback>{selectedLead.customer_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h4 className="font-black text-lg">{selectedLead.customer_name}</h4>
                        <p className="text-xs text-muted-foreground font-medium select-all">PSID: {selectedLead.external_id}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Số điện thoại
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Chưa có SĐT..."
                                    defaultValue={selectedLead.phone}
                                    className="h-8 text-xs font-bold bg-muted/10 border-none"
                                    onBlur={(e) => updateLead({ phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                <StickyNote className="h-3 w-3" /> Ghi chú nội bộ
                            </label>
                            <textarea
                                placeholder="Nhập ghi chú quan trọng về khách hàng này..."
                                className="w-full text-xs font-medium p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 min-h-[100px] outline-none hover:bg-orange-500/10 transition-all font-sans"
                                defaultValue={selectedLead.notes}
                                onBlur={(e) => updateLead({ notes: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Nhãn phân loại
                            </label>
                            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg bg-muted/20">
                                {selectedLead.platform_data?.labels?.map((label: any) => (
                                    <Badge key={label.id} className="text-[9px] font-bold bg-primary/20 text-primary border-none hover:bg-primary/30">
                                        {label.name}
                                    </Badge>
                                ))}
                                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-muted/50"><RefreshCw className="h-2.5 w-2.5" /></Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                <Target className="h-3 w-3" /> Nguồn chiến dịch
                            </label>
                            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground">Tài khoản:</span>
                                    <span className="text-[10px] font-bold">{selectedLead.platform_accounts?.name}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-muted-foreground shrink-0">Chiến dịch:</span>
                                    <span className="text-[10px] font-bold text-right leading-tight">{selectedLead.source_campaign_name}</span>
                                </div>
                                {selectedLead.source_campaign_id && (
                                    <div className="pt-1">
                                        <Button variant="outline" className="w-full h-7 text-[9px] gap-1 font-bold border-blue-500/20 hover:bg-blue-500/10 text-blue-500">
                                            <ExternalLink className="h-3 w-3" /> XEM CHI TIẾT QUẢNG CÁO
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-3 space-y-2 rounded-xl border border-dashed border-muted-foreground/20 opacity-60">
                            <p className="text-[10px] font-bold text-center">ORDER HISTORY (Coming Soon)</p>
                            <div className="h-8 bg-muted/10 rounded"></div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
