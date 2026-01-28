import { useState } from 'react';
import { toast } from 'sonner';
import {
    useUserTelegramBots,
    useUpsertUserTelegramBot,
    useDeleteUserTelegramBot,
    useUpsertBotSettings,
    useTestBotMessage,
    useRegisterWebhook,
    useWebhookInfo,
} from '@/hooks/useCronSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
} from '@/components/custom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Bot, Plus, Trash2, Loader2, ExternalLink, Users, Clock, Save, Check, Send, Globe, AlertCircle } from 'lucide-react';
import { HOURS } from '@/types/settings.types';

export function UserBotSettingsSection() {
    const { data, isLoading, error } = useUserTelegramBots();
    const upsertMutation = useUpsertUserTelegramBot();
    const deleteMutation = useDeleteUserTelegramBot();
    const upsertSettingsMutation = useUpsertBotSettings();
    const testMessageMutation = useTestBotMessage();
    const registerWebhookMutation = useRegisterWebhook();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingBotId, setEditingBotId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        botToken: '',
        botName: '',
    });
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [enabled, setEnabled] = useState(true);

    const handleSave = async () => {
        if (!formData.botToken.trim()) {
            toast.error('Vui lòng nhập Bot Token');
            return;
        }

        try {
            const result = await upsertMutation.mutateAsync({
                botToken: formData.botToken.trim(),
                botName: formData.botName.trim() || undefined,
            });
            
            if (result.success && result.telegramLink) {
                toast.success(
                    <div>
                        <p className="font-semibold">Đã thêm bot thành công!</p>
                        <a 
                            href={result.telegramLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                        >
                            Mở bot trên Telegram →
                        </a>
                    </div>
                );
            } else if (result.error) {
                toast.error(result.error);
                return;
            }
            
            setShowAddDialog(false);
            setFormData({ botToken: '', botName: '' });
        } catch {
            toast.error('Lỗi khi lưu bot');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Đã xóa bot');
        } catch {
            toast.error('Lỗi khi xóa bot');
        }
    };

    const openSettingsDialog = (botId: number) => {
        setEditingBotId(botId);
        // Load existing settings if available
        const bot = bots.find((b: any) => b.id === botId);
        if (bot?.notificationSettings) {
            setSelectedHours(bot.notificationSettings.allowedHours || [7, 12, 18]);
            setEnabled(bot.notificationSettings.enabled ?? true);
        } else {
            setSelectedHours([7, 12, 18]);
            setEnabled(true);
        }
    };

    const toggleHour = (hour: number) => {
        if (selectedHours.includes(hour)) {
            setSelectedHours(selectedHours.filter((h) => h !== hour));
        } else {
            setSelectedHours([...selectedHours, hour].sort((a, b) => a - b));
        }
    };

    const handleSaveSettings = async () => {
        if (!editingBotId) return;

        try {
            await upsertSettingsMutation.mutateAsync({
                botId: editingBotId,
                dto: {
                    allowedHours: selectedHours,
                    enabled,
                },
            });
            toast.success('Đã lưu thiết lập giờ gửi');
            setEditingBotId(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Lỗi khi lưu thiết lập';
            toast.error(errorMessage);
        }
    };

    const handleTestMessage = async (e: React.MouseEvent, botId: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const result = await testMessageMutation.mutateAsync(botId);
            if (result.success) {
                toast.success(`Đã gửi test message đến ${result.subscriberCount} người`);
            } else {
                toast.error('Không thể gửi test message');
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Lỗi khi gửi test message';
            toast.error(errorMessage);
        }
    };

    const handleRegisterWebhook = async (e: React.MouseEvent, botId: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const result = await registerWebhookMutation.mutateAsync(botId);
            if (result.success) {
                toast.success('Đã đăng ký Webhook thành công!');
            } else {
                toast.error(`Lỗi: ${result.message || 'Không thể đăng ký Webhook'}`);
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Lỗi khi đăng ký Webhook';
            toast.error(errorMessage);
        }
    };

    const bots = data?.bots || [];

    if (error) {
        return null;
    }

    return (
        <>
            <FloatingCard>
                <FloatingCardHeader>
                    <div className="flex items-center justify-between">
                        <FloatingCardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-500" />
                            Cấu hình Bot Telegram
                        </FloatingCardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddDialog(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm Bot
                        </Button>
                    </div>
                </FloatingCardHeader>
                <FloatingCardContent className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải...
                        </div>
                    ) : bots.length > 0 ? (
                        bots.map((bot: any) => (
                            <div
                                key={bot.id}
                                className="p-4 bg-muted/30 rounded-lg space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4 text-purple-500" />
                                        <span className="font-medium">
                                            {bot.botName || bot.bot_name || 'Unnamed Bot'}
                                        </span>
                                        {bot.adAccount ? (
                                            <Badge variant="outline" className="text-xs">
                                                {bot.adAccount.name}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">
                                                Tất cả accounts
                                            </Badge>
                                        )}
                                        {bot.notificationSettings && (
                                            <Badge variant={bot.notificationSettings.enabled ? 'default' : 'secondary'} className="text-xs">
                                                {bot.notificationSettings.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        )}
                                        <WebhookStatusBadge botId={bot.id} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => handleTestMessage(e, bot.id)}
                                            disabled={testMessageMutation.isPending}
                                        >
                                            <Send className="h-4 w-4 mr-1" />
                                            Test
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openSettingsDialog(bot.id);
                                            }}
                                        >
                                            <Clock className="h-4 w-4 mr-1" />
                                        </Button>
                                        <WebhookActionButton 
                                            botId={bot.id} 
                                            onRegister={(e) => handleRegisterWebhook(e, bot.id)}
                                            isRegistering={registerWebhookMutation.isPending}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(bot.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Notification Settings Display */}
                                {bot.notificationSettings && bot.notificationSettings.enabled && (
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">Giờ gửi:</span>{' '}
                                        {bot.notificationSettings.allowedHours.length > 0
                                            ? bot.notificationSettings.allowedHours
                                                  .map((h: number) => `${h.toString().padStart(2, '0')}:00`)
                                                  .join(', ')
                                            : 'Chưa thiết lập'}
                                    </div>
                                )}
                                
                                {/* t.me Link */}
                                {bot.telegramLink && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={bot.telegramLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {bot.telegramLink}
                                        </a>
                                    </div>
                                )}

                                {/* Subscriber Count */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {bot.activeSubscribers || bot.active_subscribers || 0} người đang nhận thông báo
                                            {(bot.subscriberCount || bot.subscriber_count) > 0 && ` / ${bot.subscriberCount || bot.subscriber_count} đã đăng ký`}
                                        </span>
                                    </div>
                                </div>


                                <p className="text-xs text-muted-foreground">
                                    Chia sẻ link cho team để họ bấm /start → /subscribe
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Chưa có bot nào. Thêm bot để nhận thông báo qua Telegram.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tạo bot tại{' '}
                                <a
                                    href="https://t.me/BotFather"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    @BotFather
                                </a>
                            </p>
                        </div>
                    )}
                </FloatingCardContent>
            </FloatingCard>

            {/* Add Bot Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-500" />
                            Thêm Bot Telegram
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Bot Token *</Label>
                            <Input
                                placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                                value={formData.botToken}
                                onChange={(e) =>
                                    setFormData({ ...formData, botToken: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Lấy từ{' '}
                                <a
                                    href="https://t.me/BotFather"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    @BotFather
                                </a>
                                {' '}trên Telegram
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Tên hiển thị (tuỳ chọn)</Label>
                            <Input
                                placeholder="My Ads Bot"
                                value={formData.botName}
                                onChange={(e) =>
                                    setFormData({ ...formData, botName: e.target.value })
                                }
                            />
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                            <p className="font-medium">📌 Hướng dẫn:</p>
                            <ol className="list-decimal pl-4 text-muted-foreground space-y-1">
                                <li>Tạo bot từ @BotFather</li>
                                <li>Copy token và dán vào đây</li>
                                <li>Chia sẻ link bot cho team</li>
                                <li>Mỗi người bấm /subscribe để nhận thông báo</li>
                            </ol>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                            {upsertMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Thêm Bot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bot Notification Settings Dialog */}
            <Dialog open={!!editingBotId} onOpenChange={() => setEditingBotId(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Thiết lập giờ gửi thông báo
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between">
                            <Label>Bật gửi thông báo</Label>
                            <Button
                                variant={enabled ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setEnabled(!enabled)}
                            >
                                {enabled ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Enabled
                                    </>
                                ) : (
                                    'Disabled'
                                )}
                            </Button>
                        </div>

                        {/* Hour Selection */}
                        <div className="space-y-2">
                            <Label>Chọn giờ gửi thông báo (Vietnam timezone)</Label>
                            <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-muted/20">
                                {HOURS.map((hour) => (
                                    <Button
                                        key={hour.value}
                                        variant={selectedHours.includes(hour.value) ? 'default' : 'ghost'}
                                        size="sm"
                                        className="text-xs h-8"
                                        onClick={() => toggleHour(hour.value)}
                                    >
                                        {hour.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Select */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedHours([7, 12, 18])}
                            >
                                3 lần/ngày
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedHours([0, 6, 12, 18])}
                            >
                                4 lần/ngày
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedHours(Array.from({ length: 24 }, (_, i) => i))}
                            >
                                Mỗi giờ
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedHours([])}
                            >
                                Xóa hết
                            </Button>
                        </div>

                        {/* Selected hours summary */}
                        <div className="text-sm text-muted-foreground">
                            Đã chọn <span className="font-medium text-foreground">{selectedHours.length}</span> giờ
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingBotId(null)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={upsertSettingsMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {upsertSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function WebhookStatusBadge({ botId }: { botId: number }) {
    const { data, isLoading } = useWebhookInfo(botId);

    if (isLoading) return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;

    if (data?.isRegistered) {
        return (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] py-0 h-4">
                <Check className="h-2 w-2 mr-1" /> Webhook OK
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] py-0 h-4">
            <AlertCircle className="h-2 w-2 mr-1" /> Webhook Chưa Đăng Ký
        </Badge>
    );
}

function WebhookActionButton({ botId, onRegister, isRegistering }: { botId: number, onRegister: (e: React.MouseEvent) => void, isRegistering: boolean }) {
    const { data, isLoading } = useWebhookInfo(botId);

    if (isLoading) return null;

    if (!data?.isRegistered) {
        return (
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRegister}
                disabled={isRegistering}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
            >
                <Globe className="h-4 w-4 mr-1" />
                Đăng ký Backend
            </Button>
        );
    }

    // If registered, show info button (or just hide the register button)
    return (
        <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-default opacity-70 bg-green-500/5 text-green-500 border-green-500/20"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Webhook Details:', data.result);
                toast.info(`Webhook URL: ${data.result?.url?.substring(0, 40)}...`, {
                    description: `Pending updates: ${data.result?.pending_update_count}`
                });
            }}
        >
            <Globe className="h-4 w-4 mr-1" />
            Webhook Info
        </Button>
    );
}
