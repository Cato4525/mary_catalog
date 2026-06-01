alter table public.products
  add column if not exists descripcion text not null default '';
