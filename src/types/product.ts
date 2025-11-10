export interface Product {
  id: string;
  nombre: string;
  producto_web: string;
  tipo_unidad: string;
  stock: number;
  precio: number;
  has_precio_alternativo: boolean;
  precio_alternativo?: number;
  motivo_precio_alternativo?: string;
  fecha_creacion: string;
  imagen?: string;
  categoria_ref: string;
  codigo_barras: string;
  estado: string;
  retornable: boolean;
  categoria_nombre?: string; // Incluido en resultados de búsqueda
}

export interface Category {
  categoria_id: string;
  categoria_nombre: string;
  productos: Product[];
}

export interface ApiResponse {
  success: boolean;
  total_categorias: number;
  cache_age_seconds: number;
  data: Category[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total: number;
  data: Product[];
}
