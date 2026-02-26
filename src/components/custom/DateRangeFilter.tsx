"use client"

import { useState, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from './DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { isSameDay, startOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

interface DateRangeFilterProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    onPresetChange?: (preset: string | null) => void;
    activePreset?: string | null;
    className?: string;
    showLabel?: boolean;
}

export function DateRangeFilter({
    dateRange: propDateRange,
    setDateRange: propSetDateRange,
    onPresetChange,
    activePreset: propActivePreset,
    className,
    showLabel = true
}: DateRangeFilterProps) {
    const [internalActivePreset, setInternalActivePreset] = useState<string | null>(null);

    // Controlled temp state for "Apply" button
    const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(propDateRange);
    const [tempActivePreset, setTempActivePreset] = useState<string | null>(null);

    // Update temp state when props change (initial load or external reset)
    useMemo(() => {
        setTempDateRange(propDateRange);
    }, [propDateRange]);

    useMemo(() => {
        const active = propActivePreset !== undefined ? propActivePreset : internalActivePreset;
        setTempActivePreset(active);
    }, [propActivePreset, internalActivePreset]);

    // Auto-detect preset based on date range (using temp range for the UI highlights)
    const detectedPreset = useMemo(() => {
        if (!tempDateRange?.from || !tempDateRange?.to) return null;

        const today = startOfDay(new Date());
        const from = startOfDay(tempDateRange.from);
        const to = startOfDay(tempDateRange.to);

        // Today
        if (isSameDay(from, today) && isSameDay(to, today)) return 'today';

        // Yesterday
        const yesterday = subDays(today, 1);
        if (isSameDay(from, yesterday) && isSameDay(to, yesterday)) return 'yesterday';

        // 3 days
        const threeDaysAgo = subDays(today, 2);
        if (isSameDay(from, threeDaysAgo) && isSameDay(to, today)) return '3days';

        // 7 days
        const sevenDaysAgo = subDays(today, 6);
        if (isSameDay(from, sevenDaysAgo) && isSameDay(to, today)) return '7days';

        // This month
        const firstDayOfMonth = startOfMonth(today);
        if (isSameDay(from, firstDayOfMonth) && isSameDay(to, today)) return 'thisMonth';

        // Last month
        const lastMonth = subMonths(today, 1);
        const firstDayLastMonth = startOfMonth(lastMonth);
        const lastDayLastMonth = endOfMonth(lastMonth);
        if (isSameDay(from, firstDayLastMonth) && isSameDay(to, lastDayLastMonth)) return 'lastMonth';

        return null;
    }, [tempDateRange]);

    const activePreset = tempActivePreset ?? detectedPreset;

    const handlePresetClick = (preset: string, from: Date, to: Date) => {
        setTempDateRange({ from, to });
        setTempActivePreset(preset);
    };

    const handleApply = () => {
        propSetDateRange(tempDateRange);
        if (onPresetChange) {
            onPresetChange(tempActivePreset);
        } else {
            setInternalActivePreset(tempActivePreset);
        }
    };

    const hasChanges = useMemo(() => {
        if (!tempDateRange || !propDateRange) return tempDateRange !== propDateRange;
        return !isSameDay(tempDateRange.from || new Date(0), propDateRange.from || new Date(0)) ||
            !isSameDay(tempDateRange.to || new Date(0), propDateRange.to || new Date(0));
    }, [tempDateRange, propDateRange]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className={cn("flex flex-wrap gap-4 items-end", className)}>
            <div className="space-y-2">
                {showLabel && <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Khoảng thời gian</Label>}
                <DatePickerWithRange
                    date={tempDateRange}
                    setDate={(range) => {
                        setTempDateRange(range);
                        setTempActivePreset(null);
                    }}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activePreset === 'today' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => handlePresetClick('today', today, today)}
                >
                    Hôm nay
                </Button>
                <Button
                    variant={activePreset === 'yesterday' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => {
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        handlePresetClick('yesterday', yesterday, yesterday);
                    }}
                >
                    Hôm qua
                </Button>
                <Button
                    variant={activePreset === '3days' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => {
                        const threeDaysAgo = new Date(today);
                        threeDaysAgo.setDate(today.getDate() - 2);
                        handlePresetClick('3days', threeDaysAgo, today);
                    }}
                >
                    3 ngày
                </Button>
                <Button
                    variant={activePreset === '7days' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => {
                        const sevenDaysAgo = new Date(today);
                        sevenDaysAgo.setDate(today.getDate() - 6);
                        handlePresetClick('7days', sevenDaysAgo, today);
                    }}
                >
                    7 ngày
                </Button>
                <Button
                    variant={activePreset === 'thisMonth' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => {
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        handlePresetClick('thisMonth', firstDayOfMonth, today);
                    }}
                >
                    Tháng này
                </Button>
                <Button
                    variant={activePreset === 'lastMonth' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-4 transition-all"
                    onClick={() => {
                        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                        handlePresetClick('lastMonth', firstDayLastMonth, lastDayLastMonth);
                    }}
                >
                    Tháng trước
                </Button>
            </div>

            <Button
                variant="default"
                className={cn(
                    "h-9 px-6 font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-95",
                    !hasChanges && "opacity-50 pointer-events-none grayscale"
                )}
                onClick={handleApply}
            >
                Áp dụng
            </Button>
        </div>
    );
}
