import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CURRENT_STORE_ID = 'a0000000-0000-0000-0000-000000000001'

export function useMasterData() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [ordersHistory, setOrdersHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Data Staf dari Supabase (Profiles)
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_staff_list')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  const [activeCashier, setActiveCashier] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_active_cashier')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })

  const [tablesList, setTablesList] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_tables_list')
      return saved ? JSON.parse(saved) : [
        { id: 'tbl-1', name: 'Meja 01 (Indoor)' },
        { id: 'tbl-2', name: 'Meja 02 (Indoor)' },
        { id: 'tbl-3', name: 'Quiet Zone 05' },
        { id: 'tbl-4', name: 'Takeaway' }
      ]
    } catch (e) {
      return []
    }
  })

  const [toppingsList, setToppingsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_toppings_list')
      return saved ? JSON.parse(saved) : [
        { id: 'top-1', name: 'Extra Shot Espresso', price: 5000, categoryType: 'drink' },
        { id: 'top-2', name: 'Oat Milk / Plant-Based', price: 8000, categoryType: 'drink' }
      ]
    } catch (e) {
      return []
    }
  })

  const [ingredientsList, setIngredientsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_ingredients_list')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  const [productRecipes, setProductRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem('medium_brew_product_recipes')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Sinkronisasi ke LocalStorage (Caching Offline)
  useEffect(() => { localStorage.setItem('medium_brew_staff_list', JSON.stringify(staffList)) }, [staffList])
  useEffect(() => { 
    if (activeCashier) {
      localStorage.setItem('medium_brew_active_cashier', JSON.stringify(activeCashier))
    }
  }, [activeCashier])
  useEffect(() => { localStorage.setItem('medium_brew_tables_list', JSON.stringify(tablesList)) }, [tablesList])
  useEffect(() => { localStorage.setItem('medium_brew_toppings_list', JSON.stringify(toppingsList)) }, [toppingsList])
  useEffect(() => { localStorage.setItem('medium_brew_ingredients_list', JSON.stringify(ingredientsList)) }, [ingredientsList])
  useEffect(() => { localStorage.setItem('medium_brew_product_recipes', JSON.stringify(productRecipes)) }, [productRecipes])

  useEffect(() => {
    fetchInitialData()
    fetchHistory()

    // Realtime Listener untuk Tabel Profiles
    const profilesChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchProfiles()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
    }
  }, [])

  // Fungsi khusus mengambil data staf dari tabel profiles Supabase
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

      if (data && data.length > 0) {
        const formatted = data.map(p => ({
          id: p.id,
          name: p.name || p.full_name || 'Kasir',
          role: (p.role || 'CASHIER').toUpperCase(),
          pin: p.pin || '0000',
          initials: p.initials || (p.name || p.full_name || 'K').substring(0, 2).toUpperCase()
        }))

        setStaffList(formatted)

        // Perbarui activeCashier dengan data terbaru jika ada
        setActiveCashier(prev => {
          if (!prev) return formatted[0]
          const updated = formatted.find(s => s.id === prev.id)
          return updated || formatted[0]
        })
      }
    } catch (e) {
      console.error('Fetch Profiles Error:', e)
    }
  }

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await fetchProfiles()

      const [prodRes, catRes, custRes, ingRes, recRes] = await Promise.all([
        supabase.from('products').select(`
          id, name, barcode, image_url, category_id,
          product_variants (id, variant_name, price, cogs, inventories(stock))
        `).order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('customers').select('*').order('name'),
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('product_recipes').select('*')
      ])

      if (prodRes.data) setProducts(prodRes.data)
      if (catRes.data) setCategories(catRes.data)
      if (custRes.data) setCustomers(custRes.data)
      if (ingRes.data && ingRes.data.length > 0) setIngredientsList(ingRes.data)
      if (recRes.data && recRes.data.length > 0) setProductRecipes(recRes.data)
    } catch (e) {
      console.error('Data Cloud Fetch Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
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
    } catch (e) {
      console.error('History Fetch Error:', e)
    }
  }

  const resetToDefaultStaff = () => {
    fetchProfiles()
  }

  return {
    CURRENT_STORE_ID,
    products: Array.isArray(products) ? products : [],
    categories: Array.isArray(categories) ? categories : [],
    customers: Array.isArray(customers) ? customers : [],
    ordersHistory: Array.isArray(ordersHistory) ? ordersHistory : [],
    loading,
    staffList: Array.isArray(staffList) ? staffList : [],
    setStaffList,
    activeCashier: activeCashier || staffList[0] || { name: 'Kasir', role: 'CASHIER' },
    setActiveCashier,
    tablesList: Array.isArray(tablesList) ? tablesList : [],
    setTablesList,
    toppingsList: Array.isArray(toppingsList) ? toppingsList : [],
    setToppingsList,
    ingredientsList: Array.isArray(ingredientsList) ? ingredientsList : [],
    setIngredientsList,
    productRecipes: Array.isArray(productRecipes) ? productRecipes : [],
    setProductRecipes,
    fetchInitialData,
    fetchHistory,
    resetToDefaultStaff
  }
}

export default useMasterData