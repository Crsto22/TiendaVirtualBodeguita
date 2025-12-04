"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2, Minus, Plus, ChevronLeft, ChevronRight, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useStoreConfigContext } from "@/context/StoreConfigContext";
import { categories } from "@/data/categories";
import { getAllProducts, getProductsByCategory } from "@/lib/api";
import type { Product } from "@/types/product";
import { ProductWeightSelector } from "@/components/product/product-weight-selector";
import { ProductNewBadge } from "@/components/product/product-new-badge";

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaSlug = params.categoria as string;

  const [currentPage, setCurrentPage] = useState(1);

  // Decodificar el slug: "lacteos-y-huevos" → "Lacteos Y Huevos"
  const categoriaNombre = categoriaSlug === "todas"
    ? null
    : decodeURIComponent(categoriaSlug).replace(/-/g, ' ');

  // Store config
  const { tiendaAbierta } = useStoreConfigContext();
  
  // Zustand store
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch productos - Si es "todas" usa getAllProducts, sino getProductsByCategory
  const { data, error, isLoading } = useSWR(
    categoriaNombre
      ? `categoria-${categoriaNombre}-page-${currentPage}`
      : `productos-page-${currentPage}`,
    () => categoriaNombre
      ? getProductsByCategory(categoriaNombre, currentPage)
      : getAllProducts(currentPage)
  );

  // Reset página a 1 cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [categoriaSlug]);

  // Obtener info de paginación según el tipo de respuesta
  const paginacion = categoriaNombre
    ? (data as any)?.paginacion
    : data?.paginacion;

  const productos = categoriaNombre
    ? (data as any)?.productos
    : data?.productos;

  // Buscar info de categoría seleccionada (para imagen/descripción)
  const selectedCategoryData = categoriaNombre
    ? categories.find(cat => cat.name.toLowerCase() === categoriaNombre.toLowerCase())
    : null;

  // Manejar cambio de categoría via navegación
  const handleCategoryChange = (categoryName: string | null) => {
    if (categoryName === null) {
      router.push("/coleccion/todas");
    } else {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      router.push(`/coleccion/${encodeURIComponent(slug)}`);
    }
  };

  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MobileDock />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {categoriaNombre && selectedCategoryData ? (
            // Header cuando hay categoría seleccionada
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-primary/20 flex items-center justify-center bg-white shadow-lg">
                <Image
                  src={selectedCategoryData.image}
                  alt={categoriaNombre}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-darkblue mb-1 uppercase">
                  {categoriaNombre}
                </h1>
                {selectedCategoryData.description && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {selectedCategoryData.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Header por defecto para "todas"
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-darkblue mb-1">
                Colección de Productos
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Explora todos nuestros productos organizados por categoría
              </p>
            </>
          )}
        </div>

        {/* Filtro Horizontal de Categorías - Móvil (Chips Scrolleables) */}
        <div className="lg:hidden mb-4 -mx-3 sm:-mx-4">
          <div className="overflow-x-auto px-3 sm:px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-2 min-w-max">
              {/* Chip "Todas" */}
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!categoriaNombre
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
                  }`}
              >
                Todas
                {!categoriaNombre && paginacion?.total_productos && (
                  <span className="ml-1.5 opacity-80">({paginacion.total_productos})</span>
                )}
              </button>

              {/* Chips de Categorías */}
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${categoriaNombre?.toLowerCase() === category.name.toLowerCase()
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
                    }`}
                >
                  {category.name}
                  {categoriaNombre?.toLowerCase() === category.name.toLowerCase() && paginacion?.total_productos && (
                    <span className="ml-1.5 opacity-80">({paginacion.total_productos})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 sticky top-20">
              <h2 className="text-lg font-bold text-darkblue mb-4">
                Categorías
              </h2>

              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${!categoriaNombre
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <span className="font-medium">Todas</span>
                  <Badge variant="secondary" className={!categoriaNombre ? "bg-white text-primary" : "bg-gray-200 text-darkblue"}>
                    {!categoriaNombre && paginacion?.total_productos ? paginacion.total_productos : "610"}
                  </Badge>
                </button>

                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${categoriaNombre?.toLowerCase() === category.name.toLowerCase()
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <span className="font-medium text-sm">{category.name}</span>
                    <Badge
                      variant="secondary"
                      className={
                        categoriaNombre?.toLowerCase() === category.name.toLowerCase()
                          ? "bg-white text-primary"
                          : "bg-gray-200 text-darkblue"
                      }
                    >
                      {categoriaNombre?.toLowerCase() === category.name.toLowerCase() && paginacion?.total_productos
                        ? paginacion.total_productos
                        : ""}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            {/* Info y acciones */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs sm:text-sm text-gray-600">
                {isLoading ? (
                  "Cargando..."
                ) : (
                  ""
                )}
              </p>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm sm:text-base text-gray-600">Cargando productos...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-12 sm:py-16">
                <ShoppingCart className="size-16 sm:size-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-darkblue mb-2">
                  Error al cargar productos
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Hubo un problema al obtener los productos. Por favor, intenta de nuevo.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* Grid de productos - Optimizado para móvil */}
            {!isLoading && !error && productos && productos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {productos.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.producto_web}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-60 sm:h-[280px] md:h-80 flex flex-col group-hover:scale-[1.02]">
                      {/* Image Container */}
                      <div className="relative h-[110px] sm:h-[140px] md:h-40 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                        {product.imagen ? (
                          <Image
                            src={product.imagen}
                            alt={product.nombre}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ShoppingCart className="size-6 sm:size-8 md:size-10 text-gray-400" />
                          </div>
                        )}
                        
                        <ProductNewBadge product={product} />
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-2 sm:p-3">
                        {/* Product Name */}
                        <h3 className="text-xs sm:text-sm font-semibold text-darkblue mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {capitalizeText(product.nombre)}
                        </h3>

                        {/* Unit Type */}
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center gap-1">
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
                              <span className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                                S/ {(product.precio || 0).toFixed(2)}
                              </span>
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
                                        if (cartItem.cantidad < product.stock) {
                                          updateQuantity(product.id, cartItem.cantidad + 1);
                                        }
                                      }}
                                      className="bg-amber-500 text-white size-6 sm:size-7 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                                      disabled={cartItem.cantidad >= product.stock}
                                    >
                                      <Plus className="size-3 sm:size-3.5" />
                                    </button>
                                  </div>
                                );
                              } else {
                                return (
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (product.tipo_unidad === 'kilogramo') {
                                        setSelectedProduct(product);
                                      } else {
                                        addItem(product);
                                      }
                                    }}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold flex items-center gap-1 relative"
                                  >
                                    <ShoppingCart className="size-3 sm:size-4" />
                                    Agregar
                                    {quantityInCart > 0 && (
                                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {quantityInCart}
                                      </span>
                                    )}
                                  </Button>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Mensaje si no hay productos */}
            {!isLoading && !error && (!productos || productos.length === 0) && (
              <div className="text-center py-12 sm:py-16">
                <ShoppingCart className="size-14 sm:size-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-darkblue mb-2">
                  No hay productos {categoriaNombre ? "en esta categoría" : "disponibles"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {categoriaNombre ? "Intenta seleccionar otra categoría" : "Vuelve más tarde"}
                </p>
                {categoriaNombre && (
                  <Button
                    onClick={() => handleCategoryChange(null)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Ver todos los productos
                  </Button>
                )}
              </div>
            )}

            {/* Paginación - Optimizada para móvil */}
            {!isLoading && !error && paginacion && paginacion.total_paginas > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-md">
                <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <span className="font-semibold">{(currentPage - 1) * paginacion.productos_por_pagina + 1}</span> -
                  <span className="font-semibold"> {Math.min(currentPage * paginacion.productos_por_pagina, paginacion.total_productos)}</span> de
                  <span className="font-semibold"> {paginacion.total_productos}</span> productos
                </p>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginacion.tiene_anterior}
                    variant="outline"
                    size="sm"
                    className="border-primary rounded-full text-primary hover:bg-primary hover:text-white disabled:opacity-50 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <ChevronLeft className="size-3 sm:size-4 mr-1" />
                    Anterior
                  </Button>

                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg font-semibold text-sm sm:text-base">
                    {currentPage}
                  </span>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginacion.tiene_siguiente}
                    variant="outline"
                    size="sm"
                    className="border-primary rounded-full text-primary hover:bg-primary hover:text-white disabled:opacity-50 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    Siguiente
                    <ChevronRight className="size-3 sm:size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
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