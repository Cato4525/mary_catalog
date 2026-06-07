alter table public.store_settings
  add column if not exists whatsapp text not null default '';
