-- ========================================================
-- ARUBEKEE COLLECTION - CONCURRENCY-SAFE INVENTORY FUNCTIONS
-- High-concurrency stock reservation, Paystack settlement,
-- expired reservation cleanup, and Aba offline sales ledger.
-- ========================================================

-- 1. ATOMIC ORDER STOCK RESERVATION
-- Called when a customer clicks "Proceed to Paystack" at checkout.
-- Locks relevant variant rows with SELECT ... FOR UPDATE to prevent race conditions.
CREATE OR REPLACE FUNCTION create_order_reservation(
  p_order_id UUID,
  p_items JSONB, -- Array of { "variant_id": "uuid", "quantity": 1 }
  p_duration_minutes INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_variant_id UUID;
  v_requested_qty INT;
  v_current_stock INT;
  v_active_reservations INT;
  v_available_stock INT;
  v_expires_at TIMESTAMPTZ;
  v_reserved_count INT := 0;
BEGIN
  v_expires_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;

  -- Iterate through items and evaluate availability with row-level locks
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_requested_qty := (v_item->>'quantity')::INT;

    -- Lock the specific variant row for concurrency safety
    SELECT stock_quantity INTO v_current_stock
    FROM product_variants
    WHERE id = v_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant ID % does not exist', v_variant_id;
    END IF;

    -- Calculate active (unexpired, unreleased, uncommitted) reservations for this variant
    SELECT COALESCE(SUM(quantity), 0) INTO v_active_reservations
    FROM stock_reservations
    WHERE variant_id = v_variant_id
      AND is_released = FALSE
      AND is_committed = FALSE
      AND expires_at > NOW();

    v_available_stock := v_current_stock - v_active_reservations;

    IF v_available_stock < v_requested_qty THEN
      -- Insufficient available stock for this variant
      RETURN jsonb_build_object(
        'success', FALSE,
        'error', 'INSUFFICIENT_STOCK',
        'variant_id', v_variant_id,
        'requested', v_requested_qty,
        'available', GREATEST(v_available_stock, 0)
      );
    END IF;
  END LOOP;

  -- If all items passed validation, insert reservation rows
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_requested_qty := (v_item->>'quantity')::INT;

    INSERT INTO stock_reservations (
      order_id,
      variant_id,
      quantity,
      expires_at,
      is_released,
      is_committed
    ) VALUES (
      p_order_id,
      v_variant_id,
      v_requested_qty,
      v_expires_at,
      FALSE,
      FALSE
    );

    v_reserved_count := v_reserved_count + 1;
  END LOOP;

  -- Add timeline event to order
  INSERT INTO order_timeline (order_id, title, description, actor)
  VALUES (
    p_order_id,
    'Stock Reserved',
    'Inventory reserved for ' || p_duration_minutes || ' minutes while awaiting Paystack payment.',
    'Inventory Service'
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'reserved_items_count', v_reserved_count,
    'expires_at', v_expires_at
  );
END;
$$;


-- 2. IDEMPOTENT PAYMENT SETTLEMENT & INVENTORY COMMIT
-- Executed either by Paystack Webhook or verified callback.
-- Guarantees single-execution even under concurrent or duplicate webhook deliveries.
CREATE OR REPLACE FUNCTION settle_order_payment(
  p_payment_reference TEXT,
  p_amount_paid_kobo BIGINT,
  p_paystack_transaction_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_res RECORD;
  v_has_conflict BOOLEAN := FALSE;
  v_current_stock INT;
BEGIN
  -- Lock the target order row
  SELECT * INTO v_order
  FROM orders
  WHERE payment_reference = p_payment_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'ORDER_NOT_FOUND',
      'reference', p_payment_reference
    );
  END IF;

  -- Idempotency check: if already marked paid, return success immediately
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object(
      'success', TRUE,
      'status', 'ALREADY_PAID',
      'order_id', v_order.id,
      'order_number', v_order.order_number
    );
  END IF;

  -- Validate amount matches expected order total
  IF p_amount_paid_kobo < v_order.total_kobo THEN
    -- Underpayment anomaly
    UPDATE orders
    SET payment_status = 'failed',
        internal_notes = COALESCE(internal_notes, '') || ' [Error: Underpayment received: ' || p_amount_paid_kobo || ' kobo instead of ' || v_order.total_kobo || ' kobo]'
    WHERE id = v_order.id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'UNDERPAYMENT',
      'expected_kobo', v_order.total_kobo,
      'received_kobo', p_amount_paid_kobo
    );
  END IF;

  -- Inspect reservation state for this order
  FOR v_res IN 
    SELECT sr.*, pv.stock_quantity AS variant_stock
    FROM stock_reservations sr
    JOIN product_variants pv ON pv.id = sr.variant_id
    WHERE sr.order_id = v_order.id
    FOR UPDATE OF pv
  LOOP
    -- Check if reservation has expired and stock has been taken by another customer
    IF v_res.expires_at < NOW() AND v_res.is_committed = FALSE THEN
      IF v_res.variant_stock < v_res.quantity THEN
        v_has_conflict := TRUE;
      END IF;
    END IF;
  END LOOP;

  -- HANDLE OVERSOLD / LATE-PAYMENT CONFLICT
  IF v_has_conflict THEN
    -- Customer paid after their reservation expired, and inventory was sold out in the interim.
    -- We QUARANTINE the order into a visible exception status instead of silently dropping or overselling!
    UPDATE orders
    SET payment_status = 'inventory_conflict_quarantined',
        paystack_transaction_id = p_paystack_transaction_id,
        paid_at = NOW(),
        internal_notes = COALESCE(internal_notes, '') || ' [INVENTORY CONFLICT: Customer paid after 15-min reservation expired. Stock insufficient. Requires merchant action: Restock or Refund]'
    WHERE id = v_order.id;

    INSERT INTO order_timeline (order_id, title, description, actor)
    VALUES (
      v_order.id,
      'Payment Quarantined (Inventory Conflict)',
      'Payment was received after reservation expired. Requested items are currently out of stock. Awaiting owner resolution.',
      'Paystack Gateway'
    );

    RETURN jsonb_build_object(
      'success', TRUE,
      'status', 'QUARANTINED_INVENTORY_CONFLICT',
      'order_id', v_order.id,
      'order_number', v_order.order_number
    );
  END IF;

  -- STANDARD SUCCESSFUL SETTLEMENT: COMMIT INVENTORY & DECREMENT
  FOR v_res IN 
    SELECT sr.* 
    FROM stock_reservations sr
    WHERE sr.order_id = v_order.id
  LOOP
    -- Mark reservation committed
    UPDATE stock_reservations
    SET is_committed = TRUE,
        is_released = FALSE
    WHERE id = v_res.id;

    -- Decrement physical variant stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - v_res.quantity,
        updated_at = NOW()
    WHERE id = v_res.variant_id
    RETURNING stock_quantity INTO v_current_stock;

    -- Record immutable inventory movement
    INSERT INTO inventory_movements (
      variant_id,
      change_quantity,
      resulting_quantity,
      reason,
      reference_id,
      recorded_by,
      notes
    ) VALUES (
      v_res.variant_id,
      -v_res.quantity,
      v_current_stock,
      'online_sale',
      v_order.order_number,
      'Paystack System',
      'Confirmed online payment via Paystack'
    );
  END LOOP;

  -- Mark order as PAID
  UPDATE orders
  SET payment_status = 'paid',
      paystack_transaction_id = p_paystack_transaction_id,
      paid_at = NOW(),
      updated_at = NOW()
  WHERE id = v_order.id;

  -- Add timeline event
  INSERT INTO order_timeline (order_id, title, description, actor)
  VALUES (
    v_order.id,
    'Payment Confirmed',
    'Payment of ₦' || (p_amount_paid_kobo / 100) || ' confirmed via Paystack. Ready for fulfillment.',
    'Paystack Gateway'
  );

  -- Enqueue notification in outbox
  INSERT INTO notification_outbox (channel, recipient, template, payload)
  VALUES (
    'email',
    v_order.customer_email,
    'order_confirmation',
    jsonb_build_object(
      'order_id', v_order.id,
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'total_naira', (v_order.total_kobo / 100),
      'delivery_type', v_order.delivery_type
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'status', 'PAID',
    'order_id', v_order.id,
    'order_number', v_order.order_number
  );
END;
$$;


-- 3. RELEASE EXPIRED RESERVATIONS CLEANUP PROCEDURE
-- Periodic edge cron / triggered function to release stale reservations.
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_released_count INT;
BEGIN
  WITH released AS (
    UPDATE stock_reservations
    SET is_released = TRUE
    WHERE expires_at < NOW()
      AND is_released = FALSE
      AND is_committed = FALSE
    RETURNING id
  )
  SELECT COUNT(*) INTO v_released_count FROM released;

  RETURN v_released_count;
END;
$$;


-- 4. RECORD OFFLINE ABA BOUTIQUE / WHATSAPP SALE
-- Directly debits the physical stock for walk-in store sales on Ehi Road or WhatsApp orders.
-- Does NOT fake an online Paystack transaction. Records the exact payment method and staff member.
CREATE OR REPLACE FUNCTION record_offline_sale(
  p_variant_id UUID,
  p_quantity INT,
  p_unit_price_kobo BIGINT,
  p_payment_method payment_method_enum,
  p_staff_name TEXT,
  p_order_source order_source_enum, -- 'offline_aba_store' or 'whatsapp_order'
  p_customer_name TEXT DEFAULT 'Walk-in Customer',
  p_customer_phone TEXT DEFAULT 'N/A',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_variant RECORD;
  v_product RECORD;
  v_new_stock INT;
  v_order_id UUID;
  v_order_number TEXT;
  v_total_kobo BIGINT;
BEGIN
  -- Lock variant row
  SELECT * INTO v_variant
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'VARIANT_NOT_FOUND');
  END IF;

  IF v_variant.stock_quantity < p_quantity THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'INSUFFICIENT_STOCK',
      'available', v_variant.stock_quantity,
      'requested', p_quantity
    );
  END IF;

  SELECT * INTO v_product
  FROM products
  WHERE id = v_variant.product_id;

  v_total_kobo := p_unit_price_kobo * p_quantity;
  v_order_number := 'ARU-OFF-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Create completed offline order record
  INSERT INTO orders (
    order_number,
    order_source,
    customer_name,
    customer_email,
    customer_phone,
    delivery_type,
    subtotal_kobo,
    delivery_fee_kobo,
    discount_kobo,
    total_kobo,
    payment_status,
    payment_method,
    fulfillment_status,
    paid_at,
    dispatched_at,
    recorded_by_staff_name,
    internal_notes
  ) VALUES (
    v_order_number,
    p_order_source,
    p_customer_name,
    'offline@arubekee.internal',
    p_customer_phone,
    'aba_pickup',
    v_total_kobo,
    0,
    0,
    v_total_kobo,
    'paid',
    p_payment_method,
    'delivered',
    NOW(),
    NOW(),
    p_staff_name,
    p_notes
  ) RETURNING id INTO v_order_id;

  -- Insert order item snapshot
  INSERT INTO order_items (
    order_id,
    product_id,
    variant_id,
    sku,
    product_name,
    color_name,
    size,
    unit_price_kobo,
    quantity,
    total_kobo
  ) VALUES (
    v_order_id,
    v_variant.product_id,
    v_variant.id,
    v_variant.sku,
    v_product.name,
    v_variant.color_name,
    v_variant.size,
    p_unit_price_kobo,
    p_quantity,
    v_total_kobo
  );

  -- Decrement variant stock
  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO v_new_stock;

  -- Record inventory movement ledger entry
  INSERT INTO inventory_movements (
    variant_id,
    change_quantity,
    resulting_quantity,
    reason,
    reference_id,
    recorded_by,
    notes
  ) VALUES (
    p_variant_id,
    -p_quantity,
    v_new_stock,
    CASE WHEN p_order_source = 'whatsapp_order' THEN 'whatsapp_order'::inventory_reason_enum ELSE 'offline_sale_aba'::inventory_reason_enum END,
    v_order_number,
    p_staff_name,
    COALESCE(p_notes, 'Manual in-store / WhatsApp sale recorded')
  );

  -- Record timeline
  INSERT INTO order_timeline (order_id, title, description, actor)
  VALUES (
    v_order_id,
    'Offline Sale Logged',
    'Sale of ' || p_quantity || ' unit(s) recorded by ' || p_staff_name || ' via ' || p_payment_method || '.',
    p_staff_name
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'new_stock', v_new_stock
  );
END;
$$;

