import React from 'react';
import { AnimatedNumber } from '../../components/shared/AnimatedNumber';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  accent?: string; // hex colour for the icon bg tint
  trend?: string;
  trendPositive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  accent = '#FF7A10',
  trend,
  trendPositive = true,
}) => {
  const tintBg = `${accent}14`;   // ~8% opacity
  const tintText = accent;

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#555754] uppercase tracking-wider">{title}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: tintBg }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: tintText }} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black text-[#1F221D] tracking-tight leading-none">
          {title.includes('Occupied') ? (
            <span>{value}<span className="text-base font-semibold text-[#555754]">/12</span></span>
          ) : (
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          )}
        </h3>
        {trend && (
          <span
            className="text-[11px] font-semibold mt-0.5"
            style={{ color: trendPositive ? '#2E7D32' : '#C62828' }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
