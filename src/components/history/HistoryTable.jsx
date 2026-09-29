import React from 'react'
import { Search, Eye, Trash2, Users } from 'lucide-react'

export default function HistoryTable({
  filteredHistory = [],
  historySearch = '',
  setHistorySearch,
  setSelectedOrderDetail,
  handleDeleteOrder
}) {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 space-y-4 pb-28 md:pb-8">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Riwayat Transaksi & Penjualan</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Daftar seluruh nota order yang telah tersimpan di sistem.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor nota..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="bg-slate-50 font-extrabold text-[10px] uppercase tracking-wider border-b border-slate-200/80 text-slate-400">
            <tr>
              <th className="p-4">No. Order</th>
              <th className="p-4">Waktu Transaksi</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Total Tagihan</th>
              <th className="p-4">Tipe Pembayaran</th>
              <th className="p-4 text-center">Aksi</th>
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
              filteredHistory.map((order) => {
                const isSplitEqual = order.payment_mode === 'SPLIT_EQUAL'
                const isSplitItem = order.payment_mode === 'SPLIT_ITEM'

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold font-mono text-slate-900">
                      {order.order_number || 'ORD-' + order.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {order.customers?.name || order.customer || 'Umum'}
                    </td>
                    <td className="p-4 font-bold text-blue-600 font-mono text-sm">
                      Rp {parseFloat(order.total_amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      {isSplitEqual ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-xl font-bold text-[10px] inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> Bagi Rata ({order.split_people || 2}P)
                        </span>
                      ) : isSplitItem ? (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-xl font-bold text-[10px]">
                          Pilih Menu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl font-bold text-[10px]">
                          Penuh
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrderDetail(order)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="Lihat Detail Struk"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <button
                          onClick={() => handleDeleteOrder?.(order.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-xl transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}