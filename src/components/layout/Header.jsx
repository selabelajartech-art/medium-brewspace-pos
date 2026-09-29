import React, { useState, useEffect } from 'react'
import { Search, Users, Calculator, ChevronDown } from 'lucide-react'

export default function Header({
  activeCashier,
  searchQuery,
  setSearchQuery,
  setShowAdminStaffModal,
  showShiftDropdown,
  setShowShiftDropdown,
  setShowShiftClosingModal
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cashierName = activeCashier?.name || 'Kasir'
  const cashierRole = activeCashier?.role || 'KASIR'
  const cashierInitials = activeCashier?.initials || 'KS'

  return (
    <header className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-200/80 flex items-center justify-between bg-white gap-2 sm:gap-4 shrink-0 relative z-30 min-w-0">
      
      {/* Brand & Cashier Status Area */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        {/* Logo Kafe: Hanya tampil di Mobile/Tablet (lg:hidden) agar tidak redundan dengan Sidebar */}
        <img
          src="/logo.png"
          alt="Logo Cafe"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0 bg-white p-0.5 lg:hidden"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = '/logo.jpg'
          }}
        />

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
              Medium Brewspace
            </h2>

            {/* Indikator Status Koneksi */}
            {isOnline ? (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[9px] sm:text-[10px] font-mono font-extrabold text-emerald-700 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden xs:inline">ONLINE</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 border border-red-200/80 text-[9px] sm:text-[10px] font-mono font-extrabold text-red-700 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="hidden xs:inline">OFFLINE</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate">
            Petugas Kasir: <strong className="text-slate-900 font-bold">{cashierName}</strong>
          </p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md min-w-0">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-12 py-1.5 sm:py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition shadow-2xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-mono font-bold text-slate-400 shadow-2xs">
            F2
          </div>
        </div>
      </div>

      {/* Profile & Shift Dropdown Trigger */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowShiftDropdown?.(!showShiftDropdown)}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition text-left focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {cashierInitials}
          </div>
          <div className="hidden sm:block leading-tight pr-1">
            <span className="block text-xs font-black text-slate-900 leading-tight">{cashierName}</span>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cashierRole}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Dropdown Menu Modal Trigger */}
        {showShiftDropdown && (
          <div className="absolute right-0 top-11 sm:top-12 w-52 sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Petugas Aktif</p>
              <p className="text-xs font-black text-slate-900">{cashierName}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowShiftDropdown?.(false)
                setShowShiftClosingModal?.(true)
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition flex items-center gap-2.5"
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Closing Shift & Audit Kas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShiftDropdown?.(false)
                setShowAdminStaffModal?.(true)
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-2.5"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Ganti / Kelola Petugas</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}