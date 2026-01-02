export interface Product {
  id: string;
  nombre: string;
  producto_web: string;
  tipo_unidad: string;
  stock: number;
  precio: number | null;
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
  mostrar_precio_web?: boolean;
  tipo_producto_kg?: 'granel' | 'pieza' | 'peso_fijo' | 'precio_directo';
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
  // Bloque opcional que puede venir del endpoint /inicio con los productos nuevos
  productos_nuevos?: {
    total: number;
    productos: Product[];
  } | Product[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total: number;
  data: Product[];
}

export interface ProductDetailResponse {
  success: boolean;
  producto: Product;
  productos_relacionados: {
    total: number;
    data: Product[];
  };
}

// Interface para items en el carrito (extiende Product + cantidad)
export interface CartItem extends Product {
  cantidad: number;
  cantidad_helada?: number; // Cantidad de bebidas heladas (solo para bebidas con precio_alternativo "Helada")
  detalle?: string; // Detalle de la selección (ej: "500 g", "3 unid", "S/ 5.00")
}

// Paginación
export interface Pagination {
  pagina_actual: number;
  total_paginas: number;
  productos_por_pagina: number;
  total_productos: number;
  tiene_siguiente: boolean;
  tiene_anterior: boolean;
}

// Respuesta de productos con paginación (para /productos y /categoria)
export interface PaginatedProductsResponse {
  success: boolean;
  paginacion: Pagination;
  productos: Product[];
}

// Respuesta de productos por categoría
export interface CategoryProductsResponse {
  success: boolean;
  categoria: {
    id: string;
    nombre: string;
    color: string;
    descripcion: string;
  };
  paginacion: Pagination;
  productos: Product[];
}
