import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidElement } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType | React.ReactNode;
  trend?: { value: number; isPositive: boolean; label: string };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  status?: 'excellent' | 'good' | 'poor';
  chart?: 'line' | 'bar' | 'area';
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, color, status, chart, className }: MetricCardProps) {
  const colorSchemes = {
    blue: {
      bg: 'bg-primary-01/10',
      text: 'text-primary-01',
      gradient: 'from-primary-01 to-primary-01/60',
      label: 'label-gray'
    },
    green: {
      bg: 'bg-primary-02/10',
      text: 'text-primary-02',
      gradient: 'from-primary-02 to-primary-02/60',
      label: 'label-green'
    },
    purple: {
      bg: 'bg-primary-04/10',
      text: 'text-primary-04',
      gradient: 'from-primary-04 to-primary-04/60',
      label: 'label-gray'
    },
    orange: {
      bg: 'bg-primary-05/10',
      text: 'text-primary-05',
      gradient: 'from-primary-05 to-primary-05/60',
      label: 'label-yellow'
    },
    red: {
      bg: 'bg-primary-03/10',
      text: 'text-primary-03',
      gradient: 'from-primary-03 to-primary-03/60',
      label: 'label-red'
    },
  };

  const statusIndicators = {
    excellent: 'label-green',
    good: 'label-yellow',
    poor: 'label-red',
  };

  const scheme = colorSchemes[color];

  // Simple mini chart data
  const chartData = chart === 'bar'
    ? [60, 45, 70, 55, 80, 65, 90]
    : chart === 'area'
      ? [40, 65, 55, 75, 60, 85, 70]
      : [50, 60, 55, 70, 65, 80, 75];

  const isIconComponent = !isValidElement(icon) && (typeof icon === 'function' || (typeof icon === 'object' && icon !== null));
  const IconComponent = isIconComponent ? (icon as React.ElementType) : null;

  return (
    <div className={cn(
      "card relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]",
      className
    )}>
      {/* Background Decor */}
      <div className={cn(
        "absolute -right-4 -top-4 size-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        scheme.bg
      )} />

      <div className="flex items-start justify-between mb-4 relative z-1">
        <div className={cn(
          "p-3 rounded-2xl shadow-depth transition-all duration-300 group-hover:shadow-depth-toggle",
          scheme.bg,
          scheme.text
        )}>
          {IconComponent ? <IconComponent className="size-6" /> : (icon as React.ReactNode)}
        </div>

        {trend && (
          <div className={cn(
            "label",
            trend.isPositive ? "label-green" : "label-red"
          )}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mb-4 relative z-1">
        <h3 className="text-sub-title-1 text-t-secondary mb-1">{title}</h3>
        <p className="text-h4 font-bold tracking-tight text-t-primary">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-caption text-t-tertiary">{subtitle}</span>
          {status && (
            <span className={cn("label py-0 h-4 scale-75 origin-left", statusIndicators[status])}>
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Mini Chart Area */}
      {chart && (
        <div className="flex items-end gap-1 h-14 mt-4 relative z-1">
          {chartData.map((height, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-500 bg-linear-to-t",
                scheme.gradient,
                "opacity-20 group-hover:opacity-40"
              )}
              style={{ height: `${height}%`, transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      )}

      {trend?.label && (
        <p className="text-overline text-t-tertiary mt-2 uppercase tracking-widest">{trend.label}</p>
      )}
    </div>
  );
}

