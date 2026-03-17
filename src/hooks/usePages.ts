import { useQuery } from '@tanstack/react-query';
import { pagesApi, type FBPage } from '@/api/pages.api';

const KEYS = {
    pages: ['pages'],
};

export function usePages() {
    return useQuery({
        queryKey: KEYS.pages,
        queryFn: async () => {
            const pages = await pagesApi.getPages();
            return pages as FBPage[];
        },
    });
}
