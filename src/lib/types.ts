export interface Category {
  id: number
  nombre: string
  created_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  color: string
  categoria_id: number | null
  imagen_url: string
  disponible: boolean
  fecha_activacion: string | null
  created_at: string
  categories?: Category | null
  images?: ProductImage[]
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
