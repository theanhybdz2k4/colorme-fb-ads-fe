import { useState } from 'react';
import { toast } from 'sonner';
import { useCronSettings, useCreateCronSetting, useUpdateCronSetting, useDeleteCronSetting, useEstimatedApiCalls } from '@/hooks/useCronSettings';
import { CRON_TYPES, HOURS, type CronType } from '@/types/settings.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    PageHeader,
    FloatingCard,
    FloatingCardHeader,
    FloatingCardTitle,
    FloatingCardContent,
    LoadingState,
} from '@/components/custom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Settings, Clock, Zap, Save, X, AlertTriangle, Plus, Check } from 'lucide-react';
import { UserBotSettingsSection } from './sections/UserBotSettingsSection';

export function CronSettingsPage() {
    const { data, isLoading, error } = useCronSettings();
    const { data: estimateData, isLoading: isLoadingEstimate } = useEstimatedApiCalls();
    const createMutation = useCreateCronSetting();
    const updateMutation = useUpdateCronSetting();
    const deleteMutation = useDeleteCronSetting();

    const [editingType, setEditingType] = useState<CronType | null>(null);
    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [enabled, setEnabled] = useState(true);

    // Safe access to settings array
    const settings = data?.settings || [];

    const openEditDialog = (cronType: CronType) => {
        const existing = settings.find((s) => s.cronType === cronType);
        setEditingType(cronType);
        setSelectedHours(existing?.allowedHours || [7, 12, 18]);
        setEnabled(existing?.enabled ?? true);
    };

    const handleSave = async () => {
        if (!editingType) return;

        try {
            // Backend đã hỗ trợ upsert, luôn dùng create mutation
            await createMutation.mutateAsync({
                cronType: editingType,
                allowedHours: selectedHours,
                enabled,
            });

            // Đợi một chút để đảm bảo query được refetch và UI update
            await new Promise(resolve => setTimeout(resolve, 200));

            toast.success('Đã lưu cài đặt cron');
            setEditingType(null);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Lỗi khi lưu cài đặt';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (cronType: string) => {
        try {
            await deleteMutation.mutateAsync(cronType);
            toast.success('Đã xóa cài đặt cron');
        } catch {
            toast.error('Lỗi khi xóa cài đặt');
        }
    };

    const toggleHour = (hour: number) => {
        setSelectedHours((prev) =>
            prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour].sort((a, b) => a - b)
        );
    };

    const getSettingForType = (cronType: CronType) => {
        return settings.find((s) => s.cronType === cronType);
    };

    // Use estimate from API
    const estimate = estimateData
        ? {
            total: estimateData.totalCalls,
            warning: estimateData.warning,
        }
        : { total: 0, warning: undefined };

    if (isLoading) {
        return <LoadingState text="Đang tải cài đặt..." />;
    }

    // Handle API error (e.g., migration not run yet)
    if (error) {
        return (
            <div className="space-y-6 animate-float-up">
                <PageHeader
                    title="Cron Settings"
                    description="Cài đặt lịch sync dữ liệu tự động qua n8n"
                />
                <FloatingCard className="border-red-500/50 bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                            <p className="font-medium text-red-500">Lỗi tải cài đặt</p>
                            <p className="text-sm text-muted-foreground">
                                Backend chưa sẵn sàng. Hãy chạy migration: <code className="bg-muted px-1 rounded">npx prisma migrate dev</code>
                            </p>
                        </div>
                    </div>
                </FloatingCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-float-up">
            <PageHeader
                title="Cron Settings"
                description="Cài đặt lịch sync dữ liệu tự động qua n8n"
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>{data?.adAccountCount || 0} ad accounts</span>
                </div>
            </PageHeader>

            {/* Warning Card */}
            {!isLoadingEstimate && estimate.warning && (
                <FloatingCard className="border-yellow-500/50 bg-yellow-500/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                            <p className="font-medium text-yellow-500">Cảnh báo quota</p>
                            <p className="text-sm text-muted-foreground">{estimate.warning}</p>
                        </div>
                    </div>
                </FloatingCard>
            )}

            {/* Cron Types Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {CRON_TYPES.map((type) => {
                    const setting = getSettingForType(type.value);
                    const isConfigured = !!setting;

                    return (
                        <FloatingCard key={type.value} className="relative">
                            <FloatingCardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <FloatingCardTitle className="text-base flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-primary" />
                                        {type.label}
                                    </FloatingCardTitle>
                                    {isConfigured && (
                                        <Badge variant={setting.enabled ? 'default' : 'secondary'}>
                                            {setting.enabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {type.description}
                                </p>
                            </FloatingCardHeader>
                            <FloatingCardContent className="pt-2">
                                {isConfigured ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Giờ sync:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {setting.allowedHours.map((hour) => (
                                                <Badge key={hour} variant="outline" className="text-xs">
                                                    {hour.toString().padStart(2, '0')}:00
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditDialog(type.value)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(type.value)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => openEditDialog(type.value)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thiết lập
                                    </Button>
                                )}
                            </FloatingCardContent>
                        </FloatingCard>
                    );
                })}
            </div>

            {/* User Bot Settings */}
            <UserBotSettingsSection />

            {/* Edit Dialog */}
            <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Cài đặt {CRON_TYPES.find((t) => t.value === editingType)?.label}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between">
                            <Label>Bật tự động sync</Label>
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
                            <Label>Chọn giờ sync (Vietnam timezone)</Label>
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
                        <Button variant="outline" onClick={() => setEditingType(null)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
