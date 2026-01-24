"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Snowflake,
  ThermometerSun,
  Info,
  ArrowRight,
  Recycle,
  Store,
  ChevronDown,
  ChevronUp,
  Wallet,
  Smartphone,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { useStoreConfigContext } from "@/context/StoreConfigContext";
import { LoginModal } from "@/components/auth/login-modal";
import { convertCartItemsToOrderItems, calculateCartTotal, countReturnableBottles } from "@/lib/order-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad, si no, usa template literals normales

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Función para redondear el total a múltiplos de 0.10
function redondearTotal(total: number): number {
  return Math.round(total * 10) / 10;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const { createOrder, loading: orderLoading } = useOrder();
  const { hacerPedidos } = useStoreConfigContext();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "yape" | null>(null);
  const [montoPagaCon, setMontoPagaCon] = useState<string>("");
  const [pagoCompleto, setPagoCompleto] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push("/inicio");
    }
  }, [items, router]);

  // Función para manejar la confirmación de pedido
  const handleConfirmarPedido = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    // Validar método de pago si es necesario
    // Modificación: Requiere confirmación si no muestra precio web O si es kilogramo con precio 0 (ej: pidió 3 unidades de naranja)
    const hayProductosSinPrecio = items.some(i =>
      (i.mostrar_precio_web === false && i.tipo_unidad !== "kilogramo") ||
      (i.tipo_unidad === "kilogramo" && (i.precio === 0 || i.precio === null))
    );
    if (!hayProductosSinPrecio) {
      if (!metodoPago) {
        toast.error("Por favor selecciona un método de pago");
        return;
      }

      // Validar efectivo
      if (metodoPago === "efectivo") {
        const montoNumerico = parseFloat(montoPagaCon);

        if (!montoPagaCon || isNaN(montoNumerico)) {
          toast.error("Por favor ingresa el monto con el que pagarás");
          return;
        }

        if (montoNumerico < totalRedondeado) {
          toast.error("El monto debe ser mayor o igual al total");
          return;
        }
      }
    }

    try {
      // Convertir items del carrito a items de pedido
      const orderItems = convertCartItemsToOrderItems(items);

      // Calcular totales
      const envasesRetornables = countReturnableBottles(items);

      // Preparar datos de pago - Solo si NO es consulta
      const pagoData: any = {};

      if (!hayProductosSinPrecio) {
        // Tiene precios definidos - guardar método de pago
        pagoData.metodo = metodoPago;

        // Si es efectivo, agregar monto
        if (metodoPago === "efectivo" && montoPagaCon) {
          pagoData.monto_paga_con = parseFloat(montoPagaCon);
          pagoData.rechazo_vuelto = false;
        }
      }
      // Si es consulta (hayProductosSinPrecio = true), pagoData queda vacío

      // Crear el pedido
      const orderId = await createOrder({
        cliente: {
          nombre: user.nombre || "Cliente",
          telefono: user.telefono || "",
          email: user.email || "",
          foto_url: user.foto_url || "",
        },
        pago: pagoData,
        items: orderItems,
        total_estimado: totalRedondeado,
        envases_retornables: envasesRetornables,
      });

      if (orderId) {
        console.log("Pedido creado exitosamente:", orderId);

        // Mostrar mensaje de éxito
        toast.success(hayProductosSinPrecio ? "Consulta enviada exitosamente" : "Pedido creado exitosamente");

        // Limpiar el carrito y estados
        clearCart();
        setMetodoPago("efectivo");
        setMontoPagaCon("");

        // Redirigir a la página de detalles del pedido
        setTimeout(() => {
          router.push(`/pedidos/${orderId}`);
        }, 500);
      } else {
        toast.error("No se pudo crear el pedido. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al crear pedido:", error);
      toast.error("Error al crear el pedido");
    }
  };

  // Modificación: Requiere confirmación si:
  // 1. Tiene mostrar_precio_web = false Y NO es kilogramo (regla general)
  // 2. O SI es kilogramo PERO su precio es 0 (ej: pidió por unidades "3 naranjas", el precio base es 0)
  const hayProductosSinPrecio = items.some(i =>
    (i.mostrar_precio_web === false && i.tipo_unidad !== "kilogramo") ||
    (i.tipo_unidad === "kilogramo" && (i.precio === 0 || i.precio === null))
  );
  const totalAPagar = calculateCartTotal(items);
  const totalRedondeado = redondearTotal(totalAPagar);
  const ajusteRedondeo = totalRedondeado - totalAPagar;
  const botellasRetornables = countReturnableBottles(items);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Simplificado y Moderno */}
      <header className="bg-white sticky top-0 z-40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] backdrop-blur-md bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95 duration-200"
            >
              <ArrowLeft className="size-5 text-slate-800" />
            </button>
            <Link href="/inicio" className="relative size-8 rounded-full overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
              <Image
                src="/Logo.png"
                alt="Bodeguita Logo"
                fill
                className="object-cover"
                priority
              />
            </Link>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Finalizar Compra</h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
              {user.nombre?.split(' ')[0]}
              </span>
              <div className="size-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative">
                {user.foto_url ? (
                  <Image
                    src={user.foto_url}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10">
                    {user.nombre?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-60 lg:pb-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

          {/* COLUMNA IZQUIERDA: Método de Pago y Detalles (Principal en Desktop) */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">

            {/* Sección de Entrega (Visualmente mejorada) */}
            <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/50 space-y-4">
              
              {/* Información del Cliente */}
              {user && (
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Pedido a nombre de:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden relative shrink-0">
                        {user.foto_url ? (
                          <Image
                            src={user.foto_url}
                            alt={user.nombre || "Usuario"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10 text-lg">
                            {user.nombre?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.nombre || "Cliente"}</p>
                        <p className="text-xs text-slate-500">{user.telefono || user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/perfil"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              )}

              {/* Método de Entrega */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl shrink-0">
                  <Store className="size-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-slate-900 mb-1">Método de entrega</h2>
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Recojo en Tienda</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                        Gratis
                      </Badge>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/xEYuLvHZRJKHv6MY7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium w-fit"
                    >
                      <MapPin className="size-3" />
                      Ver ubicación
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Selector de Método de Pago */}
            {!hayProductosSinPrecio && (
              <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/50">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Wallet className="size-5 text-slate-400" />
                  ¿Cómo quieres pagar?
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Opción Efectivo */}
                  <div
                    onClick={() => setMetodoPago("efectivo")}
                    className={`
                      cursor-pointer relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                      ${metodoPago === "efectivo"
                        ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    {metodoPago === "efectivo" && (
                      <div className="absolute top-2 right-2 text-emerald-500">
                        <CheckCircle2 className="size-5 fill-emerald-100" />
                      </div>
                    )}
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                      <Image src="/MetodoPago/Efectivo.png" alt="Efectivo" width={32} height={32} className="object-contain" />
                    </div>
                    <span className={`font-bold text-sm ${metodoPago === "efectivo" ? "text-emerald-700" : "text-slate-600"}`}>Efectivo</span>
                  </div>

                  {/* Opción Yape */}
                  <div
                    onClick={() => setMetodoPago("yape")}
                    className={`
                      cursor-pointer relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                      ${metodoPago === "yape"
                        ? "border-purple-500 bg-purple-50/30 ring-1 ring-purple-500/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    {metodoPago === "yape" && (
                      <div className="absolute top-2 right-2 text-purple-500">
                        <CheckCircle2 className="size-5 fill-purple-100" />
                      </div>
                    )}
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                      <Image src="/MetodoPago/Yape.png" alt="Yape" width={32} height={32} className="object-contain rounded-lg" />
                    </div>
                    <span className={`font-bold text-sm ${metodoPago === "yape" ? "text-purple-700" : "text-slate-600"}`}>Yape</span>
                  </div>
                </div>

                <div className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${metodoPago === "efectivo" ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
                `}>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/60 transition-all">

                    {/* Opción Pago Completo */}
                    <div className="mb-4 flex items-center justify-center gap-2 pb-4 border-b border-gray-200/50">
                      <button
                        onClick={() => {
                          const nuevoEstado = !pagoCompleto;
                          setPagoCompleto(nuevoEstado);
                          if (nuevoEstado) {
                            setMontoPagaCon(totalRedondeado.toFixed(2));
                          } else {
                            setMontoPagaCon("");
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${pagoCompleto
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                          : "bg-white border-gray-200 text-slate-600 hover:border-emerald-200"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${pagoCompleto ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"
                          }`}>
                          {pagoCompleto && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        Pagaré con el monto exacto
                      </button>
                    </div>

                    {!pagoCompleto && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-center text-sm font-medium text-slate-500 mb-2">
                          ¿Con cuánto vas a pagar?
                        </label>
                        <div className="relative max-w-[200px] mx-auto">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={montoPagaCon}
                            onChange={(e) => setMontoPagaCon(e.target.value)}
                            className="w-full bg-white text-center pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-2xl font-bold text-slate-800 placeholder:text-gray-300 transition-colors shadow-sm"
                            autoFocus={metodoPago === "efectivo" && !pagoCompleto}
                          />
                        </div>
                      </div>
                    )}

                    {pagoCompleto && (
                      <p className="text-center text-emerald-600 font-bold text-lg animate-in fade-in">
                        Pago Completo: S/ {totalRedondeado.toFixed(2)}
                      </p>
                    )}

                    {/* Cálculo de vuelto */}
                    {!pagoCompleto && montoPagaCon && parseFloat(montoPagaCon) >= totalRedondeado && (
                      <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-3 border-dashed">
                        <span className="text-sm font-medium text-slate-600">Tu vuelto será:</span>
                        <span className="text-lg font-bold text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-lg">
                          S/ {(parseFloat(montoPagaCon) - totalRedondeado).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Aviso si los pedidos están deshabilitados */}
            {!hacerPedidos && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-800 text-sm">Pedidos no disponibles</h3>
                  <p className="text-amber-700/80 text-xs mt-1">
                    En este momento no estamos recibiendo pedidos. Intenta más tarde.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Resumen de Pedido (Sticky) */}
          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24 space-y-4 mb-6 lg:mb-0 mt-6 lg:mt-0">

            {/* Acordeón de Productos (Diseño mejorado) */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
              <button
                onClick={() => setMostrarProductos(!mostrarProductos)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors lg:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700 relative">
                    <ShoppingCart className="size-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold size-4 flex items-center justify-center rounded-full border border-white">
                      {items.length}
                    </span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-slate-800">Tu Carrito</h2>
                    <p className="text-xs text-slate-500 lg:hidden">Toca para ver detalles</p>
                  </div>
                </div>
                <div className="lg:hidden bg-gray-100 rounded-full p-1">
                  {mostrarProductos ? <ChevronUp className="size-4 text-slate-600" /> : <ChevronDown className="size-4 text-slate-600" />}
                </div>
              </button>

              {/* Lista de productos con animación */}
              <div className={`
                ${mostrarProductos ? 'max-h-[800px]' : 'max-h-0 lg:max-h-[600px]'}
                overflow-y-auto transition-all duration-300 ease-in-out bg-slate-50/50 lg:block scrollbar-thin scrollbar-thumb-gray-200
              `}>
                <div className="p-4 space-y-3">
                  {items.map((item) => {
                    const cantidadHelada = item.cantidad_helada || 0;
                    const cantidadNormal = item.cantidad - cantidadHelada;
                    const precioBase = item.precio || 0;
                    const tienePrecioAlternativo = item.has_precio_alternativo && item.precio_alternativo;

                    let precioTotalItem = 0;
                    if (tienePrecioAlternativo && cantidadHelada > 0) {
                      precioTotalItem = (cantidadNormal * precioBase) + (cantidadHelada * (item.precio_alternativo || precioBase));
                    } else {
                      precioTotalItem = precioBase * item.cantidad;
                    }

                    return (
                      <div key={item.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative group">
                        {/* Imagen */}
                        <div className="w-16 h-16 bg-gray-50 rounded-xl shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                          {item.imagen ? (
                            <Image
                              src={item.imagen}
                              alt={item.nombre}
                              width={64}
                              height={64}
                              className="object-contain w-full h-full mix-blend-multiply"
                            />
                          ) : (
                            <ShoppingCart className="size-6 text-gray-300" />
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                            {capitalizeText(item.nombre)}
                          </h4>
                          {item.detalle && (
                            <span className="block text-xs text-blue-600 font-bold mt-0.5">
                              {item.detalle}
                            </span>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              x{item.cantidad}
                            </span>

                            {cantidadHelada > 0 && (
                              <div className="flex gap-1">
                                <Badge variant="secondary" className="h-5 px-1.5 bg-blue-50 text-blue-700 border-0 text-[10px] gap-0.5">
                                  <Snowflake className="size-3" /> {cantidadHelada}
                                </Badge>
                                {cantidadNormal > 0 && (
                                  <Badge variant="secondary" className="h-5 px-1.5 bg-orange-50 text-orange-700 border-0 text-[10px] gap-0.5">
                                    <ThermometerSun className="size-3" /> {cantidadNormal}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="flex flex-col justify-center text-right pl-2">
                          {(() => {
                            // Si el precio total es 0, mostrar "Consultar"
                            if (precioTotalItem === 0) {
                              return (
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">
                                  Consultar
                                </span>
                              );
                            }

                            // Si tiene precio, mostrarlo
                            if (item.mostrar_precio_web !== false || item.tipo_unidad === "kilogramo") {
                              return (
                                <span className="text-sm font-bold text-slate-900">
                                  S/ {precioTotalItem.toFixed(2)}
                                </span>
                              );
                            }

                            // Por defecto, mostrar "Consultar"
                            return (
                              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">
                                Consultar
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer del Resumen (Desktop Only - Mobile usa la barra sticky) */}
              <div className="p-5 bg-white border-t border-gray-100 hidden lg:block">
                <div className="space-y-3">
                  {/* Siempre mostrar subtotal si hay productos */}
                  {items.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">S/ {totalAPagar.toFixed(2)}</span>
                    </div>
                  )}

                  {ajusteRedondeo !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Redondeo</span>
                      <span className={`font-semibold ${ajusteRedondeo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {ajusteRedondeo > 0 ? '+' : ''}S/ {ajusteRedondeo.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {botellasRetornables > 0 && (
                    <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg text-green-700">
                      <span className="flex items-center gap-1.5"><Recycle className="size-3.5" /> Retornables</span>
                      <span className="font-bold">{botellasRetornables} u.</span>
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-200">
                    <span className={`font-bold ${hayProductosSinPrecio ? "text-orange-600" : "text-slate-800"}`}>
                      {hayProductosSinPrecio ? "Total Parcial" : "Total a Pagar"}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      S/ {totalRedondeado.toFixed(2)}
                    </span>
                  </div>
                  
                  {hayProductosSinPrecio && (
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 mt-2.5 shadow-sm">
                      <div className="flex items-start gap-2">
                        <Info className="size-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="font-bold">No incluye productos por consultar.</span> 
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-transform active:scale-[0.98]"
                  onClick={handleConfirmarPedido}
                  disabled={!hacerPedidos || orderLoading || (!hayProductosSinPrecio && (!metodoPago || (metodoPago === "efectivo" && !montoPagaCon)))}
                >
                  {orderLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {hayProductosSinPrecio ? "Enviar Consulta" : "Confirmar Pedido"}
                      <ArrowRight className="size-5" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BARRA INFERIOR STICKY (SOLO MÓVIL) */}
      {/* Esta barra asegura que el botón de acción principal siempre esté visible en pantallas pequeñas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 lg:hidden z-30 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] safe-area-pb">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {/* Desglose de totales - Siempre mostrar subtotal si hay productos */}
          <div className="space-y-2 text-sm">
            {items.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">S/ {totalAPagar.toFixed(2)}</span>
              </div>
            )}
            
            {ajusteRedondeo !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Redondeo</span>
                <span className={`font-semibold ${ajusteRedondeo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {ajusteRedondeo > 0 ? '+' : ''}S/ {ajusteRedondeo.toFixed(2)}
                </span>
              </div>
            )}

            {botellasRetornables > 0 && (
              <div className="flex justify-between items-center bg-green-50 px-2 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-green-700 text-xs">
                  <Recycle className="size-3.5" /> Retornables
                </span>
                <span className="font-bold text-green-700 text-xs">{botellasRetornables} u.</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
              <span className={`font-bold ${hayProductosSinPrecio ? "text-orange-600" : "text-slate-800"}`}>
                {hayProductosSinPrecio ? "Total Parcial" : "Total a Pagar"}
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                S/ {totalRedondeado.toFixed(2)}
              </span>
            </div>
            
            {hayProductosSinPrecio && (
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-2.5 shadow-sm">
                <div className="flex items-start gap-2">
                  <Info  className="size-3.5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-700 leading-snug font-medium">
                    <span className="font-bold ">No incluye productos por consultar.</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-slate-200"
            onClick={handleConfirmarPedido}
            disabled={!hacerPedidos || orderLoading || (!hayProductosSinPrecio && (!metodoPago || (metodoPago === "efectivo" && !montoPagaCon)))}
          >
            {orderLoading ? "..." : (hayProductosSinPrecio ? "Consultar" : "Confirmar")}
            {!orderLoading && <ArrowRight className="size-4 ml-2" />}
          </Button>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}