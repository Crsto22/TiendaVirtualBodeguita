"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import Image from "next/image";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  CalendarDays,
  Receipt,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Configuración de estados (Misma lógica, solo ajuste visual en iconos)
const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20",
    icon: Clock,
  },
  en_revision: {
    label: "En Revisión",
    color: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
    icon: Package,
  },
  esperando_confirmacion: {
    label: "Esperando Confirmación",
    color: "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20",
    icon: AlertCircle,
  },
  confirmada: {
    label: "Confirmada",
    color: "bg-green-50 text-green-700 border-green-200 ring-green-500/20",
    icon: CheckCircle2,
  },
  preparando: {
    label: "Preparando",
    color: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20",
    icon: Package,
  },
  lista: {
    label: "Lista para Recojo",
    color: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20",
    icon: CheckCircle2,
  },
  entregada: {
    label: "Entregada",
    color: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/20",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-red-50 text-red-700 border-red-200 ring-red-500/20",
    icon: XCircle,
  },
};

export default function PedidosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, loading, fetchOrdersByDate } = useOrder();
  const [filtro, setFiltro] = useState<'hoy' | 'ayer' | 'especifico'>('hoy');
  const [fechaEspecifica, setFechaEspecifica] = useState<string>('');

  // Función para cargar pedidos según el filtro
  const cargarPedidos = useCallback(() => {
    let fecha: Date;

    switch (filtro) {
      case 'hoy':
        fecha = new Date();
        break;
      case 'ayer':
        fecha = new Date();
        fecha.setDate(fecha.getDate() - 1);
        break;
      case 'especifico':
        if (!fechaEspecifica) return;
        fecha = new Date(fechaEspecifica + 'T00:00:00');
        break;
      default:
        fecha = new Date();
    }

    fetchOrdersByDate(fecha);
  }, [filtro, fechaEspecifica, fetchOrdersByDate]);

  // Cargar pedidos de hoy cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      cargarPedidos();
    }
  }, [user, cargarPedidos]);

  // Cambiar filtro y recargar
  const cambiarFiltro = (nuevoFiltro: 'hoy' | 'ayer' | 'especifico') => {
    setFiltro(nuevoFiltro);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-0 font-sans">
      <Navbar />
      <MobileDock />

      {/* Contenedor Principal */}
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        {user ? (
          <div className=" mx-auto">
            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 px-2">
              Historial de Pedidos
            </h1>

            {/* Filtros de Fecha */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
              {/* Botones de Filtro */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => cambiarFiltro('hoy')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filtro === 'hoy'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => cambiarFiltro('ayer')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filtro === 'ayer'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ayer
                </button>
                <button
                  onClick={() => cambiarFiltro('especifico')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filtro === 'especifico'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fecha específica
                </button>
              </div>

              {/* Selector de Fecha Específica */}
              {filtro === 'especifico' && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-gray-400" />
                  <input
                    type="date"
                    value={fechaEspecifica}
                    onChange={(e) => setFechaEspecifica(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100">
                <Loader2 className="size-12 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Sincronizando tus pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 md:p-16 text-center shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse"></div>
                  <Image
                    src="/Pedidos1.png"
                    alt="Historial de Pedidos Vacío"
                    fill
                    className="object-contain p-4 drop-shadow-md"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {filtro === 'hoy' && 'No tienes pedidos hoy'}
                  {filtro === 'ayer' && 'No tienes pedidos de ayer'}
                  {filtro === 'especifico' && 'No hay pedidos en esta fecha'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                  {filtro === 'hoy' 
                    ? 'No has realizado ningún pedido hoy. ¡Explora nuestro catálogo!'
                    : 'No se encontraron pedidos para el período seleccionado. Prueba con otra fecha o realiza un nuevo pedido.'
                  }
                </p>
                {filtro === 'hoy' && (
                  <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    Comenzar a comprar
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-5">
                {orders.map((order) => {
                  const estadoConfig = ESTADO_CONFIG[order.estado] || ESTADO_CONFIG.pendiente;
                  const IconoEstado = estadoConfig.icon;
                  const fechaCreacion = order.fecha_creacion instanceof Date
                    ? order.fecha_creacion
                    : order.fecha_creacion?.toDate?.() || new Date();

                  return (
                    <div
                      key={order.orderId}
                      onClick={() => router.push(`/pedidos/${order.orderId}`)}
                      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer active:scale-[0.99] relative overflow-hidden"
                    >
                      {/* Fila Superior: Estado y Precio (Desktop) */}
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${estadoConfig.color} border ring-0 px-3 py-1 text-xs font-bold rounded-full shadow-sm`}>
                          <IconoEstado className="size-3.5 mr-1.5" />
                          {estadoConfig.label}
                        </Badge>

                        {/* Precio Desktop */}
                        <div className="hidden md:flex items-center gap-2 text-gray-900">
                          <span className="text-xl font-extrabold tracking-tight">S/ {order.total_estimado.toFixed(2)}</span>
                          <ChevronRight className="size-5 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      {/* Información Principal del Pedido */}
                      <div className="mb-5 space-y-1">
                        <h4 className="text-base font-bold text-gray-800 capitalize">
                          {fechaCreacion.toLocaleDateString("es-PE", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono tracking-wide">
                          NO. ORDEN: {order.numeroOrden}
                        </p>

                        {/* Alerta de Acción Requerida */}
                        {order.requiere_confirmacion && (
                          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100 animate-pulse">
                            <AlertCircle className="size-3.5" />
                            Requiere confirmar cambios
                          </div>
                        )}
                      </div>

                      {/* Fila Inferior: Productos y Precio (Móvil) */}
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        {/* Previsualización de Productos (Círculos superpuestos) */}
                        <div className="flex items-center pl-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative w-11 h-11 -ml-2 rounded-full border-[3px] border-white bg-gray-50 shadow-sm overflow-hidden flex items-center justify-center shrink-0"
                            >
                              {item.imagen ? (
                                <Image
                                  src={item.imagen}
                                  alt={item.nombre}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <ShoppingBag className="size-5 text-gray-300" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="relative w-11 h-11 -ml-2 rounded-full border-[3px] border-white bg-gray-100 flex items-center justify-center shadow-sm shrink-0 z-10">
                              <span className="text-xs font-bold text-gray-600">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>

                        {/* Precio en Móvil (Visible solo en móvil) */}
                        <div className="md:hidden flex items-center gap-1">
                          <span className="text-lg font-extrabold text-gray-900">S/ {order.total_estimado.toFixed(2)}</span>
                          <ChevronRight className="size-5 text-gray-400 ml-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Estado No Autenticado */
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className=" p-8 md:p-12  max-w-md w-full relative overflow-hidden">
              <div className="flex justify-center mx-auto mb-6 md:mb-8 relative">
                <div className="absolute inset-0 bg-gray-100 rounded-full scale-110 blur-xl opacity-50"></div>
                <Image
                  src="/Pedidos.png"
                  alt="Acceso Restringido"
                  width={180}
                  height={180}
                  className="object-contain relative z-10"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Inicia Sesión</h2>
              <p className="text-gray-500 mb-8 text-base md:text-lg leading-relaxed">
                Para ver el seguimiento de tus pedidos necesitas acceder a tu cuenta.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}