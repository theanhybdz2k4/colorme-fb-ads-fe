import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fbAccountsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface FbAccount {
    id: number;
    name: string | null;
    fbUserId: string | null;
    isValid: boolean;
    _count: { adAccounts: number; tokens: number };
    tokens: { id: number; name: string; isDefault: boolean; isValid: boolean }[];
}

export function FbAccountsPage() {
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [newName, setNewName] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['fb-accounts'],
        queryFn: async () => {
            const { data } = await fbAccountsApi.list();
            return (data.result || data.data || data || []) as FbAccount[];
        },
    });

    const addMutation = useMutation({
        mutationFn: ({ accessToken, name }: { accessToken: string; name?: string }) =>
            fbAccountsApi.add(accessToken, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fb-accounts'] });
            setIsAddDialogOpen(false);
            setNewToken('');
            setNewName('');
            toast.success('Đã thêm tài khoản Facebook');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể thêm tài khoản');
        },
    });

    const syncMutation = useMutation({
        mutationFn: (id: number) => fbAccountsApi.sync(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['fb-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
            toast.success(`Đã đồng bộ ad accounts cho tài khoản #${id}`);
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể đồng bộ');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => fbAccountsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fb-accounts'] });
            toast.success('Đã xóa tài khoản Facebook');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể xóa tài khoản');
        },
    });

    const handleAdd = () => {
        if (!newToken.trim()) {
            toast.error('Vui lòng nhập token');
            return;
        }
        addMutation.mutate({ accessToken: newToken, name: newName || undefined });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tài khoản Facebook</h1>
                    <p className="text-muted-foreground">Quản lý các tài khoản Facebook Ads của bạn</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Thêm tài khoản</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm tài khoản Facebook</DialogTitle>
                            <DialogDescription>
                                Nhập access token từ Facebook để kết nối tài khoản
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên tài khoản (tùy chọn)</Label>
                                <Input
                                    id="name"
                                    placeholder="VD: Nick FB chính"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="token">Access Token</Label>
                                <Input
                                    id="token"
                                    placeholder="EAAxxxxxx..."
                                    value={newToken}
                                    onChange={(e) => setNewToken(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleAdd} disabled={addMutation.isPending}>
                                {addMutation.isPending ? 'Đang thêm...' : 'Thêm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {data?.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">Chưa có tài khoản Facebook nào</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>+ Thêm tài khoản đầu tiên</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data?.map((account) => (
                        <Card key={account.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {account.name || `Facebook #${account.id}`}
                                        </CardTitle>
                                        <CardDescription>
                                            {account.fbUserId ? `ID: ${account.fbUserId}` : 'Chưa xác định'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={account.isValid ? 'default' : 'destructive'}>
                                        {account.isValid ? 'Hoạt động' : 'Lỗi'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Ad Accounts:</span>
                                        <span className="font-medium">{account._count.adAccounts}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tokens:</span>
                                        <span className="font-medium">{account._count.tokens}</span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => syncMutation.mutate(account.id)}
                                            disabled={syncMutation.isPending}
                                        >
                                            {syncMutation.isPending ? 'Đang sync...' : 'Sync'}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
                                                    deleteMutation.mutate(account.id);
                                                }
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
