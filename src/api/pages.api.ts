import { apiClient } from '@/lib/apiClient';

export interface FBPage {
    id: string;
    name: string;
    access_token: string | null;
    last_synced_at: string | null;
}

export const pagesApi = {
    getPages: async (): Promise<FBPage[]> => {
        const { data } = await apiClient.get('/leads/pages');
        return data.result || [];
    },

    syncPages: async (): Promise<FBPage[]> => {
        const { data } = await apiClient.post('/leads/pages/sync');
        return data.result || [];
    },

    updatePageToken: async (pageId: string, accessToken: string): Promise<FBPage> => {
        const { data } = await apiClient.put(`/leads/pages/${pageId}`, {
            access_token: accessToken
        });
        if (!data.success) throw new Error(data.error);
        return data.result;
    }
};

