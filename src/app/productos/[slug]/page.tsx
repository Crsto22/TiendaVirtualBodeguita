"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Trash2,
  Minus,
  Plus,
  Store,
  Info,
  Recycle
} from "lucide-react";
import { getProductDetail } from "@/lib/api";
import { ProductDetailResponse, Product } from "@/types/product";
import { ProductWeightSelector } from "@/components/product/product-weight-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { useCartStore } from "@/store/cart-store";
import { useStoreConfigContext } from "@/context/StoreConfigContext";
import { ProductNewBadge } from "@/components/product/product-new-badge";

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fetcher para SWR
const fetcher = (slug: string) => getProductDetail(slug);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Store config
  const { tiendaAbierta } = useStoreConfigContext();
  
  // Zustand store
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  // SWR con cache
  const { data, error, isLoading } = useSWR<ProductDetailResponse>(
    slug ? `product-${slug}` : null,
    () => fetcher(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutos
    }
  );

  const product = data?.producto;
  const relatedProducts = data?.productos_relacionados.data || [];

  // Obtener item del carrito
  const cartItem = product ? items.find(item => item.id === product.id) : null;

  // Handlers
  const handleAddToCart = () => {
    if (!product) return;
    if (product.tipo_unidad === 'kilogramo') {
      setSelectedProduct(product);
    } else {
      addItem(product);
    }
  };

  const handleShare = (platform: 'facebook' | 'whatsapp') => {
    if (!product) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = product.mostrar_precio_web !== false
      ? `${capitalizeText(product.nombre)} - S/ ${(product.precio || 0).toFixed(2)}`
      : capitalizeText(product.nombre);

    if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'width=600,height=400'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        '_blank'
      );
    }

    setShowShareMenu(false);
  };

  // Loading state
  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
          {/* Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-300 rounded mb-6" />
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-300 rounded-xl" />
                <div className="space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4" />
                  <div className="h-6 bg-gray-300 rounded w-1/2" />
                  <div className="h-12 bg-gray-300 rounded w-1/3" />
                  <div className="h-10 bg-gray-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <MobileDock />
      </div>
    );
  }

  // Error state
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
            <AlertCircle className="size-12 sm:size-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-darkblue mb-2">
              Producto no encontrado
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Lo sentimos, no pudimos encontrar este producto.
            </p>
            <Button onClick={() => router.push('/inicio')} className="bg-primary hover:bg-primary/90">
              Volver al inicio
            </Button>
          </div>
        </div>
        <MobileDock />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const maxQuantity = Math.min(product.stock, 99);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MobileDock />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-darkblue hover:text-primary mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="size-4 sm:size-5" />
          <span className="text-sm sm:text-base font-medium">Volver</span>
        </button>

        {/* Detalle del producto */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Imagen del producto */}
            <div className="relative">
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                {product.imagen ? (
                  <Image
                    src={product.imagen}
                    alt={product.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="size-20 sm:size-24 text-gray-300" />
                  </div>
                )}
                
                <ProductNewBadge product={product} className="top-3 left-3 px-3 py-1.5 text-xs sm:text-sm" />
              </div>

              {/* Botón compartir */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Compartir producto"
                >
                  <Share2 className="size-5 sm:size-6 text-gray-600" />
                </button>

                {/* Menú de compartir */}
                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl p-2 min-w-40 z-20">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Facebook</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Badge de stock */}
              {isOutOfStock && (
                <div className="absolute bottom-3 left-3">
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    Agotado
                  </Badge>
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="flex flex-col">
              {/* Categoría */}
              <Badge variant="secondary" className="w-fit mb-3 text-xs sm:text-sm">
                {product.categoria_nombre}
              </Badge>

              {/* Nombre */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-darkblue mb-3 sm:mb-4">
                {capitalizeText(product.nombre)}
              </h1>

              {/* Tipo de unidad */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Tag className="size-4 sm:size-5 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-600">
                  Se vende por: <span className="font-semibold">
                    {product.tipo_unidad === 'kilogramo' ? 'Kilogramo' : 'Unidad'}
                  </span>
                  {product.retornable && (
                    <span className="text-secondary font-semibold ml-2 inline-flex items-center gap-1">
                      <Recycle className="size-4" />
                      Retornable
                    </span>
                  )}
                </span>
              </div>

              {/* Precio */}
              {product.mostrar_precio_web !== false && (
                <div className="bg-linear-to-br from-primary/5 to-secondary/5 rounded-xl p-4 ">
                  <p className="text-sm sm:text-base text-gray-600 mb-2">Precio</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                    S/ {(product.precio || 0).toFixed(2)}
                  </p>
                  {product.has_precio_alternativo && product.precio_alternativo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {product.motivo_precio_alternativo}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-secondary">
                        S/ {product.precio_alternativo.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tipo de entrega */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl">
                  <div className=" text-white p-2 sm:p-2.5 rounded-lg shrink-0 flex items-center justify-center">
                    <Image
                      src="/recojo-en-tienda.svg"
                      alt="Recojo en tienda"
                      width={34}
                      height={34}
                      className="size-13 sm:size-15"
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Tipo de entrega</p>
                    <p className="text-sm sm:text-base font-bold text-green-700">Recojo en tienda</p>
                  </div>
                </div>
              </div>

              {/* Botón de acción o Controles de cantidad */}
              <div className="mt-auto">
                {tiendaAbierta && cartItem && product.tipo_unidad !== 'kilogramo' ? (
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-white border-2 border-gray-200 rounded-full px-2 py-2 shadow-md">
                    <button
                      onClick={() => {
                        if (cartItem.cantidad === 1) {
                          removeItem(product.id);
                        } else {
                          updateQuantity(product.id, cartItem.cantidad - 1);
                        }
                      }}
                      className="bg-red-500 text-white size-7 sm:size-9 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                    >
                      {cartItem.cantidad === 1 ? (
                        <Trash2 className="size-4 sm:size-5" />
                      ) : (
                        <Minus className="size-4 sm:size-5" />
                      )}
                    </button>
                    <div className="px-3 sm:px-4">
                      <span className="text-xl sm:text-2xl font-bold text-darkblue">
                        {cartItem.cantidad}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (cartItem.cantidad < product.stock) {
                          updateQuantity(product.id, cartItem.cantidad + 1);
                        }
                      }}
                      className="bg-amber-500 text-white size-7 sm:size-9 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                      disabled={cartItem.cantidad >= product.stock}
                    >
                      <Plus className="size-5 sm:size-6" />
                    </button>
                  </div>
                ) : tiendaAbierta ? (
                  <div className="relative inline-block">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 px-7 sm:px-8 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 relative"
                    >
                      <ShoppingCart className="size-4 sm:size-5" />
                      Agregar
                      {(() => {
                        const quantityInCart = items.reduce((acc, item) => {
                          if (item.id === product.id || item.id.startsWith(`${product.id}-`)) {
                            return acc + item.cantidad;
                          }
                          return acc;
                        }, 0);

                        if (quantityInCart > 0) {
                          return (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold size-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                              {quantityInCart}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </button>
                    {product.mostrar_precio_web === false && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 group">
                        <Info className="size-5 text-gray-400 hover:text-primary cursor-help transition-colors" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                         Por seguridad, algunos precios no se muestran públicamente.
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-darkblue mb-4 sm:mb-6">
              Productos relacionados
            </h2>
            <RelatedProductsCarousel products={relatedProducts} />
          </div>
        )}
      </div>
      {product && selectedProduct && (
        <ProductWeightSelector
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// Componente separado para el carrusel de productos relacionados
function RelatedProductsCarousel({ products }: { products: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { tiendaAbierta } = useStoreConfigContext();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  return (
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
        {products.map((relatedProduct) => (
          <Link
            key={relatedProduct.id}
            href={`/productos/${relatedProduct.producto_web}`}
            className="group shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-[150px] sm:w-40 md:w-[200px] lg:w-[220px] h-[260px] sm:h-[280px] md:h-[340px] flex flex-col group-hover:scale-[1.02]">
              {/* Image Container */}
              <div className="relative h-[120px] sm:h-[140px] md:h-[180px] bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                {relatedProduct.imagen ? (
                  <Image
                    src={relatedProduct.imagen}
                    alt={relatedProduct.nombre}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShoppingCart className="size-8 sm:size-10 md:size-12 text-gray-400" />
                  </div>
                )}
                
                <ProductNewBadge product={relatedProduct} />
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 p-2 sm:p-3 md:p-4">
                {/* Product Name */}
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-darkblue mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {capitalizeText(relatedProduct.nombre)}
                </h3>

                {/* Unit Type */}
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>{relatedProduct.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}</span>
                  {relatedProduct.retornable && (
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
                    {relatedProduct.mostrar_precio_web !== false && (
                      <>
                        <span className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                          S/ {(relatedProduct.precio || 0).toFixed(2)}
                        </span>
                        {relatedProduct.has_precio_alternativo && relatedProduct.precio_alternativo && (
                          <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                            {relatedProduct.motivo_precio_alternativo}: S/ {relatedProduct.precio_alternativo.toFixed(2)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Botón de carrito o controles */}
                  <div className="flex justify-center md:justify-end md:shrink-0">
                    {tiendaAbierta && (() => {
                      const cartItem = items.find(item => item.id === relatedProduct.id);

                      if (cartItem) {
                        return (
                          <div className="flex items-center gap-5 sm:gap-1 bg-white border-2 border-gray-200 rounded-full px-1 py-1 shadow-sm">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (cartItem.cantidad === 1) {
                                  removeItem(relatedProduct.id);
                                } else {
                                  updateQuantity(relatedProduct.id, cartItem.cantidad - 1);
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
                                if (cartItem.cantidad < relatedProduct.stock) {
                                  updateQuantity(relatedProduct.id, cartItem.cantidad + 1);
                                }
                              }}
                              className="bg-amber-500 text-white size-6 sm:size-7 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                              disabled={cartItem.cantidad >= relatedProduct.stock}
                            >
                              <Plus className="size-3 sm:size-3.5" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (relatedProduct.tipo_unidad === 'kilogramo') {
                              setSelectedProduct(relatedProduct);
                            } else {
                              addItem(relatedProduct);
                            }
                          }}
                          className="bg-primary text-white px-3 py-2.5 sm:p-2 rounded-full sm:rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 inline-flex items-center gap-1.5 sm:gap-0"
                          aria-label="Agregar al carrito"
                          disabled={relatedProduct.stock === 0}
                        >
                          <ShoppingCart className="size-3.5 sm:size-4 md:size-5" />
                          <span className="text-xs font-semibold sm:hidden">Agregar</span>
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
