import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { playBeepSound } from '../utils/sound';

export function useProductActions(master, showToast) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    variant_name: 'Regular',
    price: '',
    stock: '',
    barcode: '',
    image_url: '',
  });
  const [showProductModal, setShowProductModal] = useState(false);

  const handleOpenProductModal = (product = null) => {
    if (product) {
      const variant = product.product_variants?.[0];
      const stock = variant?.inventories?.[0]?.stock ?? 0;
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        category_id: product.category_id || master.categories[0]?.id || '',
        variant_name: variant?.variant_name || 'Regular',
        price: variant?.price || '',
        stock: stock,
        barcode: product.barcode || '',
        image_url: product.image_url || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category_id: master.categories[0]?.id || '',
        variant_name: 'Regular',
        price: '',
        stock: '50',
        barcode: '',
        image_url: '',
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e?.preventDefault();
    if (!productForm.name || !productForm.price) {
      return showToast('Nama dan Harga produk wajib diisi!', 'warning');
    }

    try {
      if (editingProduct) {
        await supabase
          .from('products')
          .update({
            name: productForm.name,
            category_id: productForm.category_id || null,
            image_url: productForm.image_url,
            barcode: productForm.barcode,
          })
          .eq('id', editingProduct.id);

        const variant = editingProduct.product_variants?.[0];
        if (variant) {
          await supabase
            .from('product_variants')
            .update({
              variant_name: productForm.variant_name || 'Regular',
              price: parseFloat(productForm.price),
            })
            .eq('id', variant.id);

          await supabase
            .from('inventories')
            .update({ stock: parseInt(productForm.stock) || 0 })
            .eq('variant_id', variant.id)
            .eq('store_id', master.CURRENT_STORE_ID);
        }
      } else {
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert([
            {
              store_id: master.CURRENT_STORE_ID,
              category_id: productForm.category_id || null,
              name: productForm.name,
              barcode: productForm.barcode,
              image_url: productForm.image_url,
            },
          ])
          .select()
          .single();

        if (prodErr) throw prodErr;

        const { data: newVar, error: varErr } = await supabase
          .from('product_variants')
          .insert([
            {
              product_id: newProd.id,
              variant_name: productForm.variant_name || 'Regular',
              price: parseFloat(productForm.price),
              cogs: parseFloat(productForm.price) * 0.4,
            },
          ])
          .select()
          .single();

        if (varErr) throw varErr;

        await supabase.from('inventories').insert([
          {
            store_id: master.CURRENT_STORE_ID,
            variant_id: newVar.id,
            stock: parseInt(productForm.stock) || 0,
          },
        ]);
      }

      setShowProductModal(false);
      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound();
      showToast('Menu berhasil disimpan!', 'success');
    } catch (err) {
      showToast('Gagal menyimpan produk: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Non-aktifkan produk ini dari katalog?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      if (master.fetchInitialData) await master.fetchInitialData();
      playBeepSound();
      showToast('Produk berhasil dinonaktifkan!', 'success');
    } catch (err) {
      showToast('Gagal menonaktifkan produk: ' + err.message, 'error');
    }
  };

  const handleSaveCategory = async (categoryName) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ store_id: master.CURRENT_STORE_ID, name: categoryName }]);

      if (error) throw error;

      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound();
      showToast(`Kategori "${categoryName}" berhasil ditambahkan!`, 'success');
    } catch (err) {
      showToast('Gagal menambah kategori: ' + err.message, 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Hapus kategori ini? Produk terkait tidak akan terhapus.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound();
      showToast('Kategori berhasil dihapus!', 'info');
    } catch (err) {
      showToast('Gagal menghapus kategori: ' + err.message, 'error');
    }
  };

  return {
    editingProduct,
    setEditingProduct,
    productForm,
    setProductForm,
    showProductModal,
    setShowProductModal,
    handleOpenProductModal,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveCategory,
    handleDeleteCategory
  };
}