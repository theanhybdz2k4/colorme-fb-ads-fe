"use client"

import * as React from "react"
import { subDays, startOfMonth, subMonths, endOfMonth, format, isSameDay } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard } from "../context/DashboardContext"
import Icon from "@/components/shared/common/Icon"
import { cn } from "@/lib/utils"

const presets = [
    { label: "Hôm nay", getValue: () => ({ from: new Date(), to: new Date() }), id: "today" },
    {
        label: "Hôm qua", getValue: () => {
            const d = subDays(new Date(), 1);
            return { from: d, to: d };
        }, id: "yesterday"
    },
    { label: "7 ngày qua", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }), id: "7days" },
    { label: "30 ngày qua", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }), id: "30days" },
    { label: "Tháng này", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }), id: "thisMonth" },
    {
        label: "Tháng trước", getValue: () => {
            const d = subMonths(new Date(), 1);
            return { from: startOfMonth(d), to: endOfMonth(d) };
        }, id: "lastMonth"
    },
]

export function DateRangeSelector() {
    const { dateRange, setDateRange } = useDashboard()

    const currentPreset = React.useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return null;
        return presets.find(p => {
            const { from, to } = p.getValue();
            return isSameDay(from, dateRange.from!) && isSameDay(to, dateRange.to!);
        });
    }, [dateRange]);

    const label = currentPreset ? currentPreset.label :
        (dateRange?.from && dateRange?.to ?
            `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}` :
            "Chọn khoảng thời gian");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex justify-between items-center min-w-40 max-md:min-w-34 h-12 pl-4 pr-3 border border-s-stroke2 rounded-3xl text-body-2 text-t-primary fill-t-secondary transition-all cursor-pointer hover:border-s-highlight">
                    <div className="truncate">{label}</div>
                    <Icon name="chevron" className="shrink-0 ml-2 fill-inherit transition-transform group-data-[state=open]:rotate-180" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-b-surface2/95 backdrop-blur-md border-s-subtle rounded-2xl shadow-depth p-1">
                {presets.map((preset) => (
                    <DropdownMenuItem
                        key={preset.id}
                        onClick={() => setDateRange(preset.getValue())}
                        className={cn(
                            "flex items-center px-4 py-2.5 text-body-2 font-medium rounded-xl transition-colors cursor-pointer",
                            currentPreset?.id === preset.id ? "bg-primary-01/10 text-primary-01" : "text-t-secondary hover:bg-white/5"
                        )}
                    >
                        {preset.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
