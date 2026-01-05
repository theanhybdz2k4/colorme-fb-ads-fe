import { useState } from 'react';
import { toast } from 'sonner';
import {
    useTelegramChatIds,
    useRefreshTelegramChatIds,
    useAddTelegramChatId,
    useSendTelegramTest,
} from './useCronSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
} from '@/components/custom';
import { Send, RefreshCw, Plus, Users, Loader2, MessageCircle } from 'lucide-react';

export function TelegramSettingsSection() {
    const { data, isLoading, error } = useTelegramChatIds();
    const refreshMutation = useRefreshTelegramChatIds();
    const addMutation = useAddTelegramChatId();
    const testMutation = useSendTelegramTest();

    const [newChatId, setNewChatId] = useState('');

    const handleRefresh = async () => {
        try {
            const result = await refreshMutation.mutateAsync();
            toast.success(`Đã refresh ${result.chatIds?.length || 0} chat IDs`);
        } catch {
            toast.error('Lỗi refresh chat IDs');
        }
    };

    const handleAddChatId = async () => {
        if (!newChatId.trim()) return;
        try {
            await addMutation.mutateAsync(newChatId.trim());
            toast.success('Đã thêm chat ID');
            setNewChatId('');
        } catch {
            toast.error('Lỗi thêm chat ID');
        }
    };

    const handleSendTest = async () => {
        try {
            const result = await testMutation.mutateAsync();
            toast.success(`Đã gửi test tới ${result.subscriberCount} người`);
        } catch {
            toast.error('Lỗi gửi test message');
        }
    };

    const chatIds = data?.chatIds || [];

    if (error) {
        return (
            <FloatingCard className="border-orange-500/50 bg-orange-500/10">
                <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-orange-500" />
                    <div>
                        <p className="font-medium text-orange-500">Telegram chưa cấu hình</p>
                        <p className="text-sm text-muted-foreground">
                            Kiểm tra TELEGRAM_BOT_TOKEN trong .env
                        </p>
                    </div>
                </div>
            </FloatingCard>
        );
    }

    return (
        <FloatingCard>
            <FloatingCardHeader>
                <div className="flex items-center justify-between">
                    <FloatingCardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-500" />
                        Telegram Notifications
                    </FloatingCardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {chatIds.length} subscribers
                        </Badge>
                    </div>
                </div>
            </FloatingCardHeader>
            <FloatingCardContent className="space-y-4">
                {/* Chat IDs List */}
                {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải...
                    </div>
                ) : chatIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {chatIds.map((id) => (
                            <Badge key={id} variant="secondary" className="font-mono text-xs">
                                {id}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Chưa có subscribers. Gửi tin nhắn tới bot Telegram để đăng ký.
                    </p>
                )}

                {/* Add Chat ID */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Nhập Chat ID..."
                        value={newChatId}
                        onChange={(e) => setNewChatId(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        onClick={handleAddChatId}
                        disabled={addMutation.isPending || !newChatId.trim()}
                    >
                        {addMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshMutation.isPending}
                    >
                        {refreshMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh từ Bot
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSendTest}
                        disabled={testMutation.isPending || chatIds.length === 0}
                    >
                        {testMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Gửi Test
                    </Button>
                </div>
            </FloatingCardContent>
        </FloatingCard>
    );
}
