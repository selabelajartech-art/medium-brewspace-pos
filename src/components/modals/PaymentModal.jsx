import React, { useState, useEffect } from 'react'
import { X, Check, Users, ShoppingBag, Plus, Minus, AlertCircle, Percent, DollarSign } from 'lucide-react'

export default function PaymentModal({
  setShowPaymentModal,
  grandTotal = 0,
  payments = [],
  setPayments,
  cart = [],
  checkoutLoading = false,
  handleCheckout
}) {
  const [paymentMode, setPaymentMode] = useState('FULL')
  const [splitPeople, setSplitPeople] = useState(2)
  const [currentPersonIndex, setCurrentPersonIndex] = useState(1) // Melacak pembayaran Orang Ke-1, 2, dst.
  const [splitItemQtyMap, setSplitItemQtyMap] = useState({})

  // State Diskon Terintegrasi
  const [discountType, setDiscountType] = useState('FIXED') // 'FIXED' (Rp) atau 'PERCENT' (%)
  const [discountValue, setDiscountValue] = useState('')

  const safeCart = Array.isArray(cart) ? cart : []
  const safePayments = Array.isArray(payments) ? payments : []

  // 1. Kalkulasi Diskon Utama
  const rawDiscountVal = parseFloat(discountValue) || 0
  const calculatedDiscount = Math.min(
    grandTotal,
    discountType === 'PERCENT'
      ? (grandTotal * rawDiscountVal) / 100
      : rawDiscountVal
  )

  const netGrandTotal = Math.max(0, grandTotal - calculatedDiscount)
  const discountRatio = grandTotal > 0 ? calculatedDiscount / grandTotal : 0

  // 2. Kalkulasi Presisi Bagi Rata Tak Terbatas (SPLIT_EQUAL)
  const numPeople = Math.max(1, parseInt(splitPeople) || 1)
  const baseAmountPerPerson = Math.floor(netGrandTotal / numPeople)
  const remainder = netGrandTotal - (baseAmountPerPerson * numPeople)

  // Jika Orang ke-1: Bayar porsi dasar + sisa pecahan rupiah
  // Jika Orang ke-2+: Bayar porsi dasar murni
  const splitAmountPerPerson = currentPersonIndex === 1
    ? baseAmountPerPerson + remainder
    : baseAmountPerPerson

  // Adjust currentPersonIndex jika jumlah orang dikurangi melampaui indeks saat ini
  useEffect(() => {
    if (currentPersonIndex > numPeople) {
      setCurrentPersonIndex(numPeople)
    }
  }, [numPeople, currentPersonIndex])

  // 3. Kalkulasi Pilih Menu (SPLIT_ITEM) - Diskon Proporsional
  const splitItemSubtotal = safeCart.reduce((sum, item) => {
    if (!item) return sum
    const qtyToPay = splitItemQtyMap[item.cartKey] || 0
    return sum + (item.finalPrice || 0) * qtyToPay
  }, 0)

  const netSplitItemTotal = Math.max(0, Math.round(splitItemSubtotal * (1 - discountRatio)))

  // 4. Penentuan Target Total Sesi Ini
  const targetTotal =
    paymentMode === 'SPLIT_EQUAL'
      ? splitAmountPerPerson
      : paymentMode === 'SPLIT_ITEM'
      ? netSplitItemTotal
      : netGrandTotal

  // 5. Auto-Sync Input Pembayaran saat Target Total / Mode Berubah
  useEffect(() => {
    if (typeof setPayments === 'function') {
      const currentMethod = safePayments[0]?.method || 'CASH'
      setPayments([{ method: currentMethod, amount: targetTotal.toString() }])
    }
  }, [targetTotal, paymentMode])

  const totalPaid = safePayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0)
  const changeAmount = Math.max(0, totalPaid - targetTotal)

  const updateSplitQty = (cartKey, maxQty, delta) => {
    const current = splitItemQtyMap[cartKey] || 0
    const next = Math.max(0, Math.min(maxQty, current + delta))
    setSplitItemQtyMap((prev) => ({ ...prev, [cartKey]: next }))
  }

  const handleQuickMoney = (nominal) => {
    if (typeof setPayments === 'function') {
      setPayments([{ method: safePayments[0]?.method || 'CASH', amount: nominal.toString() }])
    }
  }

  const quickMoneyOptions = Array.from(new Set([targetTotal, 10000, 20000, 50000, 100000]))
    .filter((v) => v >= targetTotal)
    .sort((a, b) => a - b)

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPaymentModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto print:hidden"
    >
      <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Proses Pembayaran</h3>
            <p className="text-[11px] text-slate-400 font-medium">Atur diskon, pisah tagihan, atau pilih metode bayar.</p>
          </div>
          <button 
            type="button"
            onClick={() => setShowPaymentModal?.(false)} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Opsi Bayar / Split Bill */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setPaymentMode('FULL')}
            className={`py-2 rounded-lg transition ${paymentMode === 'FULL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Penuh
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('SPLIT_EQUAL')}
            className={`py-2 rounded-lg transition ${paymentMode === 'SPLIT_EQUAL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Bagi Rata
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('SPLIT_ITEM')}
            className={`py-2 rounded-lg transition ${paymentMode === 'SPLIT_ITEM' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pilih Menu
          </button>
        </div>

        {/* Panel Input Diskon Transaksi */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-700">Diskon / Potongan Harga</span>
            {calculatedDiscount > 0 && (
              <span className="font-extrabold text-emerald-600 font-mono text-[11px]">
                - Rp {calculatedDiscount.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`px-2.5 py-1 rounded-lg transition ${discountType === 'FIXED' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('PERCENT')}
                className={`px-2.5 py-1 rounded-lg transition ${discountType === 'PERCENT' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                <Percent className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="number"
              min="0"
              placeholder={discountType === 'PERCENT' ? '10 (%)' : '5000 (Rp)'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Quick Preset Diskon */}
          <div className="flex gap-1.5 overflow-x-auto pt-0.5">
            {[5, 10, 15, 20, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setDiscountType('PERCENT')
                  setDiscountValue(pct.toString())
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-600 rounded-lg shrink-0"
              >
                {pct}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDiscountValue('')}
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-lg shrink-0"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Opsi Bagi Rata Tak Terbatas */}
        {paymentMode === 'SPLIT_EQUAL' && (
          <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60 space-y-3 text-xs">
            {/* Pemilih Jumlah Orang: Preset + Stepper Tambah Orang Tanpa Batas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                <Users className="w-4 h-4 text-blue-600" /> Jumlah Orang:
              </span>
              
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSplitPeople(num)
                      setCurrentPersonIndex(1)
                    }}
                    className={`px-2.5 py-1 rounded-xl font-bold text-xs border transition ${
                      splitPeople === num 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num}P
                  </button>
                ))}

                {/* Counter Tambah/Kurang Orang Kustom */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSplitPeople((prev) => Math.max(2, prev - 1))
                    }}
                    disabled={splitPeople <= 2}
                    className="p-1 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono font-bold text-xs text-blue-700 min-w-[28px] text-center">
                    {splitPeople}P
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitPeople((prev) => prev + 1)
                    }}
                    className="p-1 hover:bg-slate-100 text-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pemilih Orang Ke- Berapa Yang Sedang Membayar */}
            <div className="border-t border-blue-200/60 pt-2.5 space-y-1.5">
              <span className="font-bold text-slate-700 block">Proses Bayar Sesi Ini:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {Array.from({ length: numPeople }, (_, i) => i + 1).map((personNum) => (
                  <button
                    key={personNum}
                    type="button"
                    onClick={() => setCurrentPersonIndex(personNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition ${
                      currentPersonIndex === personNum
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Orang Ke-{personNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Rincian Tagihan Sesi Ini */}
            <div className="border-t border-blue-200/60 pt-2 space-y-1 text-right">
              <p className="text-[11px] text-slate-600">
                Porsi Orang Ke-{currentPersonIndex}: <strong className="text-blue-700 font-mono text-xs">Rp {splitAmountPerPerson.toLocaleString('id-ID')}</strong>
              </p>
              {remainder > 0 && (
                <p className="text-[10px] text-amber-700 flex items-center justify-end gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Orang ke-1 bayar Rp {(baseAmountPerPerson + remainder).toLocaleString('id-ID')}, selebihnya ({numPeople - 1} orang) bayar Rp {baseAmountPerPerson.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Opsi Pilih Menu */}
        {paymentMode === 'SPLIT_ITEM' && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs max-h-48 overflow-y-auto">
            <span className="font-bold text-slate-700 block flex items-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-blue-600" /> Atur porsi dibayar sesi ini:
            </span>
            {safeCart.map((item) => {
              if (!item) return null
              const qtyToPay = splitItemQtyMap[item.cartKey] || 0
              const isSelected = qtyToPay > 0

              return (
                <div
                  key={item.cartKey || item.id}
                  className={`p-2.5 rounded-xl border flex justify-between items-center transition ${
                    isSelected ? 'bg-blue-50/90 border-blue-400' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        updateSplitQty(item.cartKey, item.quantity || 1, e.target.checked ? (item.quantity || 1) : -qtyToPay)
                      }}
                      className="rounded w-4 h-4 text-blue-600 cursor-pointer shrink-0 accent-blue-600"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Rp {(item.finalPrice || 0).toLocaleString('id-ID')} / porsi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateSplitQty(item.cartKey, item.quantity || 1, -1)}
                        disabled={qtyToPay <= 0}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-xs text-slate-900 min-w-[20px] text-center">
                        {qtyToPay} <span className="text-[10px] text-slate-400 font-normal">/ {item.quantity || 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSplitQty(item.cartKey, item.quantity || 1, 1)}
                        disabled={qtyToPay >= (item.quantity || 1)}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Input Pembayaran */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Total Tagihan Sesi Ini:</span>
            <span className="text-base font-black font-mono text-blue-600 truncate">
              Rp {targetTotal.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={safePayments[0]?.method || 'CASH'}
              onChange={(e) => {
                if (typeof setPayments === 'function') {
                  setPayments([{ ...(safePayments[0] || {}), method: e.target.value }])
                }
              }}
              className="w-full sm:w-1/2 bg-white text-slate-800 text-xs p-2.5 rounded-xl font-bold border border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="CASH">Tunai</option>
              <option value="QRIS">QRIS / E-Wallet</option>
              <option value="CARD">Debit / Kredit</option>
              <option value="TRANSFER">Transfer Bank</option>
            </select>

            <input
              type="number"
              value={safePayments[0]?.amount || ''}
              onChange={(e) => {
                if (typeof setPayments === 'function') {
                  setPayments([{ ...(safePayments[0] || {}), amount: e.target.value }])
                }
              }}
              placeholder="0"
              className="w-full sm:w-1/2 bg-white text-slate-900 font-mono font-bold text-sm p-2.5 rounded-xl text-right border border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* Quick Money Options */}
          <div className="flex flex-wrap justify-end gap-1.5 pt-1">
            {quickMoneyOptions.map((nominal, idx) => (
              <button
                key={`btn-quick-${nominal}-${idx}`}
                type="button"
                onClick={() => handleQuickMoney(nominal)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[10px] font-mono text-slate-700 rounded-lg border border-slate-200 font-bold transition shadow-2xs"
              >
                Rp {nominal.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {/* Kembalian */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-bold text-emerald-700">
            <span>Kembalian</span>
            <span className="font-mono text-sm font-black">Rp {changeAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Tombol Selesaikan Transaksi */}
        <button
          type="button"
          disabled={checkoutLoading || totalPaid < targetTotal || targetTotal === 0}
          onClick={() => {
            if (typeof handleCheckout === 'function') {
              handleCheckout(paymentMode, targetTotal, splitItemQtyMap, calculatedDiscount, splitPeople)
            }
          }}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 active:scale-98"
        >
          {checkoutLoading ? 'Memproses Transaksi...' : <><Check className="w-4 h-4 stroke-[3]" /> Selesaikan Transaksi</>}
        </button>

      </div>
    </div>
  )
}