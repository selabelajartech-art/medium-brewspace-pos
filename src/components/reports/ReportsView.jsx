import React from 'react'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Users,
  FileSpreadsheet,
  Award,
  PackageCheck
} from 'lucide-react'
import { exportToExcel } from '../../utils/excelExport'

export default function ReportsView({
  filteredHistory = [],
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterPreset,
  applyDatePreset,
  totalRevenue = 0,
  totalOrders = 0,
  avgOrderValue = 0,
  ingredientsList = []
}) {
  const productSalesMap = {}
  let totalItemsSold = 0

  filteredHistory.forEach((order) => {
    order.order_items?.forEach((item) => {
      const name = item.name || item.product_variants?.products?.name || 'Produk'
      const qty = item.quantity || 1
      const subtotal = item.subtotal || ((item.unit_price || item.price || 0) * qty)

      totalItemsSold += qty

      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, qty: 0, revenue: 0 }
      }
      productSalesMap[name].qty += qty
      productSalesMap[name].revenue += subtotal
    })
  })

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const maxQty = topProducts[0]?.qty || 1

  const paymentBreakdown = { CASH: 0, QRIS: 0, CARD: 0, TRANSFER: 0 }
  filteredHistory.forEach((order) => {
    if (order.order_payments && order.order_payments.length > 0) {
      order.order_payments.forEach((p) => {
        const method = (p.method || 'CASH').toUpperCase()
        if (paymentBreakdown[method] !== undefined) {
          paymentBreakdown[method] += parseFloat(p.amount || 0)
        } else {
          paymentBreakdown.CASH += parseFloat(p.amount || 0)
        }
      })
    } else {
      paymentBreakdown.CASH += parseFloat(order.total_amount || 0)
    }
  })

  const lowStockIngredients = ingredientsList.filter(
    (ing) => parseFloat(ing.current_stock) <= parseFloat(ing.min_stock)
  )

  const cashierSalesMap = {}
  filteredHistory.forEach((order) => {
    const cashierName = order.cashier_name || order.cashier || 'Kasir Staff'
    if (!cashierSalesMap[cashierName]) {
      cashierSalesMap[cashierName] = { name: cashierName, count: 0, total: 0 }
    }
    cashierSalesMap[cashierName].count += 1
    cashierSalesMap[cashierName].total += parseFloat(order.total_amount || 0)
  })
  const cashierList = Object.values(cashierSalesMap)

  return (
    <div className="flex-1 h-full min-h-0 p-4 sm:p-6 overflow-y-auto bg-[#f8f9fa] space-y-6 pb-28 md:pb-8">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-black text-base text-slate-900">Dashboard Analisa Penjualan</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Ringkasan performa finansial & operasional Medium Brew.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => applyDatePreset('today')}
              className={`px-3 py-1.5 rounded-lg transition ${filterPreset === 'today' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => applyDatePreset('7days')}
              className={`px-3 py-1.5 rounded-lg transition ${filterPreset === '7days' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => applyDatePreset('this_month')}
              className={`px-3 py-1.5 rounded-lg transition ${filterPreset === 'this_month' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'}`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-mono font-bold">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
            />
          </div>

          {/* Ekspor Excel */}
          <button
            onClick={() => exportToExcel(filteredHistory, startDate, endDate)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Total Omset</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Akumulasi pendapatan kotor</p>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Total Transaksi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {totalOrders} <span className="text-xs font-bold text-slate-400">Order</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Jumlah transaksi selesai</p>
        </div>

        {/* AOV */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Rata-Rata / Order (AOV)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Nilai belanja rata-rata</p>
        </div>

        {/* Produk Terjual */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Produk Terjual</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {totalItemsSold} <span className="text-xs font-bold text-slate-400">Item</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Total porsi keluar</p>
        </div>
      </div>

      {/* Analytics Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Top 5 Produk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Produk Terlaris (Top 5)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Berdasarkan Porsi</span>
          </div>

          <div className="space-y-3.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada data transaksi pada periode ini.</p>
            ) : (
              topProducts.map((item, idx) => {
                const percentage = Math.round((item.qty / maxQty) * 100)
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{idx + 1}. {item.name}</span>
                      <span className="font-mono text-slate-900">{item.qty} Pcs <span className="text-slate-400 font-normal">(Rp {item.revenue.toLocaleString('id-ID')})</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Breakdown Pembayaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Breakdown Metode Pembayaran
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Distribusi Omset</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tunai (Cash)</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.CASH.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase block">QRIS / E-Wallet</span>
              <p className="text-sm font-black text-blue-900 font-mono">
                Rp {paymentBreakdown.QRIS.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Debit / Kredit</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.CARD.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Bank Transfer</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.TRANSFER.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Peringatan Stok Bahan Baku */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Peringatan Stok Bahan Baku
            </h3>
            <span className="text-[10px] text-red-600 font-bold">{lowStockIngredients.length} Perlu Restock</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {lowStockIngredients.length === 0 ? (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/60 text-center text-xs text-blue-800 font-bold">
                Semua stok bahan baku saat ini berada dalam kondisi aman.
              </div>
            ) : (
              lowStockIngredients.map((ing) => (
                <div key={ing.id} className="flex justify-between items-center p-2.5 bg-red-50 border border-red-200/60 rounded-xl text-xs">
                  <div>
                    <h5 className="font-bold text-red-900">{ing.name}</h5>
                    <p className="text-[10px] text-red-600 font-mono">
                      Stok Tersisa: <strong>{ing.current_stock} {ing.unit}</strong> (Min: {ing.min_stock} {ing.unit})
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-600 text-white font-extrabold text-[9px] rounded-lg uppercase">
                    Kritis
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Penjualan per Kasir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Penjualan Per Kasir
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Performa Staf</span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {cashierList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada data transaksi.</p>
            ) : (
              cashierList.map((stf) => (
                <div key={stf.name} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{stf.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">{stf.count} Transaksi Selesai</p>
                  </div>
                  <span className="font-black text-slate-900 font-mono">
                    Rp {stf.total.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}