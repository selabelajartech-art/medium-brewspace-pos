import React, { useState } from 'react'
import { X, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'

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

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.name || form.current_stock === '' || form.cost_per_unit === '') {
      return alert('Mohon lengkapi Nama, Stok, dan Harga Modal per Unit!')
    }

    handleSaveIngredient({
      id: form.id,
      name: form.name,
      unit: form.unit,
      current_stock: parseFloat(form.current_stock) || 0,
      min_stock: parseFloat(form.min_stock) || 0,
      cost_per_unit: parseFloat(form.cost_per_unit) || 0
    })

    setForm({ id: null, name: '', unit: 'Gram', current_stock: '', min_stock: '10', cost_per_unit: '' })
  }

  const handleEdit = (ing) => {
    setForm({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      current_stock: ing.current_stock.toString(),
      min_stock: ing.min_stock.toString(),
      cost_per_unit: ing.cost_per_unit.toString()
    })
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowIngredientModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        <button
          onClick={() => setShowIngredientModal(false)}
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
        <form onSubmit={onSubmit} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
          <h4 className="font-bold text-slate-800">{form.id ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Baru'}</h4>
          
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
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="Gram">Gram (g)</option>
                <option value="ML">ML (Mili)</option>
                <option value="Pcs">Pcs (Buah)</option>
                <option value="Sachet">Sachet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Stok Saat Ini</label>
              <input
                type="number"
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
                placeholder="10"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Harga/Satuan (Rp)</label>
              <input
                type="number"
                placeholder="150"
                value={form.cost_per_unit}
                onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-xs">
              {form.id ? 'Simpan Perubahan' : '+ Simpan Bahan Baku'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ id: null, name: '', unit: 'Gram', current_stock: '', min_stock: '10', cost_per_unit: '' })}
                className="px-3.5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Tabel Daftar Bahan Baku */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Daftar Bahan Baku ({ingredientsList.length})</h4>
          {ingredientsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada data bahan baku.</p>
          ) : (
            ingredientsList.map((ing) => {
              const isLowStock = ing.current_stock <= ing.min_stock
              return (
                <div key={ing.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-900">{ing.name}</h5>
                      {isLowStock && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-black flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Tipis
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Stok: <strong className={isLowStock ? 'text-red-600' : 'text-slate-800'}>{ing.current_stock} {ing.unit}</strong> • Modal: Rp {parseFloat(ing.cost_per_unit).toLocaleString('id-ID')}/{ing.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(ing)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteIngredient(ing.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition">
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