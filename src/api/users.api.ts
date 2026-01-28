
import { apiClient } from '@/lib/apiClient';

export const usersApi = {
    list: () => apiClient.get('/auth/users'),
};
