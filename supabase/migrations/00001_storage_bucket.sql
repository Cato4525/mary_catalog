-- ============================================================
-- Migration: Crear bucket product-images y políticas RLS
-- ============================================================

-- 1. Crear bucket público para imágenes de productos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Política: lectura pública (cualquiera puede ver imágenes)
drop policy if exists "Public Read" on storage.objects;
create policy "Public Read" on storage.objects
  for select using (bucket_id = 'product-images');

-- 3. Política: subida pública (cualquiera puede subir imágenes)
drop policy if exists "Public Upload" on storage.objects;
create policy "Public Upload" on storage.objects
  for insert with check (bucket_id = 'product-images');

-- 4. Política: eliminación pública
drop policy if exists "Public Delete" on storage.objects;
create policy "Public Delete" on storage.objects
  for delete using (bucket_id = 'product-images');
