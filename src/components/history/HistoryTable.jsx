import React from 'react'
import { Search, Eye } from 'lucide-react'

export default function HistoryTable({
  filteredHistory = [],
  historySearch,
  setHistorySearch,
  setSelectedOrderDetail
}) {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f8f9fa] space-y-4 pb-28 md:pb-8">
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-black text-sm text-slate-900">Riwayat Transaksi & Penjualan</h3>
          <p className="text-[11px] text-slate-400 font-medium">Daftar seluruh nota order yang telah tersimpan di sistem.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor nota..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Table Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="bg-slate-50 font-extrabold text-[10px] uppercase tracking-wider border-b border-slate-200/80 text-slate-400">
            <tr>
              <th className="p-3.5">No. Order</th>
              <th className="p-3.5">Waktu Transaksi</th>
              <th className="p-3.5">Nama Pelanggan</th>
              <th className="p-3.5">Total Tagihan</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                  Belum ada data riwayat transaksi ditemukan.
                </td>
              </tr>
            ) : (
              filteredHistory.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold font-mono text-slate-900">{order.order_number}</td>
                  <td className="p-3.5 text-slate-500">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-3.5 font-bold text-slate-800">{order.customers?.name || 'Umum'}</td>
                  <td className="p-3.5 font-bold text-blue-600 font-mono text-sm">
                    Rp {parseFloat(order.total_amount || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-lg font-bold text-[10px]">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedOrderDetail(order)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}