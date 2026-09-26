import React from 'react'
import { X } from 'lucide-react'

export default function ProductModal({
  setShowProductModal,
  editingProduct,
  productForm,
  setProductForm,
  categories,
  handleSaveProduct
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button 
          onClick={() => setShowProductModal(false)} 
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-extrabold text-sm text-slate-900 mb-4">
          {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
        </h3>

        <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1 text-slate-700">Nama Menu</label>
            <input
              type="text"
              placeholder="Contoh: Es Kopi Susu Aren"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
              required
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Kategori Menu</label>
            <select
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium text-slate-800"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Harga (Rp)</label>
              <input
                type="number"
                placeholder="22000"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Stok (Pcs)</label>
              <input
                type="number"
                placeholder="50"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition mt-2"
          >
            {editingProduct ? 'Simpan Perubahan' : '+ Tambah Menu Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}