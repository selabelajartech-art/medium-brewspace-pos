import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldCheck, UserCheck, Coffee } from 'lucide-react';

export function LockScreen({ staffList = [], onUnlock, showToast }) {
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList, selectedStaffId]);

  // Input Keyboard PC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedStaffId]);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        submitUnlock(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const submitUnlock = (pinToSubmit) => {
    const res = onUnlock(selectedStaffId, pinToSubmit);
    if (!res?.success) {
      setErrorMsg(res?.message || 'PIN yang dimasukkan salah!');
      setPin('');
      if (showToast) showToast(res?.message || 'PIN Salah!', 'error');
    } else {
      if (showToast) showToast(`Selamat bertugas, ${res.staff.name}!`, 'success');
    }
  };

  const activeStaff = staffList.find((s) => String(s.id) === String(selectedStaffId));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Glow Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100/80 flex flex-col items-center my-auto">
        
        {/* Brand Header & Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/logo.png"
            alt="Logo Cafe"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm p-0.5 bg-white"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.jpg';
            }}
          />
          <div className="text-left">
            <h1 className="font-black text-slate-900 text-base leading-tight">Medium Brewspace</h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">POS Terminal System</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-6">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Terminal Terkunci</span>
        </div>

        {/* Staff Selection Grid */}
        <div className="w-full mb-5">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Pilih Staf Jaga
            </label>
            <span className="text-[10px] text-slate-400 font-semibold">{staffList.length} Petugas</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50/80 rounded-2xl border border-slate-100">
            {staffList.map((s) => {
              const isSelected = String(s.id) === String(selectedStaffId);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStaffId(s.id);
                    setPin('');
                    setErrorMsg('');
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-blue-600 bg-white text-blue-900 shadow-md ring-2 ring-blue-600/20'
                      : 'border-transparent hover:bg-slate-200/60 text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.initials || s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black truncate leading-snug">{s.name}</p>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase">{s.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Staff Indicator & PIN Dots */}
        <div className="flex flex-col items-center mb-5">
          <span className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-100">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Profil: <strong className="text-slate-900">{activeStaff?.name || 'Kasir'}</strong>
          </span>

          {/* PIN Indicators */}
          <div className="flex gap-3 my-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-blue-600 border-blue-600 scale-125 shadow-md shadow-blue-500/30'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 mt-2 animate-bounce">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-black text-lg rounded-2xl border border-slate-200/70 shadow-2xs transition active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-2xl border border-rose-100 transition active:scale-95"
          >
            RESET
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-black text-lg rounded-2xl border border-slate-200/70 shadow-2xs transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center rounded-2xl border border-slate-200 transition active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Security */}
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured Terminal v2.4 by Selba Digital</span>
        </div>
      </div>
    </div>
  );
}

export default LockScreen;