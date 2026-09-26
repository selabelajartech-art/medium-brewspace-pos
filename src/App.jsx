import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import ProductGrid from './components/pos/ProductGrid'
import OrderRegisterPane from './components/pos/OrderRegisterPane'
import HistoryTable from './components/history/HistoryTable'
import InventoryGrid from './components/inventory/InventoryGrid'
import ReportsView from './components/reports/ReportsView'

import AdminStaffModal from './components/modals/AdminStaffModal'
import ProductModal from './components/modals/ProductModal'
import PaymentModal from './components/modals/PaymentModal'
import ReceiptModal from './components/modals/ReceiptModal'

import { ShoppingCart, X } from 'lucide-react'

const CURRENT_STORE_ID = 'a0000000-0000-0000-0000-000000000001'

export default function App() {
  const [activeTab, setActiveTab] = useState('pos')

  // Staff Management State
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('medium_brew_staff_list')
    return saved ? JSON.parse(saved) : [
      { id: 'stf-1', name: 'Rian Prasetya', role: 'Kasir Shift 1', initials: 'RP' },
      { id: 'stf-2', name: 'Dian Sastro', role: 'Kasir Shift 2', initials: 'DS' },
      { id: 'stf-3', name: 'Bima Sakti', role: 'Barista Utama', initials: 'BS' }
    ]
  })
  const [activeCashier, setActiveCashier] = useState(staffList[0])
  const [showShiftDropdown, setShowShiftDropdown] = useState(false)
  const [showAdminStaffModal, setShowAdminStaffModal] = useState(false)

  // Supabase Data States
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [ordersHistory, setOrdersHistory] = useState([])
  
  // POS Cart State
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState('DINE_IN')
  const [payments, setPayments] = useState([{ method: 'CASH', amount: '' }])
  const [discountAmount, setDiscountAmount] = useState(0)

  // Mobile Drawer & Modals
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '', category_id: '', variant_name: 'Regular', price: '', stock: '', barcode: '', image_url: ''
  })

  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Filters & Calendar States
  const [historySearch, setHistorySearch] = useState('')
  const [startDate, setStartDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [filterPreset, setFilterPreset] = useState('this_month')

  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('medium_brew_staff_list', JSON.stringify(staffList))
  }, [staffList])

  useEffect(() => {
    fetchInitialData()
    fetchHistory()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    const [prodRes, catRes, custRes] = await Promise.all([
      supabase.from('products').select(`
        id, name, barcode, image_url, category_id,
        product_variants (id, variant_name, price, cogs, inventories(stock))
      `).order('name'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('customers').select('*').order('name')
    ])

    if (prodRes.data) setProducts(prodRes.data)
    if (catRes.data) setCategories(catRes.data)
    if (custRes.data) setCustomers(custRes.data)
    setLoading(false)
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name, phone),
        order_items (*, product_variants (*, products (name))),
        order_payments (*)
      `)
      .order('created_at', { ascending: false })

    if (data) setOrdersHistory(data)
  }

  const applyDatePreset = (preset) => {
    setFilterPreset(preset)
    const now = new Date()
    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0]
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (preset === '7days') {
      const past = new Date()
      past.setDate(now.getDate() - 7)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(now.toISOString().split('T')[0])
    } else if (preset === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      setStartDate(firstDayLastMonth)
      setEndDate(lastDayLastMonth)
    }
  }

  const filteredHistory = ordersHistory.filter((order) => {
    const orderDate = new Date(order.created_at)
    const start = startDate ? new Date(startDate + 'T00:00:00') : null
    const end = endDate ? new Date(endDate + 'T23:59:59') : null

    let matchDate = true
    if (start && orderDate < start) matchDate = false
    if (end && orderDate > end) matchDate = false

    const matchSearch =
      order.order_number?.toLowerCase().includes(historySearch.toLowerCase()) ||
      order.customers?.name?.toLowerCase().includes(historySearch.toLowerCase())

    return matchDate && matchSearch
  })

  const totalRevenue = filteredHistory.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const totalOrders = filteredHistory.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const handleOpenProductModal = (product = null) => {
    if (product) {
      const variant = product.product_variants?.[0]
      const stock = variant?.inventories?.[0]?.stock ?? 0
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        category_id: product.category_id || '',
        variant_name: variant?.variant_name || 'Regular',
        price: variant?.price || '',
        stock: stock,
        barcode: product.barcode || '',
        image_url: product.image_url || ''
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        name: '',
        category_id: categories[0]?.id || '',
        variant_name: 'Regular',
        price: '',
        stock: '50',
        barcode: '',
        image_url: ''
      })
    }
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name || !productForm.price) return alert('Nama dan Harga wajib diisi!')

    setLoading(true)
    try {
      if (editingProduct) {
        await supabase
          .from('products')
          .update({
            name: productForm.name,
            category_id: productForm.category_id || null,
            image_url: productForm.image_url,
            barcode: productForm.barcode
          })
          .eq('id', editingProduct.id)

        const variant = editingProduct.product_variants?.[0]
        if (variant) {
          await supabase
            .from('product_variants')
            .update({
              variant_name: productForm.variant_name,
              price: parseFloat(productForm.price)
            })
            .eq('id', variant.id)

          await supabase
            .from('inventories')
            .update({ stock: parseInt(productForm.stock) || 0 })
            .eq('variant_id', variant.id)
            .eq('store_id', CURRENT_STORE_ID)
        }
      } else {
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert([{
            store_id: CURRENT_STORE_ID,
            category_id: productForm.category_id || null,
            name: productForm.name,
            barcode: productForm.barcode,
            image_url: productForm.image_url
          }])
          .select()
          .single()

        if (prodErr) throw prodErr

        const { data: newVar, error: varErr } = await supabase
          .from('product_variants')
          .insert([{
            product_id: newProd.id,
            variant_name: productForm.variant_name || 'Regular',
            price: parseFloat(productForm.price),
            cogs: parseFloat(productForm.price) * 0.4
          }])
          .select()
          .single()

        if (varErr) throw varErr

        await supabase.from('inventories').insert([{
          store_id: CURRENT_STORE_ID,
          variant_id: newVar.id,
          stock: parseInt(productForm.stock) || 0
        }])
      }

      setShowProductModal(false)
      fetchInitialData()
      alert('Produk berhasil disimpan!')
    } catch (err) {
      alert('Gagal menyimpan produk: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    setLoading(true)
    await supabase.from('products').delete().eq('id', id)
    fetchInitialData()
    setLoading(false)
  }

  const updateCartQuantity = (product, variant, delta) => {
    const stock = variant.inventories?.[0]?.stock ?? 0
    const cartKey = `${product.id}-${variant.id}`

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey)

      if (existing) {
        const newQty = existing.quantity + delta
        if (newQty > stock) {
          alert('Jumlah melebihi stok yang tersedia!')
          return prev
        }
        if (newQty <= 0) {
          return prev.filter((item) => item.cartKey !== cartKey)
        }
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: newQty } : item
        )
      } else if (delta > 0) {
        if (stock <= 0) {
          alert('Stok produk habis!')
          return prev
        }
        return [
          ...prev,
          {
            cartKey,
            product_id: product.id,
            variant_id: variant.id,
            name: product.name,
            variant_name: variant.variant_name,
            price: parseFloat(variant.price),
            image_url: product.image_url,
            quantity: 1
          }
        ]
      }
      return prev
    })
  }

  const getCartQuantity = (productId, variantId) => {
    const item = cart.find((i) => i.cartKey === `${productId}-${variantId}`)
    return item ? item.quantity : 0
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const grandTotal = Math.max(0, subtotal - discountAmount)
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!')
    if (totalPaid < grandTotal) return alert('Uang pembayaran kurang!')

    setCheckoutLoading(true)
    const itemsPayload = cart.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }))

    const paymentsPayload = payments.map((p) => ({
      method: p.method,
      amount: parseFloat(p.amount) || 0
    }))

    try {
      const { data: orderId, error } = await supabase.rpc('process_advanced_checkout', {
        p_store_id: CURRENT_STORE_ID,
        p_shift_id: null,
        p_user_id: null,
        p_customer_id: null,
        p_order_type: orderType,
        p_table_number: tableNumber || '1',
        p_status: 'COMPLETED',
        p_subtotal: subtotal,
        p_discount: discountAmount,
        p_tax: 0,
        p_total: grandTotal,
        p_items: itemsPayload,
        p_payments: paymentsPayload
      })

      if (error) throw error

      setLastTransaction({
        id: orderId,
        order_number: 'ORD-' + orderId.substring(0, 6).toUpperCase(),
        date: new Date().toLocaleString('id-ID'),
        items: [...cart],
        grandTotal,
        payments,
        change: totalPaid - grandTotal,
        customer: customerName || 'Umum',
        cashier: activeCashier.name
      })

      setShowPaymentModal(false)
      setIsMobileCartOpen(false)
      setShowReceiptModal(true)
      setCart([])
      setCustomerName('')
      setTableNumber('')
      setPayments([{ method: 'CASH', amount: '' }])
      fetchInitialData()
      fetchHistory()
    } catch (err) {
      alert('Gagal transaksi: ' + err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode === searchQuery
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 font-sans text-slate-800 antialiased select-none flex items-center justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl min-h-[92vh] flex overflow-hidden border border-slate-200">
        
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowAdminStaffModal={setShowAdminStaffModal}
          activeCashier={activeCashier}
          showShiftDropdown={showShiftDropdown}
          setShowShiftDropdown={setShowShiftDropdown}
          staffList={staffList}
          setActiveCashier={setActiveCashier}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <Header
            activeCashier={activeCashier}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowAdminStaffModal={setShowAdminStaffModal}
            showShiftDropdown={showShiftDropdown}
            setShowShiftDropdown={setShowShiftDropdown}
          />

          <div className="flex flex-1 overflow-hidden">
            {activeTab === 'pos' && (
              <div className="flex flex-1 overflow-hidden relative">
                <ProductGrid
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  ordersHistory={ordersHistory}
                  setActiveTab={setActiveTab}
                  loading={loading}
                  filteredProducts={filteredProducts}
                  getCartQuantity={getCartQuantity}
                  updateCartQuantity={updateCartQuantity}
                />

                <div className="hidden lg:flex w-80 border-l border-slate-200 bg-slate-50 p-4 flex-col h-full justify-between">
                  <OrderRegisterPane
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    tableNumber={tableNumber}
                    setTableNumber={setTableNumber}
                    cart={cart}
                    updateCartQuantity={updateCartQuantity}
                    subtotal={subtotal}
                    discountAmount={discountAmount}
                    grandTotal={grandTotal}
                    setShowPaymentModal={setShowPaymentModal}
                    setPayments={setPayments}
                  />
                </div>

                <div className="lg:hidden fixed bottom-3 left-3 right-3 bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center justify-between z-40">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{cart.reduce((a,b)=>a+b.quantity,0)} Items Dipilih</span>
                    <span className="font-bold text-xs text-blue-400 font-mono">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileCartOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Buka Order
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <HistoryTable
                filteredHistory={filteredHistory}
                historySearch={historySearch}
                setHistorySearch={setHistorySearch}
                setSelectedOrderDetail={setSelectedOrderDetail}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryGrid
                products={products}
                handleOpenProductModal={handleOpenProductModal}
                handleDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                filteredHistory={filteredHistory}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                filterPreset={filterPreset}
                applyDatePreset={applyDatePreset}
                setFilterPreset={setFilterPreset}
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                avgOrderValue={avgOrderValue}
              />
            )}
          </div>
        </div>
      </div>

      {isMobileCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Register Order</h3>
              <button onClick={() => setIsMobileCartOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <OrderRegisterPane
                customerName={customerName}
                setCustomerName={setCustomerName}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                cart={cart}
                updateCartQuantity={updateCartQuantity}
                subtotal={subtotal}
                discountAmount={discountAmount}
                grandTotal={grandTotal}
                setShowPaymentModal={setShowPaymentModal}
                setPayments={setPayments}
              />
            </div>
          </div>
        </div>
      )}

      {showAdminStaffModal && (
        <AdminStaffModal
          setShowAdminStaffModal={setShowAdminStaffModal}
          staffList={staffList}
          setStaffList={setStaffList}
          setActiveCashier={setActiveCashier}
          activeCashier={activeCashier}
        />
      )}

      {showProductModal && (
        <ProductModal
          setShowProductModal={setShowProductModal}
          editingProduct={editingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          handleSaveProduct={handleSaveProduct}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          grandTotal={grandTotal}
          payments={payments}
          setPayments={setPayments}
          checkoutLoading={checkoutLoading}
          handleCheckout={handleCheckout}
        />
      )}

      {(showReceiptModal || selectedOrderDetail) && (
        <ReceiptModal
          setShowReceiptModal={setShowReceiptModal}
          setSelectedOrderDetail={setSelectedOrderDetail}
          selectedOrderDetail={selectedOrderDetail}
          lastTransaction={lastTransaction}
        />
      )}
    </div>
  )
}