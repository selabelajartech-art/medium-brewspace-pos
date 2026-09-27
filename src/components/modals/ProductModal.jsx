import React from 'react'
import { X, PlusCircle, Save, PackagePlus } from 'lucide-react'

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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-slate-200 space-y-5 my-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {editingProduct ? 'Edit Menu Katalog' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Lengkapi rincian nama, harga, dan stok katalog.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProductModal?.(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProduct} className="space-y-4">
          
          {/* Nama Menu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nama Menu</label>
            <input
              type="text"
              required
              placeholder="Contoh: Es Kopi Susu Aren"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-medium text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Kategori Menu */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Kategori Menu</label>
            <select
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-semibold text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
            >
              <option value="">-- Pilih Kategori Menu --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Harga & Stok Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Harga (Rp)</label>
              <input
                type="number"
                required
                placeholder="22000"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono font-bold text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Stok (Pcs)</label>
              <input
                type="number"
                required
                placeholder="50"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono font-bold text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98 mt-2"
          >
            {editingProduct ? (
              <>
                <Save className="w-4 h-4" /> Simpan Perubahan
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Tambah Menu Baru
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  )
}