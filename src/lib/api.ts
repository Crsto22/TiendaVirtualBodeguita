import { ApiResponse, SearchResponse, ProductDetailResponse, PaginatedProductsResponse, CategoryProductsResponse } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vanesabodeguita-api.arturo200512.workers.dev';

/**
 * Obtiene todos los productos agrupados por categorías (para SSR)
 */
export async function getProducts(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/inicio`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Obtiene todos los productos agrupados por categorías (para client-side)
 */
export async function getProductsClient(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/inicio`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Busca productos por query string
 * @param query - Término de búsqueda
 * @returns Productos que coinciden con la búsqueda
 */
export async function searchProducts(query: string): Promise<SearchResponse> {
  try {
    // Validar query
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return {
        success: true,
        query: '',
        total: 0,
        data: [],
      };
    }

    const response = await fetch(
      `${API_BASE_URL}/buscar?q=${encodeURIComponent(trimmedQuery)}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al buscar productos: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Obtiene el detalle de un producto por su slug
 * @param slug - Slug del producto (producto_web)
 * @returns Detalle del producto y productos relacionados
 */
export async function getProductDetail(slug: string): Promise<ProductDetailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return a safe "not found" object instead of crashing
        return {
          success: false,
          producto: null as any,
          productos_relacionados: { total: 0, data: [] }
        };
      }
      throw new Error(`Error al obtener producto: ${response.status}`);
    }

    const data: ProductDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product detail:', error);
    // Return a safe failure object on network error
    return {
      success: false,
      producto: null as any,
      productos_relacionados: { total: 0, data: [] }
    };
  }
}

/**
 * Obtiene todos los productos con paginación (para /coleccion)
 * @param page - Número de página (por defecto 1)
 * @returns Productos paginados
 */
export async function getAllProducts(page: number = 1): Promise<PaginatedProductsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/productos?page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const data: PaginatedProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
}

/**
 * Obtiene productos de una categoría con paginación
 * @param categoryName - Nombre de la categoría
 * @param page - Número de página (por defecto 1)
 * @returns Productos de la categoría paginados
 */
export async function getProductsByCategory(
  categoryName: string,
  page: number = 1
): Promise<CategoryProductsResponse> {
  try {
    // Reemplazar espacios con guiones como solicitó el usuario
    const formattedCategory = categoryName.replace(/\s+/g, '-');

    const response = await fetch(
      `${API_BASE_URL}/categoria/${encodeURIComponent(formattedCategory)}?page=${page}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          categoria: { id: '', nombre: categoryName, color: '', descripcion: '' },
          paginacion: { pagina_actual: 1, total_paginas: 0, productos_por_pagina: 0, total_productos: 0, tiene_siguiente: false, tiene_anterior: false },
          productos: []
        };
      }
      throw new Error(`Error al obtener productos de categoría: ${response.status}`);
    }

    const data: CategoryProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return {
      success: false,
      categoria: { id: '', nombre: categoryName, color: '', descripcion: '' },
      paginacion: { pagina_actual: 1, total_paginas: 0, productos_por_pagina: 0, total_productos: 0, tiene_siguiente: false, tiene_anterior: false },
      productos: []
    };
  }
}
