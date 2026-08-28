import React from 'react';
import { useTime } from '../../hooks/useTime';
import { useAppStore } from '../../store/useAppStore';
import { Bell, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumb, onMenuClick }) => {
  const time = useTime();
  const notifications = useAppStore((state) => state.notifications);
  const userName = useAppStore((state) => state.userName);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="bg-white border-b border-[#1F221D]/10 px-6 py-3.5 flex items-center justify-between select-none flex-shrink-0">

      {/* Left: menu toggle + title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-[#F4F2F0] border border-[#1F221D]/10 text-[#555754] hover:text-[#1F221D] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          {breadcrumb && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#555754]">
              {breadcrumb}
            </span>
          )}
          <h2 className="text-lg font-black text-[#1F221D] leading-tight">{title}</h2>
        </div>
      </div>

      {/* Center: date/time */}
      <div className="hidden md:flex flex-col items-center">
        <span className="text-sm font-black text-[#FF7A10] tracking-wider font-mono">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-[#555754] font-semibold uppercase tracking-wider">
          {formatDate(time)}
        </span>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-xl bg-[#F4F2F0] border border-[#1F221D]/10 text-[#555754] hover:text-[#1F221D] transition-all cursor-pointer">
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7A10] rounded-full" />
          )}
        </button>
        <Avatar name={userName || 'User'} size="md" />
      </div>
    </header>
  );
};

export default Header;
