"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  // Zustand store
  const { items, updateQuantity, removeItem, getSubtotal, getTotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const delivery = 0; // Gratis por ahora
  const total = getTotal();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col border-none bg-white">
        <SheetHeader className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 border-b border-gray-200">
          <SheetTitle className="text-lg sm:text-xl md:text-2xl font-bold text-darkblue flex items-center gap-2">
            <ShoppingCart className="size-5 sm:size-6 text-primary" />
            Mi Carrito
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-gray-600">
            {items.length === 0
              ? "Tu carrito está vacío"
              : `${items.length} ${items.length === 1 ? 'producto' : 'productos'} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
              <div className="w-48 h-48 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                <ShoppingCart className="size-24 sm:size-12 md:size-16 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-darkblue mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-xs px-4">
                Agrega productos a tu carrito para comenzar tu compra
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                    {/* Imagen del producto */}
                    {item.imagen ? (
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                        <ShoppingCart className="size-5 sm:size-6 md:size-8 text-gray-400" />
                      </div>
                    )}

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <h4 className="font-semibold text-xs sm:text-sm md:text-base text-darkblue line-clamp-2 leading-tight">
                          {capitalizeText(item.nombre)}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="size-3.5 sm:size-4 md:size-5" />
                        </button>
                      </div>

                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs mb-1.5 sm:mb-2 px-1.5 sm:px-2 py-0 text-white">
                        {item.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                      </Badge>

                      <div className="flex items-center justify-between gap-2">
                        {/* Controles de cantidad */}
                        {item.tipo_unidad !== 'kilogramo' && (
                          <div className="flex items-center gap-1 sm:gap-1.5 bg-white border-2 border-gray-200 rounded-full px-1 py-1 shadow-sm">
                            <button
                              onClick={() => {
                                if (item.cantidad === 1) {
                                  removeItem(item.id);
                                } else {
                                  updateQuantity(item.id, item.cantidad - 1);
                                }
                              }}
                              className="bg-red-500 text-white size-6 sm:size-7 md:size-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                              aria-label="Disminuir cantidad"
                            >
                              {item.cantidad === 1 ? (
                                <Trash2 className="size-3 sm:size-3.5 md:size-4" />
                              ) : (
                                <Minus className="size-3 sm:size-3.5 md:size-4" />
                              )}
                            </button>
                            <span className="text-xs sm:text-sm md:text-base font-bold text-darkblue px-1.5 sm:px-2 min-w-6 sm:min-w-7 text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => {
                                if (item.cantidad < item.stock) {
                                  updateQuantity(item.id, item.cantidad + 1);
                                }
                              }}
                              className="bg-amber-500 text-white size-6 sm:size-7 md:size-8 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                              disabled={item.cantidad >= item.stock}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="size-3 sm:size-3.5 md:size-4" />
                            </button>
                          </div>
                        )}

                        {/* Precio */}
                        <div className="text-right ml-auto">
                          {item.mostrar_precio_web !== false && (
                            <>
                              <p className="text-sm sm:text-base md:text-lg font-bold text-primary">
                                S/ {((item.has_precio_alternativo && item.precio_alternativo ? item.precio_alternativo : (item.precio || 0)) * item.cantidad).toFixed(2)}
                              </p>
                              {item.cantidad > 1 && (
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">
                                  S/ {(item.has_precio_alternativo && item.precio_alternativo ? item.precio_alternativo : (item.precio || 0)).toFixed(2)} c/u
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con totales y botón de compra */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Resumen de precios */}
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm sm:text-base md:text-lg font-bold ${items.some(item => item.mostrar_precio_web === false) ? "text-orange-500" : "text-darkblue"}`}>
                  {items.some(item => item.mostrar_precio_web === false) ? "Total Parcial" : "Total"}
                </span>
                <span className={`text-lg sm:text-xl md:text-2xl font-bold ${items.some(item => item.mostrar_precio_web === false) ? "text-orange-500" : "text-primary"}`}>
                  S/ {items.reduce((sum, item) => {
                    if (item.mostrar_precio_web === false) return sum;
                    const price = item.has_precio_alternativo && item.precio_alternativo
                      ? item.precio_alternativo
                      : (item.precio || 0);
                    return sum + (price * item.cantidad);
                  }, 0).toFixed(2)}
                </span>
              </div>
              {items.some(item => item.mostrar_precio_web === false) && (
                <p className="text-xs text-orange-500 text-right font-medium">
                  * Algunos precios se deben consultar para saber el precio real
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-1.5 sm:space-y-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/pedidos">
                  {items.some(item => item.mostrar_precio_web === false) ? "Consultar Pedido" : "Realizar Pedido"}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-2 border-gray-200 text-darkblue hover:bg-gray-50 font-semibold py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
