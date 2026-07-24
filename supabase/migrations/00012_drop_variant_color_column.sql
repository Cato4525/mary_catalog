-- ============================================================
-- Migration 00012: Drop orphaned `color` text column from product_variants
-- The normalized model uses `color_id` referencing the colors table.
-- This leftover column was causing NOT NULL violations on insert.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'color'
  ) THEN
    ALTER TABLE public.product_variants DROP COLUMN color;
  END IF;
END $$;
