-- ============================================================
-- Migrar imágenes existentes de products.imagen_url
-- a product_images
-- ============================================================

insert into public.product_images (product_id, url, sort_order)
select
  p.id,
  p.imagen_url,
  0
from public.products p
where p.imagen_url is not null
  and p.imagen_url != ''
  and not exists (
    select 1
    from public.product_images pi
    where pi.product_id = p.id
      and pi.url = p.imagen_url
  );
