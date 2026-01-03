
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart, Trash2, Minus, Plus, Recycle } from "lucide-react";
import { useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { getProductsClient } from "@/lib/api";
import { Category, Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { useStoreConfigContext } from "@/context/StoreConfigContext";
import { ProductWeightSelector } from "@/components/product/product-weight-selector";
import { ProductNewBadge } from "@/components/product/product-new-badge";

// Función para capitalizar texto (primera letra mayúscula, resto minúscula)
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Componente individual para el carrusel de cada categoría
function CategoryCarousel({ category }: { category: Category }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { tiendaAbierta } = useStoreConfigContext();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollPosition =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (product.stock === 0) return;

    if (product.tipo_unidad === 'kilogramo') {
      setSelectedProduct(product);
    } else {
      addItem(product);
    }
  };

  if (!category.productos || category.productos.length === 0) {
    return null;
  }

  // Generar slug de la categoría para la URL
  const categorySlug = category.categoria_nombre.toLowerCase().replace(/\s+/g, '-');

  // Verificar si es la sección de "Productos nuevos" (sin botón Ver más)
  const isNewProductsSection = category.categoria_id === 'nuevos';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-darkblue">
          {category.categoria_nombre}
        </h3>
        {!isNewProductsSection && (
          <Link href={`/coleccion/${encodeURIComponent(categorySlug)}`}>
            <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm">
              Ver más →
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Previous Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute hidden md:flex left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="size-5 md:size-6" />
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth md:px-10"
        >
          {category.productos.map((product) => (
            <Link
              key={product.id}
              href={`/productos/${product.producto_web}`}
              className="group shrink-0"
            >
              <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-[150px] sm:w-40 md:w-[200px] lg:w-[220px] h-[260px] sm:h-[280px] md:h-[340px] flex flex-col group-hover:scale-[1.02] ${product.stock === 0 ? 'opacity-60' : ''}`}>
                {/* Image Container */}
                <div className="relative h-[120px] sm:h-[140px] md:h-[180px] bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.imagen ? (
                    <Image
                      src={product.imagen}
                      alt={product.nombre}
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
                      className={product.stock === 0 ? 'grayscale' : ''}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ShoppingCart className="size-8 sm:size-10 md:size-12 text-gray-400" />
                    </div>
                  )}

                  <ProductNewBadge product={product} />

                  {/* Badge de Producto Agotado */}
                  {product.stock === 0 && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                      <svg className="size-3 sm:size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Producto Agotado
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1 p-2 sm:p-3 md:p-4">
                  {/* Product Name */}
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-darkblue mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {capitalizeText(product.nombre)}
                  </h3>

                  {/* Unit Type */}
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2 flex items-center gap-1">
                    <span>{product.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}</span>
                    {product.retornable && (
                      <span className="text-secondary font-semibold flex items-center gap-0.5">
                        <Recycle className="size-3" />
                        Retornable
                      </span>
                    )}
                  </p>

                  {/* Price and Cart Container */}
                  <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-1">
                    {/* Precio */}
                    <div className="flex flex-col min-w-0">
                      {product.mostrar_precio_web !== false && (
                        <>
                          <span className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                            S/ {(product.precio || 0).toFixed(2)}
                          </span>
                          {product.has_precio_alternativo && product.precio_alternativo && (
                            <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                              {product.motivo_precio_alternativo}: S/ {product.precio_alternativo.toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Botón de carrito o controles */}
                    <div className="flex justify-center md:justify-end">
                      {tiendaAbierta && (() => {
                        const cartItem = items.find(item => item.id === product.id);
                        const quantityInCart = items.reduce((acc, item) => {
                          if (item.id === product.id || item.id.startsWith(`${product.id}-`)) {
                            return acc + item.cantidad;
                          }
                          return acc;
                        }, 0);

                        if (cartItem && product.tipo_unidad !== 'kilogramo') {
                          return (
                            <div className="flex items-center gap-5 sm:gap-1 bg-white border-2 border-gray-200 rounded-full px-1 py-1 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (cartItem.cantidad === 1) {
                                    removeItem(product.id);
                                  } else {
                                    updateQuantity(product.id, cartItem.cantidad - 1);
                                  }
                                }}
                                className="bg-red-500 text-white size-6 sm:size-7 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                              >
                                {cartItem.cantidad === 1 ? (
                                  <Trash2 className="size-3 sm:size-3.5" />
                                ) : (
                                  <Minus className="size-3 sm:size-3.5" />
                                )}
                              </button>
                              <span className="text-sm sm:text-base font-bold text-darkblue px-2 min-w-6 text-center">
                                {cartItem.cantidad}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (product.stock !== 0) {
                                    updateQuantity(product.id, cartItem.cantidad + 1);
                                  }
                                }}
                                disabled={product.stock === 0}
                                className={`text-white size-6 sm:size-7 rounded-full flex items-center justify-center transition-colors ${product.stock === 0
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-amber-500 hover:bg-amber-600"
                                  }`}
                              >
                                <Plus className="size-3 sm:size-3.5" />
                              </button>
                            </div>
                          );
                        }

                        if (product.stock === 0) {
                          return (
                            <button
                              disabled
                              className="bg-gray-100 text-gray-400 px-3 py-2.5 sm:p-2 rounded-full shadow-none cursor-not-allowed shrink-0 inline-flex items-center gap-1.5 sm:gap-0 border border-gray-200"
                              aria-label="Agotado"
                            >
                              <ShoppingCart className="size-3.5 sm:size-4 md:size-5" />
                              <span className="text-xs font-semibold sm:hidden">Agotado</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={(e) => handleProductClick(e, product)}
                            className="bg-primary text-white px-3 py-2.5 sm:p-2 rounded-full sm:rounded-full shadow-md hover:bg-primary/90 transition-colors shrink-0 inline-flex items-center gap-1.5 sm:gap-0 relative"
                            aria-label="Agregar al carrito"
                          >
                            <ShoppingCart className="size-3.5 sm:size-4 md:size-5" />
                            <span className="text-xs font-semibold sm:hidden">Agregar</span>
                            {quantityInCart > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {quantityInCart}
                              </span>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 hidden md:flex -translate-y-1/2 translate-x-3 md:translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
          aria-label="Siguiente"
        >
          <ChevronRight className="size-5 md:size-6" />
        </button>
      </div>

      {selectedProduct && (
        <ProductWeightSelector
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// Función auxiliar para transformar la respuesta de la API
export function transformProductsResponse(response: any) {
  // Extraer productos nuevos defensivamente
  let productosNuevos: Product[] | undefined = undefined;
  if (Array.isArray(response.productos_nuevos)) {
    productosNuevos = response.productos_nuevos as Product[];
  } else if (response.productos_nuevos && (response.productos_nuevos as any).productos) {
    productosNuevos = (response.productos_nuevos as any).productos as Product[];
  }

  // Filtrar categorías que tienen productos y tomar solo las primeras 5
  // Verificamos si response.data es array
  const dataArray = Array.isArray(response.data) ? response.data : [];

  const categorias = dataArray
    .filter((category: Category) => category.productos && category.productos.length > 0)
    .slice(0, 5);

  return {
    categorias,
    productosNuevos,
  };
}

// Fetcher function para SWR
const fetcher = async () => {
  const response = await getProductsClient();
  return transformProductsResponse(response);
};

interface ProductsSectionProps {
  initialData?: any; // Type as ApiResponse but we'll transform it before passing to SWR if needed, or expects transformed
}

export function ProductsSection({ initialData }: ProductsSectionProps) {
  // Si recibimos initialData (desde SSR), lo transformamos para usarlo como fallback
  const fallbackData = initialData ? transformProductsResponse(initialData) : undefined;

  // SWR con cache automático
  const { data, error, isLoading } = useSWR<{
    categorias: Category[];
    productosNuevos?: Product[];
  }>(
    'home-products', // Key única para este dato
    fetcher,
    {
      fallbackData, // Datos iniciales del servidor
      revalidateOnFocus: false, // No revalidar al cambiar de tab
      revalidateOnReconnect: true, // Revalidar al reconectar internet
      dedupingInterval: 60000, // Deduplicar requests por 1 minuto
    }
  );

  // Skeleton loader solo en la primera carga (cuando no hay data en cache)
  if (isLoading && !data) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-darkblue mb-6">
            Productos por Categoría
          </h2>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-8">
              <div className="h-8 bg-gray-300 rounded w-48 mb-4 animate-pulse" />
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="shrink-0">
                    <div className="bg-gray-200 rounded-2xl w-40 md:w-[200px] lg:w-[220px] h-[280px] md:h-[340px] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const categorias = data?.categorias;
  const productosNuevos = data?.productosNuevos;

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Productos nuevos (si existen) */}
        {productosNuevos && productosNuevos.length > 0 && (
          <CategoryCarousel
            key="nuevos"
            category={{
              categoria_id: 'nuevos',
              categoria_nombre: 'Productos nuevos',
              productos: productosNuevos,
            }}
          />
        )}

        {/* Render each category with its carousel */}
        {categorias?.map((category) => (
          <CategoryCarousel key={category.categoria_id} category={category} />
        ))}
      </div>
    </section>
  );
}
