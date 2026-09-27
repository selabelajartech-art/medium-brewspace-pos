import React from 'react'
import { X, PlusCircle, Save } from 'lucide-react'

export default function ProductModal({
  setShowProductModal,
  editingProduct,
  productForm,
  setProductForm,
  categories = [],
  handleSaveProduct
}) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowProductModal?.(false)
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-4 my-auto">
        <button 
          onClick={() => setShowProductModal?.(false)} 
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">
            {editingProduct ? 'Edit Data Menu' : 'Tambah Menu Baru'}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Lengkapi rincian nama, harga, dan stok katalog.</p>
        </div>

        <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block mb-1 text-slate-700">Nama Menu</label>
            <input
              type="text"
              placeholder="Contoh: Es Kopi Susu Aren"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Kategori Menu</label>
            <select
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Harga (Rp)</label>
              <input
                type="number"
                placeholder="22000"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-2 active:scale-98"
          >
            {editingProduct ? <><Save className="w-4 h-4" /> Simpan Perubahan</> : <><PlusCircle className="w-4 h-4" /> Tambah Menu Baru</>}
          </button>
        </form>
      </div>
    </div>
  )
}