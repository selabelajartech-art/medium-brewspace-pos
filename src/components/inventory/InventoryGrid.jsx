import React from 'react'
import { PlusCircle } from 'lucide-react'

export default function InventoryGrid({
  products,
  handleOpenProductModal,
  handleDeleteProduct
}) {
  return (
    <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-extrabold text-sm text-slate-900">Kelola Katalog Produk & Stok</h3>
        <button
          onClick={() => handleOpenProductModal(null)}
          className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {products.map((product) => {
          const variant = product.product_variants?.[0]
          const stock = variant?.inventories?.[0]?.stock ?? 0
          return (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex gap-3 items-center">
              <img src={product.image_url || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-xs text-slate-900">{product.name}</h4>
                <p className="text-xs font-mono font-bold text-blue-700">Rp {parseFloat(variant?.price || 0).toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-slate-400">Stok: {stock} Pcs</p>
                <div className="flex gap-2 mt-1.5">
                  <button onClick={() => handleOpenProductModal(product)} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">Hapus</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}