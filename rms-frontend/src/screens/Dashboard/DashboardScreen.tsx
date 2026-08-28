import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StatsCard } from './StatsCard';
import { RevenueChart } from './RevenueChart';
import { RecentOrders } from './RecentOrders';
import {
  TrendingUp, Receipt, Flame, Grid,
  PlusCircle, ChefHat, CalendarDays, Users,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useTableStore } from '../../store/useTableStore';
import { useKitchenStore } from '../../store/useKitchenStore';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);
  const tables = useTableStore((s) => s.tables);
  const kitchenOrders = useKitchenStore((s) => s.orders);

  const todayRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const totalOrders = orders.length;
  const inProgressCount = kitchenOrders.filter((o) => o.status === 'cooking' || o.status === 'new').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  const quickActions = [
    { label: 'New Order',    icon: PlusCircle,  path: '/order',        accent: '#FF7A10' },
    { label: 'Tables',       icon: Grid,        path: '/tables',       accent: '#1565C0' },
    { label: 'Kitchen',      icon: ChefHat,     path: '/kitchen',      accent: '#2E7D32' },
    { label: 'Reservations', icon: CalendarDays,path: '/reservations', accent: '#FF7A10' },
    { label: 'Customers',    icon: Users,        path: '/customers',   accent: '#555754' },
  ];

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="max-w-[1600px] mx-auto px-6 py-6 pb-24 md:pb-8 flex flex-col gap-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Revenue"
            value={todayRevenue}
            prefix="$"
            icon={TrendingUp}
            accent="#FF7A10"
            trend="+12.4% from yesterday"
            trendPositive
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            icon={Receipt}
            accent="#2E7D32"
            trend={`${inProgressCount} in kitchen`}
            trendPositive
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={Flame}
            accent="#FF7A10"
            trend="Cooking now"
            trendPositive
          />
          <StatsCard
            title="Tables Occupied"
            value={occupiedCount}
            icon={Grid}
            accent="#1565C0"
            trend={`${tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}% occupancy`}
            trendPositive
          />
        </div>

        {/* ── Chart + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-black text-[#1F221D]">Quick Actions</h3>
              <p className="text-xs text-[#555754] mt-0.5">Jump to common tasks</p>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {/* Primary CTA */}
              <button
                onClick={() => navigate('/order')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF7A10] text-white font-bold text-sm hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Order
              </button>

              {/* Secondary grid */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {quickActions.slice(1).map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.path}
                      onClick={() => navigate(a.path)}
                      className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-[#F4F2F0] border border-[#1F221D]/08 text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Icon className="w-5 h-5" style={{ color: a.accent }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <RecentOrders />

      </div>
    </PageWrapper>
  );
};

export default DashboardScreen;
