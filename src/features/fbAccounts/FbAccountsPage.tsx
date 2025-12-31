import { useState } from 'react';
import { useFbAccounts, useAddFbAccount, useSyncFbAccount, useDeleteFbAccount } from './useFbAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import {
  PageHeader,
  FloatingCard,
  LoadingPage,
  EmptyState,
} from '@/components/custom';

export function FbAccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [newName, setNewName] = useState('');

  const { data, isLoading } = useFbAccounts();
  const addMutation = useAddFbAccount();
  const syncMutation = useSyncFbAccount();
  const deleteMutation = useDeleteFbAccount();

  const handleAdd = () => {
    if (!newToken.trim()) {
      toast.error('Vui lòng nhập token');
      return;
    }
    addMutation.mutate(
      { accessToken: newToken, name: newName || undefined },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewToken('');
          setNewName('');
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* Header */}
      <PageHeader
        title="Tài khoản Facebook"
        description="Quản lý các tài khoản Facebook Ads của bạn"
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
              <DialogTitle>Thêm tài khoản Facebook</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Nhập access token từ Facebook để kết nối tài khoản
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-muted-foreground">Tên tài khoản (tùy chọn)</Label>
                <Input
                  id="name"
                  placeholder="VD: Nick FB chính"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm text-muted-foreground">Access Token</Label>
                <Input
                  id="token"
                  placeholder="EAAxxxxxx..."
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="bg-muted/30 border-border/50">
                Hủy
              </Button>
              <Button onClick={handleAdd} disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Đang thêm...' : 'Thêm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Content */}
      {data?.length === 0 ? (
        <FloatingCard>
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Chưa có tài khoản Facebook nào"
            description="Thêm tài khoản để bắt đầu quản lý quảng cáo"
            action={{
              label: 'Thêm tài khoản đầu tiên',
              onClick: () => setIsAddDialogOpen(true),
            }}
          />
        </FloatingCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((account) => (
            <FloatingCard key={account.id} padding="none">
              {/* Card Header */}
              <div className="p-4 border-b border-border/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium text-foreground">
                      {account.name || `Facebook #${account.id}`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {account.fbUserId ? `ID: ${account.fbUserId}` : 'Chưa xác định'}
                    </p>
                  </div>
                  <Badge variant={account.isValid ? 'default' : 'destructive'}>
                    {account.isValid ? 'Hoạt động' : 'Lỗi'}
                  </Badge>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ad Accounts:</span>
                  <span className="font-medium text-foreground">{account._count.adAccounts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens:</span>
                  <span className="font-medium text-foreground">{account._count.tokens}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-muted/30 border-border/50 hover:bg-muted/50"
                    onClick={() => syncMutation.mutate(account.id)}
                    disabled={syncMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {syncMutation.isPending ? 'Syncing...' : 'Sync'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
                        deleteMutation.mutate(account.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>
      )}
    </div>
  );
}
