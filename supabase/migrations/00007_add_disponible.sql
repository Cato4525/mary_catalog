-- Agregar columna disponible (booleano, default true)
alter table public.products
add column if not exists disponible boolean not null default true;

-- Agregar columna fecha_activacion (para el timer de 15 días)
alter table public.products
add column if not exists fecha_activacion timestamptz default now();

-- Actualizar productos existentes con fecha_activacion = created_at
update public.products
set fecha_activacion = created_at
where fecha_activacion is null;

-- Índice para filtrar productos disponibles
create index if not exists idx_products_disponible on public.products(disponible);
