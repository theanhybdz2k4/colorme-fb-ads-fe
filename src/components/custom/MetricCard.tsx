import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType | React.ReactNode;
  trend?: { value: number; isPositive: boolean; label: string };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  status?: 'excellent' | 'good' | 'poor';
  chart?: 'line' | 'bar' | 'area';
}

import { isValidElement } from 'react';
// ... existing imports

// ... existing interface

export function MetricCard({ title, value, subtitle, icon, trend, color, status, chart }: MetricCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-100/50', text: 'text-blue-500', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-green-100/50', text: 'text-green-500', gradient: 'from-green-500 to-emerald-600' },
    purple: { bg: 'bg-purple-100/50', text: 'text-purple-500', gradient: 'from-purple-500 to-purple-600' },
    orange: { bg: 'bg-orange-100/50', text: 'text-orange-500', gradient: 'from-orange-500 to-orange-600' },
    red: { bg: 'bg-red-100/50', text: 'text-red-500', gradient: 'from-red-500 to-red-600' },
  };

  const statusClasses = {
    excellent: 'ring-1 ring-green-500/50 shadow-lg shadow-green-500/10',
    good: 'ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/10',
    poor: 'ring-1 ring-red-500/50 shadow-lg shadow-red-500/10',
  };

  const colors = colorClasses[color];

  // Simple mini chart data
  const chartData = chart === 'bar' 
    ? [60, 45, 70, 55, 80, 65, 90] 
    : chart === 'area'
    ? [40, 65, 55, 75, 60, 85, 70]
    : [50, 60, 55, 70, 65, 80, 75];

  // Determine if icon is a component (function or forwardRef object) rather than a rendered element
  const isIconComponent = !isValidElement(icon) && (typeof icon === 'function' || (typeof icon === 'object' && icon !== null));
  const IconComponent = isIconComponent ? (icon as React.ElementType) : null;

  return (
    <div className={`bg-card rounded-2xl border border-border/50 p-6 hover:shadow-xl transition-all duration-300 group ${status ? statusClasses[status] : 'hover:border-primary/20'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${colors.bg} rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          {IconComponent ? <IconComponent className={`w-6 h-6 ${colors.text}`} /> : (icon as React.ReactNode)}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
            trend.isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1 font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Mini Chart */}
      {chart && (
        <div className="flex items-end gap-1 h-12">
          {chartData.map((height, i) => (
            <div
              key={i}
              className={`flex-1 bg-linear-to-t ${colors.gradient} rounded-t opacity-20 group-hover:opacity-40 transition-opacity`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}

      {trend && (
        <p className="text-[10px] text-muted-foreground mt-2">{trend.label}</p>
      )}
    </div>
  );
}
