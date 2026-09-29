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
  PackageCheck,
  PieChart
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
  let totalCogs = 0

  filteredHistory.forEach((order) => {
    order.order_items?.forEach((item) => {
      const name = item.name || item.product_variants?.products?.name || 'Produk'
      const qty = item.quantity || 1
      const subtotal = item.subtotal || ((item.unit_price || item.price || 0) * qty)
      const cogs = (item.cogs || item.product_variants?.cogs || 0) * qty

      totalItemsSold += qty
      totalCogs += cogs

      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, qty: 0, revenue: 0 }
      }
      productSalesMap[name].qty += qty
      productSalesMap[name].revenue += subtotal
    })
  })

  const netProfit = Math.max(0, totalRevenue - totalCogs)
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

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
    <div className="flex-1 h-full min-h-0 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 space-y-6 pb-28 md:pb-8">
      
      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900">Analisa Penjualan</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Ringkasan performa finansial & operasional Medium Brew.
            </p>
          </div>

          <button
            type="button"
            onClick={() => exportToExcel(filteredHistory, startDate, endDate)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98 shrink-0 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1 border-t border-slate-100">
          <div className="grid grid-cols-3 md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-600 shrink-0">
            <button
              type="button"
              onClick={() => applyDatePreset('today')}
              className={`px-4 py-2 rounded-xl transition text-center whitespace-nowrap text-xs ${
                filterPreset === 'today'
                  ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('7days')}
              className={`px-4 py-2 rounded-xl transition text-center whitespace-nowrap text-xs ${
                filterPreset === '7days'
                  ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('this_month')}
              className={`px-4 py-2 rounded-xl transition text-center whitespace-nowrap text-xs ${
                filterPreset === 'this_month'
                  ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-mono font-semibold flex-1 max-w-md">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-mono font-bold cursor-pointer w-full text-center"
            />
            <span className="text-slate-400 font-sans font-bold px-1 shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-xs font-mono font-bold cursor-pointer w-full text-center"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Omset</span>
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
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Transaksi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {totalOrders} <span className="text-xs font-bold text-slate-400">Order</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Jumlah order selesai</p>
        </div>

        {/* Margin Keuntungan Bersih */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Laba Bersih / Margin</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/60">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-emerald-600 font-mono">
            Rp {netProfit.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Est. Margin Bersih: {profitMarginPercent}%</p>
        </div>

        {/* Rata-Rata Order */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Rata-Rata / Order</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Rata-rata nilai order per nota</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Top 5 Produk */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Produk Terlaris (Top 5)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Berdasarkan Porsi</span>
          </div>

          <div className="space-y-3.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada data transaksi.</p>
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

        {/* Breakdown Metode Pembayaran */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Breakdown Metode Pembayaran
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Distribusi Omset</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tunai (Cash)</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.CASH.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase block">QRIS / E-Wallet</span>
              <p className="text-sm font-black text-blue-900 font-mono">
                Rp {paymentBreakdown.QRIS.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Debit / Kredit</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.CARD.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Bank Transfer</span>
              <p className="text-sm font-black text-slate-900 font-mono">
                Rp {paymentBreakdown.TRANSFER.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}