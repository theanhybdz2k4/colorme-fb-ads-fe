import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fbAccountsApi } from '@/api/fbAccounts.api';
import type { FbAccount } from '@/types/fbAccounts.types';
import { toast } from 'sonner';

export function useFbAccounts() {
  return useQuery({
    queryKey: ['fb-accounts'],
    queryFn: async () => {
      const { data } = await fbAccountsApi.list();
      return (data.result || data.data || data || []) as FbAccount[];
    },
  });
}

export function useAddFbAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accessToken, name }: { accessToken: string; name?: string }) =>
      fbAccountsApi.add(accessToken, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fb-accounts'] });
      toast.success('Đã thêm tài khoản Facebook');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể thêm tài khoản');
    },
  });
}

export function useSyncFbAccount() {
  const queryClient = useQueryClient();

  return useMutation({
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
}

export function useDeleteFbAccount() {
  const queryClient = useQueryClient();

  return useMutation({
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
}
