import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

import { useMasterData } from "./hooks/useMasterData";
import { usePOSCart } from "./hooks/usePOSCart";

import AppLayout from "./components/layout/AppLayout";
import ModalContainer from "./components/modals/ModalContainer";
import Toast from "./components/ui/Toast.jsx";

import ProductGrid from "./components/pos/ProductGrid";
import OrderRegisterPane from "./components/pos/OrderRegisterPane";
import HistoryTable from "./components/history/HistoryTable";
import InventoryGrid from "./components/inventory/InventoryGrid";
import ReportsView from "./components/reports/ReportsView";

import { playBeepSound, playSuccessSound } from "./utils/sound";
import {
  saveOfflineOrder,
  getOfflineOrders,
  removeOfflineOrder,
} from "./utils/offlineStore";
import { ShoppingCart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("pos");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  // Toast Notification System
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  // Modals Local States
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdminStaffModal, setShowAdminStaffModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHppModal, setShowHppModal] = useState(false);
  const [showShiftClosingModal, setShowShiftClosingModal] = useState(false);

  // State Hapus Transaksi
  const [orderToDelete, setOrderToDelete] = useState(null);

  // State PIN Auth Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinSuccessCallback, setPinSuccessCallback] = useState(null);

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category_id: "",
    variant_name: "Regular",
    price: "",
    stock: "",
    barcode: "",
    image_url: "",
  });
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Filters & Calendar States
  const [historySearch, setHistorySearch] = useState("");
  const [startDate, setStartDate] = useState(
    () =>
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [filterPreset, setFilterPreset] = useState("this_month");

  // Custom Hooks Data
  const master = useMasterData() || {};
  const cartData = usePOSCart() || {};

  const productsList = Array.isArray(master.products) ? master.products : [];
  const categoriesList = Array.isArray(master.categories)
    ? master.categories
    : [];
  const ordersHistoryList = Array.isArray(master.ordersHistory)
    ? master.ordersHistory
    : [];
  const ingredientsList = Array.isArray(master.ingredientsList)
    ? master.ingredientsList
    : [];
  const cartList = Array.isArray(cartData.cart) ? cartData.cart : [];
  const paymentsList = Array.isArray(cartData.payments)
    ? cartData.payments
    : [];

  // SINKRONISASI STOK MENU OTOMATIS BERDASARKAN KANTONG BAHAN BAKU (BOTTLENECK)
  const syncVariantStockFromRecipes = async (variantId) => {
    if (!variantId) return;

    const { data: recipes } = await supabase
      .from("product_recipes")
      .select("ingredient_id, quantity_required")
      .eq("variant_id", variantId);

    if (!recipes || recipes.length === 0) return;

    const ingIds = recipes.map((r) => r.ingredient_id);
    const { data: ingredients } = await supabase
      .from("ingredients")
      .select("id, current_stock")
      .in("id", ingIds);

    if (!ingredients || ingredients.length === 0) return;

    const capacities = recipes.map((r) => {
      const ing = ingredients.find((i) => String(i.id) === String(r.ingredient_id));
      if (!ing) return 0;
      const currentStock = parseFloat(ing.current_stock || 0);
      const qtyReq = parseFloat(r.quantity_required || 0);
      return qtyReq > 0 ? Math.floor(currentStock / qtyReq) : 0;
    });

    const newStock = Math.min(...capacities);

    await supabase
      .from("inventories")
      .update({ stock: newStock })
      .eq("variant_id", variantId)
      .eq("store_id", master.CURRENT_STORE_ID);
  };

  const syncAllVariantsUsingIngredient = async (ingredientId) => {
    if (!ingredientId) return;

    const { data: recipes } = await supabase
      .from("product_recipes")
      .select("variant_id")
      .eq("ingredient_id", ingredientId);

    if (!recipes || recipes.length === 0) return;

    const variantIds = [...new Set(recipes.map((r) => r.variant_id))];
    for (const vId of variantIds) {
      await syncVariantStockFromRecipes(vId);
    }
  };

  // PINTASAN KEYBOARD (HOTKEYS)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Cari"]');
        if (searchInput) searchInput.focus();
      }

      if (e.key === "Escape") {
        setShowPaymentModal(false);
        setCustomizingProduct(null);
        setShowProductModal(false);
        setShowReceiptModal(false);
        setShowIngredientModal(false);
        setShowCategoryModal(false);
        setShowAdminStaffModal(false);
        setShowPinModal(false);
        setShowShiftClosingModal(false);
        setIsMobileCartOpen(false);
        setOrderToDelete(null);
      }

      if (
        e.key === "Enter" &&
        activeTab === "pos" &&
        !showPaymentModal &&
        cartList.length > 0
      ) {
        if (
          document.activeElement?.tagName !== "BUTTON" &&
          document.activeElement?.tagName !== "INPUT"
        ) {
          e.preventDefault();
          playBeepSound();
          setShowPaymentModal(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, showPaymentModal, cartList]);

  // SYNC LOCK UNTUK MENCEGAH DUPLIKASI SINKRONISASI OFFLINE
  const isSyncingRef = useRef(false);

  // AUTO-SYNC TRANSAKSI OFFLINE KE CLOUD
  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (!navigator.onLine || isSyncingRef.current) return;

      try {
        isSyncingRef.current = true;
        const offlineOrders = await getOfflineOrders();
        
        if (!offlineOrders || offlineOrders.length === 0) {
          isSyncingRef.current = false;
          return;
        }

        showToast(
          `Menyingkronkan ${offlineOrders.length} transaksi offline...`,
          "info"
        );

        for (const item of offlineOrders) {
          const { error } = await supabase.rpc(
            "process_advanced_checkout",
            item.payload
          );

          if (!error) {
            await removeOfflineOrder(item.temp_id);
          }
        }

        if (master.fetchInitialData) await master.fetchInitialData();
        if (master.fetchHistory) await master.fetchHistory();

        playSuccessSound();
        showToast(
          `Transaksi offline berhasil disingkronkan ke cloud!`,
          "success"
        );
      } catch (err) {
        console.error("Gagal sinkronisasi offline:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    window.addEventListener("online", syncOfflineOrders);
    syncOfflineOrders();

    return () => window.removeEventListener("online", syncOfflineOrders);
  }, []);

  // Otorisasi PIN untuk Modal Akses Terproteksi
  const handleOpenProtectedIngredientModal = () => {
    const currentRole = master.activeCashier?.role;

    if (currentRole === "MANAGER" || currentRole === "ADMIN") {
      setShowIngredientModal(true);
      return;
    }

    setPinSuccessCallback(() => () => setShowIngredientModal(true));
    setShowPinModal(true);
  };

  // Filter Logic
  const filteredProducts = productsList.filter((p) => {
    if (!p) return false;
    const matchCat =
      selectedCategory === "ALL" || p.category_id === selectedCategory;
    const matchSearch = (p.name || "")
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());
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
    const matchSearch = (order.order_number || "")
      .toLowerCase()
      .includes((historySearch || "").toLowerCase());
    return matchDate && matchSearch;
  });

  const totalRevenue = filteredHistory.reduce(
    (sum, o) => sum + parseFloat(o?.total_amount || 0),
    0
  );
  const totalOrders = filteredHistory.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Action Handlers Kategori
  const handleSaveCategory = async (categoryName) => {
    try {
      const { error } = await supabase
        .from("categories")
        .insert([{ store_id: master.CURRENT_STORE_ID, name: categoryName }]);

      if (error) throw error;

      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound();
      showToast(`Kategori "${categoryName}" berhasil ditambahkan!`, "success");
    } catch (err) {
      showToast("Gagal menambah kategori: " + err.message, "error");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Hapus kategori ini? Produk terkait tidak akan terhapus."))
      return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      if (master.fetchInitialData) master.fetchInitialData();
      playBeepSound();
      showToast("Kategori berhasil dihapus!", "info");
    } catch (err) {
      showToast("Gagal menghapus kategori: " + err.message, "error");
    }
  };

  // HANDLER HAPUS RIWAYAT TRANSAKSI
  const handleDeleteOrder = (orderId) => {
    const currentRole = master.activeCashier?.role;

    const triggerDeleteModal = () => {
      setOrderToDelete(orderId);
    };

    if (currentRole === "MANAGER" || currentRole === "ADMIN") {
      triggerDeleteModal();
    } else {
      setPinSuccessCallback(() => triggerDeleteModal);
      setShowPinModal(true);
    }
  };

  const confirmExecuteDelete = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete);

      if (error) throw error;

      if (master.fetchHistory) master.fetchHistory();
      if (master.fetchInitialData) master.fetchInitialData();

      playBeepSound();
      showToast("Riwayat transaksi berhasil dihapus!", "success");
      setSelectedOrderDetail(null);
    } catch (err) {
      showToast("Gagal menghapus transaksi: " + err.message, "error");
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleOpenProductModal = (product = null) => {
    if (product) {
      const variant = product.product_variants?.[0];
      const stock = variant?.inventories?.[0]?.stock ?? 0;
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        category_id: product.category_id || categoriesList[0]?.id || "",
        variant_name: variant?.variant_name || "Regular",
        price: variant?.price || "",
        stock: stock,
        barcode: product.barcode || "",
        image_url: product.image_url || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        category_id: categoriesList[0]?.id || "",
        variant_name: "Regular",
        price: "",
        stock: "50",
        barcode: "",
        image_url: "",
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e?.preventDefault();
    if (!productForm.name || !productForm.price) {
      return showToast("Nama dan Harga produk wajib diisi!", "warning");
    }

    try {
      if (editingProduct) {
        await supabase
          .from("products")
          .update({
            name: productForm.name,
            category_id: productForm.category_id || null,
            image_url: productForm.image_url,
            barcode: productForm.barcode,
          })
          .eq("id", editingProduct.id);

        const variant = editingProduct.product_variants?.[0];
        if (variant) {
          await supabase
            .from("product_variants")
            .update({
              variant_name: productForm.variant_name || "Regular",
              price: parseFloat(productForm.price),
            })
            .eq("id", variant.id);

          await supabase
            .from("inventories")
            .update({ stock: parseInt(productForm.stock) || 0 })
            .eq("variant_id", variant.id)
            .eq("store_id", master.CURRENT_STORE_ID);
        }
      } else {
        const { data: newProd, error: prodErr } = await supabase
          .from("products")
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
          .from("product_variants")
          .insert([
            {
              product_id: newProd.id,
              variant_name: productForm.variant_name || "Regular",
              price: parseFloat(productForm.price),
              cogs: parseFloat(productForm.price) * 0.4,
            },
          ])
          .select()
          .single();

        if (varErr) throw varErr;

        await supabase.from("inventories").insert([
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
      showToast("Menu berhasil disimpan!", "success");
    } catch (err) {
      showToast("Gagal menyimpan produk: " + err.message, "error");
    }
  };

  // HANDLER CHECKOUT RESILIEN DENGAN DUKUNGAN PRESISI DISKON & DINAMIS SPLIT BILL
  const handleCheckout = async (
    paymentMode = "FULL",
    targetTotal = cartData.grandTotal || 0,
    splitItemQtyMap = {},
    appliedDiscount = 0,
    splitPeopleCount = 1
  ) => {
    if (cartList.length === 0)
      return showToast("Keranjang belanja masih kosong!", "warning");
    setCheckoutLoading(true);

    let itemsToPay = cartList;
    let currentSubtotal = cartData.subtotal || targetTotal;
    const numPeople = Math.max(1, parseInt(splitPeopleCount) || 1);

    if (paymentMode === "SPLIT_ITEM") {
      itemsToPay = cartList
        .filter((item) => (splitItemQtyMap[item?.cartKey] || 0) > 0)
        .map((item) => {
          const payQty = splitItemQtyMap[item.cartKey] || 0;
          return {
            ...item,
            quantity: payQty,
            subtotal: (item.finalPrice || 0) * payQty,
          };
        });
      currentSubtotal = itemsToPay.reduce((sum, i) => sum + i.subtotal, 0);
    } else if (paymentMode === "SPLIT_EQUAL") {
      itemsToPay = cartList.map((item) => {
        const originalQty = Math.round(item.quantity || 1);
        const portionUnitPrice = (item.finalPrice || 0) / numPeople;
        return {
          ...item,
          quantity: originalQty,
          finalPrice: portionUnitPrice,
          subtotal: portionUnitPrice * originalQty,
        };
      });
      currentSubtotal = itemsToPay.reduce((sum, i) => sum + i.subtotal, 0);
    }

    const currentDiscount = appliedDiscount || 0;
    const currentTotal = Math.max(0, targetTotal);

    const checkoutPayload = {
      p_store_id: master.CURRENT_STORE_ID,
      p_shift_id: null,
      p_user_id: null,
      p_customer_id: null,
      p_order_type: cartData.orderType || "DINE_IN",
      p_table_number: cartData.tableNumber || "1",
      p_status: "COMPLETED",
      p_subtotal: currentSubtotal,
      p_discount: currentDiscount,
      p_tax: 0,
      p_total: currentTotal,
      p_items: itemsToPay.map((i) => ({
        variant_id: i.variant_id,
        quantity: Math.round(i.quantity || 1),
        unit_price: i.finalPrice,
        subtotal: i.subtotal,
        notes: i.notes,
      })),
      p_payments: paymentsList.map((p) => ({
        method: p.method,
        amount: parseFloat(p.amount) || currentTotal,
      })),
      p_payment_mode: paymentMode,
      p_split_people: numPeople,
    };

    try {
      let orderId = null;

      if (navigator.onLine) {
        const { data, error } = await supabase.rpc(
          "process_advanced_checkout",
          checkoutPayload
        );
        if (error) throw error;
        orderId = data;
      } else {
        const savedTemp = await saveOfflineOrder(checkoutPayload);
        orderId = savedTemp.temp_id;
      }

      // Potong Stok Bahan Baku Lokal (Dengan String Casting Aman untuk UUID/ID)
      itemsToPay.forEach((cartItem) => {
        const recipes = (master.productRecipes || []).filter(
          (r) => String(r.variant_id) === String(cartItem.variant_id)
        );
        recipes.forEach((rec) => {
          if (master.setIngredientsList) {
            master.setIngredientsList((prev) =>
              (Array.isArray(prev) ? prev : []).map((ing) => {
                if (String(ing.id) === String(rec.ingredient_id)) {
                  const deductionFactor = paymentMode === "SPLIT_EQUAL" ? (1 / numPeople) : 1;
                  const totalDeduction =
                    parseFloat(rec.quantity_required) *
                    cartItem.quantity *
                    deductionFactor;
                  return {
                    ...ing,
                    current_stock: Math.max(
                      0,
                      parseFloat(ing.current_stock || 0) - totalDeduction
                    ),
                  };
                }
                return ing;
              })
            );
          }
        });
      });

      setLastTransaction({
        id: orderId,
        order_number: "ORD-" + orderId.substring(0, 6).toUpperCase(),
        date: new Date().toLocaleString("id-ID"),
        items: [...itemsToPay],
        subtotal: cartData.subtotal || currentSubtotal,
        discountAmount: currentDiscount,
        grandTotal: currentTotal,
        payments: paymentsList,
        change: Math.max(
          0,
          (parseFloat(paymentsList[0]?.amount) || currentTotal) - currentTotal
        ),
        customer: cartData.customerName || "Umum",
        cashier: master.activeCashier?.name || "Kasir",
        paymentMode: paymentMode,
        splitPeople: numPeople,
      });

      setShowPaymentModal(false);
      setIsMobileCartOpen(false);
      setShowReceiptModal(true);

      if (paymentMode === "SPLIT_ITEM") {
        if (cartData.setCart) {
          cartData.setCart((prev) =>
            (Array.isArray(prev) ? prev : [])
              .map((item) => {
                const paidQty = splitItemQtyMap[item.cartKey] || 0;
                const remainQty = item.quantity - paidQty;
                return remainQty > 0 ? { ...item, quantity: remainQty } : null;
              })
              .filter(Boolean)
          );
        }
      } else if (paymentMode === "SPLIT_EQUAL") {
        showToast("Pembayaran porsi berhasil diselesaikan!", "success");
      } else {
        if (cartData.setCart) cartData.setCart([]);
        if (cartData.setCustomerName) cartData.setCustomerName("");
        if (cartData.setTableNumber) cartData.setTableNumber("");
      }

      if (navigator.onLine) {
        if (master.fetchInitialData) master.fetchInitialData();
        if (master.fetchHistory) master.fetchHistory();
        playSuccessSound();
        showToast("Transaksi berhasil diproses!", "success");
      } else {
        playSuccessSound();
        showToast(
          "OFFLINE: Transaksi disimpan di perangkat lokal kasir!",
          "warning"
        );
      }
    } catch (err) {
      showToast("Gagal memproses transaksi: " + err.message, "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Toast toast={toast} setToast={setToast} />

      <AppLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCashier={master.activeCashier}
        setActiveCashier={master.setActiveCashier}
        staffList={master.staffList}
        setStaffList={master.setStaffList}
        showShiftDropdown={showShiftDropdown}
        setShowShiftDropdown={setShowShiftDropdown}
        setShowAdminStaffModal={setShowAdminStaffModal}
        setShowShiftClosingModal={setShowShiftClosingModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        {activeTab === "pos" && (
          <div className="flex flex-1 overflow-hidden relative">
            <ProductGrid
              categories={categoriesList}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              ordersHistory={ordersHistoryList}
              setActiveTab={setActiveTab}
              loading={master.loading}
              filteredProducts={filteredProducts}
              onOpenCustomization={(product) => {
                playBeepSound();
                setCustomizingProduct(product);
              }}
            />

            <div className="hidden lg:flex w-80 border-l border-slate-200/80 bg-white p-4 flex-col h-full justify-between shrink-0">
              <OrderRegisterPane
                customerName={cartData.customerName}
                setCustomerName={cartData.setCustomerName}
                tableNumber={cartData.tableNumber}
                setTableNumber={cartData.setTableNumber}
                tablesList={master.tablesList}
                setShowTableModal={setShowTableModal}
                cart={cartList}
                updateCartQuantity={(key, delta) => {
                  playBeepSound();
                  cartData.updateCartQuantity(key, delta);
                }}
                removeCartItem={(key) => {
                  playBeepSound();
                  cartData.removeCartItem(key);
                }}
                subtotal={cartData.subtotal}
                setShowPaymentModal={(val) => {
                  if (val) playBeepSound();
                  setShowPaymentModal(val);
                }}
                setPayments={cartData.setPayments}
              />
            </div>

            {cartList.length > 0 && (
              <div className="lg:hidden fixed bottom-20 left-3 right-3 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between z-30 transition-all duration-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {cartList.reduce((a, b) => a + (b?.quantity || 0), 0)} Item Dipilih
                  </span>
                  <span className="font-bold text-xs text-blue-400 font-mono">
                    Rp {(cartData.subtotal || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    playBeepSound();
                    setIsMobileCartOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" /> Buka Order
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTable
            filteredHistory={filteredHistory}
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            setSelectedOrderDetail={setSelectedOrderDetail}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryGrid
            products={productsList}
            categories={categoriesList}
            handleOpenProductModal={handleOpenProductModal}
            handleDeleteProduct={async (id) => {
              if (confirm("Hapus produk ini?")) {
                await supabase.from("products").delete().eq("id", id);
                if (master.fetchInitialData) master.fetchInitialData();
                showToast("Produk berhasil dihapus!", "success");
              }
            }}
            setShowToppingModal={setShowToppingModal}
            setShowIngredientModal={handleOpenProtectedIngredientModal}
            setSelectedRecipeProduct={setSelectedRecipeProduct}
            setShowHppModal={setShowHppModal}
            setShowCategoryModal={setShowCategoryModal}
          />
        )}

        {activeTab === "reports" && (
          <ReportsView
            filteredHistory={filteredHistory}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            filterPreset={filterPreset}
            applyDatePreset={(p) => setFilterPreset(p)}
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
            avgOrderValue={avgOrderValue}
            ingredientsList={ingredientsList}
          />
        )}

        <ModalContainer
          modalState={{
            customizingProduct,
            setCustomizingProduct,
            showIngredientModal,
            setShowIngredientModal,
            selectedRecipeProduct,
            setSelectedRecipeProduct,
            showTableModal,
            setShowTableModal,
            showToppingModal,
            setShowToppingModal,
            showCategoryModal,
            setShowCategoryModal,
            showProductModal,
            setShowProductModal,
            showAdminStaffModal,
            setShowAdminStaffModal,
            showPaymentModal,
            setShowPaymentModal,
            showReceiptModal,
            setShowReceiptModal,
            showHppModal,
            setShowHppModal,
            showPinModal,
            setShowPinModal,
            pinSuccessCallback,
            showShiftClosingModal,
            setShowShiftClosingModal,
            ordersHistory: ordersHistoryList,
            selectedOrderDetail,
            setSelectedOrderDetail,
            isMobileCartOpen,
            setIsMobileCartOpen,

            orderToDelete,
            setOrderToDelete,
            confirmExecuteDelete,

            categories: categoriesList,
            toppingsList: master.toppingsList,
            setToppingsList: master.setToppingsList,
            ingredientsList: ingredientsList,
            setIngredientsList: master.setIngredientsList,
            productRecipes: master.productRecipes,
            setProductRecipes: master.setProductRecipes,
            tablesList: master.tablesList,
            setTablesList: master.setTablesList,
            staffList: master.staffList,
            setStaffList: master.setStaffList,
            activeCashier: master.activeCashier,
            setActiveCashier: master.setActiveCashier,

            editingProduct,
            setEditingProduct,
            productForm,
            setProductForm,
            handleSaveProduct,
            handleSaveCategory,
            handleDeleteCategory,

            // CRUD Bahan Baku Mentah (Auto Sync Stok)
            handleSaveIngredient: async (ingData) => {
              try {
                const payload = {
                  store_id: master.CURRENT_STORE_ID,
                  name: ingData.name,
                  unit: ingData.unit || "Gram",
                  current_stock: parseFloat(ingData.current_stock) || 0,
                  min_stock: parseFloat(ingData.min_stock) || 0,
                  cost_per_unit: parseFloat(ingData.cost_per_unit) || 0,
                };

                let targetIngId = ingData.id;

                if (ingData.id) {
                  const { data: updatedIng, error } = await supabase
                    .from("ingredients")
                    .update(payload)
                    .eq("id", ingData.id)
                    .select()
                    .single();

                  if (error) throw error;

                  if (master.setIngredientsList) {
                    master.setIngredientsList((prev) =>
                      (Array.isArray(prev) ? prev : []).map((item) =>
                        String(item.id) === String(ingData.id)
                          ? updatedIng || { ...item, ...payload }
                          : item
                      )
                    );
                  }
                  showToast("Bahan baku berhasil diperbarui!", "success");
                } else {
                  const { data: newIng, error } = await supabase
                    .from("ingredients")
                    .insert([payload])
                    .select()
                    .single();

                  if (error) throw error;
                  if (newIng) targetIngId = newIng.id;

                  if (master.setIngredientsList && newIng) {
                    master.setIngredientsList((prev) => [
                      ...(Array.isArray(prev) ? prev : []),
                      newIng,
                    ]);
                  }
                  showToast("Bahan baku berhasil disimpan!", "success");
                }

                if (targetIngId) {
                  await syncAllVariantsUsingIngredient(targetIngId);
                }

                if (master.fetchInitialData) await master.fetchInitialData();
                playBeepSound();
              } catch (err) {
                showToast("Gagal menyimpan bahan baku: " + err.message, "error");
                if (master.fetchInitialData) await master.fetchInitialData();
              }
            },

            handleDeleteIngredient: async (id) => {
              if (!id) {
                return showToast("ID bahan baku tidak valid!", "warning");
              }

              try {
                if (master.setIngredientsList) {
                  master.setIngredientsList((prev) =>
                    (Array.isArray(prev) ? prev : []).filter(
                      (item) => String(item.id) !== String(id)
                    )
                  );
                }

                await supabase
                  .from("product_recipes")
                  .delete()
                  .eq("ingredient_id", id);

                const { error } = await supabase
                  .from("ingredients")
                  .delete()
                  .eq("id", id);

                if (error) throw error;

                if (master.fetchInitialData) await master.fetchInitialData();
                playBeepSound();
                showToast("Bahan baku berhasil dihapus!", "success");
              } catch (err) {
                showToast("Gagal menghapus bahan baku: " + err.message, "error");
                if (master.fetchInitialData) await master.fetchInitialData();
              }
            },

            // CRUD Resep Menu (Auto Sync Stok)
            handleSaveRecipe: async (recipeData) => {
              try {
                const existing = (master.productRecipes || []).find(
                  (r) =>
                    String(r.variant_id) === String(recipeData.variant_id) &&
                    String(r.ingredient_id) === String(recipeData.ingredient_id)
                );

                if (existing) {
                  const { error } = await supabase
                    .from("product_recipes")
                    .update({ quantity_required: recipeData.quantity_required })
                    .eq("id", existing.id);
                  if (error) throw error;
                } else {
                  const { error } = await supabase
                    .from("product_recipes")
                    .insert([
                      {
                        variant_id: recipeData.variant_id,
                        ingredient_id: recipeData.ingredient_id,
                        quantity_required: recipeData.quantity_required,
                      },
                    ]);
                  if (error) throw error;
                }

                await syncVariantStockFromRecipes(recipeData.variant_id);

                if (master.fetchInitialData) await master.fetchInitialData();
                playBeepSound();
                showToast("Resep berhasil disimpan!", "success");
              } catch (err) {
                showToast("Gagal menyimpan resep: " + err.message, "error");
              }
            },

            handleDeleteRecipeItem: async (id) => {
              try {
                const { data: targetRecipe } = await supabase
                  .from("product_recipes")
                  .select("variant_id")
                  .eq("id", id)
                  .single();

                const { error } = await supabase
                  .from("product_recipes")
                  .delete()
                  .eq("id", id);
                if (error) throw error;

                if (targetRecipe?.variant_id) {
                  await syncVariantStockFromRecipes(targetRecipe.variant_id);
                }

                if (master.fetchInitialData) await master.fetchInitialData();
                playBeepSound();
                showToast("Bahan resep berhasil dihapus!", "info");
              } catch (err) {
                showToast("Gagal menghapus bahan resep: " + err.message, "error");
              }
            },

            cart: cartList,
            customerName: cartData.customerName,
            setCustomerName: cartData.setCustomerName,
            tableNumber: cartData.tableNumber,
            setTableNumber: cartData.setTableNumber,
            subtotal: cartData.subtotal || 0,
            discountAmount: cartData.discountAmount || 0,
            grandTotal: cartData.subtotal || 0,
            updateCartQuantity: cartData.updateCartQuantity,
            removeCartItem: cartData.removeCartItem,
            handleAddToCartWithCustomization: (item) => {
              playBeepSound();
              if (cartData.handleAddToCartWithCustomization) {
                cartData.handleAddToCartWithCustomization(item);
              }
            },
            payments: paymentsList,
            setPayments: cartData.setPayments,
            checkoutLoading,
            handleCheckout,
            lastTransaction,
          }}
        />
      </AppLayout>
    </>
  );
}