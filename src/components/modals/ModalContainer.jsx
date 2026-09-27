import React from 'react'
import CustomizationModal from './CustomizationModal'
import IngredientManagerModal from './IngredientManagerModal'
import RecipeManagerModal from './RecipeManagerModal'
import TableManagerModal from './TableManagerModal'
import ToppingManagerModal from './ToppingManagerModal'
import ProductModal from './ProductModal'
import PaymentModal from './PaymentModal'
import ReceiptModal from './ReceiptModal'
import AdminStaffModal from './AdminStaffModal'
import OrderRegisterPane from '../pos/OrderRegisterPane'
import HppCalculatorModal from './HppCalculatorModal'
import PinAuthModal from './PinAuthModal'
import ShiftClosingModal from './ShiftClosingModal'
import CategoryManagerModal from './CategoryManagerModal' // <-- Import Baru
import { X } from 'lucide-react'

export default function ModalContainer({ modalState = {} }) {
  const {
    customizingProduct, setCustomizingProduct,
    showIngredientModal, setShowIngredientModal,
    selectedRecipeProduct, setSelectedRecipeProduct,
    showTableModal, setShowTableModal,
    showToppingModal, setShowToppingModal,
    showCategoryModal, setShowCategoryModal, // <-- Prop Baru
    showProductModal, setShowProductModal,
    showAdminStaffModal, setShowAdminStaffModal,
    showPaymentModal, setShowPaymentModal,
    showReceiptModal, setShowReceiptModal,
    showHppModal, setShowHppModal,
    showPinModal, setShowPinModal, pinSuccessCallback,
    showShiftClosingModal, setShowShiftClosingModal,
    selectedOrderDetail, setSelectedOrderDetail,
    isMobileCartOpen, setIsMobileCartOpen,
    
    // Data Handlers & Lists
    categories = [], toppingsList = [], setToppingsList, ingredientsList = [], setIngredientsList,
    productRecipes = [], setProductRecipes, tablesList = [], setTablesList, staffList = [], setStaffList, activeCashier, setActiveCashier,
    ordersHistory = [],
    editingProduct, setEditingProduct, productForm, setProductForm, handleSaveProduct,
    handleSaveIngredient, handleDeleteIngredient, handleSaveRecipe, handleDeleteRecipeItem,
    handleSaveCategory, handleDeleteCategory, // <-- Prop Baru
    handleAddToCartWithCustomization,
    cart = [],
    grandTotal = 0,
    subtotal = 0,
    discountAmount = 0,
    payments = [],
    setPayments,
    customerName, setCustomerName, tableNumber, setTableNumber, updateCartQuantity, removeCartItem,
    checkoutLoading = false, handleCheckout, lastTransaction
  } = modalState || {}

  return (
    <>
      {/* DRAWER KERANJANG MOBILE */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Keranjang Belanja</h3>
              <button onClick={() => setIsMobileCartOpen?.(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <OrderRegisterPane
                customerName={customerName}
                setCustomerName={setCustomerName}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                tablesList={tablesList}
                setShowTableModal={setShowTableModal}
                cart={cart}
                updateCartQuantity={updateCartQuantity}
                removeCartItem={removeCartItem}
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

      {/* MODAL LAINNYA */}
      {customizingProduct && (
        <CustomizationModal
          product={customizingProduct}
          categoryName={categories.find((c) => c.id === customizingProduct.category_id)?.name}
          toppingsList={toppingsList}
          onClose={() => setCustomizingProduct?.(null)}
          onAddToCart={handleAddToCartWithCustomization}
        />
      )}

      {showIngredientModal && (
        <IngredientManagerModal
          setShowIngredientModal={setShowIngredientModal}
          ingredientsList={ingredientsList}
          handleSaveIngredient={handleSaveIngredient}
          handleDeleteIngredient={handleDeleteIngredient}
        />
      )}

      {selectedRecipeProduct && (
        <RecipeManagerModal
          product={selectedRecipeProduct}
          ingredientsList={ingredientsList}
          productRecipes={productRecipes}
          onClose={() => setSelectedRecipeProduct?.(null)}
          handleSaveRecipe={handleSaveRecipe}
          handleDeleteRecipeItem={handleDeleteRecipeItem}
        />
      )}

      {showTableModal && (
        <TableManagerModal
          setShowTableModal={setShowTableModal}
          tablesList={tablesList}
          setTablesList={setTablesList}
        />
      )}

      {showToppingModal && (
        <ToppingManagerModal
          setShowToppingModal={setShowToppingModal}
          toppingsList={toppingsList}
          setToppingsList={setToppingsList}
        />
      )}

      {showCategoryModal && (
        <CategoryManagerModal
          setShowCategoryModal={setShowCategoryModal}
          categories={categories}
          handleSaveCategory={handleSaveCategory}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}

      {showProductModal && (
        <ProductModal
          setShowProductModal={setShowProductModal}
          editingProduct={editingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          categories={categories}
          handleSaveProduct={handleSaveProduct}
        />
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

      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          grandTotal={grandTotal}
          payments={payments}
          setPayments={setPayments}
          cart={cart}
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

      {showHppModal && (
        <HppCalculatorModal onClose={() => setShowHppModal?.(false)} />
      )}

      {showPinModal && (
        <PinAuthModal
          onClose={() => setShowPinModal?.(false)}
          onSuccess={() => {
            if (typeof pinSuccessCallback === 'function') pinSuccessCallback()
          }}
          staffList={staffList}
        />
      )}

      {showShiftClosingModal && (
        <ShiftClosingModal
          onClose={() => setShowShiftClosingModal?.(false)}
          activeCashier={activeCashier}
          ordersHistory={ordersHistory}
          onFinishShift={() => {
            setShowShiftClosingModal?.(false)
            if (typeof setShowAdminStaffModal === 'function') setShowAdminStaffModal(true)
          }}
        />
      )}
    </>
  )
}