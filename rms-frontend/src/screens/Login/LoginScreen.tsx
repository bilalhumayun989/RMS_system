import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import { Utensils, User, Delete, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import styles from './LoginScreen.module.css';

type LoginRole = 'employee' | 'admin';

export const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [pin, setPin] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const setUserRole = useAppStore((state) => state.setUserRole);
  const { login, isLoggingIn } = useAuthStore();
  const toast = useToast();

  const cardRef = useRef<HTMLDivElement>(null);
  const pinInputRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    tl.fromTo(pinInputRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.3');
    tl.fromTo(btnRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, '-=0.2');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedRole === 'admin') return;
      if (/^[0-9]$/.test(e.key)) { handleKeyPress(e.key); }
      else if (e.key === 'Backspace') { handleBackspace(); }
      else if (e.key === 'Enter') { e.preventDefault(); handleSignIn(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedRole]);

  const handleKeyPress = (num: string) => { if (pin.length < 4) setPin((prev) => prev + num); };
  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedRole !== 'admin' && pin.length < 4) { toast.error('Enter your 4-digit PIN.'); return; }
    if (selectedRole === 'admin' && (!adminEmail || !adminPassword)) { toast.error('Enter admin email and password.'); return; }

    const response = await login(
      selectedRole,
      selectedRole === 'admin' ? { email: adminEmail, password: adminPassword } : { pin }
    );

    if (response) {
      setUserRole(selectedRole, response.permissions, response.token, response.name, response.role_name);
      toast.success(`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login Successful!`);
      gsap.to(cardRef.current, {
        y: -30, opacity: 0, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          const finalScreen = response.screen === 'staff' ? 'tables' : response.screen;
          navigate('/' + finalScreen);
        }
      });
    } else {
      toast.error(selectedRole === 'admin' ? 'Invalid admin email or password.' : 'Invalid PIN.');
      setPin('');
    }
  };

  const handleBtnMouseEnter = () => { if (btnRef.current) gsap.to(btnRef.current, { scale: 1.03, duration: 0.2, ease: 'power1.out' }); };
  const handleBtnMouseLeave = () => { if (btnRef.current) gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' }); };

  return (
    <div className="flex min-h-screen bg-[#F4F2F0] w-full overflow-hidden font-sans">

      {/* LEFT IMAGE SIDE */}
      <div
        className="hidden md:flex w-[60%] relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1974&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
          <p className="text-xl font-medium leading-relaxed max-w-lg mb-6">
            "Serve customers the best food with prompt and friendly service in a welcoming atmosphere."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
              <User className="w-5 h-5 text-white/70" />
            </div>
            <span className="text-sm font-medium text-white/80">Ray Kroc, founder of Good Eats Grill</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-[45%] 2xl:w-[38%] bg-white border-l border-[#1F221D]/10 flex flex-col justify-center items-center relative z-10 overflow-hidden min-h-screen px-5 sm:px-8 md:px-10 lg:px-12 2xl:px-16">
        <div ref={cardRef} className="w-full max-w-[300px] sm:max-w-[340px] md:max-w-[360px] 2xl:max-w-[320px] flex flex-col items-center scale-[0.92] sm:scale-100 2xl:scale-[0.88]">

          {/* LOGO */}
          <div className="flex flex-col items-center text-center gap-1 sm:gap-2 mb-4 sm:mb-5 2xl:mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#FF7A10]/30 bg-[rgba(255,122,16,0.08)] flex items-center justify-center">
              <Utensils className="w-4 h-4 text-[#FF7A10]" />
            </div>
            <p className="text-[9px] font-semibold text-[#555754] uppercase tracking-widest">RESTO POS</p>
            <h1 className="text-[22px] sm:text-[26px] 2xl:text-[22px] font-semibold tracking-tight text-[#FF7A10]">
              {selectedRole === 'employee' ? 'Employee Login' : 'Admin Login'}
            </h1>
          </div>

          {/* ROLE SELECTOR */}
          <div className="w-full mb-4 sm:mb-5 2xl:mb-4">
            <p className="text-[10px] text-[#555754] mb-1.5 text-center">Choose your account to start your shift</p>
            <div className="relative cursor-pointer" ref={dropdownRef}>
              <div onClick={() => setOpen((prev) => !prev)}
                className="w-full bg-[#F4F2F0] hover:bg-[#ECEAE7] transition-colors rounded-xl p-2.5 flex items-center justify-between border border-[#1F221D]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#1F221D]/10 flex items-center justify-center">
                    {selectedRole === 'employee' ? <Utensils className="w-4 h-4 text-[#555754]" /> : <ShieldCheck className="w-4 h-4 text-[#FF7A10]" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#1F221D] capitalize">{selectedRole} Account</span>
                    <span className="text-[9px] text-[#555754]">{selectedRole === 'admin' ? 'Email and password' : 'PIN access'}</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-white border border-[#1F221D]/10 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#555754]"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
              </div>
              {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#1F221D]/10 rounded-xl shadow-card overflow-hidden z-50">
                  {(['employee', 'admin'] as LoginRole[]).map((role) => (
                    <div key={role} onClick={() => { setSelectedRole(role); setPin(''); setOpen(false); }}
                      className="p-2.5 hover:bg-[#F4F2F0] flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-semibold text-[#1F221D] capitalize">{role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignIn} className="w-full flex flex-col items-center">
            {selectedRole === 'admin' ? (
              <div ref={pinInputRef} className="w-full mb-4 sm:mb-5 2xl:mb-4 space-y-3">
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all"
                  placeholder="Admin email" />
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all"
                  placeholder="Password" />
              </div>
            ) : (
              <>
                <div ref={pinInputRef} className="flex flex-col items-center mb-4 sm:mb-5 2xl:mb-4">
                  <p className="text-[10px] text-[#555754] mb-3">Please input your PIN to validate yourself.</p>
                  <div className="flex items-center gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={styles.pinSquare}>
                        <div className={`${styles.pinDot} ${i < pin.length ? styles.pinDotActive : ''}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`w-full max-w-[220px] sm:max-w-[250px] 2xl:max-w-[220px] ${styles.keypadGrid} mb-4 sm:mb-5`}>
                  {['1','2','3','4','5','6','7','8','9'].map((num) => (
                    <button key={num} type="button" onClick={() => handleKeyPress(num)} className={styles.keypadButton}>{num}</button>
                  ))}
                  <div />
                  <button type="button" onClick={() => handleKeyPress('0')} className={styles.keypadButton}>0</button>
                  <button type="button" onClick={handleBackspace} className={styles.keypadButton}><Delete className="w-4 h-4 opacity-70" /></button>
                </div>
              </>
            )}

            <button ref={btnRef} type="submit" disabled={isLoggingIn}
              onMouseEnter={handleBtnMouseEnter} onMouseLeave={handleBtnMouseLeave}
              className="w-full py-3 sm:py-3.5 2xl:py-3 text-sm sm:text-[15px] 2xl:text-sm bg-[#FF7A10] text-white font-semibold rounded-full hover:bg-[#E86000] active:scale-[0.98] transition-all">
              {isLoggingIn ? 'Signing In...' : 'Start Shift'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
