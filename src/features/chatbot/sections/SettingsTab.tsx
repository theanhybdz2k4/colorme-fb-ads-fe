import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Send, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatbot } from '../context/ChatbotContext';

export function SettingsTab() {
    const {
        config,
        updateConfig,
        testChatbot,
        newPsid,
        setNewPsid,
        testPsid,
        setTestPsid,
        handleAddPsid,
        handleRemovePsid,
        handleTestModeToggle,
        handleTest,
    } = useChatbot();

    return (
        <div className="space-y-6">
            {/* Test Mode */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </div>
                            Chế độ Test
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Khi bật, chatbot chỉ reply cho các PSID trong danh sách test dưới đây.
                        </p>
                    </div>
                    <button
                        onClick={handleTestModeToggle}
                        disabled={updateConfig.isPending}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                            config?.test_mode
                                ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/5"
                                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                        )}
                    >
                        {config?.test_mode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {config?.test_mode ? 'Đang BẬT' : 'Đang TẮT'}
                    </button>
                </div>

                {/* PSIDs list */}
                <div className="space-y-4 pt-2">
                    <Label className="text-sm font-bold tracking-tight text-foreground/70 flex items-center gap-2">
                        DANH SÁCH PSID TEST
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-mono">
                            tổng cộng {config?.test_psids?.length || 0}
                        </span>
                    </Label>

                    <div className="flex flex-wrap gap-2 min-h-10 p-3 rounded-xl bg-muted/30 border border-dashed border-border/60">
                        {(config?.test_psids || []).map(psid => (
                            <span
                                key={psid}
                                className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-background border border-border/50 text-sm font-mono shadow-sm hover:border-blue-500/30 transition-colors"
                            >
                                {psid}
                                <button
                                    onClick={() => handleRemovePsid(psid)}
                                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {(config?.test_psids || []).length === 0 && (
                            <p className="text-xs text-muted-foreground/60 italic self-center">Chưa có PSID test nào.</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPsid}
                            onChange={e => setNewPsid(e.target.value)}
                            placeholder="Dán PSID vào đây..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleAddPsid()}
                        />
                        <Button
                            onClick={handleAddPsid}
                            size="default"
                            className="rounded-xl px-6 font-bold shadow-lg shadow-primary/10"
                            disabled={!newPsid.trim()}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Thêm
                        </Button>
                    </div>
                </div>
            </div>

            {/* Test Send */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Send className="h-4 w-4 text-blue-500" />
                        </div>
                        Gửi tin nhắn giả lập
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gửi kịch bản chào mừng tới PSID test để kiểm tra logic chatbot.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={testPsid}
                            onChange={e => setTestPsid(e.target.value)}
                            placeholder="Nhập PSID để test..."
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-background/50 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Send className="h-4 w-4" />
                        </div>
                    </div>
                    <Button
                        onClick={handleTest}
                        disabled={testChatbot.isPending || !testPsid}
                        className="gap-2 px-8 rounded-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 border-none h-auto"
                    >
                        {testChatbot.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Chạy Test
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
