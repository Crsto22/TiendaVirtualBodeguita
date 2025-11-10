import { ApiResponse, SearchResponse } from '@/types/product';

const API_BASE_URL = 'https://vanesabodeguita-api.arturo200512.workers.dev';

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
