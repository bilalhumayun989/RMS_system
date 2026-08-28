import { useAppStore } from '../store/useAppStore';

export const useToast = () => {
  const addNotification = useAppStore((state) => state.addNotification);

  return {
    show: (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      addNotification(msg, type);
    },
    success: (msg: string) => addNotification(msg, 'success'),
    error: (msg: string) => addNotification(msg, 'error'),
    info: (msg: string) => addNotification(msg, 'info'),
    warning: (msg: string) => addNotification(msg, 'warning'),
  };
};

export default useToast;
