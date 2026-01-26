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
                return data.result || data.data || data;
            } catch (err) {
                // If it's a 401, apiClient handles refresh. If it fails there, we clear.
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
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            queryClient.setQueryData(['auth-me'], data.user);
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
