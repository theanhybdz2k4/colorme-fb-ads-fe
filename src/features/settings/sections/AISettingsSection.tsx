import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
} from '@/components/custom';
import { Sparkles, Save, Eye, EyeOff, Loader2 } from 'lucide-react';

export function AISettingsSection() {
    const { user, updateProfile, refreshUser } = useAuth();
    const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || '');
    const [showKey, setShowKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateProfile({ gemini_api_key: geminiApiKey });
            await refreshUser();
            toast.success('Đã lưu Gemini API Key');
        } catch (err: any) {
            toast.error('Lỗi khi lưu key: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FloatingCard>
            <FloatingCardHeader>
                <FloatingCardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Cấu hình AI (Gemini)
                </FloatingCardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    API Key dùng để phân tích nội dung đoạn hội thoại và gợi ý xử lý Lead.
                </p>
            </FloatingCardHeader>
            <FloatingCardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="gemini-key">Gemini API Key</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="gemini-key"
                                type={showKey ? 'text' : 'password'}
                                placeholder="Dán Gemini API Key của bạn vào đây..."
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="shrink-0"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Lưu Key
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Bạn có thể lấy API Key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.
                    </p>
                </div>

                <div className="bg-blue-500/5 rounded-lg p-3 text-xs space-y-1 border border-blue-500/10">
                    <p className="font-medium text-blue-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Trí tuệ nhân tạo sẽ giúp:
                    </p>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                        <li>Tóm tắt nội dung cuộc trò chuyện ngắn gọn.</li>
                        <li>Phân loại Lead dựa trên thái độ và nhu cầu.</li>
                        <li>Gợi ý câu trả lời phù hợp để chốt đơn nhanh hơn.</li>
                    </ul>
                </div>
            </FloatingCardContent>
        </FloatingCard>
    );
}
