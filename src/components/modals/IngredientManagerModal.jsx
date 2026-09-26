import React, { useState } from 'react'
import { X, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'

export default function IngredientManagerModal({
  setShowIngredientModal,
  ingredientsList,
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-2xl relative border border-slate-200">
        <button
          onClick={() => setShowIngredientModal(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Kelola Stok Bahan Baku Mentah</h3>
            <p className="text-[11px] text-slate-500">Atur takaran susu, biji kopi, sirup, dan kemasan.</p>
          </div>
        </div>

        {/* Form Tambah/Edit Bahan Baku */}
        <form onSubmit={onSubmit} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
          <h4 className="font-bold text-slate-800">{form.id ? 'Edit Data Bahan Baku' : 'Tambah Bahan Baku Baru'}</h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Nama Bahan (misal: Biji Kopi Houseblend)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                required
              />
            </div>
            <div>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
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
              <label className="text-[10px] text-slate-500 font-medium block">Stok Saat Ini</label>
              <input
                type="number"
                placeholder="0"
                value={form.current_stock}
                onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-medium block">Batas Min. Stok</label>
              <input
                type="number"
                placeholder="10"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-medium block">Harga/Satuan (Rp)</label>
              <input
                type="number"
                placeholder="150"
                value={form.cost_per_unit}
                onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition">
              {form.id ? 'Simpan Perubahan' : '+ Simpan Bahan Baku'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ id: null, name: '', unit: 'Gram', current_stock: '', min_stock: '10', cost_per_unit: '' })}
                className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Tabel Daftar Bahan Baku */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Daftar Bahan Baku ({ingredientsList.length})</h4>
          {ingredientsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada data bahan baku.</p>
          ) : (
            ingredientsList.map((ing) => {
              const isLowStock = ing.current_stock <= ing.min_stock
              return (
                <div key={ing.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-900">{ing.name}</h5>
                      {isLowStock && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Tipis
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Stok: <strong className={isLowStock ? 'text-red-600' : 'text-slate-800'}>{ing.current_stock} {ing.unit}</strong> • Modal: Rp {parseFloat(ing.cost_per_unit).toLocaleString('id-ID')}/{ing.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(ing)} className="p-1.5 text-slate-400 hover:text-blue-600">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteIngredient(ing.id)} className="p-1.5 text-slate-400 hover:text-red-600">
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