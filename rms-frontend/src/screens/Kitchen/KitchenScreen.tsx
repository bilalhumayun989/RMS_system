import React, { useState, useEffect } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { useTableStore } from '../../store/useTableStore';
import { useAppStore } from '../../store/useAppStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { KitchenOrder, KitchenStatus } from '../../types';
import { Clock, ChefHat, CheckCircle, Bell, Trash2 } from 'lucide-react';

const COLUMNS: { status: KitchenStatus; label: string; topColor: string; icon: React.ReactNode }[] = [
  { status: 'new', label: 'New Orders', topColor: 'border-t-[#1565C0]', icon: <Bell className="w-4 h-4 text-[#1565C0]" /> },
  { status: 'cooking', label: 'Cooking', topColor: 'border-t-[#FF7A10]', icon: <ChefHat className="w-4 h-4 text-[#FF7A10]" /> },
  { status: 'ready', label: 'Ready to Serve', topColor: 'border-t-[#2E7D32]', icon: <CheckCircle className="w-4 h-4 text-[#2E7D32]" /> },
];

const ElapsedTimer: React.FC<{ createdAt: Date }> = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [createdAt]);
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${elapsed >= 20 ? 'text-[#C62828]' : elapsed >= 10 ? 'text-[#FF7A10]' : 'text-[#555754]'}`}>
      <Clock className="w-3 h-3" /> {elapsed}m
    </span>
  );
};

const KitchenCard: React.FC<{ order: KitchenOrder }> = ({ order }) => {
  const updateOrderStatus = useKitchenStore((s) => s.updateOrderStatus);
  const removeOrder = useKitchenStore((s) => s.removeOrder);
  const updateTableStatus = useTableStore((s) => s.updateTableStatus);
  const addNotification = useAppStore((s) => s.addNotification);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (order.status === 'new') {
        await updateOrderStatus(order.id, 'cooking');
        addNotification(`Table ${order.tableId} — now cooking 🍳`, 'info');
      } else if (order.status === 'cooking') {
        await updateOrderStatus(order.id, 'ready');
        addNotification(`Table ${order.tableId} — order READY! 🔔`, 'success');
      } else {
        // Mark served: remove kitchen order + update table status
        await removeOrder(order.id);
        await updateTableStatus(order.tableId, 'served');
        addNotification(`Table ${order.tableId} — served ✅`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabel = order.status === 'new' ? 'Start Cooking' : order.status === 'cooking' ? 'Mark Ready' : 'Mark Served';
  const actionStyle =
    order.status === 'new' ? 'text-[#1565C0] border-[#1565C0]/20 hover:bg-[#1565C0]/10' :
    order.status === 'cooking' ? 'text-[#FF7A10] border-[#FF7A10]/20 hover:bg-[rgba(255,122,16,0.08)]' :
    'text-[#2E7D32] border-[#2E7D32]/20 hover:bg-[#2E7D32]/10';

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium text-[#555754] tracking-widest">#{order.id}</p>
          <p className="text-base font-semibold text-[#1F221D]">Table {order.tableId}</p>
        </div>
        <div className="flex items-center gap-2">
          <ElapsedTimer createdAt={order.createdAt} />
          <button
            onClick={() => removeOrder(order.id)}
            className="p-1.5 rounded-lg text-[#555754] hover:text-[#C62828] hover:bg-[#C62828]/10 transition-all disabled:opacity-30"
            disabled={isProcessing}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 py-2 border-y border-[#1F221D]/06">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-[#1F221D] font-medium">{item.name}</span>
            <span className="text-xs font-semibold text-[#FF7A10] bg-[rgba(255,122,16,0.08)] px-2 py-0.5 rounded-full">×{item.qty}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-[#555754]">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Est. {order.estimatedMinutes} min</span>
      </div>

      <button
        onClick={handleAction}
        disabled={isProcessing}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${actionStyle}`}
      >
        {isProcessing ? 'Processing…' : actionLabel}
      </button>
    </div>
  );
};

export const KitchenScreen: React.FC = () => {
  const orders = useKitchenStore((s) => s.orders);
  const fetchKitchenOrders = useKitchenStore((s) => s.fetchKitchenOrders);

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(() => {
      fetchKitchenOrders();
    }, 3000);

    const handleDemoUpdate = () => {
      fetchKitchenOrders();
    };
    window.addEventListener('demo-storage-updated', handleDemoUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('demo-storage-updated', handleDemoUpdate);
    };
  }, [fetchKitchenOrders]);

  return (
    <PageWrapper className="h-full overflow-hidden p-4 bg-[#F4F2F0]">
      <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <div key={col.status} className={`flex flex-col bg-white border-t-4 ${col.topColor} border border-[#1F221D]/10 rounded-2xl overflow-hidden`}>
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1F221D]/06">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="font-semibold text-sm text-[#1F221D]">{col.label}</span>
                </div>
                <span className="w-6 h-6 rounded-full bg-[#ECEAE7] text-[#555754] text-xs font-semibold flex items-center justify-center">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-xs text-[#555754] font-medium">No orders</p>
                  </div>
                ) : (
                  colOrders.map((order) => <KitchenCard key={order.id} order={order} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default KitchenScreen;
