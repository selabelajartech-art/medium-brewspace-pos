import React from 'react'
import { Coffee, LayoutGrid, History, Package, BarChart2, Users } from 'lucide-react'

export default function Sidebar({
  activeTab,
  setActiveTab,
  setShowAdminStaffModal
}) {
  const navItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: LayoutGrid },
    { id: 'history', label: 'Riwayat Order', icon: History },
    { id: 'inventory', label: 'Kelola Menu', icon: Package },
    { id: 'reports', label: 'Laporan Keuangan', icon: BarChart2 }
  ]

  return (
    <aside className="hidden lg:flex flex-col justify-between w-60 bg-white border-r border-slate-200/80 p-5 shrink-0 z-20">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base leading-tight">MedPOS</h1>
            <p className="text-[11px] font-semibold text-blue-600">POS & Cafe System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}

          {/* Tombol Kelola Tim Staf */}
          <button
            onClick={() => setShowAdminStaffModal?.(true)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>Kelola Tim Kasir</span>
          </button>
        </nav>
      </div>

      {/* Footer Minimalis Sederhana */}
      <div className="pt-4 border-t border-slate-100 px-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Sistem</p>
        <p className="text-[11px] font-extrabold text-slate-700 font-mono mt-0.5">v2.4 • Ready</p>
      </div>
    </aside>
  )
}