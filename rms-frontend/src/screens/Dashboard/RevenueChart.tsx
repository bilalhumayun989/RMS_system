import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { day: 'Mon', revenue: 3200, orders: 18 },
  { day: 'Tue', revenue: 4100, orders: 24 },
  { day: 'Wed', revenue: 2800, orders: 15 },
  { day: 'Thu', revenue: 3900, orders: 22 },
  { day: 'Fri', revenue: 4850, orders: 29 },
  { day: 'Sat', revenue: 5800, orders: 35 },
  { day: 'Sun', revenue: 5400, orders: 31 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#1F221D]/12 rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(31,34,29,0.10)]">
      <p className="text-xs font-bold text-[#1F221D] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.dataKey === 'revenue' ? `$${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export const RevenueChart: React.FC = () => {
  const weekTotal = data.reduce((s, d) => s + d.revenue, 0);
  const weekOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-black text-[#1F221D]">Weekly Revenue</h3>
          <p className="text-xs text-[#555754] mt-0.5">Revenue trend over the last 7 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-black text-[#1F221D]">${weekTotal.toLocaleString()}</p>
            <p className="text-[11px] text-[#555754]">{weekOrders} orders this week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#FF7A10]" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7A10" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#FF7A10" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(31,34,29,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#55575440"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#555754', fontWeight: 600 }}
            />
            <YAxis
              stroke="#55575440"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#555754' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF7A10', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF7A10"
              strokeWidth={2.5}
              fill="url(#revGrad)"
              dot={{ fill: '#FF7A10', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#FF7A10', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Day pills */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
        {data.map((d) => (
          <div key={d.day} className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-[#F4F2F0] min-w-[56px]">
            <span className="text-[10px] font-bold text-[#555754] uppercase">{d.day}</span>
            <span className="text-xs font-black text-[#1F221D]">${(d.revenue / 1000).toFixed(1)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
