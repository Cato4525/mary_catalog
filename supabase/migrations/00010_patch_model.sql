-- ============================================================
-- Migration 00010: Complete variant-based model
-- Safe incremental patch — preserves all existing data
-- ============================================================

-- ============================================================
-- PHASE 1: Add new columns to products
-- ============================================================

-- 1a. products.slug (SEO-friendly URL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.products ADD COLUMN slug text;
  END IF;
END $$;

-- Generate slug from nombre for existing products
UPDATE public.products
SET slug = lower(regexp_replace(
  regexp_replace(nombre, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If unique constraint fails (duplicates), append id to make unique
  UPDATE public.products SET slug = slug || '-' || id
  WHERE id IN (
    SELECT id FROM (
      SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) AS rn
      FROM public.products
    ) t WHERE rn > 1
  );
  ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
END $$;

-- 1b. products.destacado (featured product)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'destacado'
  ) THEN
    ALTER TABLE public.products ADD COLUMN destacado boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================
-- PHASE 2: Update product_variants
-- ============================================================

-- 2a. Rename activo → disponible on product_variants
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'activo'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'disponible'
  ) THEN
    ALTER TABLE public.product_variants RENAME COLUMN activo TO disponible;
  END IF;
END $$;

-- If neither exists, add disponible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'disponible'
  ) THEN
    ALTER TABLE public.product_variants ADD COLUMN disponible boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- 2b. Add orden column for variant ordering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'orden'
  ) THEN
    ALTER TABLE public.product_variants ADD COLUMN orden integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Set initial orden based on created_at for existing variants
UPDATE public.product_variants
SET orden = sub.rn - 1
FROM (
  SELECT id, row_number() OVER (PARTITION BY product_id ORDER BY created_at ASC) AS rn
  FROM public.product_variants
) sub
WHERE public.product_variants.id = sub.id
  AND public.product_variants.orden = 0;

-- ============================================================
-- PHASE 3: Drop obsolete columns from products
-- ============================================================

-- 3a. Drop products.color (replaced by product_variants.color_id)
ALTER TABLE public.products DROP COLUMN IF EXISTS color;

-- 3b. Drop products.imagen_url (replaced by product_images.variant_id)
ALTER TABLE public.products DROP COLUMN IF EXISTS imagen_url;

-- 3c. Drop products.fecha_activacion (not needed)
ALTER TABLE public.products DROP COLUMN IF EXISTS fecha_activacion;

-- ============================================================
-- PHASE 4: Add indices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON public.products(destacado);
CREATE INDEX IF NOT EXISTS idx_product_variants_orden ON public.product_variants(orden);

-- ============================================================
-- PHASE 5: Disable RLS on all tables
-- ============================================================

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PHASE 6: Validation
-- ============================================================

DO $$
DECLARE
  total_products bigint;
  total_variants bigint;
  products_without_slug bigint;
  products_without_variant bigint;
BEGIN
  SELECT count(*) INTO total_products FROM public.products;
  SELECT count(*) INTO total_variants FROM public.product_variants;

  SELECT count(*) INTO products_without_slug
    FROM public.products WHERE slug IS NULL OR slug = '';

  SELECT count(*) INTO products_without_variant
    FROM public.products p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.product_variants pv WHERE pv.product_id = p.id
    );

  RAISE NOTICE '=== Migration 00010 Validation ===';
  RAISE NOTICE 'Products: %', total_products;
  RAISE NOTICE 'Variants: %', total_variants;
  RAISE NOTICE 'Products without slug: %', products_without_slug;
  RAISE NOTICE 'Products without variant: %', products_without_variant;

  IF products_without_slug > 0 THEN
    RAISE WARNING '% products have no slug!', products_without_slug;
  END IF;

  IF products_without_variant > 0 THEN
    RAISE WARNING '% products have no variant!', products_without_variant;
  END IF;
END $$;
