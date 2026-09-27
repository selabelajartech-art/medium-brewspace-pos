import React, { useState, useEffect } from "react";
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

  // State Hapus Transaksi (Custom Pop-up Modal)
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

  // AUTO-SYNC TRANSAKSI OFFLINE KE CLOUD SAAT KONEKSI TERHUBUNG
  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (!navigator.onLine) return;

      try {
        const offlineOrders = await getOfflineOrders();
        if (offlineOrders.length === 0) return;

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

        if (master.fetchInitialData) master.fetchInitialData();
        if (master.fetchHistory) master.fetchHistory();

        playSuccessSound();
        showToast(
          `${offlineOrders.length} Transaksi offline berhasil disingkronkan ke cloud!`,
          "success"
        );
      } catch (err) {
        console.error("Gagal sinkronisasi offline:", err);
      }
    };

    window.addEventListener("online", syncOfflineOrders);
    syncOfflineOrders();

    return () => window.removeEventListener("online", syncOfflineOrders);
  }, [master]);

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

  // HANDLER HAPUS RIWAYAT TRANSAKSI (Memicu Pop-up Custom Delete Modal)
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

  // HANDLER CHECKOUT RESILIEN (DUAL MODE: ONLINE & OFFLINE INDEXEDDB)
  const handleCheckout = async (
    paymentMode = "FULL",
    targetTotal = cartData.grandTotal || 0,
    splitItemQtyMap = {}
  ) => {
    if (cartList.length === 0)
      return showToast("Keranjang belanja masih kosong!", "warning");
    setCheckoutLoading(true);

    let itemsToPay = cartList;
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
    }

    const currentTotal =
      paymentMode === "FULL" ? cartData.grandTotal || 0 : targetTotal;

    const checkoutPayload = {
      p_store_id: master.CURRENT_STORE_ID,
      p_shift_id: null,
      p_user_id: null,
      p_customer_id: null,
      p_order_type: cartData.orderType || "DINE_IN",
      p_table_number: cartData.tableNumber || "1",
      p_status: "COMPLETED",
      p_subtotal: currentTotal,
      p_discount: paymentMode === "FULL" ? cartData.discountAmount || 0 : 0,
      p_tax: 0,
      p_total: currentTotal,
      p_items: itemsToPay.map((i) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: i.finalPrice,
        subtotal: i.finalPrice * i.quantity,
        notes: i.notes,
      })),
      p_payments: paymentsList.map((p) => ({
        method: p.method,
        amount: parseFloat(p.amount) || currentTotal,
      })),
    };

    try {
      let orderId = null;

      // Mode Online -> Direct RPC Supabase
      if (navigator.onLine) {
        const { data, error } = await supabase.rpc(
          "process_advanced_checkout",
          checkoutPayload
        );
        if (error) throw error;
        orderId = data;
      }
      // Mode Offline -> Simpan ke IndexedDB lokal browser
      else {
        const savedTemp = await saveOfflineOrder(checkoutPayload);
        orderId = savedTemp.temp_id;
      }

      // Potong Stok Bahan Baku Lokal
      itemsToPay.forEach((cartItem) => {
        const recipes = (master.productRecipes || []).filter(
          (r) => r.variant_id === cartItem.variant_id
        );
        recipes.forEach((rec) => {
          if (master.setIngredientsList) {
            master.setIngredientsList((prev) =>
              (Array.isArray(prev) ? prev : []).map((ing) => {
                if (ing.id === rec.ingredient_id) {
                  const totalDeduction =
                    parseFloat(rec.quantity_required) * cartItem.quantity;
                  return {
                    ...ing,
                    current_stock: Math.max(
                      0,
                      ing.current_stock - totalDeduction
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
        grandTotal: currentTotal,
        payments: paymentsList,
        change: Math.max(
          0,
          (parseFloat(paymentsList[0]?.amount) || currentTotal) - currentTotal
        ),
        customer: cartData.customerName || "Umum",
        cashier: master.activeCashier?.name || "Kasir",
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
                discountAmount={cartData.discountAmount}
                grandTotal={cartData.grandTotal}
                setShowPaymentModal={(val) => {
                  if (val) playBeepSound();
                  setShowPaymentModal(val);
                }}
                setPayments={cartData.setPayments}
              />
            </div>

            {/* Bar Keranjang Melayang Mobile - Hanya Muncul Jika Ada Item Terpilih */}
            {cartList.length > 0 && (
              <div className="lg:hidden fixed bottom-20 left-3 right-3 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between z-30 transition-all duration-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {cartList.reduce((a, b) => a + (b?.quantity || 0), 0)} Item Dipilih
                  </span>
                  <span className="font-bold text-xs text-blue-400 font-mono">
                    Rp {(cartData.grandTotal || 0).toLocaleString("id-ID")}
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

            // State Pop-up Delete Modal
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

            handleSaveIngredient: (ing) => {
              if (master.setIngredientsList)
                master.setIngredientsList([...ingredientsList, ing]);
              showToast("Bahan baku disimpan!", "success");
            },
            handleDeleteIngredient: (id) => {
              if (master.setIngredientsList)
                master.setIngredientsList(
                  ingredientsList.filter((i) => i.id !== id)
                );
              showToast("Bahan baku dihapus!", "success");
            },
            handleSaveRecipe: (r) => {
              if (master.setProductRecipes)
                master.setProductRecipes([...(master.productRecipes || []), r]);
              showToast("Resep berhasil diperbarui!", "success");
            },
            handleDeleteRecipeItem: (id) => {
              if (master.setProductRecipes)
                master.setProductRecipes(
                  (master.productRecipes || []).filter((r) => r.id !== id)
                );
              showToast("Bahan resep dihapus!", "info");
            },

            cart: cartList,
            customerName: cartData.customerName,
            setCustomerName: cartData.setCustomerName,
            tableNumber: cartData.tableNumber,
            setTableNumber: cartData.setTableNumber,
            subtotal: cartData.subtotal || 0,
            discountAmount: cartData.discountAmount || 0,
            grandTotal: cartData.grandTotal || 0,
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