import { useState, useMemo } from 'react';
import { useAccounts, useAddAccount, useSyncAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { FloatingCard } from '@/components/custom/FloatingCard';
import { LoadingPage } from '@/components/custom/LoadingState';
import { EmptyState } from '@/components/custom/EmptyState';

// Supported platforms configuration
const PLATFORMS = [
    { code: 'facebook', name: 'Facebook', icon: 'F', color: 'bg-blue-100 text-blue-600' },
    { code: 'tiktok', name: 'TikTok', icon: 'T', color: 'bg-black text-white' },
    { code: 'google', name: 'Google', icon: 'G', color: 'bg-red-100 text-red-600' },
];

export function AccountsPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('facebook');
    const [newToken, setNewToken] = useState('');
    const [newName, setNewName] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // State for adding simple token management (placeholder)
    const [isAddingToken, setIsAddingToken] = useState<number | null>(null);
    const [tokenInput, setTokenInput] = useState('');

    const { data, isLoading } = useAccounts();
    const addMutation = useAddAccount();
    const syncMutation = useSyncAccount();
    const deleteMutation = useDeleteAccount();

    const filteredData = useMemo(() => {
        if (activeTab === 'all') return data;
        return data?.filter(account => account.platform?.code === activeTab);
    }, [data, activeTab]);

    const handleAdd = () => {
        if (!newToken.trim()) {
            toast.error('Vui lòng nhập token');
            return;
        }
        addMutation.mutate(
            { platformCode: selectedPlatform, accessToken: newToken, name: newName || undefined },
            {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setNewToken('');
                    setNewName('');
                    setSelectedPlatform('facebook');
                },
            }
        );
    };

    const handleAddToken = (id: number) => {
        // Placeholder logic for adding token to an existing identity
        // In a real implementation, you would call an API endpoint here
        toast.message(`Tính năng thêm token cho ID ${id} đang được phát triển`, {
            description: `Token: ${tokenInput.slice(0, 10)}...`
        });
        setIsAddingToken(null);
        setTokenInput('');
    };

    const getPlatformConfig = (code: string) => {
        return PLATFORMS.find(p => p.code === code) || { name: code, icon: code[0]?.toUpperCase(), color: 'bg-gray-100 text-gray-600' };
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6 animate-float-up">
            {/* Header */}
            <PageHeader
                title="Accounts"
                description="Quản lý các tài khoản kết nối từ nhiều nền tảng"
            >
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm tài khoản
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Thêm tài khoản mới</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Chọn nền tảng và nhập access token để kết nối
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nền tảng</Label>
                                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                    <SelectTrigger className="bg-muted/30 border-border/50">
                                        <SelectValue placeholder="Chọn nền tảng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLATFORMS.map(p => (
                                            <SelectItem key={p.code} value={p.code}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${p.color}`}>
                                                        {p.icon}
                                                    </span>
                                                    {p.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm text-muted-foreground">Tên gợi nhớ (tùy chọn)</Label>
                                <Input
                                    id="name"
                                    placeholder="VD: Nick chính, TK Google Ads..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-muted/30 border-border/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-sm text-muted-foreground">Access Token / API Key</Label>
                                <Input
                                    id="token"
                                    placeholder="Nhập token..."
                                    value={newToken}
                                    onChange={(e) => setNewToken(e.target.value)}
                                    className="bg-muted/30 border-border/50 font-mono text-xs"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="bg-muted/30 border-border/50">
                                Hủy
                            </Button>
                            <Button onClick={handleAdd} disabled={addMutation.isPending}>
                                {addMutation.isPending ? 'Đang thêm...' : 'Kết nối'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Tabs / Filter */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/30 border border-border/50">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    {PLATFORMS.map(p => (
                        <TabsTrigger key={p.code} value={p.code} className="flex items-center gap-2">
                            {p.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Content */}
            {!filteredData?.length ? (
                <EmptyState
                    title={activeTab === 'all' ? "Chưa có tài khoản nào" : `Chưa có tài khoản ${getPlatformConfig(activeTab).name}`}
                    description="Kết nối tài khoản để bắt đầu quản lý"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredData.map((account) => {
                        const config = getPlatformConfig(account.platform?.code);
                        return (
                            <FloatingCard key={account.id}>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${config.color}`}>
                                                {config.icon}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium text-foreground truncate max-w-[150px]" title={account.name || ''}>
                                                    {account.name || 'User'}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate max-w-[150px]" title={account.externalId}>
                                                    {account.externalId}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={account.isValid ? 'default' : 'destructive'}>
                                            {account.isValid ? 'Active' : 'Invalid'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Sub-Accounts</p>
                                            <p className="font-medium">{account._count?.accounts || 0}</p>
                                        </div>
                                        {isAddingToken === account.id ? (
                                            <div className="col-span-2 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                                <Input
                                                    placeholder="Token mới..."
                                                    value={tokenInput}
                                                    onChange={(e) => setTokenInput(e.target.value)}
                                                    className="h-8 text-xs font-mono"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setIsAddingToken(null); setTokenInput(''); }}>Hủy</Button>
                                                    <Button size="sm" className="h-7 px-2" onClick={() => handleAddToken(account.id)}>Lưu</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Platform</p>
                                                <p className="font-medium capitalize flex items-center gap-1">
                                                    {config.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-border/50">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => syncMutation.mutate(account.id)}
                                            disabled={syncMutation.isPending}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                                            Sync
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-primary hover:text-primary hover:bg-primary/10"
                                            onClick={() => setIsAddingToken(account.id)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Token
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
                                                    deleteMutation.mutate(account.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </FloatingCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
