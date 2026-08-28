import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, ShoppingBag, Users,
  RefreshCw, ChevronDown,
  Calendar, TrendingUp, Receipt,
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { RecentOrder, Customer } from '../../types';

// ─── Shared utils ─────────────────────────────────────────────────────────────

const inputBase =
  'bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl px-3 py-2 text-sm text-[#1F221D] focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

const formatPKR = (val: number) =>
  'PKR ' + val.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toDateStr(d);
};

const defaultTo = () => toDateStr(new Date());

type TabId = 'orders' | 'customers';

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  const base = 'text-[10px] font-bold px-2 py-0.5 rounded-full border';
  switch (status) {
    case 'completed':  return `${base} bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20`;
    case 'in-progress':return `${base} bg-[#FF7A10]/10 text-[#FF7A10] border-[#FF7A10]/20`;
    case 'waiting':    return `${base} bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20`;
    case 'ready':      return `${base} bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20`;
    default:           return `${base} bg-[#ECEAE7] text-[#555754] border-[#1F221D]/10`;
  }
};

// ─── Order History Tab ────────────────────────────────────────────────────────

const OrderHistoryTab: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [status, setStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrderHistory({
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      });
      setOrders(data);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load orders.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [from, to, status, addNotification]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#FF7A10]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F221D]">Order History</p>
            <p className="text-xs text-[#555754]">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className={`${inputBase} pl-9 text-xs`} />
          </div>
          <span className="text-xs text-[#555754]">to</span>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className={`${inputBase} pl-9 text-xs`} />
          </div>
          <div className="relative flex items-center">
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className={`${inputBase} text-xs appearance-none pr-7 min-w-[130px]`}>
              <option value="">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[#555754]/50 pointer-events-none" />
          </div>
          <button onClick={fetchOrders} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] transition-all active:scale-95 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
          <p className="text-sm font-semibold text-[#1F221D]/60">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
            <ShoppingBag className="w-7 h-7 text-[#555754]/40" />
          </div>
          <p className="text-sm font-semibold text-[#1F221D]/60">No orders found</p>
          <p className="text-xs text-[#555754]/50">Adjust your date range or status filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F221D]/10 bg-[#F4F2F0]">
                  <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Order ID</th>
                  <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Table</th>
                  <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Items</th>
                  <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-[#555754] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F221D]/6">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F4F2F0] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[#1F221D]">{order.id}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#555754] hidden sm:table-cell">
                      {order.tableId ? `Table #${order.tableId}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#555754] hidden md:table-cell">{order.items}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(order.status)}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-[#1F221D]">{formatPKR(order.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#555754] hidden lg:table-cell">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#1F221D]/10 bg-[#F4F2F0] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-[#FF7A10]" />
              <span className="text-xs font-semibold text-[#555754]">
                Total Orders: <span className="text-[#1F221D]">{orders.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#555754]">Total Revenue:</span>
              <span className="text-sm font-bold text-[#2E7D32]">{formatPKR(totalRevenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Customer Purchases Tab ───────────────────────────────────────────────────

const CustomerPurchasesTab: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [custs, ords] = await Promise.all([api.getCustomers(), api.getOrders()]);
      setCustomers(custs);
      setOrders(ords);
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to load data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1565C0]/10 border border-[#1565C0]/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-[#1565C0]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F221D]">Customer Purchases</p>
            <p className="text-xs text-[#555754]">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={load} disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] transition-all active:scale-95 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
          <p className="text-sm font-semibold text-[#1F221D]/60">Loading…</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
            <Users className="w-7 h-7 text-[#555754]/40" />
          </div>
          <p className="text-sm font-semibold text-[#1F221D]/60">No customers yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {customers.map((cust) => {
            const isExpanded = expandedId === cust.id;
            const orderCount = orders.length;
            return (
              <div key={cust.id} className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cust.id)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[#F4F2F0] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 border border-[#1565C0]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#1565C0]">{cust.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1F221D] truncate">{cust.name}</p>
                    <p className="text-xs text-[#555754] truncate">{cust.phone ?? cust.email ?? 'No contact info'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#555754]">{orderCount} orders tracked</p>
                    <p className="text-[10px] text-[#555754]/50 mt-0.5">Click to view details</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#555754]/50 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="border-t border-[#1F221D]/10 px-4 py-4 bg-[#F4F2F0]">
                    <div className="mb-3 p-3 bg-white border border-[#1F221D]/10 rounded-xl">
                      <p className="text-xs font-semibold text-[#555754] mb-2 uppercase tracking-wider">Customer Info</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#555754]">
                        <div><span className="font-medium text-[#1F221D]">Name:</span> {cust.name}</div>
                        {cust.phone && <div><span className="font-medium text-[#1F221D]">Phone:</span> {cust.phone}</div>}
                        {cust.email && <div><span className="font-medium text-[#1F221D]">Email:</span> {cust.email}</div>}
                        {cust.notes && <div className="col-span-2"><span className="font-medium text-[#1F221D]">Notes:</span> {cust.notes}</div>}
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-[#FF7A10]/20 rounded-xl">
                      <p className="text-xs font-semibold text-[#FF7A10] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" /> Purchase Tracking
                      </p>
                      <p className="text-xs text-[#555754]">
                        Direct order-to-customer linking requires orders to be associated by customer ID at the time of order placement.
                        Purchase history will appear here once orders are linked to customer accounts.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── HistoryScreen ────────────────────────────────────────────────────────────

export const HistoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('orders');

  const tabs: { id: TabId; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'orders',    label: 'Order History',     icon: ShoppingBag },
    { id: 'customers', label: 'Customer Purchases', icon: Users },
  ];

  return (
    <PageWrapper className="h-full overflow-y-auto bg-[#F4F2F0]">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF7A10]/10 border border-[#FF7A10]/20 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1F221D]">History</h1>
            <p className="text-xs text-[#555754]">Order history and customer purchase data</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#FF7A10] text-white shadow-sm'
                    : 'bg-white text-[#555754] border border-[#1F221D]/10 hover:bg-[#ECEAE7]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'orders'    && <OrderHistoryTab />}
        {activeTab === 'customers' && <CustomerPurchasesTab />}
      </div>
    </PageWrapper>
  );
};

export default HistoryScreen;
