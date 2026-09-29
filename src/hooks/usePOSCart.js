import { useState } from 'react'

export function usePOSCart() {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerId, setCustomerId] = useState(null)
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState('DINE_IN')
  const [payments, setPayments] = useState([{ method: 'CASH', amount: '' }])
  const [discountAmount, setDiscountAmount] = useState(0)

  const handleAddToCartWithCustomization = (customizedItem) => {
    if (!customizedItem) return
    const cartKey = `${customizedItem.product_id}-${customizedItem.variant_id}-${customizedItem.temp}-${customizedItem.sugar}-${customizedItem.topping}`
    
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      const existing = safePrev.find((item) => item.cartKey === cartKey)
      if (existing) {
        return safePrev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...safePrev, { ...customizedItem, cartKey }]
      }
    })
  }

  const updateCartQuantity = (cartKey, delta) => {
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.map((item) => {
        if (item.cartKey === cartKey) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  const removeCartItem = (cartKey) => {
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.filter((item) => item.cartKey !== cartKey)
    })
  }

  const safeCart = Array.isArray(cart) ? cart : []
  const subtotal = safeCart.reduce((sum, item) => sum + (item?.finalPrice || 0) * (item?.quantity || 0), 0)
  const grandTotal = Math.max(0, subtotal - (discountAmount || 0))

  return {
    cart: safeCart,
    setCart,
    customerName,
    setCustomerName,
    customerId,
    setCustomerId,
    tableNumber,
    setTableNumber,
    orderType,
    setOrderType,
    payments: Array.isArray(payments) ? payments : [{ method: 'CASH', amount: '' }],
    setPayments,
    discountAmount,
    setDiscountAmount,
    subtotal,
    grandTotal,
    handleAddToCartWithCustomization,
    updateCartQuantity,
    removeCartItem
  }
}

export default usePOSCart