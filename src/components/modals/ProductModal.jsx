import React from 'react'
import { X } from 'lucide-react'

export default function ProductModal({
  setShowProductModal,
  editingProduct,
  productForm,
  setProductForm,
  handleSaveProduct
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative border border-slate-200">
        <button onClick={() => setShowProductModal(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-sm text-slate-900 mb-3">{editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
        <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
          <input type="text" placeholder="Nama Menu" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg" required />
          <input type="number" placeholder="Harga (Rp)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg" required />
          <input type="number" placeholder="Stok Pcs" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg" />
          <input type="text" placeholder="URL Foto Unsplash" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg" />
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700">Simpan Produk</button>
        </form>
      </div>
    </div>
  )
}