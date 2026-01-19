import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/api/branches.api';
import type { BranchSummary } from '@/types/adAccounts.types';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await branchesApi.list();
      // API /branches trả về danh sách branches; ưu tiên field result/data nếu có
      const list = (data.result || data.data || data || []) as Array<
        BranchSummary & { _count?: { adAccounts?: number } }
      >;

      return list.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code ?? null,
      })) as BranchSummary[];
    },
  });
}


