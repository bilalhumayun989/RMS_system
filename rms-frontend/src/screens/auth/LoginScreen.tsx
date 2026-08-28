import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Utensils, ChefHat, ShieldCheck, Delete } from 'lucide-react';

type UserRole = 'staff' | 'admin' | 'kitchen';

const ROLES: { id: UserRole; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'staff',   label: 'Staff / Waiter',    icon: <Utensils className="w-5 h-5" />,    hint: 'PIN: 1234' },
  { id: 'kitchen', label: 'Kitchen',            icon: <ChefHat className="w-5 h-5" />,     hint: 'PIN: 9999' },
  { id: 'admin',   label: 'Admin / Manager',    icon: <ShieldCheck className="w-5 h-5" />, hint: 'Email & password login' },
];

export const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [pin, setPin] = useState('');
  const { login, loginError } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('DEL');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedRole]);

  const handleKey = (k: string) => {
    if (k === 'DEL') { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const newPin = pin + k;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => {
        login(selectedRole, { pin: newPin }).then((screen) => {
          if (!screen) setPin('');
        });
      }, 150);
    }
  };

  const roleConfig = ROLES.find((r) => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-[#F4F2F0] flex flex-col items-center justify-center p-4">

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#FF7A10] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Utensils className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-[#1F221D] tracking-tight">RestoPOS</h1>
        <p className="text-sm text-[#555754] mt-1">Restaurant Management System</p>
      </div>

      {/* Role Selector */}
      <div className="w-full max-w-sm mb-6">
        <p className="text-xs text-[#555754] uppercase tracking-wider mb-2 text-center font-medium">Select Your Role</p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedRole(r.id); setPin(''); }}
              className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                selectedRole === r.id
                  ? 'border-[#FF7A10] bg-[#FF7A10]/10 text-[#E86000]'
                  : 'border-[#1F221D]/10 bg-white text-[#555754] hover:border-[#FF7A10]/30 hover:text-[#1F221D]'
              }`}
            >
              {r.icon}
              <span className="leading-tight text-center">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PIN Display */}
      <div className="w-full max-w-sm mb-5">
        <p className="text-xs text-[#555754] uppercase tracking-wider mb-3 text-center font-medium">Enter PIN</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                i < pin.length
                  ? 'border-[#FF7A10] bg-[#FF7A10]'
                  : 'border-[#1F221D]/15 bg-white'
              }`}
            >
              {i < pin.length && <div className="w-3 h-3 rounded-full bg-white" />}
            </div>
          ))}
        </div>
        {loginError && (
          <p className="text-center text-xs text-[#C62828] font-medium mt-2">{loginError}</p>
        )}
      </div>

      {/* Numpad */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2">
        {['1','2','3','4','5','6','7','8','9','','0','DEL'].map((k, idx) => (
          k === '' ? <div key={idx} /> :
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`h-14 rounded-xl text-lg font-medium transition-all active:scale-95 cursor-pointer ${
              k === 'DEL'
                ? 'bg-white border border-[#C62828]/20 text-[#C62828] hover:bg-[#C62828]/08 flex items-center justify-center'
                : 'bg-white border border-[#1F221D]/10 text-[#1F221D] hover:bg-[#ECEAE7]'
            }`}
          >
            {k === 'DEL' ? <Delete className="w-5 h-5 mx-auto" /> : k}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-[#555754]/60 mt-6">{roleConfig.hint}</p>
    </div>
  );
};

export default LoginScreen;
