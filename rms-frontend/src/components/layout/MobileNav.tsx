import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Grid, PlusCircle, ChefHat, CreditCard, CalendarDays, UserCircle2, UtensilsCrossed, Users, BarChart2, Package, History } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '../../store/useAppStore';

interface MobileNavProps {
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const permissions = useAppStore((state) => state.permissions);
  const navItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/tables', label: 'Tables', icon: Grid },
    { id: '/reservations', label: 'Reserve', icon: CalendarDays },
    { id: '/customers', label: 'Customers', icon: UserCircle2 },
    { id: '/staff', label: 'Staff', icon: Users },
    { id: '/supplies', label: 'Supplies', icon: Package },
    { id: '/history', label: 'History', icon: History },
    { id: '/reports', label: 'Reports', icon: BarChart2 },
    { id: '/services', label: 'Services', icon: UtensilsCrossed },
    { id: '/order', label: 'Order', icon: PlusCircle, isSpecial: true },
    { id: '/kitchen', label: 'Kitchen', icon: ChefHat },
    { id: '/payment', label: 'Payment', icon: CreditCard },
  ].filter(item => permissions.includes(item.id) || item.id === '/reservations' || item.id === '/customers' || item.id === '/services' || item.id === '/staff' || item.id === '/supplies' || item.id === '/history' || item.id === '/reports');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#1F221D]/10 px-4 flex items-center justify-around z-40 select-none shadow-card">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.id || (activePath === '/' && item.id === '/dashboard');

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className="flex flex-col items-center justify-center relative w-12 h-12 cursor-pointer"
          >
            {item.isSpecial ? (
              <div
                className={twMerge(
                  clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center -translate-y-2.5 shadow-card transition-all active:scale-95 border border-[#1F221D]/10',
                    {
                      'bg-[#FF7A10] text-white': isActive,
                      'bg-[#ECEAE7] text-[#FF7A10]': !isActive,
                    }
                  )
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <>
                <Icon
                  className={twMerge(
                    clsx('w-5 h-5 transition-colors', {
                      'text-[#FF7A10]': isActive,
                      'text-[#555754]': !isActive,
                    })
                  )}
                />
                <span
                  className={twMerge(
                    clsx('text-[9px] font-medium mt-1 transition-colors', {
                      'text-[#FF7A10]': isActive,
                      'text-[#555754]': !isActive,
                    })
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#FF7A10] rounded-full" />
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;
