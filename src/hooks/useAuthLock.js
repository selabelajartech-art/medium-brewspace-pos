import { useState, useEffect } from 'react';

export function useAuthLock(staffList, masterActiveCashier, setMasterActiveCashier) {
  const [isLocked, setIsLocked] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_is_locked');
      return saved !== null ? JSON.parse(saved) : true; // Default TERKUNCI pada perangkat baru
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('medium_brew_is_locked', JSON.stringify(isLocked));
  }, [isLocked]);

  const lockTerminal = () => {
    setIsLocked(true);
  };

  const unlockTerminal = (staffId, pin) => {
    const staff = staffList.find((s) => String(s.id) === String(staffId));
    if (!staff) {
      return { success: false, message: 'Staf tidak ditemukan!' };
    }

    // Verifikasi PIN Staf
    if (String(staff.pin) === String(pin)) {
      setMasterActiveCashier(staff);
      setIsLocked(false);
      return { success: true, staff };
    } else {
      return { success: false, message: 'PIN yang Anda masukkan salah!' };
    }
  };

  const activeRole = (masterActiveCashier?.role || 'CASHIER').toUpperCase();
  const isManagerOrAdmin = activeRole === 'MANAGER' || activeRole === 'ADMIN';

  return {
    isLocked,
    setIsLocked,
    lockTerminal,
    unlockTerminal,
    activeRole,
    isManagerOrAdmin
  };
}