-- =============================================================================
-- 1. PEMBERSIHAN OTOMATIS SELURUH VERSI DUPILKASI FUNCTION (FUNCTION OVERLOAD PURGE)
-- =============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT oid::regprocedure AS func_signature
        FROM pg_proc
        WHERE proname = 'process_advanced_checkout'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;
END $$;

-- =============================================================================
-- 2. MEMBUAT ULANG SATU FUNGSI ADVANCED CHECKOUT TUNGGAL & TEPAT
-- =============================================================================
CREATE OR REPLACE FUNCTION process_advanced_checkout(
  p_store_id UUID,
  p_shift_id UUID,
  p_user_id UUID,
  p_customer_id UUID,
  p_order_type VARCHAR,
  p_table_number VARCHAR,
  p_status VARCHAR,
  p_subtotal NUMERIC,
  p_discount NUMERIC,
  p_tax NUMERIC,
  p_total NUMERIC,
  p_items JSONB,
  p_payments JSONB,
  p_payment_mode VARCHAR DEFAULT 'FULL',
  p_split_people INTEGER DEFAULT 1
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item JSONB;
    v_payment JSONB;
    v_variant_id UUID;
    v_unit_price NUMERIC;
    v_quantity INT;
    v_item_subtotal NUMERIC;
    v_payment_method TEXT;
    v_payment_amount NUMERIC;
    
    -- Variabel Potong Stok & Poin
    v_recipe_count INT;
    v_rec RECORD;
    v_bom RECORD;
    v_num_people INT;
    v_deduction_factor NUMERIC;
    v_earned_points INT;
BEGIN
    -- Generate ID & Nomor Nota Unik
    v_order_id := gen_random_uuid();
    v_order_number := 'ORD-' || UPPER(SUBSTRING(v_order_id::text FROM 1 FOR 8));

    -- Faktor Pengurangan Stok Proporsional untuk Split Bill
    v_num_people := GREATEST(1, COALESCE(p_split_people, 1));
    v_deduction_factor := CASE 
        WHEN UPPER(COALESCE(p_payment_mode, 'FULL')) = 'SPLIT_EQUAL' THEN (1.0 / v_num_people) 
        ELSE 1.0 
    END;

    -- 1. Insert ke tabel orders dengan explicit casting tipe data ENUM
    INSERT INTO orders (
        id,
        store_id,
        shift_id,
        user_id,
        customer_id,
        order_number,
        order_type,
        table_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        payment_mode,
        split_people
    ) VALUES (
        v_order_id,
        p_store_id,
        p_shift_id,
        p_user_id,
        p_customer_id,
        v_order_number,
        COALESCE(NULLIF(p_order_type, ''), 'DINE_IN')::order_type,
        p_table_number,
        COALESCE(NULLIF(p_status, ''), 'COMPLETED')::order_status,
        COALESCE(p_subtotal, 0),
        COALESCE(p_discount, 0),
        COALESCE(p_tax, 0),
        COALESCE(p_total, 0),
        COALESCE(NULLIF(p_payment_mode, ''), 'FULL'),
        v_num_people
    );

    -- 2. Insert item pesanan ke order_items & potong stok otomatis
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_variant_id := (v_item->>'variant_id')::UUID;
            v_unit_price := COALESCE(NULLIF(v_item->>'unit_price', '')::NUMERIC, 0);
            v_quantity := COALESCE(NULLIF(v_item->>'quantity', '')::INT, 1);
            
            v_item_subtotal := COALESCE(
                NULLIF(v_item->>'subtotal', '')::NUMERIC,
                (v_unit_price * v_quantity)
            );

            INSERT INTO order_items (
                order_id,
                variant_id,
                quantity,
                unit_price,
                subtotal,
                notes
            ) VALUES (
                v_order_id,
                v_variant_id,
                v_quantity,
                v_unit_price,
                v_item_subtotal,
                v_item->>'notes'
            );

            -- Potong Stok Bahan Baku (Resep / BOM / Direct)
            SELECT COUNT(*) INTO v_recipe_count 
            FROM product_recipes 
            WHERE variant_id = v_variant_id;

            IF v_recipe_count > 0 THEN
                FOR v_rec IN 
                    SELECT ingredient_id, quantity_required 
                    FROM product_recipes 
                    WHERE variant_id = v_variant_id
                LOOP
                    UPDATE ingredients 
                    SET current_stock = GREATEST(0, current_stock - (v_rec.quantity_required * v_quantity * v_deduction_factor))
                    WHERE id = v_rec.ingredient_id;
                END LOOP;

            ELSIF EXISTS (SELECT 1 FROM boms WHERE parent_variant_id = v_variant_id) THEN
                FOR v_bom IN 
                    SELECT ingredient_variant_id, quantity_required 
                    FROM boms 
                    WHERE parent_variant_id = v_variant_id
                LOOP
                    UPDATE inventories 
                    SET stock = GREATEST(0, stock - ROUND(v_bom.quantity_required * v_quantity * v_deduction_factor)::INT)
                    WHERE variant_id = v_bom.ingredient_variant_id;
                END LOOP;

            ELSE
                UPDATE inventories 
                SET stock = GREATEST(0, stock - ROUND(v_quantity * v_deduction_factor)::INT)
                WHERE variant_id = v_variant_id;
            END IF;

        END LOOP;
    END IF;

    -- 3. Insert metode pembayaran ke order_payments
    IF p_payments IS NOT NULL AND jsonb_array_length(p_payments) > 0 THEN
        FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
        LOOP
            v_payment_method := COALESCE(NULLIF(v_payment->>'method', ''), 'CASH');
            v_payment_amount := COALESCE(NULLIF(v_payment->>'amount', '')::NUMERIC, p_total);

            INSERT INTO order_payments (
                order_id,
                method,
                amount
            ) VALUES (
                v_order_id,
                v_payment_method::payment_method,
                v_payment_amount
            );
        END LOOP;
    END IF;

    -- 4. Tambah Poin Loyalitas Pelanggan (1 Poin per Rp 10.000)
    IF p_customer_id IS NOT NULL THEN
        v_earned_points := FLOOR(COALESCE(p_total, 0) / 10000)::INT;
        IF v_earned_points > 0 THEN
            UPDATE customers
            SET points = COALESCE(points, 0) + v_earned_points
            WHERE id = p_customer_id;
        END IF;
    END IF;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

//Another Query//

-- Tambahkan label 'TRANSFER' dan metode pembayaran lain yang diperlukan ke ENUM payment_method
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'TRANSFER';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'BANK_TRANSFER';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'QRIS';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'CARD';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'DEBIT';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'CREDIT';

CREATE INDEX IF NOT EXISTS idx_orders_store_created ON orders (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_variant ON product_recipes (variant_id);

-- Index 1: Mempercepat filter riwayat transaksi toko berdasarkan tanggal terbaru
CREATE INDEX IF NOT EXISTS idx_orders_store_created 
ON orders (store_id, created_at DESC);

-- Index 2: Mempercepat pemanggilan item pesanan saat klik Detail / Cetak Struk
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items (order_id);

-- Index 3: Mempercepat eksekusi pemotongan stok bahan baku resep saat checkout
CREATE INDEX IF NOT EXISTS idx_product_recipes_variant 
ON product_recipes (variant_id);

-- Index 4: Mempercepat pemanggilan data stok bahan baku pada tab Inventory
CREATE INDEX IF NOT EXISTS idx_ingredients_store 
ON ingredients (store_id);

-- Index 5: Mempercepat kalkulasi breakdown metode pembayaran di laporan keuangan
CREATE INDEX IF NOT EXISTS idx_order_payments_order 
ON order_payments (order_id);