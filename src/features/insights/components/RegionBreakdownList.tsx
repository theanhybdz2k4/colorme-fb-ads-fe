
import { PerformanceList, PerformanceItem } from '@/components/shared/common';
import { formatCurrency, formatNumber } from '@/lib/format';

interface RegionStats {
    region: string;
    country: string;
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
}

interface Props {
    data: RegionStats[];
    loading?: boolean;
}

export function RegionBreakdownList({ data, loading }: Props) {
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-64 bg-b-surface2 rounded-xl" />
            </div>
        );
    }

    // Sort by spend descending
    const sortedData = [...data].sort((a, b) => b.spend - a.spend);
    const maxSpend = sortedData.length > 0 ? sortedData[0].spend : 1;

    return (
        <PerformanceList title="Top Khu vực / Vùng" icon="search">
            {sortedData.length > 0 ? sortedData.map((item, index) => (
                <PerformanceItem
                    key={index}
                    rank={index + 1}
                    title={item.region || 'Unknown'}
                    subtitle={item.country}
                    value={formatCurrency(item.spend)}
                    progress={(item.spend / maxSpend) * 100}
                    secondaryStats={[
                        { label: 'Results', value: formatNumber(item.results ?? 0) },
                        { label: 'Imp', value: formatNumber(item.impressions ?? 0) },
                    ]}
                />
            )) : (
                <div className="h-64 flex items-center justify-center text-t-tertiary text-sm">
                    Chưa có dữ liệu phân tích
                </div>
            )}
        </PerformanceList>
    );
}
