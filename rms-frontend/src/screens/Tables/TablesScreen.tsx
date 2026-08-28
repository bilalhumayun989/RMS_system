import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../../store/useTableStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useKitchenStore } from '../../store/useKitchenStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../types';
import { Users, Clock, Receipt, Plus, X, CheckCircle, Bell } from 'lucide-react';

type DisplayStatus = 'available' | 'occupied' | 'order-ready' | 'served' | 'reserved';

function getDisplayStatus(table: Table, readyTableIds: Set<number>): DisplayStatus {
  if (table.status === 'occupied' && readyTableIds.has(table.id)) return 'order-ready';
  return table.status as DisplayStatus;
}

const statusConfig: Record<DisplayStatus, {
  bg: string; badge: string; dot: string; label: string; numberColor: string;
}> = {
  available: {
    bg: 'bg-white border-[#1F221D]/10 hover:border-[#2E7D32]/40 hover:bg-[#F4F2F0]',
    badge: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
    dot: 'bg-[#2E7D32]',
    label: 'Available',
    numberColor: 'text-[#1F221D]',
  },
  occupied: {
    bg: 'bg-white border-[#FF7A10]/30 hover:border-[#FF7A10]/60 hover:bg-[#F4F2F0]',
    badge: 'bg-[rgba(255,122,16,0.08)] text-[#FF7A10] border-[#FF7A10]/20',
    dot: 'bg-[#FF7A10] animate-pulse',
    label: 'Occupied',
    numberColor: 'text-[#FF7A10] font-semibold',
  },
  'order-ready': {
    bg: 'bg-white border-[#C62828]/50 hover:border-[#C62828]/80 hover:bg-[#F4F2F0]',
    badge: 'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20',
    dot: 'bg-[#C62828] animate-ping',
    label: 'Order Ready!',
    numberColor: 'text-[#C62828] font-semibold',
  },
  served: {
    bg: 'bg-white border-[#1565C0]/30 hover:border-[#1565C0]/60 hover:bg-[#F4F2F0]',
    badge: 'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20',
    dot: 'bg-[#1565C0] animate-pulse',
    label: 'Food Served',
    numberColor: 'text-[#1565C0] font-semibold',
  },
  reserved: {
    bg: 'bg-white border-[#555754]/20 hover:border-[#555754]/40 hover:bg-[#F4F2F0]',
    badge: 'bg-[#555754]/10 text-[#555754] border-[#555754]/20',
    dot: 'bg-[#555754]',
    label: 'Reserved',
    numberColor: 'text-[#555754]',
  },
};

interface TableModalProps {
  table: Table;
  displayStatus: DisplayStatus;
  onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ table, displayStatus, onClose }) => {
  const navigate = useNavigate();
  const setTableId = useOrderStore((s) => s.setTableId);
  const updateTableStatus = useTableStore((s) => s.updateTableStatus);
  const cfg = statusConfig[displayStatus];

  const handleNewOrder = () => { setTableId(table.id); navigate('/order'); onClose(); };
  const handleCheckout = () => { setTableId(table.id); navigate('/payment'); onClose(); };
  const handleFreeTable = () => { updateTableStatus(table.id, 'available'); onClose(); };

  return (
    <div className="fixed inset-0 bg-[#1F221D]/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-[#1F221D]/10 rounded-3xl p-6 w-full max-w-sm shadow-card relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#1F221D] tracking-tight">Table {table.id}</h3>
            <p className="text-xs text-[#555754] mt-0.5 font-medium">Section {table.section} • {table.seats} seats</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] border border-transparent hover:border-[#1F221D]/10 transition-all active:scale-90">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {(table.status === 'occupied' || table.status === 'served') && (
          <div className="bg-[#F4F2F0] border border-[#1F221D]/06 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#555754]">Order ID</span>
              <span className="font-semibold text-[#1F221D] font-mono bg-[#ECEAE7] px-2 py-0.5 rounded-md border border-[#1F221D]/06">{table.orderId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#555754]">Running Duration</span>
              <span className="font-semibold text-[#FF7A10] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {table.duration} mins active
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-[#1F221D]/06">
              <span className="text-[#555754] font-medium">Current Amount</span>
              <span className="font-semibold text-[#2E7D32] text-base">PKR {table.amount?.toFixed(2)}</span>
            </div>
          </div>
        )}

        {table.status === 'reserved' && (
          <div className="bg-[#F4F2F0] border border-[#1F221D]/06 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#555754]">Reserved Host</span>
              <span className="font-semibold text-[#1F221D]">{table.guestName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#555754]">Expected Slot</span>
              <span className="font-semibold text-[#1565C0] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {table.reservedFor}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {displayStatus === 'available' && (
            <button onClick={handleNewOrder} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF7A10] text-white font-semibold rounded-xl hover:bg-[#E86000] active:scale-[0.98] transition-all text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Create New Order
            </button>
          )}
          {displayStatus === 'occupied' && (
            <>
              <button onClick={handleNewOrder} className="w-full flex items-center justify-center gap-2 py-3 bg-[#F4F2F0] text-[#1F221D] font-semibold rounded-xl hover:bg-[#ECEAE7] border border-[#1F221D]/10 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Plus className="w-4 h-4 text-[#FF7A10]" /> Add Items / Modify
              </button>
              <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2E7D32] text-white font-semibold rounded-xl hover:bg-[#2E7D32]/90 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Receipt className="w-4 h-4" /> Process Checkout & Bill
              </button>
              <button onClick={handleFreeTable} className="w-full flex items-center justify-center gap-2 py-3 bg-[#C62828]/10 text-[#C62828] font-medium rounded-xl hover:bg-[#C62828]/15 border border-[#C62828]/20 active:scale-[0.98] transition-all text-xs mt-2 opacity-60 hover:opacity-100 cursor-pointer">
                <X className="w-3.5 h-3.5" /> Force Free Table (Clear)
              </button>
            </>
          )}
          {displayStatus === 'order-ready' && (
            <>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#C62828]/10 border border-[#C62828]/20 rounded-xl mb-1">
                <Bell className="w-4 h-4 text-[#C62828] flex-shrink-0 animate-bounce" />
                <p className="text-xs text-[#C62828] font-semibold">Order is ready — bring food to table!</p>
              </div>
              <button onClick={handleNewOrder} className="w-full flex items-center justify-center gap-2 py-3 bg-[#F4F2F0] text-[#1F221D] font-semibold rounded-xl hover:bg-[#ECEAE7] border border-[#1F221D]/10 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Plus className="w-4 h-4 text-[#FF7A10]" /> Add Items / Modify
              </button>
              <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2E7D32] text-white font-semibold rounded-xl hover:bg-[#2E7D32]/90 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Receipt className="w-4 h-4" /> Process Checkout & Bill
              </button>
              <button onClick={handleFreeTable} className="w-full flex items-center justify-center gap-2 py-3 bg-[#C62828]/10 text-[#C62828] font-medium rounded-xl hover:bg-[#C62828]/15 border border-[#C62828]/20 active:scale-[0.98] transition-all text-xs mt-2 opacity-60 hover:opacity-100 cursor-pointer">
                <X className="w-3.5 h-3.5" /> Force Free Table (Clear)
              </button>
            </>
          )}
          {displayStatus === 'served' && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1565C0]/10 border border-[#1565C0]/20 rounded-xl mb-1">
                <CheckCircle className="w-4 h-4 text-[#1565C0] flex-shrink-0" />
                <p className="text-xs text-[#1565C0] font-semibold">Food has been served to this table</p>
              </div>
              <button onClick={handleCheckout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1565C0]/90 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Receipt className="w-4 h-4" /> Collect Payment
              </button>
              <button onClick={handleFreeTable} className="w-full flex items-center justify-center gap-2 py-3 bg-[#C62828]/10 text-[#C62828] font-medium rounded-xl hover:bg-[#C62828]/15 border border-[#C62828]/20 active:scale-[0.98] transition-all text-xs mt-1 opacity-60 hover:opacity-100 cursor-pointer">
                <X className="w-3.5 h-3.5" /> Force Free Table (Clear)
              </button>
            </>
          )}
          {displayStatus === 'reserved' && (
            <>
              <button onClick={handleNewOrder} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF7A10] text-white font-semibold rounded-xl hover:bg-[#E86000] active:scale-[0.98] transition-all text-sm cursor-pointer">
                <Plus className="w-4 h-4" /> Seat Guest & Start Order
              </button>
              <button onClick={handleFreeTable} className="w-full flex items-center justify-center gap-2 py-3 bg-[#F4F2F0] text-[#555754] hover:text-[#1F221D] font-semibold rounded-xl hover:bg-[#ECEAE7] border border-[#1F221D]/10 active:scale-[0.98] transition-all text-sm cursor-pointer">
                <X className="w-4 h-4" /> Cancel Booking Reservation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TablesScreen: React.FC = () => {
  const tables = useTableStore((s) => s.tables);
  const fetchTables = useTableStore((s) => s.fetchTables);
  const kitchenOrders = useKitchenStore((s) => s.orders);
  const fetchKitchenOrders = useKitchenStore((s) => s.fetchKitchenOrders);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filterSection, setFilterSection] = useState<string>('All');

  useEffect(() => {
    fetchTables(); fetchKitchenOrders();
    const interval = setInterval(() => { fetchTables(); fetchKitchenOrders(); }, 15000);
    return () => clearInterval(interval);
  }, [fetchTables, fetchKitchenOrders]);

  const sections = ['All', 'A', 'B', 'C', 'D'];
  const filtered = filterSection === 'All' ? tables : tables.filter((t) => t.section === filterSection);

  const readyTableIds = new Set(kitchenOrders.filter((o) => o.status === 'ready').map((o) => o.tableId));

  const counts = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied' && !readyTableIds.has(t.id)).length,
    orderReady: tables.filter((t) => t.status === 'occupied' && readyTableIds.has(t.id)).length,
    served: tables.filter((t) => t.status === 'served').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <PageWrapper className="h-full overflow-y-auto p-6 pb-24 md:pb-6 scrollbar-none bg-[#F4F2F0]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Available',   count: counts.available,  border: 'border-[#2E7D32]/20',  dot: 'bg-[#2E7D32]' },
            { label: 'Occupied',    count: counts.occupied,   border: 'border-[#FF7A10]/20',  dot: 'bg-[#FF7A10]' },
            { label: 'Order Ready', count: counts.orderReady, border: 'border-[#C62828]/30',  dot: 'bg-[#C62828] animate-ping' },
            { label: 'Food Served', count: counts.served,     border: 'border-[#1565C0]/20',  dot: 'bg-[#1565C0]' },
            { label: 'Reserved',    count: counts.reserved,   border: 'border-[#555754]/20',  dot: 'bg-[#555754]' },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 bg-white border ${s.border} rounded-2xl px-4 py-2.5`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              <span className="text-sm font-semibold text-[#1F221D]">{s.count}</span>
              <span className="text-xs text-[#555754] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#1F221D]/10 rounded-2xl p-1 self-start md:self-auto">
          {sections.map((sec) => (
            <button key={sec} onClick={() => setFilterSection(sec)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${filterSection === sec ? 'bg-[#FF7A10] text-white' : 'text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7]'}`}>
              {sec === 'All' ? 'All Zones' : `Zone ${sec}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {filtered.map((table) => {
          const displayStatus = getDisplayStatus(table, readyTableIds);
          const cfg = statusConfig[displayStatus];
          const seatsArray = Array.from({ length: Math.min(table.seats, 8) });
          const isActive = displayStatus === 'occupied' || displayStatus === 'order-ready' || displayStatus === 'served';

          return (
            <div key={table.id} className="relative group p-2">
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-0.5">
                <div className="flex flex-col gap-1.5">
                  {seatsArray.slice(0, Math.ceil(seatsArray.length / 2)).map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-l-md transition-colors duration-300 ${isActive ? 'bg-[#FF7A10]/30' : 'bg-[#1F221D]/10 group-hover:bg-[#1F221D]/20'}`} />
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  {seatsArray.slice(Math.ceil(seatsArray.length / 2)).map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-r-md transition-colors duration-300 ${isActive ? 'bg-[#FF7A10]/30' : 'bg-[#1F221D]/10 group-hover:bg-[#1F221D]/20'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(table)}
                className={`w-full relative aspect-square md:aspect-auto md:h-44 flex flex-col items-center justify-between p-4 rounded-2xl border-2 text-center transition-all duration-300 active:scale-95 cursor-pointer ${cfg.bg}`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#555754] uppercase tracking-widest">Z-{table.section}</span>
                  <span className="relative flex items-center justify-center w-3 h-3">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </span>
                </div>
                <div className="my-auto flex flex-col items-center justify-center">
                  <span className={`text-4xl font-semibold tracking-tight transition-transform duration-300 group-hover:scale-110 ${cfg.numberColor}`}>{table.id}</span>
                  <span className="flex items-center gap-1 text-[10px] text-[#555754] font-medium mt-1 uppercase tracking-wider">
                    <Users className="w-2.5 h-2.5" /> {table.seats} Pax
                  </span>
                </div>
                <div className="w-full min-h-[24px] flex items-center justify-center pt-1 border-t border-[#1F221D]/06">
                  {(displayStatus === 'occupied' || displayStatus === 'order-ready' || displayStatus === 'served') && table.amount ? (
                    <span className={`text-xs font-semibold font-mono tracking-tight px-2 py-0.5 rounded-md border ${
                      displayStatus === 'order-ready' ? 'text-[#C62828] bg-[#C62828]/05 border-[#C62828]/20' :
                      displayStatus === 'served' ? 'text-[#1565C0] bg-[#1565C0]/05 border-[#1565C0]/20' :
                      'text-[#2E7D32] bg-[#2E7D32]/05 border-[#2E7D32]/10'
                    }`}>
                      PKR {table.amount.toFixed(2)}
                    </span>
                  ) : table.status === 'reserved' && table.reservedFor ? (
                    <span className="text-[10px] font-semibold text-[#555754] flex items-center gap-1 bg-[#555754]/05 px-2 py-0.5 rounded-md border border-[#555754]/10 max-w-full truncate">
                      <Clock className="w-2.5 h-2.5" /> {table.reservedFor}
                    </span>
                  ) : (
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.badge}`}>{cfg.label}</span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {selectedTable && (
        <TableModal
          table={tables.find(t => t.id === selectedTable.id) ?? selectedTable}
          displayStatus={getDisplayStatus(tables.find(t => t.id === selectedTable.id) ?? selectedTable, readyTableIds)}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </PageWrapper>
  );
};

export default TablesScreen;
