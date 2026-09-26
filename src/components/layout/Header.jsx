import React from 'react'
import { Search, Users } from 'lucide-react'

export default function Header({
  activeCashier,
  searchQuery,
  setSearchQuery,
  setShowAdminStaffModal,
  showShiftDropdown,
  setShowShiftDropdown
}) {
  return (
    <header className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Medium Brew and Space</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold font-mono">ONLINE</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Kasir Aktif: <strong className="text-slate-800">{activeCashier.name}</strong> ({activeCashier.role})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk / barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setShowAdminStaffModal(true)}
          className="p-2 bg-slate-200 text-slate-700 rounded-lg text-xs"
        >
          <Users className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowShiftDropdown(!showShiftDropdown)}
          className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center"
        >
          {activeCashier.initials}
        </button>
      </div>
    </header>
  )
}