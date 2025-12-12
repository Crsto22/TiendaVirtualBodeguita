"use client";

import { ShoppingCart, Trash2, Plus, Minus, Snowflake, Info, ArrowRight, ThermometerSun, X, Recycle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useStoreConfigContext } from "@/context/StoreConfigContext";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/login-modal";

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

// Función para verificar si un producto puede tener bebidas heladas
function puedeSerHelada(item: any): boolean {
  return CATEGORIA_BEBIDAS.includes(item.categoria_ref);
}

// Función para verificar si un producto tiene precio alternativo de helada
function tienePrecioHelada(item: any): boolean {
  return item.has_precio_alternativo === true &&
         item.motivo_precio_alternativo === 'Helada' &&
         item.precio_alternativo &&
         item.precio_alternativo > 0;
}

// Categorías de bebidas
const CATEGORIA_BEBIDAS = [
  '3gWRZpqiZd5gTLW1snA5',
  'nJNDfSudN4nVc0hxFgo7',
  'qCHp55SbEtWiSQiK4nK6',
  'uCPsgvGyH2VYN9Ai1RCD'
];

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  // Store config
  const { tiendaAbierta, hacerPedidos } = useStoreConfigContext();
  
  // Zustand store
  const { items, updateQuantity, removeItem, updateCantidadHelada, getSubtotal, getTotal, clearCart } = useCartStore();
  
  // Auth
  const { user } = useAuth();
  const router = useRouter();
  
  // Estado local para controlar qué productos tienen la opción de heladas visible (ahora múltiples)
  const [mostrarHeladaIds, setMostrarHeladaIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Función personalizada para actualizar cantidad manteniendo heladas
  const handleUpdateQuantity = (id: string, newCantidad: number, currentItem: any) => {
    updateQuantity(id, newCantidad);
    // Si tiene heladas activas, ajustar para mantener todas heladas
    if ((currentItem.cantidad_helada || 0) > 0 && puedeSerHelada(currentItem)) {
      updateCantidadHelada(id, newCantidad);
    }
  };

  // Función para manejar la confirmación de pedido
  const handleConfirmarPedido = () => {
    if (!user) {
      // Si no hay usuario autenticado, mostrar el modal de login
      setShowLoginModal(true);
    } else {
      // Si está autenticado, ir a la página de pedidos
      router.push('/pedidos');
      onClose();
    }
  };

  const subtotal = getSubtotal();
  const delivery = 0; // Gratis por ahora
  const total = getTotal();

  // Calcular botellas retornables pendientes
  const botellasRetornables = items.reduce((total, item) => {
    if (item.retornable) {
      return total + item.cantidad;
    }
    return total;
  }, 0);

  // Cerrar el carrito automáticamente cuando la tienda se cierra
  useEffect(() => {
    if (!tiendaAbierta && open) {
      onClose();
    }
  }, [tiendaAbierta, open, onClose]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col border-none bg-white data-[state=open]:duration-300 data-[state=closed]:duration-200 will-change-transform">        
        {/* HEADER MEJORADO */}
        <SheetHeader className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl shadow-primary-200 shadow-md">
                 <ShoppingCart className="size-5 text-white" />
              </div>
              Mi Carrito
            </SheetTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold rounded-full border border-blue-100">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>
          <SheetDescription className="hidden">Resumen de compra</SheetDescription>
        </SheetHeader>

        {/* CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-20">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 blur-xl opacity-50"></div>
                <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center relative z-10 border border-gray-100">
                  <ShoppingCart className="size-12 text-gray-300" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Tu carrito está vacío</h3>
                <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                  Agrega productos deliciosos para comenzar tu compra.
                </p>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-blue-600 font-medium hover:bg-blue-50 hover:text-blue-700">
                Ir a comprar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const esHeladaVisible = mostrarHeladaIds.has(item.id);
                const tieneOpcionHelada = puedeSerHelada(item);
                const precioBase = item.precio || 0;
                const cantidadHelada = item.cantidad_helada || 0;
                const cantidadNormal = item.cantidad - cantidadHelada;
                const usaPrecioHelada = tienePrecioHelada(item) && cantidadHelada > 0;

                // Cálculo de precio total por ítem (Solo visualización)
                let precioTotalItem = 0;
                if (usaPrecioHelada) {
                  const precioNormal = cantidadNormal * precioBase;
                  const precioHelado = cantidadHelada * (item.precio_alternativo || precioBase);
                  precioTotalItem = precioNormal + precioHelado;
                } else {
                  precioTotalItem = precioBase * item.cantidad;
                }

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Decoración de fondo sutil cuando está expandido */}
                    {esHeladaVisible && (
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none transition-opacity duration-500"></div>
                    )}

                    <div className="flex gap-4 relative z-10">
                      {/* Imagen Producto */}
                      <div className="relative shrink-0">
                         {item.imagen ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
                            <Image
                              src={item.imagen}
                              alt={item.nombre}
                              width={80}
                              height={80}
                              className="object-contain w-full h-full mix-blend-multiply p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
                            <ShoppingCart className="size-6 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Indicador flotante de heladas */}
                        {cantidadHelada > 0 && (
                            <div className="absolute -bottom-2 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-white flex items-center gap-0.5 animate-in zoom-in duration-300">
                                <Snowflake className="size-2.5" /> {cantidadHelada}
                            </div>
                        )}
                      </div>

                      {/* Info y Controles */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                             <h4 className="font-semibold text-sm text-slate-800 leading-tight line-clamp-2 pr-5">
                                {capitalizeText(item.nombre)}
                             </h4>
                             <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2 rounded-full hover:bg-red-50 absolute right-0 top-0"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="size-4" />
                              </button>
                          </div>
                          
                          <div className="mt-1.5 flex items-center gap-2">
                             <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-500 border-none px-2 py-0.5 rounded-md">
                                {item.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                             </Badge>
                             {item.mostrar_precio_web !== false && (
                                <span className="text-xs text-slate-400 font-medium">
                                    S/ {precioBase.toFixed(2)} c/u
                                </span>
                             )}
                          </div>
                        </div>

                        {/* Fila Inferior: Controles y Precio */}
                        <div className="flex items-end justify-between mt-3">
                           {item.tipo_unidad !== 'kilogramo' && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100 shadow-sm">
                              <button
                                onClick={() => {
                                  if (item.cantidad === 1) {
                                    removeItem(item.id);
                                  } else {
                                    handleUpdateQuantity(item.id, item.cantidad - 1, item);
                                  }
                                }}
                                className="size-7 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                              >
                                {item.cantidad === 1 ? <Trash2 className="size-3" /> : <Minus className="size-3" />}
                              </button>
                              <span className="text-sm font-bold text-slate-700 w-4 text-center tabular-nums">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => {
                                  handleUpdateQuantity(item.id, item.cantidad + 1, item);
                                }}
                                className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all hover:bg-slate-700 active:scale-90 shadow-md"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                           )}

                           {item.mostrar_precio_web !== false ? (
                             <div className="text-right">
                               <p className="font-bold text-lg text-slate-800 leading-none">
                                 S/ {precioTotalItem.toFixed(2)}
                               </p>
                             </div>
                           ) : (
                             <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">
                               Consultar precio
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN HELADAS - MEJORADA */}
                    {tieneOpcionHelada && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                        
                        {/* Toggle Principal Estilizado */}
                        <div className="relative">
                          <div 
                            className={`
                              flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none
                              ${esHeladaVisible || (item.cantidad_helada || 0) > 0
                                  ? 'bg-linear-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-sm' 
                                  : 'bg-gray-50 border-transparent hover:border-gray-200'
                              }
                            `}
                            onClick={() => {
                              if (esHeladaVisible) {
                                // Remover este item del Set
                                setMostrarHeladaIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(item.id);
                                  return newSet;
                                });
                              } else {
                                // Agregar este item al Set
                                setMostrarHeladaIds(prev => new Set(prev).add(item.id));
                                // Solo activar heladas si no tiene ninguna configurada
                                if ((item.cantidad_helada || 0) === 0) {
                                  updateCantidadHelada(item.id, item.cantidad);
                                }
                              }
                            }}
                          >
                           <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full transition-colors ${(esHeladaVisible || (item.cantidad_helada || 0) > 0) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                 <Snowflake className="size-4" />
                              </div>
                              <div className="flex flex-col">
                                 <span className={`text-xs font-bold transition-colors ${(esHeladaVisible || (item.cantidad_helada || 0) > 0) ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {(item.cantidad_helada || 0) > 0 ? 'Se entregarán Heladas' : '¿Las quieres heladas?'}
                                 </span>
                                 <span className="text-[10px] text-gray-400 font-medium">
                                    {(item.cantidad_helada || 0) > 0 ? (
                                      cantidadHelada === item.cantidad 
                                        ? 'Todas listas para tomar' 
                                        : `${cantidadHelada} helada${cantidadHelada > 1 ? 's' : ''}, ${cantidadNormal} normal${cantidadNormal > 1 ? 'es' : ''}`
                                    ) : 'Se entregarán al tiempo'}
                                 </span>
                              </div>
                           </div>

                           {/* Switch Visual Animado */}
                           <div 
                              className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${(esHeladaVisible || (item.cantidad_helada || 0) > 0) ? 'bg-blue-500' : 'bg-gray-300'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle on/off: Si tiene heladas, resetea a 0; si no tiene, activa todas
                                if ((item.cantidad_helada || 0) > 0) {
                                  updateCantidadHelada(item.id, 0);
                                  // Remover del Set
                                  setMostrarHeladaIds(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(item.id);
                                    return newSet;
                                  });
                                } else {
                                  updateCantidadHelada(item.id, item.cantidad);
                                  // Agregar al Set
                                  setMostrarHeladaIds(prev => new Set(prev).add(item.id));
                                }
                              }}
                           >
                              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${(esHeladaVisible || (item.cantidad_helada || 0) > 0) ? 'translate-x-5' : 'translate-x-0'}`}></div>
                           </div>
                          </div>
                        </div>

                        {/* Panel Expandido de Opciones */}
                        {esHeladaVisible && (
                          <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                             
                             {/* Botones de Selección Rápida - Solo si cantidad > 1 */}
                             {item.cantidad > 1 && (
                               <div className="grid grid-cols-2 gap-2">
                                  {/* Botón: Todas Heladas */}
                                  <button
                                    onClick={() => updateCantidadHelada(item.id, item.cantidad)}
                                    className={`
                                      relative flex flex-col items-center justify-center py-2 px-3 rounded-xl border-2 transition-all
                                      ${item.cantidad_helada === item.cantidad 
                                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                          : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                                      }
                                    `}
                                  >
                                     {item.cantidad_helada === item.cantidad && (
                                       <div className="absolute top-1.5 right-1.5 size-2 bg-blue-500 rounded-full animate-pulse"></div>
                                     )}
                                     <Snowflake className="size-4 mb-1" />
                                     <span className="text-[10px] font-bold">Todas Heladas</span>
                                  </button>

                                  {/* Botón: Combinar */}
                                  <button
                                    onClick={() => {
                                        const mitad = Math.ceil(item.cantidad / 2);
                                        updateCantidadHelada(item.id, mitad);
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center py-2 px-3 rounded-xl border-2 transition-all
                                        ${(item.cantidad_helada || 0) > 0 && (item.cantidad_helada || 0) < item.cantidad
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-indigo-200 hover:bg-gray-50'
                                        }
                                    `}
                                  >
                                    <div className="flex gap-1 mb-1">
                                        <Snowflake className="size-3" />
                                        <ThermometerSun className="size-3" />
                                    </div>
                                    <span className="text-[10px] font-bold">Combinar</span>
                                  </button>
                               </div>
                             )}

                             {/* Panel de Distribución (Solo modo combinado) */}
                             {item.cantidad_helada && item.cantidad_helada > 0 && item.cantidad_helada < item.cantidad && (
                                <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-inner relative overflow-hidden">
                                   <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                                      Modo Combinado
                                   </div>
                                   
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Distribución</p>
                                   
                                   {/* Fila: Heladas */}
                                   <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                         <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Snowflake className="size-3" /></div>
                                         <span className="text-xs font-bold text-gray-700">Heladas</span>
                                      </div>
                                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                         <button 
                                            onClick={() => {
                                              const newValue = Math.max(1, (item.cantidad_helada || 0) - 1);
                                              updateCantidadHelada(item.id, newValue);
                                            }}
                                            disabled={(item.cantidad_helada || 0) <= 1}
                                            className="size-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-500 hover:text-red-500 disabled:opacity-30 transition-colors"
                                         >
                                            <Minus className="size-3" />
                                         </button>
                                         <span className="text-sm font-bold text-blue-600 w-5 text-center">{item.cantidad_helada}</span>
                                         <button 
                                            onClick={() => updateCantidadHelada(item.id, Math.min(item.cantidad, (item.cantidad_helada || 0) + 1))}
                                            disabled={(item.cantidad_helada || 0) >= item.cantidad}
                                            className="size-6 flex items-center justify-center rounded-md bg-blue-500 text-white shadow-sm hover:bg-blue-600 disabled:opacity-30 disabled:bg-gray-300 transition-colors"
                                         >
                                            <Plus className="size-3" />
                                         </button>
                                      </div>
                                   </div>

                                   {/* Fila: Sin Helar */}
                                   <div className="flex items-center justify-between opacity-70">
                                      <div className="flex items-center gap-2">
                                         <div className="bg-orange-100 p-1 rounded-full text-orange-500"><ThermometerSun className="size-3" /></div>
                                         <span className="text-xs font-bold text-gray-700">Sin Helar</span>
                                      </div>
                                      <div className="flex items-center gap-2 pr-2">
                                         <span className="text-[10px] text-gray-400">Restantes:</span>
                                         <span className="text-sm font-bold text-orange-500 w-5 text-center">{item.cantidad - item.cantidad_helada}</span>
                                      </div>
                                   </div>
                                   
                                   <button 
                                     onClick={() => {
                                       updateCantidadHelada(item.id, 0);
                                       // Remover del Set
                                       setMostrarHeladaIds(prev => {
                                         const newSet = new Set(prev);
                                         newSet.delete(item.id);
                                         return newSet;
                                       });
                                     }}
                                     className="w-full text-center text-[10px] text-red-400 hover:text-red-600 hover:underline mt-2 pt-2 border-t border-gray-100"
                                   >
                                     Cancelar (Volver a sin helar)
                                   </button>
                                </div>
                             )}
                             
                             {/* Info Precio Extra */}
                             {usaPrecioHelada && (
                                <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-2.5 flex items-start gap-2">
                                   <Info className="size-3.5 text-cyan-600 mt-0.5 shrink-0" />
                                   <div className="flex-1">
                                      <p className="text-[10px] text-cyan-800 font-medium leading-tight">
                                         Costo adicional: <span className="font-bold">S/ {(item.precio_alternativo || 0).toFixed(2)} c/u</span> por refrigeración.
                                      </p>
                                      {(item.cantidad_helada || 0) > 1 && (
                                          <p className="text-[10px] text-cyan-600 mt-0.5">
                                             Total extra: S/ {((item.precio_alternativo || 0) * (item.cantidad_helada || 0)).toFixed(2)}
                                          </p>
                                      )}
                                   </div>
                                </div>
                             )}

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER MEJORADO */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-20">
             
             {!hacerPedidos && (
               <div className="mb-4 bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
                 <div className="bg-amber-100 p-1 rounded-full shrink-0"><Info className="size-4 text-amber-600" /></div>
                 <div>
                    <p className="text-xs font-bold">Pedidos deshabilitados</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Estamos reponiendo stock o fuera de horario de atención.</p>
                 </div>
               </div>
             )}

             <div className="space-y-3 mb-4">
               {/* Resumen Totales */}
               <div className="flex justify-between items-end">
                 <span className={`text-sm font-medium ${items.some(i => i.mostrar_precio_web === false) ? 'text-orange-500' : 'text-slate-500'}`}>
                    {items.some(i => i.mostrar_precio_web === false) ? 'Total Estimado' : 'Total a Pagar'}
                 </span>
                 <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    S/ {items.reduce((sum, item) => {
                       if (item.mostrar_precio_web === false) return sum;
                       
                       const pBase = item.precio || 0;
                       const cHelada = item.cantidad_helada || 0;
                       
                       if (puedeSerHelada(item) && tienePrecioHelada(item) && cHelada > 0) {
                           const cNormal = item.cantidad - cHelada;
                           return sum + (cNormal * pBase) + (cHelada * (item.precio_alternativo || pBase));
                       }
                       return sum + (pBase * item.cantidad);
                    }, 0).toFixed(2)}
                 </span>
               </div>
               
               {items.some(i => i.mostrar_precio_web === false) && (
                   <p className="text-[10px] text-orange-500 font-medium bg-orange-50 inline-block px-2 py-0.5 rounded w-full text-center">
                     * Precio final sujeto a confirmación
                   </p>
               )}

               {/* Botellas Retornables */}
               {botellasRetornables > 0 && (
                 <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-3">
                   <div className="bg-green-100 p-1.5 rounded-full shrink-0">
                     <Recycle className="size-4 text-green-600" />
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-1">
                       <p className="text-xs font-bold text-green-800">
                         Envases Retornables
                       </p>
                       <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                         {botellasRetornables} {botellasRetornables === 1 ? 'envase' : 'envases'}
                       </span>
                     </div>
                     <p className="text-[10px] text-green-600 leading-tight">
                       Recuerda devolver los envases vacíos en tu próxima compra
                     </p>
                   </div>
                 </div>
               )}
             </div>

             <div className="flex flex-col gap-3">
               <Button
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-px active:translate-y-px disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-500"
                 onClick={handleConfirmarPedido}
                 disabled={!hacerPedidos}
               >
                 <span className="flex items-center justify-center gap-2">
                   {items.some(i => i.mostrar_precio_web === false) ? "Consultar Pedido" : "Confirmar Pedido"}
                   <ArrowRight className="size-4" />
                 </span>
               </Button>
               
               <Button
                 variant="ghost"
                 onClick={onClose}
                 className="w-full text-slate-500 font-semibold h-10 hover:bg-gray-50 hover:text-slate-800 rounded-xl"
               >
                 Seguir comprando
               </Button>
             </div>
          </div>
        )}
      </SheetContent>

      {/* Modal de Login */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          // Después de cerrar el modal (ya sea por login exitoso o cancelación)
          // Si el usuario ya está autenticado, redirigir a pedidos
          if (user) {
            router.push('/pedidos');
            onClose();
          }
        }} 
      />
    </Sheet>
  );
}