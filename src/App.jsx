import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

import { useMasterData } from "./hooks/useMasterData";
import { usePOSCart } from "./hooks/usePOSCart";
import { useAuthLock } from "./hooks/useAuthLock";
import { useProductActions } from "./hooks/useProductActions";
import { useIngredientActions } from "./hooks/useIngredientActions";

import AppLayout from "./components/layout/AppLayout";
import ModalContainer from "./components/modals/ModalContainer";
import Toast from "./components/ui/Toast.jsx";
import LockScreen from "./components/auth/LockScreen";

import ProductGrid from "./components/pos/ProductGrid";
import OrderRegisterPane from "./components/pos/OrderRegisterPane";
import HistoryTable from "./components/history/HistoryTable";
import InventoryGrid from "./components/inventory/InventoryGrid";
import ReportsView from "./components/reports/ReportsView";

import { playBeepSound, playSuccessSound } from "./utils/sound";
import { saveOfflineOrder, getOfflineOrders, removeOfflineOrder } from "./utils/offlineStore";
import { ShoppingCart } from "lucide-react";

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("pos");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  // Toast System
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => setToast({ show: true, message, type });

  // Custom Hooks Data & Actions
  const master = useMasterData() || {};
  const cartData = usePOSCart() || {};
  
  // Auth & RBAC Hook
  const auth = useAuthLock(master.staffList, master.activeCashier, master.setActiveCashier);
  
  // Isolated Actions Hooks
  const prodActions = useProductActions(master, showToast);
  const ingActions = useIngredientActions(master, showToast);

  // Protected Tabs Enforcement (Jika Kasir mencoba akses Tab Terlarang)
  useEffect(() => {
    if (!auth.isManagerOrAdmin && (activeTab === "inventory" || activeTab === "reports" || activeTab === "staff")) {
      setActiveTab("pos");
      showToast("Akses Terbatas: Hanya Manager / Admin yang dapat membuka menu ini!", "warning");
    }
  }, [activeTab, auth.isManagerOrAdmin]);

  // Modals Local States
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAdminStaffModal, setShowAdminStaffModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHppModal, setShowHppModal] = useState(false);
  const [showShiftClosingModal, setShowShiftClosingModal] = useState(false);

  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinSuccessCallback, setPinSuccessCallback] = useState(null);

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Filter States
  const [historySearch, setHistorySearch] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => getLocalDateString());
  const [filterPreset, setFilterPreset] = useState("this_month");

  const productsList = Array.isArray(master.products) ? master.products : [];
  const categoriesList = Array.isArray(master.categories) ? master.categories : [];
  const ordersHistoryList = Array.isArray(master.ordersHistory) ? master.ordersHistory : [];
  const ingredientsList = Array.isArray(master.ingredientsList) ? master.ingredientsList : [];
  const cartList = Array.isArray(cartData.cart) ? cartData.cart : [];
  const paymentsList = Array.isArray(cartData.payments) ? cartData.payments : [];

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (auth.isLocked) return;
      if (e.key === "F2") {
        e.preventDefault();
        document.querySelector('input[placeholder*="Cari"]')?.focus();
      }
      if (e.key === "Escape") {
        setShowPaymentModal(false); setCustomizingProduct(null); prodActions.setShowProductModal(false);
        setShowReceiptModal(false); setShowIngredientModal(false); setShowCategoryModal(false);
        setShowAdminStaffModal(false); setShowPinModal(false); setShowShiftClosingModal(false);
        setIsMobileCartOpen(false); setOrderToDelete(null);
      }
      if (e.key === "Enter" && activeTab === "pos" && !showPaymentModal && cartList.length > 0) {
        if (document.activeElement?.tagName !== "BUTTON" && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault(); playBeepSound(); setShowPaymentModal(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, showPaymentModal, cartList, auth.isLocked]);

  // Offline Auto-Sync
  const isSyncingRef = useRef(false);
  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (!navigator.onLine || isSyncingRef.current) return;
      try {
        isSyncingRef.current = true;
        const offlineOrders = await getOfflineOrders();
        if (!offlineOrders || offlineOrders.length === 0) return;
        showToast(`Menyingkronkan ${offlineOrders.length} transaksi offline...`, "info");
        for (const item of offlineOrders) {
          const { error } = await supabase.rpc("process_advanced_checkout", item.payload);
          if (!error) await removeOfflineOrder(item.temp_id);
        }
        if (master.fetchInitialData) await master.fetchInitialData();
        if (master.fetchHistory) await master.fetchHistory();
        playSuccessSound(); showToast("Transaksi offline disingkronkan ke cloud!", "success");
      } catch (err) { console.error("Offline sync error:", err); }
      finally { isSyncingRef.current = false; }
    };
    window.addEventListener("online", syncOfflineOrders);
    syncOfflineOrders();
    return () => window.removeEventListener("online", syncOfflineOrders);
  }, []);

  const handleOpenProtectedIngredientModal = () => {
    if (auth.isManagerOrAdmin) { setShowIngredientModal(true); return; }
    setPinSuccessCallback(() => () => setShowIngredientModal(true));
    setShowPinModal(true);
  };

  const filteredProducts = productsList.filter((p) => {
    if (!p || p.is_active === false) return false;
    const matchCat = selectedCategory === "ALL" || p.category_id === selectedCategory;
    const matchSearch = (p.name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredHistory = ordersHistoryList.filter((order) => {
    if (!order) return false;
    const orderDate = new Date(order.created_at);
    const start = startDate ? new Date(startDate + "T00:00:00") : null;
    const end = endDate ? new Date(endDate + "T23:59:59") : null;
    let matchDate = true;
    if (start && orderDate < start) matchDate = false;
    if (end && orderDate > end) matchDate = false;
    const matchSearch = (order.order_number || "").toLowerCase().includes((historySearch || "").toLowerCase());
    return matchDate && matchSearch;
  });

  const totalRevenue = filteredHistory.reduce((sum, o) => sum + parseFloat(o?.total_amount || 0), 0);
  const totalOrders = filteredHistory.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleDeleteOrder = (orderId) => {
    const triggerDeleteModal = () => setOrderToDelete(orderId);
    if (auth.isManagerOrAdmin) triggerDeleteModal();
    else { setPinSuccessCallback(() => triggerDeleteModal); setShowPinModal(true); }
  };

  const confirmExecuteDelete = async () => {
    if (!orderToDelete) return;
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderToDelete);
      if (error) throw error;
      if (master.fetchHistory) master.fetchHistory();
      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound(); showToast("Riwayat transaksi berhasil dihapus!", "success");
      setSelectedOrderDetail(null);
    } catch (err) { showToast("Gagal menghapus transaksi: " + err.message, "error"); }
    finally { setOrderToDelete(null); }
  };

  const handleCheckout = async (paymentMode = "FULL", targetTotal = cartData.grandTotal || 0, splitItemQtyMap = {}, appliedDiscount = 0, splitPeopleCount = 1) => {
    if (cartList.length === 0) return showToast("Keranjang belanja masih kosong!", "warning");
    setCheckoutLoading(true);

    let itemsToPay = cartList;
    let currentSubtotal = cartData.subtotal || targetTotal;
    const numPeople = Math.max(1, parseInt(splitPeopleCount) || 1);

    if (paymentMode === "SPLIT_ITEM") {
      itemsToPay = cartList.filter((item) => (splitItemQtyMap[item?.cartKey] || 0) > 0).map((item) => {
        const payQty = splitItemQtyMap[item.cartKey] || 0;
        return { ...item, quantity: payQty, subtotal: (item.finalPrice || 0) * payQty };
      });
      currentSubtotal = itemsToPay.reduce((sum, i) => sum + i.subtotal, 0);
    } else if (paymentMode === "SPLIT_EQUAL") {
      itemsToPay = cartList.map((item) => {
        const originalQty = Math.round(item.quantity || 1);
        const portionUnitPrice = (item.finalPrice || 0) / numPeople;
        return { ...item, quantity: originalQty, finalPrice: portionUnitPrice, subtotal: portionUnitPrice * originalQty };
      });
      currentSubtotal = itemsToPay.reduce((sum, i) => sum + i.subtotal, 0);
    }

    const currentDiscount = appliedDiscount || 0;
    const currentTotal = Math.max(0, targetTotal);

    const checkoutPayload = {
      p_store_id: master.CURRENT_STORE_ID,
      p_shift_id: null,
      p_user_id: master.activeCashier?.id || null,
      p_customer_id: null,
      p_order_type: cartData.orderType || "DINE_IN",
      p_table_number: cartData.tableNumber || "1",
      p_status: "COMPLETED",
      p_subtotal: currentSubtotal,
      p_discount: currentDiscount,
      p_tax: 0,
      p_total: currentTotal,
      p_items: itemsToPay.map((i) => ({ variant_id: i.variant_id, quantity: Math.round(i.quantity || 1), unit_price: i.finalPrice, subtotal: i.subtotal, notes: i.notes })),
      p_payments: paymentsList.map((p) => ({ method: p.method, amount: parseFloat(p.amount) || currentTotal })),
      p_payment_mode: paymentMode,
      p_split_people: numPeople,
    };

    try {
      let orderId = null;
      if (navigator.onLine) {
        const { data, error } = await supabase.rpc("process_advanced_checkout", checkoutPayload);
        if (error) throw error;
        orderId = data;
      } else {
        const savedTemp = await saveOfflineOrder(checkoutPayload);
        orderId = savedTemp.temp_id;
      }

      setLastTransaction({
        id: orderId,
        order_number: "ORD-" + orderId.substring(0, 6).toUpperCase(),
        date: new Date().toLocaleString("id-ID"),
        items: [...itemsToPay],
        subtotal: cartData.subtotal || currentSubtotal,
        discountAmount: currentDiscount,
        grandTotal: currentTotal,
        payments: paymentsList,
        change: Math.max(0, (parseFloat(paymentsList[0]?.amount) || currentTotal) - currentTotal),
        customer: cartData.customerName || "Umum",
        cashier: master.activeCashier?.name || "Kasir",
        paymentMode: paymentMode,
        splitPeople: numPeople,
      });

      setShowPaymentModal(false); setIsMobileCartOpen(false); setShowReceiptModal(true);

      if (paymentMode === "SPLIT_ITEM") {
        if (cartData.setCart) {
          cartData.setCart((prev) => (Array.isArray(prev) ? prev : []).map((item) => {
            const paidQty = splitItemQtyMap[item.cartKey] || 0;
            const remainQty = item.quantity - paidQty;
            return remainQty > 0 ? { ...item, quantity: remainQty } : null;
          }).filter(Boolean));
        }
      } else {
        if (cartData.setCart) cartData.setCart([]);
        if (cartData.setCustomerName) cartData.setCustomerName("");
        if (cartData.setTableNumber) cartData.setTableNumber("");
      }

      if (navigator.onLine) {
        if (master.fetchInitialData) master.fetchInitialData();
        if (master.fetchHistory) master.fetchHistory();
        playSuccessSound(); showToast("Transaksi berhasil diproses!", "success");
      } else {
        playSuccessSound(); showToast("OFFLINE: Transaksi disimpan di perangkat lokal kasir!", "warning");
      }
    } catch (err) { showToast("Gagal memproses transaksi: " + err.message, "error"); }
    finally { setCheckoutLoading(false); }
  };

  const handleSelectOrderForReceipt = (order) => {
    if (!order) { setSelectedOrderDetail(null); return; }
    const cashierObj = master.staffList?.find((s) => String(s.id) === String(order.user_id));
    setSelectedOrderDetail({
      id: order.id,
      order_number: order.order_number,
      date: order.created_at ? new Date(order.created_at).toLocaleString("id-ID") : new Date().toLocaleString("id-ID"),
      items: (order.order_items || []).map((item) => ({
        variant_id: item.variant_id, name: item.product_variants?.products?.name || "Menu",
        variant_name: item.product_variants?.variant_name || "", quantity: item.quantity,
        finalPrice: parseFloat(item.unit_price || 0), subtotal: parseFloat(item.subtotal || 0), notes: item.notes || ""
      })),
      subtotal: parseFloat(order.subtotal || 0), discountAmount: parseFloat(order.discount_amount || 0),
      grandTotal: parseFloat(order.total_amount || 0),
      payments: (order.order_payments || []).map((p) => ({ method: p.method || p.payment_method || "CASH", amount: parseFloat(p.amount || 0) })),
      change: Math.max(0, (order.order_payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) - parseFloat(order.total_amount || 0)),
      customer: order.customers?.name || "Umum", cashier: cashierObj?.name || master.activeCashier?.name || "Kasir",
      paymentMode: order.payment_mode || "FULL", splitPeople: order.split_people || 1
    });
  };

  return (
    <>
      <Toast toast={toast} setToast={setToast} />

      {/* Lock Screen Component Overlay */}
      {auth.isLocked && (
        <LockScreen
          staffList={master.staffList}
          onUnlock={auth.unlockTerminal}
          showToast={showToast}
        />
      )}

      <AppLayout
        activeTab={activeTab} setActiveTab={setActiveTab}
        activeCashier={master.activeCashier} setActiveCashier={master.setActiveCashier}
        staffList={master.staffList} setStaffList={master.setStaffList}
        showShiftDropdown={showShiftDropdown} setShowShiftDropdown={setShowShiftDropdown}
        setShowAdminStaffModal={setShowAdminStaffModal} setShowShiftClosingModal={setShowShiftClosingModal}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        isManagerOrAdmin={auth.isManagerOrAdmin} lockTerminal={auth.lockTerminal}
      >
        {activeTab === "pos" && (
          <div className="flex flex-1 overflow-hidden relative">
            <ProductGrid
              categories={categoriesList} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              ordersHistory={ordersHistoryList} setActiveTab={setActiveTab} loading={master.loading}
              filteredProducts={filteredProducts}
              onOpenCustomization={(product) => { playBeepSound(); setCustomizingProduct(product); }}
            />
            <div className="hidden lg:flex w-80 border-l border-slate-200/80 bg-white p-4 flex-col h-full justify-between shrink-0">
              <OrderRegisterPane
                customerName={cartData.customerName} setCustomerName={cartData.setCustomerName}
                tableNumber={cartData.tableNumber} setTableNumber={cartData.setTableNumber}
                tablesList={master.tablesList} setShowTableModal={setShowTableModal} cart={cartList}
                updateCartQuantity={(key, delta) => { playBeepSound(); cartData.updateCartQuantity(key, delta); }}
                removeCartItem={(key) => { playBeepSound(); cartData.removeCartItem(key); }}
                subtotal={cartData.subtotal}
                setShowPaymentModal={(val) => { if (val) playBeepSound(); setShowPaymentModal(val); }}
                setPayments={cartData.setPayments}
              />
            </div>
            {cartList.length > 0 && (
              <div className="lg:hidden fixed bottom-20 left-3 right-3 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between z-30">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">{cartList.reduce((a, b) => a + (b?.quantity || 0), 0)} Item Dipilih</span>
                  <span className="font-bold text-xs text-blue-400 font-mono">Rp {(cartData.subtotal || 0).toLocaleString("id-ID")}</span>
                </div>
                <button onClick={() => { playBeepSound(); setIsMobileCartOpen(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Buka Order
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTable
            filteredHistory={filteredHistory} historySearch={historySearch} setHistorySearch={setHistorySearch}
            setSelectedOrderDetail={handleSelectOrderForReceipt} handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === "inventory" && auth.isManagerOrAdmin && (
          <InventoryGrid
            products={productsList.filter((p) => p && p.is_active !== false)} categories={categoriesList}
            handleOpenProductModal={prodActions.handleOpenProductModal} handleDeleteProduct={prodActions.handleDeleteProduct}
            setShowToppingModal={setShowToppingModal} setShowIngredientModal={handleOpenProtectedIngredientModal}
            setSelectedRecipeProduct={setSelectedRecipeProduct} setShowHppModal={setShowHppModal} setShowCategoryModal={setShowCategoryModal}
          />
        )}

        {activeTab === "reports" && auth.isManagerOrAdmin && (
          <ReportsView
            filteredHistory={filteredHistory} startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate} filterPreset={filterPreset}
            applyDatePreset={(p) => setFilterPreset(p)} totalRevenue={totalRevenue} totalOrders={totalOrders}
            avgOrderValue={avgOrderValue} ingredientsList={ingredientsList}
          />
        )}

        <ModalContainer
          modalState={{
            customizingProduct, setCustomizingProduct, showIngredientModal, setShowIngredientModal,
            selectedRecipeProduct, setSelectedRecipeProduct, showTableModal, setShowTableModal,
            showToppingModal, setShowToppingModal, showCategoryModal, setShowCategoryModal,
            showProductModal: prodActions.showProductModal, setShowProductModal: prodActions.setShowProductModal,
            showAdminStaffModal, setShowAdminStaffModal, showPaymentModal, setShowPaymentModal,
            showReceiptModal, setShowReceiptModal, showHppModal, setShowHppModal,
            showPinModal, setShowPinModal, pinSuccessCallback, showShiftClosingModal, setShowShiftClosingModal,
            ordersHistory: ordersHistoryList, selectedOrderDetail, setSelectedOrderDetail,
            isMobileCartOpen, setIsMobileCartOpen, orderToDelete, setOrderToDelete, confirmExecuteDelete,

            categories: categoriesList, toppingsList: master.toppingsList, setToppingsList: master.setToppingsList,
            ingredientsList: ingredientsList, setIngredientsList: master.setIngredientsList,
            productRecipes: master.productRecipes, setProductRecipes: master.setProductRecipes,
            tablesList: master.tablesList, setTablesList: master.setTablesList,
            staffList: master.staffList, setStaffList: master.setStaffList,
            activeCashier: master.activeCashier, setActiveCashier: master.setActiveCashier,

            editingProduct: prodActions.editingProduct, setEditingProduct: prodActions.setEditingProduct,
            productForm: prodActions.productForm, setProductForm: prodActions.setProductForm,
            handleSaveProduct: prodActions.handleSaveProduct, handleSaveCategory: prodActions.handleSaveCategory,
            handleDeleteCategory: prodActions.handleDeleteCategory,

            handleSaveIngredient: ingActions.handleSaveIngredient, handleDeleteIngredient: ingActions.handleDeleteIngredient,
            handleSaveRecipe: ingActions.handleSaveRecipe, handleDeleteRecipeItem: ingActions.handleDeleteRecipeItem,

            cart: cartList, customerName: cartData.customerName, setCustomerName: cartData.setCustomerName,
            tableNumber: cartData.tableNumber, setTableNumber: cartData.setTableNumber,
            subtotal: cartData.subtotal || 0, discountAmount: cartData.discountAmount || 0,
            grandTotal: cartData.subtotal || 0, updateCartQuantity: cartData.updateCartQuantity,
            removeCartItem: cartData.removeCartItem, payments: paymentsList, setPayments: cartData.setPayments,
            handleAddToCartWithCustomization: (item) => { playBeepSound(); if (cartData.handleAddToCartWithCustomization) cartData.handleAddToCartWithCustomization(item); },
            checkoutLoading, handleCheckout, lastTransaction,
          }}
        />
      </AppLayout>
    </>
  );
}