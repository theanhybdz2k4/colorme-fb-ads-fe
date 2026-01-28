import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import type { AuthContextType } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    // Check for token existence once at boot
    const hasToken = !!localStorage.getItem('accessToken');

    const { data: user, isLoading: isFetchingUser, refetch } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return null;
            try {
                const { data } = await authApi.getMe();
                // Map backend snake_case to frontend camelCase
                const rawUser = data.result || data.data || data;
                if (!rawUser || typeof rawUser !== 'object') return null;
                return {
                    ...rawUser,
                    avatarUrl: rawUser.avatar_url || rawUser.avatarUrl || null,
                    geminiApiKey: rawUser.gemini_api_key || rawUser.geminiApiKey || null,
                };
            } catch (err) {
                console.error('getMe error:', err);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: hasToken,
    });

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: any) => {
            const { data } = await authApi.login({ email, password });
            return data.result || data.data || data;
        },
        onSuccess: (data) => {
            if (!data) return;
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            const user = data.user ? {
                ...data.user,
                avatarUrl: data.user.avatar_url || data.user.avatarUrl || null,
                geminiApiKey: data.user.gemini_api_key || data.user.geminiApiKey || null,
            } : null;
            queryClient.setQueryData(['auth-me'], user);
        }
    });

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSettled: () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            queryClient.setQueryData(['auth-me'], null);
            queryClient.clear();
        }
    });

    const contextValue = useMemo(() => ({
        user: user || null,
        // isLoading is now only true if we HAVE a token but haven't finished the first check yet.
        // But for "optimistic" load, we can even set this to false if token exists.
        isLoading: hasToken && isFetchingUser && !user,
        isAuthenticated: hasToken || !!user,
        login: (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
        register: async (email: string, password: string, name?: string) => {
            const { data } = await authApi.register({ email, password, name });
            const result = data.result || data.data || data;
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            await refetch();
        },
        logout: () => logoutMutation.mutateAsync(),
        refreshUser: () => refetch(),
        updateProfile: async (data: any) => {
            const res = await authApi.updateProfile(data);
            return res.data.result || res.data.data || res.data;
        },
        updatePassword: async (data: any) => {
            const res = await authApi.updatePassword(data);
            return res.data.result || res.data.data || res.data;
        },
        uploadAvatar: async (file: File) => {
            const res = await authApi.uploadAvatar(file);
            return res.data.result || res.data.data || res.data;
        },
    }), [user, isFetchingUser, hasToken, loginMutation, logoutMutation, refetch]);

    return (
        <AuthContext.Provider value={contextValue as any}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
