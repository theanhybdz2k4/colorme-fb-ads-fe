import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlatformIdentity } from '@/types/fbAccounts.types'; // Move types to shared location later
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            // Assuming listIdentities is the generic endpoint
            // Adjust if backend needs changes, but for now we reuse the existing endpoint
            const { data } = await apiClient.get('/accounts/identities');
            const result = data.result || data.data || data || [];
            if (Array.isArray(result)) return result;
            return (result.data || []) as PlatformIdentity[];
        },
    });
}

export function useAddAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ platformCode, accessToken, name }: { platformCode: string; accessToken: string; name?: string }) =>
            apiClient.post('/accounts/connect', { platformCode, token: accessToken, name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Đã thêm tài khoản thành công');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể thêm tài khoản');
        },
    });
}

export function useSyncAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiClient.post(`/accounts/identities/${id}/sync-accounts`),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
            toast.success(`Đã đồng bộ accounts cho ID #${id}`);
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể đồng bộ');
        },
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/accounts/identities/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Đã xóa tài khoản');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Không thể xóa tài khoản');
        },
    });
}
