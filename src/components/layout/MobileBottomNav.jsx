import React from 'react'
import { Store, History, Package, BarChart3 } from 'lucide-react'

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'pos', label: 'Kasir', icon: Store },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'inventory', label: 'Stok', icon: Package },
    { id: 'reports', label: 'Laporan', icon: BarChart3 }
  ]

  return (
    <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center py-2 px-2 fixed bottom-0 left-0 right-0 z-40">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all px-3 py-1.5 rounded-xl ${
              isActive 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} /> 
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}