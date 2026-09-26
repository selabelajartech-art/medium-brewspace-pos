import React from 'react'

export default function HistoryTable({
  filteredHistory,
  historySearch,
  setHistorySearch,
  setSelectedOrderDetail
}) {
  return (
    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4 pb-28 md:pb-8">
      <div className="flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-slate-900">Riwayat Penjualan</h3>
        <input
          type="text"
          placeholder="Cari order number..."
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-3">No. Order</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Pelanggan</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-bold font-mono">{order.order_number}</td>
                <td className="p-3 text-slate-500">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                <td className="p-3">{order.customers?.name || 'Umum'}</td>
                <td className="p-3 font-bold text-blue-700 font-mono">Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{order.status}</span></td>
                <td className="p-3 text-center">
                  <button onClick={() => setSelectedOrderDetail(order)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}