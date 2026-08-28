import React from 'react';
import { useOrderStore } from '../../store/useOrderStore';

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  'waiting':     { bg: '#1565C0/10', text: '#1565C0', label: 'Waiting' },
  'in-progress': { bg: 'rgba(255,122,16,0.10)', text: '#FF7A10', label: 'In Progress' },
  'ready':       { bg: 'rgba(46,125,50,0.10)', text: '#2E7D32', label: 'Ready' },
  'completed':   { bg: 'rgba(85,87,84,0.10)', text: '#555754', label: 'Completed' },
};

export const RecentOrders: React.FC = () => {
  const orders = useOrderStore((s) => s.orders);

  return (
    <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#1F221D]">Recent Orders</h3>
          <p className="text-xs text-[#555754] mt-0.5">Live status of active orders</p>
        </div>
        <span className="text-xs font-bold text-[#FF7A10] bg-[#FF7A10]/10 px-2.5 py-1 rounded-full">
          {orders.length} orders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1F221D]/08">
              <th className="pb-3 pr-4 text-[10px] uppercase tracking-wider font-bold text-[#555754]">Order ID</th>
              <th className="pb-3 px-4 text-[10px] uppercase tracking-wider font-bold text-[#555754]">Table</th>
              <th className="pb-3 px-4 text-[10px] uppercase tracking-wider font-bold text-[#555754]">Items</th>
              <th className="pb-3 px-4 text-[10px] uppercase tracking-wider font-bold text-[#555754]">Status</th>
              <th className="pb-3 pl-4 text-right text-[10px] uppercase tracking-wider font-bold text-[#555754]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const s = statusStyle[order.status] ?? statusStyle['completed'];
              return (
                <tr
                  key={order.id}
                  className="border-b border-[#1F221D]/06 hover:bg-[#F4F2F0] transition-colors"
                >
                  <td className="py-3.5 pr-4 font-bold text-[#1F221D] font-mono text-xs">{order.id}</td>
                  <td className="py-3.5 px-4 text-[#555754] text-xs">Table {order.tableId}</td>
                  <td className="py-3.5 px-4 text-[#555754] text-xs">{order.items} items</td>
                  <td className="py-3.5 px-4">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ background: s.bg, color: s.text }}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-black text-[#FF7A10] text-sm">
                    ${order.amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[#555754]">
                  No recent orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
