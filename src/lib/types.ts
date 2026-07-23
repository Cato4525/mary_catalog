export interface Category {
  id: number
  nombre: string
  created_at: string
}

export interface ProductType {
  id: number
  nombre: string
  created_at: string
}

export interface Color {
  id: number
  nombre: string
  codigo_hex: string
  activo: boolean
  created_at: string
}

export interface ProductImage {
  id: number
  variant_id: number
  url: string
  sort_order: number
  created_at: string
}

export interface ProductVariant {
  id: number
  product_id: number
  color_id: number
  disponible: boolean
  orden: number
  created_at: string
  colors?: Color | null
  images?: ProductImage[]
}

export interface Product {
  id: number
  codigo: string
  slug: string | null
  nombre: string
  descripcion: string
  categoria_id: number | null
  tipo_id: number | null
  disponible: boolean
  destacado: boolean
  created_at: string
  updated_at: string | null
  categories?: Category | null
  product_types?: ProductType | null
  variants?: ProductVariant[]
}

export interface Size {
  id: number
  nombre: string
  activo: boolean
  created_at: string
}

export interface ProductSize {
  id: number
  product_id: number
  size_id: number
  activo: boolean
  created_at: string
  sizes?: Size | null
}

export interface StoreSettings {
  id: number
  store_name: string
  store_description: string
  contact_email: string
  contact_phone: string
  address: string
  logo_url: string
  whatsapp: string
}
