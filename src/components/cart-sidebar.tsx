"use client";

import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
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

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  tipo_unidad: string;
}

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  // TODO: Esto será reemplazado con el estado global del carrito
  const cartItems: CartItem[] = [
    {
      id: 1,
      nombre: "Coca Cola 1.5L",
      precio: 4.50,
      cantidad: 2,
      imagen: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200",
      tipo_unidad: "unidad"
    },
    {
      id: 2,
      nombre: "Pan Integral",
      precio: 2.80,
      cantidad: 1,
      imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200",
      tipo_unidad: "unidad"
    },
    {
      id: 3,
      nombre: "Manzanas Rojas",
      precio: 3.50,
      cantidad: 1.5,
      tipo_unidad: "kilogramo"
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const delivery: number = 0; // Gratis por ahora
  const total = subtotal + delivery;

  const updateQuantity = (id: number, newQuantity: number) => {
    // TODO: Implementar actualización de cantidad
    console.log(`Update item ${id} to quantity ${newQuantity}`);
  };

  const removeItem = (id: number) => {
    // TODO: Implementar eliminación de item
    console.log(`Remove item ${id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col border-none bg-white">
        <SheetHeader className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 border-b border-gray-200">
          <SheetTitle className="text-lg sm:text-xl md:text-2xl font-bold text-darkblue flex items-center gap-2">
            <ShoppingCart className="size-5 sm:size-6 text-primary" />
            Mi Carrito
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-gray-600">
            {cartItems.length === 0 
              ? "Tu carrito está vacío" 
              : `${cartItems.length} ${cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                <ShoppingCart className="size-10 sm:size-12 md:size-16 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-darkblue mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-xs px-4">
                Agrega productos a tu carrito para comenzar tu compra
              </p>
              <Button 
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-base px-6"
              >
                Explorar Productos
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {cartItems.map((item) => (
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
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="size-3.5 sm:size-4 md:size-5" />
                        </button>
                      </div>

                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs mb-1.5 sm:mb-2 px-1.5 sm:px-2 py-0">
                        {item.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                      </Badge>

                      <div className="flex items-center justify-between gap-2">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-gray-100 rounded-full p-0.5 sm:p-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.cantidad - 1))}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-darkblue transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="size-2.5 sm:size-3 md:size-4" />
                          </button>
                          <span className="text-xs sm:text-sm md:text-base font-bold text-darkblue min-w-6 sm:min-w-7 md:min-w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-darkblue transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-2.5 sm:size-3 md:size-4" />
                          </button>
                        </div>

                        {/* Precio */}
                        <div className="text-right">
                          <p className="text-sm sm:text-base md:text-lg font-bold text-primary">
                            S/ {(item.precio * item.cantidad).toFixed(2)}
                          </p>
                          {item.cantidad > 1 && (
                            <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">
                              S/ {item.precio.toFixed(2)} c/u
                            </p>
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
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Resumen de precios */}
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base md:text-lg font-bold text-darkblue">Total</span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-1.5 sm:space-y-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/pedidos">
                  Realizar Pedido
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
