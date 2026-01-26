import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '@/api/insights.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export function HourlyInsightsDialog({
    adId,
    adName,
    open,
    onOpenChange,
    initialDate,
}: {
    adId: string;
    adName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: Date;
}) {
    const [date, setDate] = useState<Date>(initialDate || new Date());

    const { data: insights, isLoading } = useQuery({
        queryKey: ['hourly-insights', adId, date],
        queryFn: async () => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const { data } = await insightsApi.getAdHourly(adId, dateStr);
            // Normalize array or object structure
            const result = data.result || data.data || data || [];
            // Ensure result is array
            return (Array.isArray(result) ? result : result.data || []) as any[];
        },
        enabled: open && !!adId,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Hourly Insights - {adName}</DialogTitle>
                </DialogHeader>

                <div className="flex justify-end mb-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-60 pl-3 text-left font-normal"
                            >
                                <span>{date ? format(date, "PPP", { locale: vi }) : <span>Pick a date</span>}</span>
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !insights || insights.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No data for this date
                    </div>
                ) : (
                    <div className="space-y-8">
                        <ChartSection title="Spend vs Results" data={insights} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ChartSection({ title, data }: { title: string, data: any[] }) {
    return (
        <div className="h-80 w-full mb-8">
            <h4 className="text-sm font-medium mb-4">{title}</h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResults" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" tickFormatter={(val) => `${val}h`} />
                    <YAxis yAxisId="left" tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)} />
                    <YAxis yAxisId="right" orientation="right" />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.1} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                        labelFormatter={(val) => `${val}:00 - ${val}:59`}
                        formatter={(value: any, name: any) => [
                            name === 'Spend' ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : value,
                            name
                        ]}
                    />
                    <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" yAxisId="left" name="Spend" />
                    <Area type="monotone" dataKey="results" stroke="#22c55e" fillOpacity={1} fill="url(#colorResults)" yAxisId="right" name="Results" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
