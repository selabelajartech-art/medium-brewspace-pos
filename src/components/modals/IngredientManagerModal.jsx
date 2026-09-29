import React, { useState, useEffect } from 'react'
import { X, Edit, Trash2, Package, AlertTriangle, Calculator, ChevronDown, ChevronUp } from 'lucide-react'

export default function IngredientManagerModal({
  setShowIngredientModal,
  ingredientsList = [],
  handleSaveIngredient,
  handleDeleteIngredient
}) {
  const [form, setForm] = useState({
    id: null,
    name: '',
    unit: 'Gram',
    current_stock: '',
    min_stock: '10',
    cost_per_unit: ''
  })

  // State Tambahan untuk Kalkulator Nota Belanja
  const [showHelper, setShowHelper] = useState(false)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [packageQty, setPackageQty] = useState('')
  const [loading, setLoading] = useState(false)

  // Otomatis hitung harga modal per gram/unit jika kalkulator nota diisi
  useEffect(() => {
    const price = parseFloat(purchasePrice)
    const qty = parseFloat(packageQty)

    if (price > 0 && qty > 0) {
      const calculatedUnitCost = (price / qty).toFixed(2)
      setForm((prev) => ({ ...prev, cost_per_unit: calculatedUnitCost }))
    }
  }, [purchasePrice, packageQty])

  const resetForm = () => {
    setForm({ id: null, name: '', unit: 'Gram', current_stock: '', min_stock: '10', cost_per_unit: '' })
    setPurchasePrice('')
    setPackageQty('')
    setShowHelper(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.current_stock === '' || form.cost_per_unit === '') {
      return alert('Mohon lengkapi Nama, Stok, dan Harga Modal per Unit!')
    }

    setLoading(true)
    try {
      if (typeof handleSaveIngredient === 'function') {
        await handleSaveIngredient({
          id: form.id,
          name: form.name.trim(),
          unit: form.unit,
          current_stock: parseFloat(form.current_stock) || 0,
          min_stock: parseFloat(form.min_stock) || 0,
          cost_per_unit: parseFloat(form.cost_per_unit) || 0
        })
      }
      resetForm()
    } catch (err) {
      console.error('Gagal menyimpan bahan:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ing) => {
    setForm({
      id: ing.id,
      name: ing.name || '',
      unit: ing.unit || 'Gram',
      current_stock: (ing.current_stock ?? ing.stock ?? 0).toString(),
      min_stock: (ing.min_stock ?? 10).toString(),
      cost_per_unit: (ing.cost_per_unit ?? 0).toString()
    })
    setPurchasePrice('')
    setPackageQty('')
    setShowHelper(false)
  }

  const onDelete = async (ingId) => {
    if (!ingId) {
      alert('ID bahan baku tidak valid!')
      return
    }
    if (confirm('Yakin ingin menghapus bahan baku ini?')) {
      setLoading(true)
      try {
        if (typeof handleDeleteIngredient === 'function') {
          await handleDeleteIngredient(ingId)
        }
        if (form.id === ingId) {
          resetForm()
        }
      } catch (err) {
        console.error('Gagal menghapus bahan:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowIngredientModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        <button
          type="button"
          onClick={() => setShowIngredientModal?.(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Kelola Stok Bahan Baku Mentah</h3>
            <p className="text-[11px] text-slate-400 font-medium">Atur takaran susu, biji kopi, sirup, dan kemasan.</p>
          </div>
        </div>

        {/* Form Tambah/Edit Bahan Baku */}
        <form onSubmit={onSubmit} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">{form.id ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Baru'}</h4>
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              {showHelper ? 'Sembunyikan Kalkulator Nota' : 'Hitung Modal dari Nota Beli'}
              {showHelper ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Nama Bahan (misal: Biji Kopi Houseblend)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                required
              />
            </div>
            <div>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
              >
                <option value="Gram">Gram (g)</option>
                <option value="ML">ML (Mili)</option>
                <option value="Pcs">Pcs (Buah)</option>
                <option value="Sachet">Sachet</option>
              </select>
            </div>
          </div>

          {/* Sub-Form Helper: Hitung Modal dari Nota Belanja Kemasan */}
          {showHelper && (
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Bantu Hitung Modal per {form.unit} dari Nota Kemasan</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-blue-700 font-bold block mb-1">Total Harga Beli Nota (Rp)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 85000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-blue-700 font-bold block mb-1">Total Isi Kemasan ({form.unit})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 250"
                    value={packageQty}
                    onChange={(e) => setPackageQty(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>
              {parseFloat(form.cost_per_unit) > 0 && (
                <div className="text-[11px] text-blue-800 font-medium pt-1 border-t border-blue-200/60 flex justify-between">
                  <span>Hasil Modal per {form.unit}:</span>
                  <strong className="font-mono text-blue-900">Rp {parseFloat(form.cost_per_unit).toLocaleString('id-ID')} / {form.unit}</strong>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Stok Saat Ini ({form.unit})</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={form.current_stock}
                onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Batas Min. Stok</label>
              <input
                type="number"
                step="any"
                placeholder="10"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Modal/Satuan (Rp/{form.unit})</label>
              <input
                type="number"
                step="any"
                placeholder="150"
                value={form.cost_per_unit}
                onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {form.id ? 'Simpan Perubahan' : '+ Simpan Bahan Baku'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Tabel Daftar Bahan Baku */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
            Daftar Bahan Baku ({ingredientsList.length})
          </h4>
          {ingredientsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada data bahan baku.</p>
          ) : (
            ingredientsList.map((ing) => {
              const currentVal = parseFloat(ing.current_stock ?? ing.stock ?? 0)
              const minVal = parseFloat(ing.min_stock ?? 0)
              const isLowStock = currentVal <= minVal

              return (
                <div key={ing.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-2xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-900 truncate">{ing.name}</h5>
                      {isLowStock && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-black flex items-center gap-0.5 shrink-0">
                          <AlertTriangle className="w-3 h-3" /> Tipis
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Stok: <strong className={isLowStock ? 'text-red-600' : 'text-slate-800'}>{currentVal} {ing.unit}</strong> • Modal: Rp {parseFloat(ing.cost_per_unit || 0).toLocaleString('id-ID')}/{ing.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleEdit(ing)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                      title="Edit Bahan"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onDelete(ing.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                      title="Hapus Bahan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}