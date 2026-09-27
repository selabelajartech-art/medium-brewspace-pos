// Native IndexedDB Store untuk Antrean Transaksi Offline
const DB_NAME = 'MediumBrewPOS_DB'
const DB_VERSION = 1
const STORE_NAME = 'offline_orders'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'temp_id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 1. Simpan Transaksi Offline ke IndexedDB
export async function saveOfflineOrder(orderData) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const tempOrder = {
      temp_id: 'OFFLINE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      payload: orderData
    }
    const request = store.add(tempOrder)
    request.onsuccess = () => resolve(tempOrder)
    request.onerror = () => reject(request.error)
  })
}

// 2. Ambil Semua Transaksi Offline
export async function getOfflineOrders() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

// 3. Hapus Transaksi Setelah Sukses Sync ke Supabase
export async function removeOfflineOrder(temp_id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(temp_id)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}