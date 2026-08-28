import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notifications, clearNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((toast) => {
        let Icon = Info;
        let iconColor = 'text-[#1565C0]';
        let borderColor = 'border-[#1565C0]/20';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          iconColor = 'text-[#2E7D32]';
          borderColor = 'border-[#2E7D32]/20';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-[#FF7A10]';
          borderColor = 'border-[#FF7A10]/20';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-[#C62828]';
          borderColor = 'border-[#C62828]/20';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 bg-white border ${borderColor} rounded-xl shadow-card pointer-events-auto`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium text-[#1F221D]">{toast.message}</p>
            </div>
            <button
              onClick={() => clearNotification(toast.id)}
              className="text-[#555754] hover:text-[#1F221D] transition-colors ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
