"use client"

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from './DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    onPresetChange?: (preset: string | null) => void;
    activePreset?: string | null;
    className?: string;
}

export function DateRangeFilter({
    dateRange,
    setDateRange,
    onPresetChange,
    activePreset: propActivePreset,
    className
}: DateRangeFilterProps) {
    const [internalActivePreset, setInternalActivePreset] = useState<string | null>(null);
    const activePreset = propActivePreset !== undefined ? propActivePreset : internalActivePreset;
    const setActivePreset = onPresetChange || setInternalActivePreset;

    const handlePresetClick = (preset: string, from: Date, to: Date) => {
        setDateRange({ from, to });
        setActivePreset(preset);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className={cn("flex flex-wrap gap-4 items-end", className)}>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Khoảng thời gian</Label>
                <DatePickerWithRange
                    date={dateRange}
                    setDate={(range) => {
                        setDateRange(range);
                        setActivePreset(null);
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
        </div>
    );
}
