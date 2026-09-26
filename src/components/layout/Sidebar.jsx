import React from 'react'
import { Coffee, LayoutGrid, History, Package, BarChart2, Users } from 'lucide-react'

export default function Sidebar({
  activeTab,
  setActiveTab,
  setShowAdminStaffModal,
  activeCashier,
  showShiftDropdown,
  setShowShiftDropdown,
  staffList = [],
  setActiveCashier
}) {
  const cashierInitials = activeCashier?.initials || 'KS'

  return (
    <aside className="hidden md:flex flex-col justify-between w-16 bg-slate-900 border-r border-slate-800 py-4 items-center z-10 shrink-0">
      <div className="space-y-6 flex flex-col items-center w-full">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Coffee className="w-5 h-5" />
        </div>

        <nav className="flex flex-col gap-2 w-full px-2">
          <button
            onClick={() => setActiveTab('pos')}
            title="POS Register"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('history')}
            title="Riwayat Order"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            title="Kelola Menu"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            title="Perekapan Laporan Keuangan"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={() => setShowAdminStaffModal?.(true)}
          title="Admin System: Kelola Tim Kasir"
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
        >
          <Users className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowShiftDropdown?.(!showShiftDropdown)}
            className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-500 text-white font-extrabold text-xs flex items-center justify-center hover:bg-blue-700 transition"
          >
            {cashierInitials}
          </button>

          {showShiftDropdown && (
            <div className="absolute left-14 bottom-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ganti Kasir / Shift</span>
                <button onClick={() => { setShowShiftDropdown?.(false); setShowAdminStaffModal?.(true); }} className="text-[10px] font-bold text-blue-600 hover:underline">
                  Kelola Tim
                </button>
              </div>
              {staffList.map((stf) => (
                <button
                  key={stf.id}
                  onClick={() => {
                    setActiveCashier?.(stf)
                    setShowShiftDropdown?.(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeCashier?.id === stf.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {stf.initials}
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">{stf.name}</p>
                    <p className="text-[9px] text-slate-400 font-normal">{stf.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}