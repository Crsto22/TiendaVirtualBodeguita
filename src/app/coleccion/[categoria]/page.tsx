"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Recycle,
  Filter,
  Tags,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaSlug = params.categoria as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Ref para el contenedor de scroll horizontal de categorías móvil
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Cargar estado desde localStorage después del montaje (solo cliente)
  useEffect(() => {
    const saved = localStorage.getItem("showAllCategories");
    if (saved === "true") {
      setShowAllCategories(true);
    }
  }, []);

  // Decodificar el slug: "lacteos-y-huevos" → "Lacteos Y Huevos"
  const categoriaNombre =
    categoriaSlug === "todas"
      ? null
      : decodeURIComponent(categoriaSlug).replace(/-/g, " ");

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
    () =>
      categoriaNombre
        ? getProductsByCategory(categoriaNombre, currentPage)
        : getAllProducts(currentPage)
  );

  // Reset página a 1 cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [categoriaSlug]);

  // Guardar estado del filtro en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showAllCategories", String(showAllCategories));
    }
  }, [showAllCategories]);

  // Restaurar posición de scroll horizontal al cargar
  useEffect(() => {
    if (categoriesScrollRef.current && typeof window !== "undefined") {
      const savedScrollPosition = localStorage.getItem(
        "categoriesScrollPosition"
      );
      if (savedScrollPosition) {
        categoriesScrollRef.current.scrollLeft = parseInt(
          savedScrollPosition,
          10
        );
      }
    }
  }, []);

  // Guardar posición de scroll antes de cambiar de categoría
  const handleCategoryChangeWithScroll = (categoryName: string | null) => {
    if (categoriesScrollRef.current && typeof window !== "undefined") {
      localStorage.setItem(
        "categoriesScrollPosition",
        String(categoriesScrollRef.current.scrollLeft)
      );
    }
    handleCategoryChange(categoryName);
  };

  // Obtener info de paginación según el tipo de respuesta
  const paginacion = categoriaNombre
    ? (data as any)?.paginacion
    : data?.paginacion;

  const productos = categoriaNombre
    ? (data as any)?.productos
    : data?.productos;

  // Buscar info de categoría seleccionada (para imagen/descripción)
  const selectedCategoryData = categoriaNombre
    ? categories.find(
        (cat) => cat.name.toLowerCase() === categoriaNombre.toLowerCase()
      )
    : null;

  // Manejar cambio de categoría via navegación
  const handleCategoryChange = (categoryName: string | null) => {
    if (categoryName === null) {
      router.push("/coleccion/todas");
    } else {
      const slug = categoryName.toLowerCase().replace(/\s+/g, "-");
      router.push(`/coleccion/${encodeURIComponent(slug)}`);
    }
  };

  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div
            ref={categoriesScrollRef}
            className="overflow-x-auto px-3 sm:px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex gap-2 min-w-max">
              {/* Chip "Todas" */}
              <button
                onClick={() => handleCategoryChangeWithScroll(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  !categoriaNombre
                    ? "bg-darkblue text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
                }`}
              >
                Todas
                {!categoriaNombre && paginacion?.total_productos && (
                  <span className="ml-1.5 opacity-80">
                    ({paginacion.total_productos})
                  </span>
                )}
              </button>

              {/* Chips de Categorías */}
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryChangeWithScroll(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    categoriaNombre?.toLowerCase() ===
                    category.name.toLowerCase()
                      ? "bg-darkblue text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar de filtros - Desktop - MODERNIZADO */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Filter className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full flex items-center justify-between gap-2 mb-4 px-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Categorías
                      </h3>
                    </div>
                    {/* Indicador visual opcional de colapso si decidieras colapsar todo el bloque, por ahora controla la lista */}
                  </button>

                  <div className="space-y-1.5">
                    {/* Botón "Todas" siempre visible */}
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`w-full group text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                        !categoriaNombre
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                          : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <span className="font-medium text-sm">Todas</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          !categoriaNombre
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        {!categoriaNombre && paginacion?.total_productos
                          ? paginacion.total_productos
                          : "All"}
                      </span>
                    </button>

                    {/* Lista de Categorías con lógica de "Ver más" */}
                    {categories
                      .slice(0, showAllCategories ? undefined : 5)
                      .map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleCategoryChange(category.name)}
                          className={`w-full group text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                            categoriaNombre?.toLowerCase() ===
                            category.name.toLowerCase()
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                              : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-primary"
                          }`}
                        >
                          <span className="font-medium text-sm">
                            {category.name}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              categoriaNombre?.toLowerCase() ===
                              category.name.toLowerCase()
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            {categoriaNombre?.toLowerCase() ===
                              category.name.toLowerCase() &&
                            paginacion?.total_productos
                              ? paginacion.total_productos
                              : ""}
                          </span>
                        </button>
                      ))}

                    {/* Botón Ver Más / Ver Menos */}
                    {categories.length > 5 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="w-full mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2"
                      >
                        {showAllCategories ? (
                          <>
                            Ver menos <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Ver {categories.length - 5} más{" "}
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            {/* Info y acciones */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"></div>

            {/* Loading state - Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden w-full flex sm:flex-col animate-pulse"
                  >
                    {/* Image Skeleton */}
                    <div className="relative w-28 sm:w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 shrink-0"></div>

                    {/* Content Skeleton */}
                    <div className="flex flex-col flex-1 p-2 sm:p-3 space-y-2">
                      {/* Title Skeleton */}
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>

                      {/* Unit Type Skeleton */}
                      <div className="h-2 sm:h-3 bg-gray-100 rounded w-1/3"></div>

                      <div className="mt-auto space-y-2">
                        {/* Price Skeleton */}
                        <div className="h-5 sm:h-6 bg-gray-300 rounded w-2/5"></div>

                        {/* Button Skeleton */}
                        <div className="h-8 sm:h-9 bg-gray-200 rounded-full w-full sm:w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  Hubo un problema al obtener los productos. Por favor, intenta
                  de nuevo.
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
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {productos.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.producto_web}`}
                    className="group"
                  >
                    <div
                      className={` sm:bg-white  sm:rounded-2xl sm:shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-[155px] sm:h-[340px] md:h-[380px] flex sm:flex-col group-hover:scale-[1.02] ${
                        product.stock === 0 ? "opacity-60" : ""
                      }`}
                    >
                      {/* Image Container */}
                      <div className="relative w-28 sm:w-full aspect-square  overflow-hidden shrink-0 p-2">
                        {product.imagen ? (
                          <Image
                            src={product.imagen}
                            alt={product.nombre}
                            fill
                            className={` object-contain  transition-transform duration-500 group-hover:scale-105 ${
                              product.stock === 0 ? "grayscale" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ShoppingCart className="size-6 sm:size-8 md:size-10 text-gray-400" />
                          </div>
                        )}

                        <ProductNewBadge product={product} />

                        {/* Badge de Producto Agotado */}
                        {product.stock === 0 && (
                          <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                            <svg
                              className="size-3 sm:size-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="hidden sm:inline">
                              Producto Agotado
                            </span>
                            <span className="sm:hidden">Agotado</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-2 sm:p-3">
                        {/* Product Name */}
                        <h3 className=" sm:text-sm font-semibold text-darkblue mb-1  group-hover:text-primary transition-colors leading-tight">
                          {capitalizeText(product.nombre)}
                        </h3>

                        {/* Unit Type */}
                        <p className="text-xs sm:text-xs text-gray-500 mb-1 flex items-center gap-1 flex-wrap">
                          <span className="block sm:hidden">Precio </span>
                          <span>
                            {product.tipo_unidad === "kilogramo"
                              ? "Por kg"
                              : "Unidad"}
                          </span>
                          {product.retornable && (
                            <span className="text-secondary font-semibold flex items-center gap-0.5">
                              <Recycle className="size-3" />
                              Retornable
                            </span>
                          )}
                        </p>
                        {product.mostrar_precio_web !== false && (
                          <span className="text-xl  sm:text-lg md:text-xl font-bold text-primary truncate">
                            S/ {(product.precio || 0).toFixed(2)}
                          </span>
                        )}
                        {/* Cart Container */}
                        <div className="mt-auto flex flex-col gap-2">

                          {/* Botón de carrito o controles */}
                          <div className="flex justify-end sm:justify-center">
                            {tiendaAbierta &&
                              (() => {
                                const cartItem = items.find(
                                  (item) => item.id === product.id
                                );
                                const quantityInCart = items.reduce(
                                  (acc, item) => {
                                    if (
                                      item.id === product.id ||
                                      item.id.startsWith(`${product.id}-`)
                                    ) {
                                      return acc + item.cantidad;
                                    }
                                    return acc;
                                  },
                                  0
                                );

                                if (
                                  cartItem &&
                                  product.tipo_unidad !== "kilogramo"
                                ) {
                                  return (
                                    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-full px-1 py-1 shadow-sm">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (cartItem.cantidad === 1) {
                                            removeItem(product.id);
                                          } else {
                                            updateQuantity(
                                              product.id,
                                              cartItem.cantidad - 1
                                            );
                                          }
                                        }}
                                        className="bg-red-500 text-white size-9 sm:size-7 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                                      >
                                        {cartItem.cantidad === 1 ? (
                                          <Trash2 className="size-5 sm:size-3.5" />
                                        ) : (
                                          <Minus className="size-5 sm:size-3.5" />
                                        )}
                                      </button>
                                      <span className="text-sm sm:text-base font-bold text-darkblue px-2 min-w-6 text-center">
                                        {cartItem.cantidad}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (product.stock !== 0) {
                                            updateQuantity(
                                              product.id,
                                              cartItem.cantidad + 1
                                            );
                                          }
                                        }}
                                        disabled={product.stock === 0}
                                        className={`text-white size-9 sm:size-7 rounded-full flex items-center justify-center transition-colors ${
                                          product.stock === 0
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-amber-500 hover:bg-amber-600"
                                        }`}
                                      >
                                        <Plus className="size-5 sm:size-3.5" />
                                      </button>
                                    </div>
                                  );
                                } else {
                                  if (product.stock === 0) {
                                    return (
                                      <Button
                                        disabled
                                        className="bg-gray-100 text-gray-400 border border-gray-200 shadow-none hover:bg-gray-100 cursor-not-allowed rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold flex items-center gap-1 relative"
                                      >
                                        <ShoppingCart className="size-5 sm:size-4" />
                                        <span className="hidden sm:block">Agotado</span>
                                      </Button>
                                    );
                                  }
                                  return (
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (product.stock === 0) return;

                                        if (
                                          product.tipo_unidad === "kilogramo"
                                        ) {
                                          setSelectedProduct(product);
                                        } else {
                                          addItem(product);
                                        }
                                      }}
                                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2  sm:text-sm font-semibold flex items-center gap-1 relative"
                                    >
                                      <ShoppingCart className=" size-5 sm:size-4" />
                                      <span className="hidden sm:block">
                                        Agregar
                                      </span>
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
                    <div className="border-b rounded-full border-gray-200 sm:border-none mt-2 sm"></div>
                  </Link>
                ))}
              </div>
            )}

            {/* Categoría vacía o no encontrada */}
            {!isLoading && !error && (!productos || productos.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-6 md:mb-8 animate-in fade-in zoom-in duration-700">
                  <Image
                    src="/Iconos/ProductoNoEncontrado.svg"
                    alt="Categoría Vacía"
                    width={300}
                    height={300}
                    className="w-full max-w-[220px] sm:max-w-[280px] h-auto mx-auto drop-shadow-xl"
                    priority
                  />
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-darkblue mb-3 md:mb-4 font-heading leading-tight">
                  {categoriaNombre
                    ? `No encontramos '${categoriaNombre}'`
                    : "No hay productos disponibles"}
                </h3>

                <p className="text-gray-500 max-w-xs sm:max-w-md mx-auto mb-8 text-sm sm:text-base font-body leading-relaxed">
                  {categoriaNombre
                    ? "Parece que esta categoría está vacía por el momento o no existe. ¿Por qué no exploras todo el catálogo?"
                    : "Intenta recargar la página o vuelve más tarde."}
                </p>

                <Button
                  onClick={() => handleCategoryChange(null)}
                  size="lg"
                  className="bg-primary hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 font-bold text-sm sm:text-base px-8 h-12 rounded-xl"
                >
                  <Tags className="mr-2 size-4 sm:size-5" />
                  Ver todos los productos
                </Button>
              </div>
            )}

            {/* Paginación Modernizada - Adaptada a Móvil */}
            {!isLoading &&
              !error &&
              paginacion &&
              paginacion.total_paginas > 1 && (
                <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 sm:gap-4 bg-white p-1.5 sm:p-2 pl-4 sm:pl-6 rounded-full shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-gray-100 max-w-full">
                    {/* Info Texto - Oculto en móviles muy pequeños para ahorrar espacio */}
                    <div className="hidden xs:flex text-[10px] sm:text-sm text-gray-500 flex-col sm:flex-row sm:gap-1 text-right sm:text-left leading-tight mr-2">
                      <span>Viendo</span>
                      <span className="font-bold text-gray-900">
                        {(currentPage - 1) * paginacion.productos_por_pagina +
                          1}{" "}
                        -{" "}
                        {Math.min(
                          currentPage * paginacion.productos_por_pagina,
                          paginacion.total_productos
                        )}
                      </span>
                      <span className="hidden sm:inline">
                        de{" "}
                        <span className="font-bold text-primary">
                          {paginacion.total_productos}
                        </span>{" "}
                        productos
                      </span>
                    </div>

                    <div className="h-6 sm:h-8 w-px bg-gray-200 mx-1 hidden xs:block"></div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!paginacion.tiene_anterior}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10 transition-transform active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </Button>

                      <div className="flex items-center justify-center min-w-[2.5rem] sm:min-w-[3rem] h-8 sm:h-10 bg-primary text-white rounded-full font-bold shadow-md shadow-primary/30 text-xs sm:text-base">
                        {currentPage}
                      </div>

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!paginacion.tiene_siguiente}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 hover:text-primary disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10 transition-transform active:scale-95"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                      </Button>
                    </div>
                  </div>

                  {/* Indicador de páginas totales - Versión Móvil Explicita */}
                  <div className="mt-3 flex flex-col items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-400">
                      Página {currentPage} de {paginacion.total_paginas}
                    </span>
                    {/* Info extra solo para móvil si se ocultó arriba */}
                    <span className="xs:hidden text-[10px] text-gray-400">
                      {(currentPage - 1) * paginacion.productos_por_pagina + 1}{" "}
                      -{" "}
                      {Math.min(
                        currentPage * paginacion.productos_por_pagina,
                        paginacion.total_productos
                      )}{" "}
                      de {paginacion.total_productos}
                    </span>
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
