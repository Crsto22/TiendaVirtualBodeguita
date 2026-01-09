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
  Recycle,
  CheckCircle2
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
  const { tiendaAbierta, hacerPedidos } = useStoreConfigContext();

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
  if (isLoading) {
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

  // Error state or Product Not Found (success: false or null product)
  if (error || !data?.success || !data?.producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center py-8 md:py-20 text-center animate-in fade-in zoom-in duration-500">

          {/* Illustration Container */}
          {/* Custom Illustration */}
          <div className="relative mb-6 md:mb-8 animate-in fade-in zoom-in duration-700">
            <Image
              src="/Iconos/ProductoNoEncontrado.svg"
              alt="Producto no encontrado"
              width={300}
              height={300}
              className="w-full max-w-[220px] sm:max-w-[320px] h-auto mx-auto drop-shadow-xl"
              priority
            />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-darkblue mb-3 md:mb-4 font-heading leading-tight px-4">
            Producto no encontrado
          </h2>

          <p className="text-gray-500 max-w-xs sm:max-w-md mx-auto mb-6 md:mb-8 text-sm sm:text-lg font-body leading-relaxed px-2">
            Parece que el producto que buscas ya no está disponible o la dirección es incorrecta.
            <br className="hidden md:block" />
            ¡Pero no te preocupes, tenemos muchos más!
          </p>

          <div className="flex flex-col w-full max-w-[280px] sm:max-w-md gap-3 sm:flex-row sm:gap-4 justify-center">
            <Button
              onClick={() => router.push('/inicio')}
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 font-bold text-sm sm:text-base h-11 sm:h-12 rounded-xl active:scale-95"
            >
              <Store className="mr-2 size-4 sm:size-5" />
              Ir al Catálogo
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold text-sm sm:text-base h-11 sm:h-12 rounded-xl active:scale-95"
            >
              <ArrowLeft className="mr-2 size-4 sm:size-5" />
              Volver atrás
            </Button>
          </div>

          {/* Suggested Categories Chips (Optional aesthetic touch) */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-100 w-full max-w-2xl px-2">
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-bold mb-3 md:mb-4">Quizás te interese buscar en</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Frutas", "Verduras", "Abarrotes", "Bebidas", "Lácteos"].map((cat) => (
                <Link
                  key={cat}
                  href={`/coleccion/${cat.toLowerCase()}`}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-xs sm:text-sm font-medium hover:border-primary hover:text-primary hover:bg-green-50 transition-all cursor-pointer active:bg-gray-100"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

        </div>

        <MobileDock />
      </div>
    );
  }

  // Ensure product exists for TypeScript
  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const maxQuantity = 999; // Sin límite de cantidad

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
        {/* Main Product Layout */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT COLUMN: Image Gallery */}
          <div className="relative group">
            <div className={`
                relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto aspect-square bg-white rounded-2xl md:rounded-4xl overflow-hidden shadow-sm border border-gray-100
                ${isOutOfStock ? 'opacity-90' : ''}
            `}>
              {/* Decorative Background Blob */}
              <div className="absolute inset-0 bg-radial-gradient from-slate-50 to-transparent opacity-50 pointer-events-none" />

              {product.imagen ? (
                <div className="w-full h-full p-4 sm:p-6 md:p-8 flex items-center justify-center ">
                  <Image
                    src={product.imagen}
                    alt={product.nombre}
                    fill
                    sizes="(max-width: 768px) 90vw, 400px"
                    className={`object-contain drop-shadow-lg ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Package className="size-24 text-slate-200" />
                </div>
              )}

              <ProductNewBadge product={product} className="top-6 left-6 text-sm px-4 py-1.5 shadow-md" />

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] z-10">
                  <div className="bg-white/90 text-red-500 px-6 py-3 rounded-2xl shadow-xl border border-red-100 flex items-center gap-3 animate-in zoom-in duration-300">
                    <AlertCircle className="size-6" />
                    <span className="font-bold text-lg">Agotado temporalmente</span>
                  </div>
                </div>
              )}
            </div>

            {/* Share Button Floating */}
            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Compartir"
              >
                <Share2 className="size-4 sm:size-5" />
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-48 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-xl transition-colors text-left group/wa"
                  >
                    <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-sm group-hover/wa:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors text-left group/fb"
                  >
                    <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-sm group-hover/fb:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Facebook</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="flex flex-col h-full pt-2">

            {/* Category Tag */}
            <div className="mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Tag className="size-2.5 sm:size-3" />
                {product.categoria_nombre}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
              {capitalizeText(product.nombre)}
            </h1>

            {/* Unit Details */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Package className="size-3 sm:size-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  {product.tipo_unidad === 'kilogramo' ? 'Venta por Kilogramo' : 'Venta por Unidad'}
                </span>
              </div>
              {product.retornable && (
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 border border-green-100 rounded-lg text-green-700 shadow-sm">
                  <Recycle className="size-3 sm:size-4" />
                  <span className="text-xs sm:text-sm font-bold">Envase Retornable</span>
                </div>
              )}
            </div>

            {/* Price Card */}
            {product.mostrar_precio_web !== false && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm mb-4 sm:mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />

                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Precio regular</p>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                    S/ {(product.precio || 0).toFixed(2)}
                  </span>
                  {product.tipo_unidad === 'kilogramo' && (
                    <span className="text-sm sm:text-base md:text-lg text-slate-400 font-medium">/ kg</span>
                  )}
                </div>

                {/* Alternative Price */}
                {product.has_precio_alternativo && product.precio_alternativo && (
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50/50 rounded-lg sm:rounded-xl border border-blue-100">
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full text-blue-600">
                      <Info className="size-3 sm:size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase tracking-wide opacity-80">
                        {product.motivo_precio_alternativo}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-blue-900">
                        S/ {product.precio_alternativo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Info */}
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 mb-4 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center shrink-0 p-1.5 sm:p-2">
                <Store className="size-5 sm:size-6 text-slate-700" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Método de entrega</p>
                {tiendaAbierta && hacerPedidos ? (
                  <p className="text-xs sm:text-sm md:text-base font-bold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="size-3 sm:size-4 text-green-500" />
                    Recojo en tienda disponible
                  </p>
                ) : !tiendaAbierta ? (
                  <div>
                    <p className="text-xs sm:text-sm md:text-base font-bold text-red-600 flex items-center gap-1.5 sm:gap-2">
                      <svg className="size-3 sm:size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      No disponible
                    </p>
                    <p className="text-[10px] sm:text-xs text-red-500 mt-0.5">Tienda cerrada</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm md:text-base font-bold text-amber-600 flex items-center gap-1.5 sm:gap-2">
                      <svg className="size-3 sm:size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      No disponible
                    </p>
                    <p className="text-[10px] sm:text-xs text-amber-500 mt-0.5">Pedidos deshabilitados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions (Sticky on mobile bottom if you prefer, currently inline) */}
            <div className="mt-auto">
              {tiendaAbierta ? (
                cartItem && product.tipo_unidad !== 'kilogramo' ? (
                  // Quantity Control UI
                  <div className="flex items-center gap-3 sm:gap-4 p-1.5 sm:p-2 bg-white border border-gray-200 rounded-full shadow-lg w-fit max-w-full animate-in slide-in-from-bottom-2">
                    <button
                      onClick={() => {
                        if (cartItem.cantidad === 1) removeItem(product.id);
                        else updateQuantity(product.id, cartItem.cantidad - 1);
                      }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full  bg-red-500 text-white  flex items-center justify-center transition-colors active:scale-90 "
                    >
                      {cartItem.cantidad === 1 ? <Trash2 className="size-4 sm:size-5" /> : <Minus className="size-4 sm:size-5" />}
                    </button>

                    <span className="text-xl sm:text-2xl font-bold text-slate-800 min-w-[3ch] text-center tabular-nums">
                      {cartItem.cantidad}
                    </span>

                    <button
                      onClick={() => {
                        updateQuantity(product.id, cartItem.cantidad + 1);
                      }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary text-white flex items-center justify-center shadow-md hover:bg-secondary-100 active:scale-90 transition-all"
                    >
                      <Plus className="size-5 sm:size-6" />
                    </button>
                  </div>
                ) : (
                  // Add to Cart Button
                  <>
                    <div className="relative group">
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-full md:w-auto bg-primary text-white text-sm sm:text-base md:text-lg font-bold py-3 sm:py-3.5 md:py-4 px-6 sm:px-7 md:px-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 sm:gap-3"
                      >
                        <ShoppingCart className="size-5 sm:size-5 md:size-6" />
                        <span>{isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}</span>
                      </button>

                      {/* Cart Badge Counter */}
                      {(() => {
                        const quantityInCart = items.reduce((acc, item) => {
                          if (item.id === product.id || item.id.startsWith(`${product.id}-`)) {
                            return acc + item.cantidad;
                          }
                          return acc;
                        }, 0);

                        if (quantityInCart > 0) {
                          return (
                            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:left-[220px] md:right-auto bg-green-500 text-white text-xs sm:text-sm font-bold h-6 min-w-6 sm:h-8 sm:min-w-8 px-1.5 sm:px-2 flex items-center justify-center rounded-full border-2 sm:border-4 border-[#F8F9FA] shadow-lg">
                              {quantityInCart}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>    
                  </>
                )
              ) : null}
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
            <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-[150px] sm:w-40 md:w-[200px] lg:w-[220px] h-[260px] sm:h-[280px] md:h-[340px] flex flex-col group-hover:scale-[1.02] ${relatedProduct.stock === 0 ? 'opacity-60' : ''}`}>
              {/* Image Container */}
              <div className="relative h-[120px] sm:h-[140px] md:h-[180px] bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                {relatedProduct.imagen ? (
                  <Image
                    src={relatedProduct.imagen}
                    alt={relatedProduct.nombre}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
                    className={relatedProduct.stock === 0 ? 'grayscale' : ''}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShoppingCart className="size-8 sm:size-10 md:size-12 text-gray-400" />
                  </div>
                )}

                <ProductNewBadge product={relatedProduct} />

                {/* Badge de Producto Agotado */}
                {relatedProduct.stock === 0 && (
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
                  {tiendaAbierta && (
                    <div className="flex justify-center md:justify-end md:shrink-0">
                      {(() => {
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
                                  updateQuantity(relatedProduct.id, cartItem.cantidad + 1);
                                }}
                                className="bg-amber-500 text-white size-6 sm:size-7 rounded-full hover:bg-amber-600 transition-colors flex items-center justify-center"
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
                            className="bg-primary text-white px-3 py-2.5 sm:p-2 rounded-full sm:rounded-full shadow-md hover:bg-primary/90 transition-colors shrink-0 inline-flex items-center gap-1.5 sm:gap-0"
                            aria-label="Agregar al carrito"
                          >
                            <ShoppingCart className="size-3.5 sm:size-4 md:size-5" />
                            <span className="text-xs font-semibold sm:hidden">Agregar</span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
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




