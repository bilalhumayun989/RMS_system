import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useTableStore } from '../../store/useTableStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CartItem, MenuItem } from '../../types';
import {
  ArrowLeft, Search, Plus, Minus, FileText,
  AlertCircle, Sparkles, X,
} from 'lucide-react';

// ── Cart Panel ────────────────────────────────────────────────
interface CartPanelProps {
  compact?: boolean;
  cartItems: CartItem[];
  cartNotes: Record<number, string>;
  cartCount: number;
  subtotal: number;
  tax: number;
  total: number;
  customerName: string;
  tableDisplayCode: string;
  currentTime: string;
  editingNoteId: number | null;
  setCustomerName: (v: string) => void;
  setEditingNoteId: (id: number | null) => void;
  handleSaveNote: (itemId: number, text: string) => void;
  updateQuantity: (id: number, qty: number) => void;
  addItem: (item: MenuItem) => void;
  setCartOpen: (open: boolean) => void;
  onProceed: () => void;
  isSubmitting: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({
  compact = false, cartItems, cartNotes, cartCount, subtotal, tax, total,
  customerName, tableDisplayCode, currentTime, editingNoteId,
  setCustomerName, setEditingNoteId, handleSaveNote,
  updateQuantity, addItem, setCartOpen, onProceed, isSubmitting,
}) => (
  <div className={`flex flex-col flex-1 min-h-0 overflow-hidden ${compact ? 'compact' : ''}`}>

    {/* Customer Info */}
    <div className="px-4 py-3 border-b border-[#1F221D]/10 flex-shrink-0 bg-[#F4F2F0]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555754]">Customer Information</span>
        <div className="bg-[#FF7A10] text-white font-semibold text-xs px-2.5 py-1 rounded-lg leading-none">
          {tableDisplayCode}
        </div>
      </div>
      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
        className="bg-transparent text-sm font-medium text-[#1F221D] outline-none border-b border-[#1F221D]/10 focus:border-[#FF7A10] pb-0.5 w-full transition-colors"
        placeholder="Guest Name" />
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#555754]">
        <span>Table {tableDisplayCode} · Dine in</span>
        <span className="font-mono">{currentTime}</span>
      </div>
    </div>

    {/* Order Details label */}
    <div className="px-4 pt-3 pb-1 flex-shrink-0 flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555754]">Order Details</span>
      {cartCount > 0 && <span className="text-[10px] text-[#FF7A10] font-semibold">{cartCount} items</span>}
    </div>

    {/* Items — scrollable */}
    <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2 min-h-0" style={{ scrollbarWidth: 'none' }}>
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <FileText className="w-8 h-8 text-[#1F221D]/10 mb-2" />
          <p className="text-xs text-[#555754]/50">Cart is empty</p>
        </div>
      ) : (
        cartItems.map((c) => {
          const note = cartNotes[c.item.id] || '';
          const isEditing = editingNoteId === c.item.id;
          return (
            <div key={c.item.id} className="bg-white border border-[#1F221D]/10 rounded-xl p-2.5 hover:bg-[#F4F2F0] transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1F221D] line-clamp-1">{c.item.name}</p>
                  <p className="text-xs text-[#FF7A10] font-semibold mt-0.5">PKR {(c.item.price * c.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-full px-1 py-0.5 flex-shrink-0">
                  <button onClick={() => updateQuantity(c.item.id, c.quantity - 1)}
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90 text-[#555754] hover:text-[#1F221D]">
                    {c.quantity === 1
                      ? <X className="w-2.5 h-2.5 text-[#C62828]/70 hover:text-[#C62828]" />
                      : <Minus className="w-2.5 h-2.5" />}
                  </button>
                  <span className="text-[11px] font-semibold text-[#1F221D] w-4 text-center">{c.quantity}</span>
                  <button onClick={() => addItem(c.item)}
                    className="w-5 h-5 rounded-full bg-[#FF7A10] flex items-center justify-center active:scale-90">
                    <Plus className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              </div>
              <div className="border-t border-[#1F221D]/06 pt-1.5">
                {isEditing ? (
                  <div className="flex gap-1.5 items-center">
                    <input type="text" placeholder="Add note..." defaultValue={note}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(c.item.id, (e.target as HTMLInputElement).value); }}
                      onBlur={(e) => handleSaveNote(c.item.id, e.target.value)}
                      className="flex-1 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-lg px-2 py-0.5 text-[11px] text-[#1F221D] outline-none focus:border-[#FF7A10]/50"
                      autoFocus />
                    <button onClick={() => setEditingNoteId(null)} className="text-[#555754] hover:text-[#1F221D]"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1">
                    {note ? <span className="text-[10px] text-[#555754]/60 italic truncate">"{note}"</span>
                      : <span className="text-[10px] text-[#555754]/30">No notes</span>}
                    <button onClick={() => setEditingNoteId(c.item.id)}
                      className="text-[10px] text-[#FF7A10]/80 hover:text-[#FF7A10] flex items-center gap-0.5 flex-shrink-0 active:scale-95">
                      <FileText className="w-2.5 h-2.5" />{note ? 'Edit' : 'Notes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>

    {/* Totals + Proceed — pinned at bottom */}
    {cartItems.length > 0 && (
      <div className="px-4 py-3 border-t border-[#1F221D]/10 bg-[#F4F2F0] flex-shrink-0 space-y-2.5">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[#555754]">
            <span>Items ({cartCount})</span><span className="text-[#1F221D]">PKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#555754]">
            <span>Tax (10%)</span><span className="text-[#1F221D]">PKR {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm border-t border-[#1F221D]/10 pt-2">
            <span className="text-[#1F221D]">Total</span>
            <span className="text-[#FF7A10]">PKR {total.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => { setCartOpen(false); onProceed(); }} disabled={isSubmitting}
          className={`w-full rounded-2xl py-3.5 px-4 flex items-center justify-between font-semibold text-sm transition-all active:scale-[0.98] ${
            isSubmitting ? 'bg-[#ECEAE7] text-[#555754] cursor-not-allowed' : 'bg-[#FF7A10] text-white hover:bg-[#E86000]'
          }`}>
          <span>PKR {total.toFixed(2)}</span>
          <span>{isSubmitting ? 'Sending to Kitchen…' : 'Send to Kitchen →'}</span>
        </button>
      </div>
    )}
  </div>
);

export const OrderScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All Menu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [cartNotes, setCartNotes] = useState<Record<number, string>>({});
  const [customerName, setCustomerName] = useState<string>('Guest');
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  const { cartItems, tableId, menuItems, addItem, updateQuantity, getSubtotal, getTax, getTotal, fetchMenuItems, sendToKitchen, isSubmitting } = useOrderStore();
  const navigate = useNavigate();
  const updateTableStatus = useTableStore((s) => s.updateTableStatus);
  const tableData = useTableStore((s) => s.tables.find((t) => t.id === tableId));
  const tableDisplayCode = tableData ? `${tableData.section}${tableData.id}` : '—';

  const handleProceed = async () => {
    if (cartItems.length === 0 || tableId === null) return;
    const subtotal = getSubtotal();
    const tax = getTax();
    const total = Number((subtotal + tax).toFixed(2));
    const currentTableId = tableId;
    const orderCode = await sendToKitchen();
    if (orderCode) {
      await updateTableStatus(currentTableId, 'occupied', orderCode, total);
      navigate('/tables');
    }
  };

  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => { fetchMenuItems(); }, [fetchMenuItems]);
  useEffect(() => {
    const fmt = () => setCurrentTime(new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
    fmt();
    const t = setInterval(fmt, 30000);
    return () => clearInterval(t);
  }, []);

  const uniqueCategories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean) as string[])).sort();
  const categories = ['All Menu', ...uniqueCategories];
  const categoryCounts: Record<string, number> = {};
  for (const cat of uniqueCategories) { categoryCounts[cat] = menuItems.filter((item) => item.category === cat).length; }

  const getFilteredItems = (): MenuItem[] => {
    const items = activeCategory === 'All Menu' ? menuItems : menuItems.filter((item) => item.category === activeCategory);
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const filteredItems = getFilteredItems();
  const cartCount = cartItems.reduce((a, c) => a + c.quantity, 0);
  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleSaveNote = (itemId: number, text: string) => {
    setCartNotes((prev) => ({ ...prev, [itemId]: text }));
    setEditingNoteId(null);
  };

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[rgba(255,122,16,0.08)] flex items-center justify-center text-[#FF7A10] border border-[#FF7A10]/20">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-[11px] tracking-widest uppercase text-[#555754]">Categories</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none min-h-0">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = cat === 'All Menu' ? Object.values(categoryCounts).reduce((a, b) => a + b, 0) : categoryCounts[cat] || 0;
          return (
            <button key={cat} onClick={() => { setActiveCategory(cat); onSelect?.(); }}
              className={`w-full rounded-xl px-3 py-3 text-left border transition-all duration-200 active:scale-[0.98] ${
                isActive ? 'bg-[rgba(255,122,16,0.08)] border-[#FF7A10]/30 text-[#1F221D]'
                : 'bg-transparent border-transparent text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7]'
              }`}>
              <p className="text-sm font-semibold leading-none">{cat}</p>
              <p className={`text-[11px] mt-1 font-medium ${isActive ? 'text-[#FF7A10]' : 'text-[#555754]/50'}`}>{count} Items</p>
            </button>
          );
        })}
      </div>
      <button onClick={() => navigate('/tables')}
        className="mt-3 flex items-center justify-center gap-2 py-2.5 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl text-xs font-semibold text-[#555754] hover:text-[#1F221D] transition-all active:scale-95 flex-shrink-0">
        <ArrowLeft className="w-3.5 h-3.5" />Floor Map
      </button>
    </div>
  );

  return (
    <PageWrapper className="h-full flex flex-col overflow-hidden font-sans select-none bg-[#F4F2F0]">

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-[#1F221D]/10 bg-white flex-shrink-0 z-10">
        <button onClick={() => navigate('/tables')}
          className="p-1.5 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-lg text-[#555754] active:scale-90">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555754]" />
          <input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-lg text-xs text-[#1F221D] placeholder-[#555754]/50 outline-none focus:border-[#FF7A10]/40" />
        </div>
        <button onClick={() => setCartOpen(true)} className="relative p-1.5 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-lg text-[#555754]">
          <FileText className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7A10] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TABLET + DESKTOP: 3-col layout ── */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">

        {/* LEFT: Sidebar */}
        <div className="w-44 lg:w-52 bg-white border-r border-[#1F221D]/10 flex-shrink-0 p-3 lg:p-4 flex flex-col overflow-hidden">
          <SidebarContent />
        </div>

        {/* MIDDLE: Header + grid */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1F221D]/10 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/tables')}
                className="p-1.5 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl text-[#555754] hover:text-[#1F221D] active:scale-90">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base font-semibold text-[#1F221D] tracking-tight">Choose Menu</h1>
            </div>
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555754]" />
              <input type="text" placeholder="Search here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl text-xs text-[#1F221D] placeholder-[#555754]/50 outline-none focus:border-[#FF7A10]/40 transition-all" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 lg:p-4 min-h-0 bg-[#F4F2F0]">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertCircle className="w-10 h-10 text-[#1F221D]/10 mb-3" />
                <p className="text-sm font-semibold text-[#555754]">No items found</p>
                <p className="text-xs text-[#555754]/50 mt-1">Try a different keyword</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {filteredItems.map((item) => {
                  const qty = cartItems.find((c) => c.item.id === item.id)?.quantity ?? 0;
                  return (
                    <div key={item.id} onClick={() => addItem(item)}
                      className={`relative group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 select-none border cursor-pointer ${
                        qty > 0 ? 'bg-white border-[#FF7A10]/40' : 'bg-white border-[#1F221D]/10 hover:border-[#1F221D]/20 hover:bg-[#F4F2F0]'
                      }`}>
                      <div className="h-32 lg:h-36 w-full overflow-hidden relative bg-[#ECEAE7] flex-shrink-0 border-b border-[#1F221D]/06">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{item.emoji}</div>
                        )}
                        {item.popular && (
                          <span className="absolute top-2 left-2 bg-[#2E7D32]/10 text-[#2E7D32] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#2E7D32]/20">Popular</span>
                        )}
                        {item.discount && (
                          <span className="absolute top-2 right-2 bg-[#C62828]/10 text-[#C62828] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#C62828]/20">Disc {item.discount}%</span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-3 gap-2">
                        <div>
                          <h3 className="text-xs font-semibold text-[#1F221D] line-clamp-1 leading-snug tracking-wide">{item.name}</h3>
                          <p className="text-[10px] text-[#555754] mt-1 line-clamp-2 leading-relaxed min-h-[2rem]">{item.description || 'Delicately cooked fresh seasonal ingredients.'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto border-t border-[#1F221D]/06 pt-2">
                          <div>
                            {item.discount ? (
                              <div>
                                <span className="text-sm font-semibold text-[#FF7A10]">PKR {item.price.toFixed(2)}</span>
                                <span className="text-[9px] text-[#555754] line-through block leading-none opacity-60">PKR {(item.price / (1 - item.discount / 100)).toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-[#1F221D]">PKR {item.price.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center bg-[#F4F2F0] border border-[#1F221D]/10 rounded-full p-0.5 gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => qty > 0 && updateQuantity(item.id, qty - 1)} disabled={qty === 0}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${qty > 0 ? 'text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] active:scale-90' : 'text-[#1F221D]/15'}`}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-[11px] font-semibold text-[#1F221D] font-mono">{qty}</span>
                            <button onClick={() => addItem(item)}
                              className="w-6 h-6 rounded-full bg-[#FF7A10] flex items-center justify-center active:scale-90 transition-transform duration-200">
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart panel */}
        <div className="w-64 lg:w-72 xl:w-80 bg-white border-l border-[#1F221D]/10 flex-shrink-0 flex flex-col overflow-hidden">
          <CartPanel compact cartItems={cartItems} cartNotes={cartNotes} cartCount={cartCount}
            subtotal={subtotal} tax={tax} total={total} customerName={customerName}
            tableDisplayCode={tableDisplayCode} currentTime={currentTime} editingNoteId={editingNoteId}
            setCustomerName={setCustomerName} setEditingNoteId={setEditingNoteId}
            handleSaveNote={handleSaveNote} updateQuantity={updateQuantity} addItem={addItem}
            setCartOpen={setCartOpen} onProceed={handleProceed} isSubmitting={isSubmitting} />
        </div>
      </div>

      {/* ── MOBILE CONTENTS ── */}
      <div className="md:hidden flex-1 flex flex-col overflow-hidden min-h-0 z-10">
        <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none flex-shrink-0 border-b border-[#1F221D]/10 bg-white">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-all active:scale-95 ${
                activeCategory === cat ? 'bg-[#FF7A10] text-white border-[#FF7A10]' : 'bg-[#F4F2F0] border-[#1F221D]/10 text-[#555754]'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3 pb-24 min-h-0 bg-[#F4F2F0]">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const qty = cartItems.find((c) => c.item.id === item.id)?.quantity ?? 0;
              return (
                <div key={item.id} onClick={() => addItem(item)}
                  className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all cursor-pointer ${qty > 0 ? 'border-[#FF7A10]/40' : 'border-[#1F221D]/10'}`}>
                  <div className="h-28 w-full overflow-hidden relative bg-[#ECEAE7]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">{item.emoji}</div>
                    )}
                    {item.popular && (
                      <span className="absolute top-1.5 left-1.5 bg-[#2E7D32] text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full">Popular</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-2.5 gap-1.5">
                    <h3 className="text-xs font-semibold text-[#1F221D] line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-[#555754] line-clamp-2 leading-relaxed flex-1">{item.description || 'Fresh ingredients.'}</p>
                    <div className="flex items-center justify-between border-t border-[#1F221D]/06 pt-2">
                      <span className="text-sm font-semibold text-[#1F221D]">PKR {item.price.toFixed(2)}</span>
                      <div className="flex items-center bg-[#F4F2F0] border border-[#1F221D]/10 rounded-full p-0.5 gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => qty > 0 && updateQuantity(item.id, qty - 1)} disabled={qty === 0}
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${qty > 0 ? 'text-[#555754] active:scale-90' : 'text-[#1F221D]/20'}`}>
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-4 text-center text-[10px] font-semibold text-[#1F221D]">{qty}</span>
                        <button onClick={() => addItem(item)} className="w-5 h-5 rounded-full bg-[#FF7A10] flex items-center justify-center active:scale-90">
                          <Plus className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE CART BOTTOM SHEET */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 bg-[#1F221D]/40 z-50 flex items-end" onClick={() => setCartOpen(false)}>
          <div className="w-full bg-white rounded-t-3xl flex flex-col max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F221D]/10 flex-shrink-0">
              <span className="text-sm font-semibold text-[#1F221D]">Your Order</span>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7]"><X className="w-4 h-4" /></button>
            </div>
            <CartPanel cartItems={cartItems} cartNotes={cartNotes} cartCount={cartCount}
              subtotal={subtotal} tax={tax} total={total} customerName={customerName}
              tableDisplayCode={tableDisplayCode} currentTime={currentTime} editingNoteId={editingNoteId}
              setCustomerName={setCustomerName} setEditingNoteId={setEditingNoteId}
              handleSaveNote={handleSaveNote} updateQuantity={updateQuantity} addItem={addItem}
              setCartOpen={setCartOpen} onProceed={handleProceed} isSubmitting={isSubmitting} />
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
