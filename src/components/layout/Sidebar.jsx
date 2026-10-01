import React from 'react'
import { LayoutGrid, History, Package, BarChart2, Users, Lock } from 'lucide-react'

export default function Sidebar({
  activeTab,
  setActiveTab,
  setShowAdminStaffModal,
  isManagerOrAdmin,
  lockTerminal
}) {
  // Penyaringan Item Navigasi Berdasarkan Role Staf
  const allNavItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: LayoutGrid, managerOnly: false },
    { id: 'history', label: 'Riwayat Order', icon: History, managerOnly: false },
    { id: 'inventory', label: 'Kelola Menu', icon: Package, managerOnly: true },
    { id: 'reports', label: 'Laporan Keuangan', icon: BarChart2, managerOnly: true }
  ]

  const navItems = allNavItems.filter((item) => !item.managerOnly || isManagerOrAdmin)

  return (
    <aside className="hidden lg:flex flex-col justify-between w-60 bg-white border-r border-slate-200/80 p-5 shrink-0 z-20">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <img
            src="/logo.png"
            alt="Logo Cafe"
            className="w-10 h-10 rounded-2xl object-cover border border-slate-200/80 shadow-2xs shrink-0 p-0.5 bg-white"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/logo.jpg'
            }}
          />
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

          {/* Tombol Kelola Tim Staf (Hanya Manager/Admin) */}
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowAdminStaffModal?.(true)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Kelola Tim Kasir</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer Area: Tombol Kunci Terminal & Status System */}
      <div className="pt-4 border-t border-slate-100 space-y-3 px-1">
        <button
          onClick={lockTerminal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95 border border-slate-200/80"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Kunci Terminal</span>
        </button>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Sistem</p>
          <p className="text-[11px] font-extrabold text-slate-700 font-mono mt-0.5">v2.4 • Secured</p>
        </div>
      </div>
    </aside>
  )
}