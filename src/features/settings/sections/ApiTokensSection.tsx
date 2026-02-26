import { useState } from 'react';
import { toast } from 'sonner';
import { useApiTokens, useCreateApiToken, useDeleteApiToken } from '@/hooks/useCronSettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { addHours, addDays, addWeeks, addMonths, addYears } from 'date-fns';

const EXPIRATION_OPTIONS = [
    { label: 'Không hết hạn', value: 'none' },
    { label: '1 giờ', value: '1h' },
    { label: '1 ngày', value: '1d' },
    { label: '1 tuần', value: '1w' },
    { label: '1 tháng', value: '1m' },
    { label: '1 năm', value: '1y' },
];
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
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Key,
    Plus,
    Trash2,
    Calendar,
    Copy,
    Check,
    AlertCircle,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';

export function ApiTokensSection() {
    const { data, isLoading } = useApiTokens();
    const createMutation = useCreateApiToken();
    const deleteMutation = useDeleteApiToken();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTokenName, setNewTokenName] = useState('');
    const [expirationPeriod, setExpirationPeriod] = useState('none');
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const tokens = data?.result || [];

    const handleCreateToken = async () => {
        if (!newTokenName) {
            toast.error('Vui lòng nhập tên token');
            return;
        }

        let expiresAt: string | null = null;
        if (expirationPeriod !== 'none') {
            const now = new Date();
            if (expirationPeriod === '1h') expiresAt = addHours(now, 1).toISOString();
            else if (expirationPeriod === '1d') expiresAt = addDays(now, 1).toISOString();
            else if (expirationPeriod === '1w') expiresAt = addWeeks(now, 1).toISOString();
            else if (expirationPeriod === '1m') expiresAt = addMonths(now, 1).toISOString();
            else if (expirationPeriod === '1y') expiresAt = addYears(now, 1).toISOString();
        }

        try {
            const result = await createMutation.mutateAsync({
                name: newTokenName,
                expiresAt,
            });

            if (result.success) {
                setGeneratedToken(result.result.token);
                toast.success('Đã tạo API token thành công');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi tạo token');
        }
    };

    const handleDeleteToken = async (token: string) => {
        if (!confirm('Bạn có chắc chắn muốn xoá token này? Các ứng dụng đang dùng token này sẽ không thể truy cập được nữa.')) return;

        try {
            await deleteMutation.mutateAsync(token);
            toast.success('Đã xoá token');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi xoá token');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Đã sao chép token vào clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setGeneratedToken(null);
        setNewTokenName('');
        setExpirationPeriod('none');
    };

    return (
        <FloatingCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <FloatingCardHeader>
                <div className="flex items-center justify-between">
                    <FloatingCardTitle className="text-xl flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        API Access Tokens
                    </FloatingCardTitle>
                    <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo Token Mới
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý các mã xác thực cho bên thứ ba truy cập API (Leads, Dashboard, v.v.)
                </p>
            </FloatingCardHeader>
            <FloatingCardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground animate-pulse">
                            Đang tải danh sách token...
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
                            <ShieldCheck className="h-10 w-10 text-muted-foreground/50" />
                            <div className="space-y-1">
                                <p className="font-medium">Chưa có API Token nào</p>
                                <p className="text-sm text-muted-foreground">Tạo token để cho phép các ứng dụng bên thứ ba truy cập dữ liệu của bạn.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {tokens.map((token) => (
                                <div
                                    key={token.token}
                                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Key className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                {token.name}
                                                {!token.isActive && <Badge variant="destructive">Inactive</Badge>}
                                                {token.expiresAt && new Date(token.expiresAt) < new Date() && (
                                                    <Badge variant="destructive">Expired</Badge>
                                                )}
                                            </h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    Tạo: {format(new Date(token.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </div>
                                                {token.expiresAt && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        Hết hạn: {format(new Date(token.expiresAt), 'dd/MM/yyyy')}
                                                    </div>
                                                )}
                                                <div className="text-xs font-mono text-primary/70 bg-primary/5 px-2 py-0.5 rounded italic">
                                                    {token.token.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteToken(token.token)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FloatingCardContent>

            {/* Create Token Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
                <DialogContent className="sm:max-w-[500px] border-primary/20 bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Key className="h-5 w-5 text-primary" />
                            {generatedToken ? 'Token Đã Được Tạo' : 'Tạo API Token Mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {generatedToken
                                ? 'Vui lòng sao chép và lưu trữ token này ở nơi an toàn. Bạn sẽ không thể xem lại mã này sau khi đóng cửa sổ này.'
                                : 'Nhập tên và ngày hết hạn để tạo mã truy cập API cho ứng dụng của bạn.'}
                        </DialogDescription>
                    </DialogHeader>

                    {generatedToken ? (
                        <div className="space-y-6 py-4">
                            <div className="relative">
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl font-mono text-sm break-all pr-12 text-primary font-bold shadow-inner">
                                    {generatedToken}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                                    onClick={() => copyToClipboard(generatedToken)}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    <strong>Quan trọng:</strong> Đây là lần duy nhất bạn có thể xem mã này. Nếu làm mất, bạn sẽ phải tạo token mới và cập nhật lại các ứng dụng liên quan.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="token-name">Tên Token (Ví dụ: CRM Integration, Mobile App)</Label>
                                <Input
                                    id="token-name"
                                    placeholder="Nhập tên dễ nhớ..."
                                    value={newTokenName}
                                    onChange={(e) => setNewTokenName(e.target.value)}
                                    className="bg-muted/50 border-primary/10 focus:border-primary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Thời hạn (Hết hạn sau)</Label>
                                <Select value={expirationPeriod} onValueChange={setExpirationPeriod}>
                                    <SelectTrigger id="expiry" className="bg-muted/50 border-primary/10">
                                        <SelectValue placeholder="Chọn thời gian hết hạn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPIRATION_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Các token có ngày hết hạn sẽ tự động bị vô hiệu sau thời gian đã chọn.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {generatedToken ? (
                            <Button onClick={closeCreateModal} className="w-full bg-primary hover:bg-primary/90">
                                Tôi Đã Lưu Token - Đóng
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={closeCreateModal}>Huỷ</Button>
                                <Button
                                    onClick={handleCreateToken}
                                    disabled={createMutation.isPending || !newTokenName}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {createMutation.isPending ? 'Đang tạo...' : 'Xác nhận tạo Token'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FloatingCard>
    );
}
