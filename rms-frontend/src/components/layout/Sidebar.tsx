import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard, Grid, Plus, ChefHat, CreditCard,
  ChevronLeft, ChevronRight, LogOut, UtensilsCrossed,
  CalendarDays, UserCircle2, Sparkles, LayoutGrid, Users,
  BarChart2, Package, History,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useKitchenStore } from '../../store/useKitchenStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const permissions = useAppStore((state) => state.permissions);
  const userName = useAppStore((state) => state.userName);
  const userRoleName = useAppStore((state) => state.userRoleName);
  const kitchenOrdersCount = useKitchenStore((state) =>
    state.orders.filter((o) => o.status !== 'ready').length
  );

  const navItems = [
    { id: '/dashboard',          label: 'Dashboard',         icon: LayoutDashboard },
    { id: '/tables',             label: 'Tables Map',         icon: Grid },
    { id: '/table-management',   label: 'Table Setup',        icon: LayoutGrid },
    { id: '/staff',              label: 'Staff',              icon: Users },
    { id: '/supplies',           label: 'Supplies',           icon: Package },
    { id: '/history',            label: 'History',            icon: History },
    { id: '/reports',            label: 'Reports',            icon: BarChart2 },
    { id: '/reservations',       label: 'Reservations',       icon: CalendarDays },
    { id: '/customers',          label: 'Customers',          icon: UserCircle2 },
    { id: '/services',           label: 'Services',           icon: UtensilsCrossed },
    { id: '/order',              label: 'New Order',          icon: Plus,    isSpecial: true },
    { id: '/kitchen',            label: 'Kitchen Board',      icon: ChefHat, badge: kitchenOrdersCount },
    { id: '/payment',            label: 'Payments',           icon: CreditCard },
    { id: '/settings',           label: 'Settings',           icon: Sparkles },
  ].filter((item) =>
    permissions.includes(item.id) ||
    (permissions.includes('/admin') && item.id === '/settings') ||
    ['/reservations', '/customers', '/services', '/table-management', '/staff', '/supplies', '/history', '/reports'].includes(item.id)
  );

  return (
    <aside
      className={twMerge(
        clsx(
          'h-screen bg-white border-r border-[#1F221D]/10 flex flex-col transition-all duration-300 z-30 relative select-none',
          { 'w-60': !collapsed, 'w-[72px]': collapsed }
        )
      )}
    >
      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-[#1F221D]/10 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#FF7A10] flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-black text-lg text-[#1F221D] tracking-tight whitespace-nowrap">
            Resto<span className="text-[#FF7A10]">POS</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.id || (activePath === '/' && item.id === '/dashboard');

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={twMerge(
                clsx(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative cursor-pointer',
                  {
                    // Active
                    'bg-[#FF7A10] text-white font-semibold': isActive && !item.isSpecial,
                    // Inactive
                    'text-[#555754] hover:text-[#1F221D] hover:bg-[#F4F2F0]': !isActive && !item.isSpecial,
                    // Special active
                    'bg-[#FF7A10] text-white font-bold': item.isSpecial && isActive,
                    // Special inactive
                    'bg-[#FF7A10]/10 text-[#FF7A10] border border-[#FF7A10]/20 hover:bg-[#FF7A10]/20 font-semibold': item.isSpecial && !isActive,
                  }
                )
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]" />

              {!collapsed && (
                <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-[76px] bg-[#1F221D] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-[0_4px_12px_rgba(31,34,29,0.15)]">
                  {item.label}
                </div>
              )}

              {/* Badge */}
              {item.badge ? (
                <span
                  className={twMerge(
                    clsx(
                      'text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
                      isActive
                        ? 'bg-white text-[#FF7A10]'
                        : 'bg-[#FF7A10] text-white',
                      collapsed && 'absolute top-1.5 right-1.5'
                    )
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#1F221D]/10 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-1 overflow-hidden">
          <Avatar name={userName || 'User'} size="md" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[#1F221D] truncate">{userName || 'User'}</span>
              <span className="text-xs text-[#555754] truncate">{userRoleName || 'Employee'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => navigate('/login')}
            className={twMerge(
              clsx(
                'flex items-center justify-center p-2 rounded-xl text-[#C62828] bg-[#C62828]/8 border border-[#C62828]/20 hover:bg-[#C62828]/15 transition-all cursor-pointer',
                { 'flex-1 gap-2 text-xs font-bold uppercase tracking-wider': !collapsed, 'w-full': collapsed }
              )
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-2 rounded-xl bg-[#F4F2F0] border border-[#1F221D]/10 text-[#555754] hover:text-[#1F221D] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {collapsed && (
            <button
              onClick={onToggle}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#FF7A10] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all cursor-pointer z-50 shadow-[0_2px_8px_rgba(255,122,16,0.30)]"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
