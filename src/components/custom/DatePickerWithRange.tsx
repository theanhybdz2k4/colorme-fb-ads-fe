"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
    const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>(undefined);

    // Sync tempDate with date when popover opens
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempDate(date);
        }
        setIsOpen(open);
        if (!open) setHoveredDate(undefined);
    };

    const handleApply = () => {
        setDate(tempDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempDate(date);
        setIsOpen(false);
    };

    // Calculate preview range if from is selected but to is not
    const previewRange = React.useMemo(() => {
        if (tempDate?.from && !tempDate.to && hoveredDate) {
            const from = tempDate.from;
            const to = hoveredDate;
            return from < to ? { from, to } : { from: to, to: from };
        }
        return undefined;
    }, [tempDate, hoveredDate]);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal bg-muted/30 border-border/50 hover:bg-muted/50",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col">
                        <Calendar
                            autoFocus
                            mode="range"
                            defaultMonth={tempDate?.from || date?.from}
                            selected={tempDate}
                            onSelect={setTempDate}
                            numberOfMonths={2}
                            onDayPointerEnter={(day) => setHoveredDate(day)}
                            onDayPointerLeave={() => setHoveredDate(undefined)}
                            modifiers={{
                                preview: (date) => {
                                    if (!previewRange) return false;
                                    return date >= previewRange.from && date <= previewRange.to;
                                }
                            }}
                            modifiersClassNames={{
                                preview: "[&_button]:bg-indigo-500/30 [&_button]:text-indigo-200 rounded-none first:rounded-l-md last:rounded-r-md"
                            }}
                        />
                        <div className="flex items-center justify-end gap-2 p-3 border-t border-border/50 bg-muted/20">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                className="h-8 px-3 text-xs"
                            >
                                Hủy
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApply}
                                className="h-8 px-3 text-xs"
                                disabled={!tempDate?.from || !tempDate?.to}
                            >
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
