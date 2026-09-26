import React, { useState } from 'react'
import { X, Plus, Edit, Trash2, Tag } from 'lucide-react'

export default function ToppingManagerModal({
  setShowToppingModal,
  toppingsList,
  setToppingsList
}) {
  const [form, setForm] = useState({ id: null, name: '', price: '', categoryType: 'drink' })

  const handleSaveTopping = (e) => {
    e.preventDefault()
    if (!form.name || form.price === '') return alert('Nama dan Harga topping wajib diisi!')

    const priceNum = parseFloat(form.price) || 0

    if (form.id) {
      // Edit Topping Existing
      const updated = toppingsList.map((t) =>
        t.id === form.id ? { ...t, name: form.name, price: priceNum, categoryType: form.categoryType } : t
      )
      setToppingsList(updated)
    } else {
      // Tambah Topping Baru
      const newTopping = {
        id: 'top-' + Date.now(),
        name: form.name,
        price: priceNum,
        categoryType: form.categoryType
      }
      setToppingsList([...toppingsList, newTopping])
    }

    setForm({ id: null, name: '', price: '', categoryType: 'drink' })
  }

  const handleDeleteTopping = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus topping ini?')) return
    setToppingsList(toppingsList.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button
          onClick={() => setShowToppingModal(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Kelola Master Topping & Add-On</h3>
            <p className="text-[11px] text-slate-500">Atur daftar topping dan harga tambahan untuk seluruh menu.</p>
          </div>
        </div>

        {/* Form Tambah/Edit Topping */}
        <form onSubmit={handleSaveTopping} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
          <h4 className="font-bold text-slate-800">{form.id ? 'Edit Topping' : 'Tambah Topping Baru'}</h4>
          
          <input
            type="text"
            placeholder="Nama Topping (misal: Extra Oat Milk / Melted Cheese)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Harga Tambahan (Rp)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
              required
            />
            <select
              value={form.categoryType}
              onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
              className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
            >
              <option value="drink">Khusus Minuman</option>
              <option value="food">Khusus Makanan</option>
              <option value="all">Semua Menu</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              {form.id ? 'Simpan Perubahan' : '+ Tambah Topping'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ id: null, name: '', price: '', categoryType: 'drink' })}
                className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar Topping Terdaftar */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs text-slate-700">Daftar Topping ({toppingsList.length})</h4>
          {toppingsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada topping. Silakan tambah di atas.</p>
          ) : (
            toppingsList.map((top) => (
              <div key={top.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{top.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono">
                    +Rp {top.price.toLocaleString('id-ID')} •{' '}
                    <span className="font-sans font-semibold text-blue-600">
                      {top.categoryType === 'drink' ? 'Minuman' : top.categoryType === 'food' ? 'Makanan' : 'Semua Menu'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setForm({ id: top.id, name: top.name, price: top.price, categoryType: top.categoryType })}
                    className="p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTopping(top.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}