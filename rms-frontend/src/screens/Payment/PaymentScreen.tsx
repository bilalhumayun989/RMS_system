import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useAppStore } from '../../store/useAppStore';
import { useTableStore } from '../../store/useTableStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import {
  ArrowLeft, CreditCard, Banknote, Wallet,
  Check, User, Receipt, ChefHat, ArrowDownUp,
} from 'lucide-react';
import { gsap } from 'gsap';

type PaymentMethod = 'cash' | 'card' | 'digital';

export const PaymentScreen: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  const { tableId } = useOrderStore();

  const navigate = useNavigate();
  const addNotification = useAppStore((s) => s.addNotification);
  const updateTableStatus = useTableStore((s) => s.updateTableStatus);
  const tables = useTableStore((s) => s.tables) || [];
  const tableData = tables.find((t) => t.id === tableId);
  const tableDisplayCode = tableData ? `${tableData.section}${tableData.id}` : '—';

  const total = tableData?.amount ?? 0;
  const tax = Number((total / 1.1 * 0.1).toFixed(2));
  const subtotal = Number((total - tax).toFixed(2));

  const paidAmount = parseFloat(amountPaid) || 0;
  const changeAmount = paidAmount - total;
  const isValidPayment = paidAmount >= total;

  useEffect(() => {
    if (showSuccessModal && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)', clearProps: 'transform' }
      );
    }
  }, [showSuccessModal]);

  const paymentOptions: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode; }[] = [
    { id: 'cash', label: 'Cash', description: 'Pay at the counter', icon: <Banknote className="w-5 h-5" /> },
    { id: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, etc.', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'digital', label: 'Digital Wallet', description: 'Apple Pay, Google Pay', icon: <Wallet className="w-5 h-5" /> },
  ];

  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const handleConfirmOrder = async () => {
    if (!total || total <= 0) { addNotification('No order found for this table!', 'error'); return; }
    if (paymentMethod === 'cash' && !isValidPayment) { addNotification('Please enter valid payment amount!', 'error'); return; }
    if (tableId !== null) { await updateTableStatus(tableId, 'available'); }
    setShowSuccessModal(true);
    addNotification(`Payment confirmed for Table ${tableDisplayCode}!`, 'success');
    setTimeout(() => { setShowSuccessModal(false); navigate('/tables'); }, 2800);
  };

  return (
    <PageWrapper className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F4F2F0] font-sans select-none pb-[84px] lg:pb-0">

      {/* LEFT PANEL — Order Summary */}
      <div className="w-full lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-[#1F221D]/10 flex flex-col flex-shrink-0 h-[40vh] lg:h-full max-h-[40vh] lg:max-h-full overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-[#1F221D]/10 flex items-center gap-3 flex-shrink-0 bg-white">
          <button onClick={() => navigate('/tables')} className="p-2 bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl text-[#555754] hover:text-[#1F221D] transition-all active:scale-90">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base lg:text-lg font-semibold text-[#1F221D] tracking-tight">Order Summary</h1>
            <p className="text-[11px] text-[#555754] mt-0.5">Table {tableDisplayCode} · Dine In</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-[#FF7A10]" />
          </div>
          <p className="text-sm font-semibold text-[#1F221D] text-center">Order sent to kitchen</p>
          <p className="text-xs text-[#555754]/60 text-center leading-relaxed">Food has been prepared. Collect payment to complete the order.</p>
          {tableData?.orderId && (
            <div className="bg-[#F4F2F0] border border-[#1F221D]/10 rounded-xl px-4 py-2 mt-1">
              <p className="text-[10px] text-[#555754]/60 text-center">Order ID</p>
              <p className="text-xs font-semibold text-[#1F221D] font-mono text-center">{tableData.orderId}</p>
            </div>
          )}
        </div>

        <div className="hidden lg:block p-4 lg:p-5 border-t border-[#1F221D]/10 bg-[#F4F2F0] space-y-2 flex-shrink-0">
          <div className="flex justify-between text-xs text-[#555754]">
            <span>Subtotal</span><span className="text-[#1F221D]">PKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#555754]">
            <span>Tax (10%)</span><span className="text-[#1F221D]">PKR {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-[#1F221D]/06 pt-2.5">
            <span className="text-[#1F221D]">Total</span>
            <span className="text-[#FF7A10] text-base">PKR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Payment Options */}
      <div className="flex-1 flex flex-col h-[60vh] lg:h-full max-h-[60vh] lg:max-h-full overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-[#1F221D]/10 flex-shrink-0 bg-white">
          <h2 className="text-base lg:text-lg font-semibold text-[#1F221D] tracking-tight">Select Payment Method</h2>
          <p className="text-xs text-[#555754] mt-1">Choose how the customer would like to pay</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 pb-24 lg:pb-6 scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3">
            {paymentOptions.map((opt) => {
              const isSelected = paymentMethod === opt.id;
              return (
                <button key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                  className={`w-full flex items-center gap-4 p-4 lg:p-5 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                    isSelected ? 'bg-[rgba(255,122,16,0.08)] border-[#FF7A10]/30' : 'bg-white border-[#1F221D]/10 hover:border-[#1F221D]/20 hover:bg-[#F4F2F0]'
                  }`}
                >
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#FF7A10] text-white' : 'bg-[#F4F2F0] text-[#555754]'
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-colors ${isSelected ? 'text-[#1F221D]' : 'text-[#555754]'}`}>{opt.label}</p>
                    <p className="text-[11px] text-[#555754]/60 mt-0.5">{opt.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#FF7A10]' : 'border-[#1F221D]/20'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A10]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'cash' && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,122,16,0.08)] flex items-center justify-center text-[#FF7A10] border border-[#FF7A10]/20">
                  <Banknote className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-[#1F221D]">Cash Payment Calculator</p>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#555754] mb-2 block">Amount Paid by Customer</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555754] font-semibold text-sm">PKR</span>
                  <input type="number" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00"
                    className="w-full pl-14 pr-4 py-3.5 bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl text-[#1F221D] placeholder-[#555754]/40 outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-colors text-lg font-semibold" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555754] mb-2">Quick Select</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button key={amt} onClick={() => setAmountPaid(amt.toFixed(2))}
                      className="bg-[#F4F2F0] hover:bg-[rgba(255,122,16,0.08)] border border-[#1F221D]/10 hover:border-[#FF7A10]/30 rounded-lg py-2.5 text-xs font-semibold text-[#1F221D] transition-all active:scale-95">
                      PKR {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#1F221D]/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[#555754]">Bill Total</span><span className="font-semibold text-[#1F221D]">PKR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#555754]">Amount Paid</span>
                  <span className="font-semibold text-[#1F221D]">{paidAmount > 0 ? `PKR ${paidAmount.toFixed(2)}` : '—'}</span>
                </div>
                <div className={`flex items-center justify-between text-base font-semibold pt-2 border-t border-[#1F221D]/10 ${changeAmount >= 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                  <span className="flex items-center gap-2"><ArrowDownUp className="w-4 h-4" />Change to Return</span>
                  <span className="text-lg">
                    {paidAmount > 0 ? changeAmount >= 0 ? `PKR ${changeAmount.toFixed(2)}` : `-PKR ${Math.abs(changeAmount).toFixed(2)}` : '—'}
                  </span>
                </div>
              </div>

              {paidAmount > 0 && !isValidPayment && (
                <div className="bg-[#C62828]/10 border border-[#C62828]/20 rounded-lg p-3 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#C62828]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#C62828] text-xs font-semibold">!</span>
                  </div>
                  <p className="text-xs text-[#C62828] leading-relaxed">Insufficient amount! Customer needs to pay at least <strong>PKR {total.toFixed(2)}</strong></p>
                </div>
              )}

              {isValidPayment && paidAmount > 0 && (
                <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-lg p-3 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#2E7D32]" />
                  </div>
                  <p className="text-xs text-[#2E7D32] leading-relaxed">Payment verified! Ready to confirm order.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555754]">Order Info</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              {[
                { icon: <Receipt className="w-4 h-4" />, label: 'Table', value: tableDisplayCode },
                { icon: <User className="w-4 h-4" />, label: 'Order', value: tableData?.orderId ?? '—', mono: true },
                { icon: <ChefHat className="w-4 h-4" />, label: 'Kitchen', value: 'Ready to send', accent: true },
                { icon: <CreditCard className="w-4 h-4" />, label: 'Payment', value: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F2F0] flex items-center justify-center text-[#555754] flex-shrink-0 border border-[#1F221D]/10">{info.icon}</div>
                  <div>
                    <p className="text-[10px] text-[#555754]/60">{info.label}</p>
                    <p className={`text-xs font-semibold ${info.accent ? 'text-[#2E7D32]' : 'text-[#1F221D]'} ${info.mono ? 'font-mono' : ''}`}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto bg-white lg:bg-transparent border-t lg:border-t-0 border-[#1F221D]/10 p-4 lg:p-6 flex-shrink-0 z-40">
          <button onClick={handleConfirmOrder} disabled={paymentMethod === 'cash' && !isValidPayment}
            className={`w-full rounded-2xl py-4 px-6 flex items-center justify-between font-semibold text-sm lg:text-base transition-all active:scale-[0.98] ${
              paymentMethod === 'cash' && !isValidPayment
                ? 'bg-[#ECEAE7] text-[#555754] border border-[#1F221D]/10'
                : 'bg-[#FF7A10] text-white hover:bg-[#E86000]'
            }`}
          >
            <span>PKR {total.toFixed(2)}</span>
            <span className="flex items-center gap-2">
              {paymentMethod === 'cash' && !isValidPayment ? 'Enter Payment Amount' : 'Confirm Payment →'}
            </span>
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#1F221D]/40 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white border border-[#1F221D]/10 rounded-3xl p-6 lg:p-8 max-w-sm w-full text-center flex flex-col items-center gap-5 shadow-card">
            <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 flex items-center justify-center animate-pulse">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1F221D]">Payment Complete!</h3>
              <p className="text-xs text-[#555754] mt-2 leading-relaxed">Table cleared · Receipt recorded</p>
            </div>
            <div className="bg-[#F4F2F0] border border-[#1F221D]/10 rounded-2xl p-4 w-full space-y-2">
              <div className="flex justify-between text-xs"><span className="text-[#555754]">Table</span><span className="font-semibold text-[#1F221D]">{tableDisplayCode}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#555754]">Payment</span><span className="font-semibold text-[#1F221D] capitalize">{paymentMethod}</span></div>
              {paymentMethod === 'cash' && paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs"><span className="text-[#555754]">Amount Paid</span><span className="font-semibold text-[#1F221D]">PKR {paidAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#555754]">Change</span><span className="font-semibold text-[#2E7D32]">PKR {changeAmount.toFixed(2)}</span></div>
                </>
              )}
              <div className="flex justify-between text-xs"><span className="text-[#555754]">Total Charged</span><span className="font-semibold text-[#FF7A10]">PKR {total.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#555754]">Table Status</span><span className="font-semibold text-[#2E7D32]">Now Available ✓</span></div>
            </div>
            <p className="text-[10px] text-[#555754]/50 animate-bounce mt-1">Returning to floor map…</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default PaymentScreen;
