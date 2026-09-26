import React from 'react'
import { Calendar, FileSpreadsheet, Printer } from 'lucide-react'
import { exportToExcel } from '../../utils/excelExport'

export default function ReportsView({
  filteredHistory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterPreset,
  applyDatePreset,
  setFilterPreset,
  totalRevenue,
  totalOrders,
  avgOrderValue
}) {
  return (
    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Perekapan Data Penjualan
            </h3>
            <p className="text-[11px] text-slate-500">Filter data berdasarkan tanggal kustom atau preset periode tertentu.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => exportToExcel(filteredHistory, startDate, endDate)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel (.xlsx)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-100 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => applyDatePreset('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPreset === 'today' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => applyDatePreset('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPreset === '7days' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => applyDatePreset('this_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPreset === 'this_month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => applyDatePreset('last_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPreset === 'last_month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Bulan Lalu
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px]">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setFilterPreset('custom'); }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px]">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setFilterPreset('custom'); }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Omset Penjualan</span>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Periode: {startDate} s/d {endDate}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Transaksi Selesai</span>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">{totalOrders} Transaksi</h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Sukses terproses</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Rata-rata Nilai Order (AOV)</span>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}</h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Per transaksi</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-xs text-slate-800">Detail Rincian Transaksi ({filteredHistory.length} Record)</h4>
        </div>
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-3">No. Order</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Pelanggan</th>
              <th className="p-3">Tipe Order</th>
              <th className="p-3">Area / Meja</th>
              <th className="p-3">Total Belanja</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                  Tidak ditemukan transaksi pada rentang tanggal ini.
                </td>
              </tr>
            ) : (
              filteredHistory.map((order) => (
                <tr key={order.id}>
                  <td className="p-3 font-bold font-mono text-slate-900">{order.order_number}</td>
                  <td className="p-3 text-slate-500">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-3">{order.customers?.name || 'Umum'}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{order.order_type || 'DINE_IN'}</span></td>
                  <td className="p-3">{order.table_number || '-'}</td>
                  <td className="p-3 font-bold text-blue-700 font-mono">Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{order.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}