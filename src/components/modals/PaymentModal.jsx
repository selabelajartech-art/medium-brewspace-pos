import React, { useState } from 'react'
import { X, Check, Users, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react'

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
  const [splitItemQtyMap, setSplitItemQtyMap] = useState({})

  const safeCart = Array.isArray(cart) ? cart : []
  const safePayments = Array.isArray(payments) ? payments : []

  const numPeople = parseInt(splitPeople) || 1
  const baseAmountPerPerson = Math.floor(grandTotal / numPeople)
  const remainder = grandTotal - (baseAmountPerPerson * numPeople)
  const splitAmountPerPerson = Math.ceil(grandTotal / numPeople)

  const splitItemSubtotal = safeCart.reduce((sum, item) => {
    if (!item) return sum
    const qtyToPay = splitItemQtyMap[item.cartKey] || 0
    return sum + (item.finalPrice || 0) * qtyToPay
  }, 0)

  const targetTotal =
    paymentMode === 'SPLIT_EQUAL'
      ? splitAmountPerPerson
      : paymentMode === 'SPLIT_ITEM'
      ? splitItemSubtotal
      : (grandTotal || 0)

  const totalPaid = safePayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0)
  const changeAmount = Math.max(0, totalPaid - targetTotal)

  // FIX: Mengeluarkan setPayments dari updater callback internal agar tidak memicu re-render conflict
  const updateSplitQty = (cartKey, maxQty, delta) => {
    const current = splitItemQtyMap[cartKey] || 0
    const next = Math.max(0, Math.min(maxQty, current + delta))
    const updated = { ...splitItemQtyMap, [cartKey]: next }

    setSplitItemQtyMap(updated)

    const nextSub = safeCart.reduce((sum, item) => {
      if (!item) return sum
      const q = updated[item.cartKey] || 0
      return sum + (item.finalPrice || 0) * q
    }, 0)

    if (typeof setPayments === 'function') {
      setPayments([{ method: safePayments[0]?.method || 'CASH', amount: nextSub.toString() }])
    }
  }

  const handleQuickMoney = (nominal) => {
    if (typeof setPayments === 'function') {
      setPayments([{ method: safePayments[0]?.method || 'CASH', amount: nominal.toString() }])
    }
  }

  const quickMoneyOptions = Array.from(new Set([targetTotal, 20000, 50000, 100000])).filter(Boolean)

  return (
    // FIX: Klik di luar window (overlay) akan menutup modal
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPaymentModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto print:hidden"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-5 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Proses Pembayaran</h3>
            <p className="text-[11px] text-slate-500">Pilih metode bayar atau pisah tagihan.</p>
          </div>
          <button onClick={() => setShowPaymentModal?.(false)} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setPaymentMode('FULL')
              if (typeof setPayments === 'function') setPayments([{ method: 'CASH', amount: (grandTotal || 0).toString() }])
            }}
            className={`py-2 rounded-lg transition ${paymentMode === 'FULL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Penuh
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMode('SPLIT_EQUAL')
              if (typeof setPayments === 'function') setPayments([{ method: 'CASH', amount: splitAmountPerPerson.toString() }])
            }}
            className={`py-2 rounded-lg transition ${paymentMode === 'SPLIT_EQUAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Bagi Rata
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMode('SPLIT_ITEM')
              if (typeof setPayments === 'function') setPayments([{ method: 'CASH', amount: '0' }])
            }}
            className={`py-2 rounded-lg transition ${paymentMode === 'SPLIT_ITEM' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            Pilih Menu
          </button>
        </div>

        {paymentMode === 'SPLIT_EQUAL' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Jumlah Orang:
              </span>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSplitPeople(num)
                      const amt = Math.ceil((grandTotal || 0) / num)
                      if (typeof setPayments === 'function') setPayments([{ method: safePayments[0]?.method || 'CASH', amount: amt.toString() }])
                    }}
                    className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-bold text-xs border transition ${
                      splitPeople === num ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {num}P
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 space-y-1 text-right">
              <p className="text-[11px] text-slate-600">
                Porsi bayar per orang: <strong className="text-slate-900 font-mono text-xs">Rp {splitAmountPerPerson.toLocaleString('id-ID')}</strong>
              </p>
              {remainder > 0 && (
                <p className="text-[10px] text-amber-700 flex items-center justify-end gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Orang pertama bayar Rp {(baseAmountPerPerson + remainder).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        )}

        {paymentMode === 'SPLIT_ITEM' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs max-h-48 overflow-y-auto">
            <span className="font-bold text-slate-700 block flex items-center gap-1.5">
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
                    isSelected ? 'bg-blue-50/80 border-blue-400' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        updateSplitQty(item.cartKey, item.quantity || 1, e.target.checked ? (item.quantity || 1) : -qtyToPay)
                      }}
                      className="rounded w-4 h-4 text-blue-600 cursor-pointer shrink-0"
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

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Total Tagihan Sesi Ini:</span>
            <span className="text-sm font-black font-mono text-blue-700 truncate">
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
              className="w-full sm:w-1/2 bg-white text-slate-800 text-xs p-2.5 rounded-xl font-bold border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
              className="w-full sm:w-1/2 bg-white text-slate-900 font-mono font-bold text-sm p-2.5 rounded-xl text-right border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-1.5 pt-1">
            {quickMoneyOptions.map((nominal, idx) => (
              <button
                key={`btn-quick-${nominal}-${idx}`}
                type="button"
                onClick={() => handleQuickMoney(nominal)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[10px] font-mono text-slate-700 rounded-lg border border-slate-200 font-bold transition"
              >
                Rp {nominal.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-bold text-emerald-700">
            <span>Kembalian</span>
            <span className="font-mono text-sm font-black">Rp {changeAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={checkoutLoading || totalPaid < targetTotal || targetTotal === 0}
          onClick={() => {
            if (typeof handleCheckout === 'function') {
              handleCheckout(paymentMode, targetTotal, splitItemQtyMap)
            }
          }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400"
        >
          {checkoutLoading ? 'Memproses Transaksi...' : <><Check className="w-4 h-4" /> Selesaikan Transaksi</>}
        </button>

      </div>
    </div>
  )
}