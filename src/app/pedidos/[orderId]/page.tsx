"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { Order } from "@/types/order";
import {
  MapPin,
  Wallet,
  ThermometerSun,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Store,
  ShoppingBag,
  Snowflake,
  AlertCircle,
  Recycle,
  Banknote,
  Smartphone,
  Download,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CancelOrderModal } from "@/components/order/cancel-order-modal";
import { PaymentRejectedModal } from "@/components/order/payment-rejected-modal";
import { toast } from "sonner";

import { ESTADO_CONFIG, capitalizeText } from "@/constants/order-config";
import { SubstituteCarousel } from "@/components/order/substitute-carousel";
import { OrderItem } from "@/components/order/order-item";
import { OrderItem as IOrderItem } from "@/types/order";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { fetchOrderById, updateOrderStatus } = useOrder();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  // State para manejar múltiples sustitutos: parentId -> { subId: quantity }
  const [substituteSelections, setSubstituteSelections] = useState<Record<string, Record<string, number>>>({});
  // State para manejar si el usuario decide cancelar todo el item original
  const [canceledItems, setCanceledItems] = useState<Record<string, boolean>>({});
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // State para revisión de pago
  const [revisionPaymentMethod, setRevisionPaymentMethod] = useState<"efectivo" | "yape" | null>(null);
  const [revisionPagaCon, setRevisionPagaCon] = useState<string>("");
  const [pagoCompletoRevision, setPagoCompletoRevision] = useState(false);

  const handleUpdateItem = async (itemId: string, updates: Partial<IOrderItem>) => {
    if (!order) return;

    try {
      const updatedItems = order.items.map(i => {
        if (i.itemId === itemId) {
          return { ...i, ...updates };
        }
        return i;
      });

      const newTotal = updatedItems.reduce((acc, i) => acc + (i.precio_final || 0), 0);

      await updateDoc(doc(db, "pedidos", orderId), {
        items: updatedItems,
        total_estimado: newTotal
      });
      // No toast on every update to avoid spam, or simplistic toast
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar producto");
    }
  };

  const handleDeleteItem = (item: IOrderItem) => {
    if (!order) return;
    // Si es el último producto, advertir cancelación de pedido
    const activeItemsCount = order.items.filter(i => !i.es_sustituto).length;
    if (activeItemsCount <= 1) {
      setShowCancelModal(true);
    } else {
      setItemToDelete(item);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!order || !itemToDelete) return;

    try {
      const updatedItems = order.items.filter(i => i.itemId !== itemToDelete.itemId);
      const newTotal = updatedItems.reduce((acc, i) => acc + (i.precio_final || 0), 0);

      await updateDoc(doc(db, "pedidos", orderId), {
        items: updatedItems,
        total_estimado: newTotal
      });
      toast.success("Producto eliminado del pedido");
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar producto");
    }
  };

  const handleToggleCancelItem = (parentId: string) => {
    setCanceledItems(prev => {
      const isCanceling = !prev[parentId];
      // Si cancelamos el item, limpiamos sus sustitutos seleccionados
      if (isCanceling) {
        setSubstituteSelections(curr => {
          const next = { ...curr };
          delete next[parentId];
          return next;
        });
      }
      return { ...prev, [parentId]: isCanceling };
    });
  };

  const handleUpdateSubstituteQty = (parentId: string, substituteId: string, quantity: number) => {
    // Asegurarnos de que el item no esté marcado como cancelado
    if (canceledItems[parentId]) {
      setCanceledItems(prev => ({ ...prev, [parentId]: false }));
    }

    setSubstituteSelections(prev => {
      const parentSelections = prev[parentId] || {};

      if (quantity <= 0) {
        // Remover sustituto si cantidad es 0
        const { [substituteId]: _, ...rest } = parentSelections;
        // Si no quedan sustitutos, limpiar el objeto del padre
        if (Object.keys(rest).length === 0) {
          const { [parentId]: __, ...restParents } = prev;
          return restParents;
        }
        return { ...prev, [parentId]: rest };
      }

      // Actualizar cantidad
      return {
        ...prev,
        [parentId]: {
          ...parentSelections,
          [substituteId]: quantity
        }
      };
    });
  };

  const handleClearSubstitutes = (parentId: string) => {
    // Opción "Solo lo que hay" -> Limpia sustitutos y asegura que no esté cancelado
    setSubstituteSelections(prev => {
      const { [parentId]: _, ...rest } = prev;
      return rest;
    });
    setCanceledItems(prev => ({ ...prev, [parentId]: false }));
  };

  const orderId = params.orderId as string;

  const calculateRevisionTotal = () => {
    if (!order) return 0;
    let currentTotal = 0;
    order.items.forEach(i => {
      if (i.es_sustituto) return; // Se suman via logica de seleccion

      if (canceledItems[i.itemId]) return; // Cancelado

      if (i.estado_item === "stock_parcial") {
        currentTotal += (Number(i.precio_final) || 0); // Precio del parcial
        // Sumar sustitutos
        const selections = substituteSelections[i.itemId] || {};
        const subs = order.items.filter(s => s.es_sustituto && s.sustituye_a === i.itemId);
        Object.entries(selections).forEach(([subId, qty]) => {
          const sub = subs.find(s => s.itemId === subId);
          if (sub) currentTotal += (Number(sub.precio_base) * qty);
        });
      } else if (i.estado_item === "sin_stock") {
        // Solo sustitutos
        const selections = substituteSelections[i.itemId] || {};
        const subs = order.items.filter(s => s.es_sustituto && s.sustituye_a === i.itemId);
        Object.entries(selections).forEach(([subId, qty]) => {
          const sub = subs.find(s => s.itemId === subId);
          if (sub) currentTotal += (Number(sub.precio_base) * qty);
        });
      } else {
        const pFinal = i.precio_final !== undefined && i.precio_final !== null ? i.precio_final : (Number(i.precio_base) * Number(i.cantidad_solicitada));
        currentTotal += (Number(pFinal) || 0);
      }
    });
    return currentTotal;
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    if (!orderId) {
      setError("ID de pedido no válido");
      setLoading(false);
      return;
    }

    // Listener en tiempo real con onSnapshot
    const orderRef = doc(db, "pedidos", orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const orderData = {
            orderId: docSnap.id,
            ...docSnap.data(),
          } as Order;

          // Verificar que el pedido pertenece al usuario
          if (orderData.userId !== user.uid) {
            setError("No tienes permiso para ver este pedido");
            setLoading(false);
            return;
          }

          setOrder(orderData);
          // Inicializar método de pago para revisión
          if ((orderData.estado === "esperando_confirmacion" || orderData.pago?.rechazo_vuelto) && orderData.pago) {
            setRevisionPaymentMethod(orderData.pago.metodo);
            setRevisionPagaCon(orderData.pago.monto_paga_con ? orderData.pago.monto_paga_con.toString() : "");
          }
          setError(null);
        } else {
          setError("Pedido no encontrado");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error al escuchar cambios del pedido:", err);
        setError("Error al cargar el pedido");
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribe();
    };
  }, [orderId, user, router]);

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setIsCancelling(true);
    try {
      // Eliminar el pedido de Firestore
      const orderRef = doc(db, "pedidos", orderId);
      await deleteDoc(orderRef);

      toast.success("Pedido eliminado correctamente");
      setShowCancelModal(false);

      // Redirigir a la página de inicio
      setTimeout(() => {
        router.push("/inicio");
      }, 500);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      toast.error("Error al eliminar el pedido");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAcceptRevision = async () => {
    if (!order) return;

    // Validar que se haya tomado una decisión para todos los items agotados con sustitutos
    const mainItems = order.items.filter(i => !i.es_sustituto);
    const pendingDecisions = mainItems.filter(item => {
      const hasSubstitutes = order.items.some(s => s.es_sustituto && s.sustituye_a === item.itemId);
      const isProblem = item.estado_item === "sin_stock" || item.estado_item === "stock_parcial";

      // Ya se tomó decisión si:
      // 1. Está marcado para cancelar
      // 2. Se seleccionaron sustitutos
      // 3. Se decidió explícitamente "Solo lo que hay" (esto es lo default si no hace nada, ¿o forzamos interacción?)
      //    Para evitar bloqueo, asumiremos que si no seleccionó nada, acepta "Solo lo que hay" a menos que sea Sin Stock total (ahí requiere acción si quiere sustituto, sino se borra)

      const isCanceled = canceledItems[item.itemId];
      const hasSelections = substituteSelections[item.itemId] && Object.keys(substituteSelections[item.itemId]).length > 0;

      // Si es SIN STOCK TOTAL, requerimos que elija algo O cancele.
      // Si no hace nada -> se asume cancelar/borrar item al final.

      return false; // Permitimos confirmar siempre, aplicando la lógica por defecto
    });

    if (pendingDecisions.length > 0) {
      toast.error("Por favor selecciona una opción para todos los productos agotados");
      return;
    }

    setLoading(true);
    try {
      const newItems: any[] = [];
      let newTotal = 0;

      const substitutes = order.items.filter(i => i.es_sustituto);

      mainItems.forEach(item => {
        // Verificar si el usuario decidió eliminar este item por completo
        if (canceledItems[item.itemId]) {
          // No lo agregamos al nuevo array (eliminación)
          return;
        }

        // Si es SIN STOCK y NO se eligieron sustitutos -> Se elimina por defecto (o se podría preguntar)
        // Pero si NO canceló explícitamente, y es SIN STOCK, y no eligió nada... es igual a cancelar.
        if (item.estado_item === "sin_stock") {
          const selections = substituteSelections[item.itemId] || {};
          const selectedSubIds = Object.keys(selections);

          if (selectedSubIds.length > 0) {
            // El usuario eligió sustitutos para reemplazar el item agotado
            // Nota: Aquí reemplazamos el item original con N sustitutos.
            // Para mantener coherencia en IDs, podemos usar itemId original para el PRIMERO y generar nuevos para el resto,
            // o generar nuevos para todos y descartar el original.

            selectedSubIds.forEach((subID, index) => {
              const subItem = substitutes.find(s => s.itemId === subID);
              const finalQty = selections[subID];

              if (subItem && finalQty > 0) {
                const newItem = {
                  ...subItem,
                  // Si es el primer sustituto, podríamos heredar el ID para mantener traza, pero mejor IDs nuevos limpios
                  itemId: index === 0 ? item.itemId : `sub-${item.itemId}-${Date.now()}-${index}`,
                  cantidad_solicitada: finalQty,
                  precio_final: (Number(subItem.precio_base) || 0) * finalQty, // USAMOS PRECIO BASE
                  es_sustituto: false,
                  sustituye_a: undefined,
                };
                delete (newItem as any).sustituye_a;
                newItems.push(newItem);
                newTotal += (Number(newItem.precio_final) || 0);
              }
            });
          } else {
            // Sin stock y sin selecciones -> se elimina
          }
        }
        else if (item.estado_item === "stock_parcial") {
          // 1. Agregar el item original con la cantidad reducida (que el usuario ACEPTÓ explícitamente al no cancelar)
          const reducedItem = {
            ...item,
            cantidad_solicitada: item.cantidad_final || 0,
            estado_item: 'modificado',
            // recalculamos precio final por si acaso
            precio_final: (Number(item.precio_base) || 0) * (item.cantidad_final || 0),
          };
          newItems.push(reducedItem);
          newTotal += (Number(reducedItem.precio_final) || 0);

          // 2. Agregar TODOS los sustitutos seleccionados
          const selections = substituteSelections[item.itemId] || {};
          Object.entries(selections).forEach(([subID, finalQty]) => {
            const subItem = substitutes.find(s => s.itemId === subID);
            if (subItem && finalQty > 0) {
              const newSubItem = {
                ...subItem,
                itemId: `sub-${item.itemId}-${Date.now()}-${subID}`,
                cantidad_solicitada: finalQty,
                precio_final: (Number(subItem.precio_base) || 0) * finalQty, // USAMOS PRECIO BASE
                es_sustituto: false,
                sustituye_a: undefined,
              };
              delete (newSubItem as any).sustituye_a;
              newItems.push(newSubItem);
              newTotal += (Number(newSubItem.precio_final) || 0);
            }
          });
        }
        else {
          // Item normal
          const pFinal = item.precio_final !== undefined && item.precio_final !== null ? item.precio_final : (Number(item.precio_base) * Number(item.cantidad_solicitada));
          newItems.push(item);
          newTotal += (Number(pFinal) || 0);
        }
      });

      // Validar selección de método de pago
      if (!revisionPaymentMethod) {
        toast.error("Debes seleccionar un método de pago para el nuevo total");
        setLoading(false);
        return;
      }

      // Validar monto si es efectivo
      if (revisionPaymentMethod === "efectivo") {
        const pagoCon = parseFloat(revisionPagaCon);
        if (isNaN(pagoCon) || pagoCon < newTotal) {
          toast.error(`El monto con el que pagas debe ser mayor o igual al total (S/ ${newTotal.toFixed(2)})`);
          setLoading(false);
          return;
        }
      }

      // Recalcular envases retornables
      const newEnvasesRetornables = newItems.reduce((acc, item) => {
        if (item.es_retornable) {
          return acc + (Number(item.cantidad_solicitada) || 0);
        }
        return acc;
      }, 0);

      // Actualizar Firestore
      const orderRef = doc(db, "pedidos", order.orderId);
      await updateDoc(orderRef, {
        items: newItems,
        total_final: newTotal,
        envases_retornables: newEnvasesRetornables,
        estado: "confirmada",
        requiere_confirmacion: false,
        "revision.requiere_accion": false,
        "pago.metodo": revisionPaymentMethod,
        "pago.monto_paga_con": revisionPaymentMethod === "efectivo" ? parseFloat(revisionPagaCon) : null,
        "pago.rechazo_vuelto": false, // Resetear el rechazo al enviar corrección
        // Recalcular vuelto si es efectivo
        vuelto: revisionPaymentMethod === "efectivo" ? (parseFloat(revisionPagaCon) - newTotal) : null,
        historial: [
          ...order.historial,
          {
            estado: "confirmada",
            fecha: new Date(),
            comentario: `Cliente aceptó cambios. Pago: ${revisionPaymentMethod}`
          }
        ]
      });

      toast.success("¡Pedido actualizado y confirmado!");
    } catch (error) {
      console.error("Error al confirmar revisión:", error);
      toast.error("Ocurrió un error al actualizar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="size-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || "Error"}</h2>
          <p className="text-gray-500 mb-8">No pudimos cargar la información solicitada.</p>
          <Button onClick={() => router.push("/inicio")} className="w-full rounded-full h-12 text-base">
            <ArrowLeft className="size-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const estadoConfig = ESTADO_CONFIG[order.estado];
  const IconoEstado = estadoConfig.icon;
  const isPaymentRejected = order.pago?.rechazo_vuelto === true;
  const canCancelOrder = order.estado === "pendiente" || order.estado === "esperando_confirmacion" || isPaymentRejected;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-10">
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />

      {/* Header Sticky con efecto blur */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/inicio")}
            className="rounded-full hover:bg-gray-100 -ml-2 text-gray-600"
            size="sm"
          >
            <ArrowLeft className="size-5 mr-1" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div className="flex flex-col items-end sm:items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Orden #</span>
            <span className="text-sm font-bold text-gray-900 font-mono">{order.numeroOrden}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Layout Grid: Movil 1 col, Desktop 2 cols (con sidebar sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* COLUMNA IZQUIERDA (Productos) - Ocupa 8/12 en desktop */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">

            {/* TARJETA DE PAGO YAPE (Ubicada ARRIBA de productos en desktop) */}
            {(order.estado === "lista" || order.estado === "preparando") && order.pago?.metodo === "yape" && (
              <div className="bg-purple-50 rounded-3xl shadow-lg border border-purple-100 p-6 flex flex-col md:flex-row items-center md:items-start md:justify-between text-center md:text-left transition-all animate-in fade-in slide-in-from-bottom-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                      <Image src="/MetodoPago/Yape.png" alt="Yape" width={20} height={20} className="rounded-sm" />
                    </div>
                    <span className="font-bold text-purple-900">Pago con Yape</span>
                  </div>

                  <p className="text-sm font-medium text-purple-800 mb-1">Escanea para pagar a</p>
                  <p className="text-2xl font-extrabold text-[#7c0f8b] mb-4">Yanet Mam*</p>

                  <p className="hidden md:block text-sm text-purple-700 bg-purple-100/50 px-4 py-3 rounded-xl max-w-xs">
                    {order.estado === "lista"
                      ? "Muestra el comprobante al recoger tu pedido"
                      : "Puedes ir adelantando tu pago mientras preparamos tu pedido"}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 relative flex items-center justify-center shrink-0">
                    <QRCodeCanvas
                      id="yape-qr-canvas"
                      value="0002010102113932969cde686e395bc6b28b0c3b05efd87a5204561153036045802PE5906YAPERO6004Lima6304BA65"
                      size={512}
                      fgColor="#7c0f8b"
                      level="H"
                      style={{ width: '160px', height: '160px' }}
                      imageSettings={{
                        src: "/MetodoPago/Yape.png",
                        height: 100,
                        width: 100,
                        excavate: true,
                      }}
                    />
                    {/* Overlay visual para consistencia estética */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm pointer-events-none">
                      <Image
                        src="/MetodoPago/Yape.png"
                        alt="Yape"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 h-8 gap-2 bg-white"
                    onClick={() => {
                      const originalCanvas = document.getElementById("yape-qr-canvas") as HTMLCanvasElement;
                      if (!originalCanvas) return;

                      // Crear canvas temporal de alta calidad para la "Tarjeta Yape"
                      const cardCanvas = document.createElement("canvas");
                      cardCanvas.width = 600;
                      cardCanvas.height = 800;
                      const ctx = cardCanvas.getContext("2d");
                      if (!ctx) return;

                      // 1. Fondo
                      ctx.fillStyle = "#F3E8FF"; // Purple-50
                      ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

                      // 2. Contenedor Blanco Central
                      ctx.fillStyle = "#FFFFFF";
                      ctx.beginPath();
                      // polyfill para roundRect si no existe o usar rect simple con esquinas
                      if (ctx.roundRect) {
                        ctx.roundRect(50, 50, 500, 700, 40);
                      } else {
                        ctx.rect(50, 50, 500, 700);
                      }
                      ctx.fill();

                      // Sombra
                      ctx.shadowColor = "rgba(0,0,0,0.1)";
                      ctx.shadowBlur = 20;
                      ctx.fill();

                      // 3. Logo Yape / Texto Superior
                      ctx.shadowBlur = 0; // Reset shadow for text
                      ctx.font = "bold 32px sans-serif";
                      ctx.fillStyle = "#581c87"; // Purple-900
                      ctx.textAlign = "center";
                      ctx.fillText("Pago con Yape", cardCanvas.width / 2, 130);

                      // 4. Nombre Destinatario
                      ctx.font = "bold 48px sans-serif";
                      ctx.fillStyle = "#7c0f8b"; // Color Yape
                      ctx.fillText("Yanet Mam*", cardCanvas.width / 2, 200);

                      // 5. Dibujar QR
                      const qrSize = 400;
                      const qrX = (cardCanvas.width - qrSize) / 2;
                      const qrY = 250;
                      ctx.drawImage(originalCanvas, qrX, qrY, qrSize, qrSize);

                      // 6. Texto Inferior
                      ctx.font = "500 24px sans-serif";
                      ctx.fillStyle = "#6b21a8"; // Purple-800
                      ctx.fillText("Escanea para pagar", cardCanvas.width / 2, 700);

                      // Descargar
                      const pngUrl = cardCanvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = "Yape_YanetMam.png";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                      toast.success("Tarjeta QR descargada");
                    }}
                  >
                    <Download className="size-3.5" />
                    Descargar QR
                  </Button>
                </div>

                <p className="md:hidden text-xs text-purple-700 bg-purple-100/50 px-3 py-2 rounded-lg w-full mt-4">
                  {order.estado === "lista"
                    ? "Muestra el comprobante al recoger tu pedido"
                    : "Puedes ir adelantando tu pago mientras preparamos tu pedido"}
                </p>
              </div>
            )}

            {/* Cabecera de Lista de Productos */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                Productos <span className="text-gray-400 text-sm font-normal">({order.items.length})</span>
              </h3>
            </div>

            {/* Lista de Productos */}
            <div className="space-y-4">
              {order.items.map((item) => {
                const isEditing = order.estado === "esperando_confirmacion";
                // Only render items that are NOT substitutes here.
                if (item.es_sustituto) return null;

                const subs = order.items.filter(i => i.es_sustituto && i.sustituye_a === item.itemId);

                return (
                  <OrderItem
                    key={item.itemId}
                    item={item}
                    order={order}
                    orderState={order.estado}
                    isEditing={isEditing}
                    substitutes={subs}
                    substituteSelections={substituteSelections}
                    canceledItems={canceledItems}
                    onUpdateItem={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    onUpdateSubstituteQty={handleUpdateSubstituteQty}
                    onToggleCancelItem={handleToggleCancelItem}
                    onClearSubstitutes={handleClearSubstitutes}
                    onShowCancelModal={() => setShowCancelModal(true)}
                  />
                );
              })}

            </div>

            {/* SELECCIÓN DE PAGO (SOLO EN REVISIÓN) - COLOCADA AQUÍ PARA MOBILE/DESKTOP */}
            {order.estado === "esperando_confirmacion" && (
              <div className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-6 shadow-sm mt-6 mb-20 lg:mb-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Wallet className="size-5 sm:size-6 text-slate-400" />
                  ¿Cómo quieres pagar el nuevo total?
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Opción Efectivo */}
                  <div
                    onClick={() => setRevisionPaymentMethod("efectivo")}
                    className={`
                          cursor-pointer relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 group h-auto sm:h-32 aspect-[4/3] sm:aspect-auto
                          ${revisionPaymentMethod === "efectivo"
                        ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                        `}
                  >
                    {revisionPaymentMethod === "efectivo" && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-emerald-500">
                        <CheckCircle2 className="size-5 sm:size-6 fill-emerald-100" />
                      </div>
                    )}
                    <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                      <Image src="/MetodoPago/Efectivo.png" alt="Efectivo" width={32} height={32} className="object-contain sm:w-10 sm:h-10" />
                    </div>
                    <span className={`font-bold text-sm sm:text-base ${revisionPaymentMethod === "efectivo" ? "text-emerald-700" : "text-slate-600"}`}>Efectivo</span>
                  </div>

                  {/* Opción Yape */}
                  <div
                    onClick={() => setRevisionPaymentMethod("yape")}
                    className={`
                          cursor-pointer relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 group h-auto sm:h-32 aspect-[4/3] sm:aspect-auto
                          ${revisionPaymentMethod === "yape"
                        ? "border-purple-500 bg-purple-50/30 ring-1 ring-purple-500/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                        `}
                  >
                    {revisionPaymentMethod === "yape" && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-purple-500">
                        <CheckCircle2 className="size-5 sm:size-6 fill-purple-100" />
                      </div>
                    )}
                    <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                      <Image src="/MetodoPago/Yape.png" alt="Yape" width={32} height={32} className="object-contain rounded-lg sm:w-10 sm:h-10" />
                    </div>
                    <span className={`font-bold text-sm sm:text-base ${revisionPaymentMethod === "yape" ? "text-purple-700" : "text-slate-600"}`}>Yape</span>
                  </div>
                </div>

                {/* Input Dinámico para Efectivo */}
                <div className={`
                      overflow-hidden transition-all duration-500 ease-in-out
                      ${revisionPaymentMethod === "efectivo" ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}
                    `}>
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200/60 max-w-md mx-auto transition-all">

                    {/* Opción Pago Completo */}
                    <div className="mb-4 flex items-center justify-center gap-2 pb-4 border-b border-gray-200/50">
                      <button
                        onClick={() => {
                          const nuevoEstado = !pagoCompletoRevision;
                          setPagoCompletoRevision(nuevoEstado);
                          if (nuevoEstado) {
                            setRevisionPagaCon(calculateRevisionTotal().toFixed(2));
                          } else {
                            setRevisionPagaCon("");
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${pagoCompletoRevision
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                          : "bg-white border-gray-200 text-slate-600 hover:border-emerald-200"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${pagoCompletoRevision ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"
                          }`}>
                          {pagoCompletoRevision && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        Pagaré con el monto exacto
                      </button>
                    </div>

                    {!pagoCompletoRevision && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-center text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-3">
                          ¿Con cuánto vas a pagar?
                        </label>
                        <div className="relative max-w-[200px] sm:max-w-[240px] mx-auto">
                          <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl sm:text-2xl">S/</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={revisionPagaCon}
                            onChange={(e) => setRevisionPagaCon(e.target.value)}
                            className="w-full bg-white text-center pl-8 sm:pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-2xl sm:text-3xl font-bold text-slate-800 placeholder:text-gray-300 transition-colors shadow-sm outline-none"
                            autoFocus={revisionPaymentMethod === "efectivo" && !pagoCompletoRevision}
                          />
                        </div>
                      </div>
                    )}

                    {pagoCompletoRevision && (
                      <p className="text-center text-emerald-600 font-bold text-lg animate-in fade-in">
                        Pago Completo: S/ {calculateRevisionTotal().toFixed(2)}
                      </p>
                    )}

                    {/* Cálculo de vuelto */}
                    {revisionPaymentMethod === "efectivo" && !pagoCompletoRevision && revisionPagaCon && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center px-2 sm:px-4 animate-in fade-in slide-in-from-top-2">
                        <span className="text-xs sm:text-sm font-medium text-slate-500">Tu vuelto será:</span>
                        <span className={`text-base sm:text-lg font-bold ${parseFloat(revisionPagaCon) >= calculateRevisionTotal() ? "text-emerald-600" : "text-red-500"
                          }`}>
                          {parseFloat(revisionPagaCon) >= calculateRevisionTotal()
                            ? `S/ ${(parseFloat(revisionPagaCon) - calculateRevisionTotal()).toFixed(2)}`
                            : "Monto insuficiente"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* COLUMNA DERECHA (Resumen y Estado) - Ocupa 4/12 en desktop y es Sticky */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* TARJETA DE ESTADO (Hero) */}
              <div className={`relative overflow-hidden rounded-3xl shadow-lg border ${estadoConfig.className} p-6 transition-all`}>
                <div className="flex flex-col items-center text-center relative z-10">
                  {(estadoConfig as any).heroImage ? (
                    <div className="mb-4 relative">
                      {/* Fondo glow para el spinner */}
                      <div className="absolute inset-0 bg-white/40 blur-xl rounded-full transform scale-150"></div>
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full border-[5px] ${(estadoConfig as any).borderClass}`}></div>
                        {/* Imagen del estado mantenida */}
                        <div className="w-24 h-24 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-full shadow-inner p-2">
                          <Image
                            src={(estadoConfig as any).heroImage}
                            alt={estadoConfig.label}
                            width={(estadoConfig as any).heroImageWidth || 100}
                            height={(estadoConfig as any).heroImageHeight || 100}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`mb-4 p-4 rounded-full bg-white/80 backdrop-blur shadow-sm ${estadoConfig.iconColor}`}>
                      <IconoEstado className="size-10" />
                    </div>
                  )}

                  <h2 className="text-2xl font-bold mb-2 tracking-tight">{estadoConfig.label}</h2>
                  <p className="text-sm opacity-90 font-medium leading-relaxed max-w-[250px]">
                    {estadoConfig.description}
                  </p>

                  {order.estado === "lista" && (
                    <a
                      href="https://maps.app.goo.gl/xEYuLvHZRJKHv6MY7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-teal-100 hover:bg-teal-50 hover:scale-105 transition-all"
                    >
                      <MapPin className="size-4" />
                      Ver ubicación de recojo
                    </a>
                  )}

                </div>
              </div>



              {/* TARJETA DE RESUMEN FINANCIERO */}
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700 pb-4 border-b border-gray-100">
                    <div className="bg-gray-100 p-2 rounded-xl">
                      <Wallet className="size-5 text-gray-600" />
                    </div>
                    <span className="font-semibold">Resumen de Pago</span>
                  </div>

                  {/* Detalles de pago */}
                  <div className="space-y-3 text-sm">
                    {order.pago?.metodo && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Método</span>
                        <span className="font-medium text-gray-900 capitalize flex items-center gap-2">
                          {order.pago.metodo === "yape" ? (
                            <>
                              <Image src="/MetodoPago/Yape.png" alt="Yape" width={16} height={16} className="rounded-sm" />
                              Yape
                            </>
                          ) : (
                            "Efectivo"
                          )}
                        </span>
                      </div>
                    )}

                    {order.pago?.metodo === "efectivo" && order.pago.monto_paga_con && (
                      <>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Paga con</span>
                          <span className="font-medium text-gray-900">
                            S/ {order.pago.monto_paga_con.toFixed(2)}
                            {(order.vuelto === 0 || order.vuelto === null || Math.abs(order.pago.monto_paga_con - (order.total_final || order.total_estimado)) < 0.05) && (
                              <span className="ml-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">(Completo)</span>
                            )}
                          </span>
                        </div>
                        {order.vuelto && order.vuelto > 0 ? (
                          <div className="flex justify-between items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <span>Vuelto a recibir</span>
                            <span className="font-bold">S/ {order.vuelto.toFixed(2)}</span>
                          </div>
                        ) : null}
                      </>
                    )}

                    {order.envases_retornables > 0 && (
                      <div className="flex justify-between items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <span className="flex items-center gap-1"><Recycle className="size-3" /> Envases</span>
                        <span className="font-bold">{order.envases_retornables} u.</span>
                      </div>
                    )}
                  </div>

                  {/* Total Grande */}
                  <div className="pt-4 border-t border-gray-100 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 font-medium text-sm mb-1">
                        {order.total_final && order.total_final > 0 ? "Total" : "Total Estimado"}
                      </span>
                      <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        {(order.total_final === 0 && order.total_estimado === 0 && order.items.some(i => i.mostrar_precio_web === false && !i.is_recovered_price && (!i.precio_final || i.precio_final === 0)))
                          ? <span className="text-xl text-orange-500">Por confirmar</span>
                          : `S/ ${(order.total_final && order.total_final > 0 ? order.total_final : order.total_estimado).toFixed(2)}`
                        }
                      </span>
                    </div>
                    {order.requiere_confirmacion && (
                      <p className="text-xs text-orange-600 mt-2 flex items-start gap-1.5 bg-orange-50 p-2 rounded-lg border border-orange-100">
                        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                        El precio final podría variar tras la revisión.
                      </p>
                    )}
                  </div>
                </div>


                {/* Botón de Confirmar Cambios (Revisión) */}
                {order.estado === "esperando_confirmacion" && (
                  <div className="hidden lg:block bg-gradient-to-b from-orange-50 to-white p-4 border-t border-orange-100">

                    {/* Total Estimado Dinámico */}
                    <div className="flex justify-between items-center mb-4 px-1">
                      <span className="text-sm font-medium text-orange-800">Total tras cambios:</span>
                      <span className="text-xl font-bold text-orange-600">
                        S/ {calculateRevisionTotal().toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={handleAcceptRevision}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl shadow-lg shadow-orange-500/20 font-bold tracking-wide transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="mr-2 size-5" />
                      Confirmar Cambios
                    </Button>
                  </div>
                )}

                {/* Botón de Cancelar */}
                {canCancelOrder && (
                  <div className="hidden lg:block bg-gray-50 p-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelModal(true)}
                      className="w-full bg-white hover:bg-red-50 text-red-600 border-red-100 hover:border-red-200 h-11 rounded-xl shadow-sm hover:shadow transition-all"
                    >
                      Cancelar Pedido
                    </Button>
                  </div>
                )}
              </div>

              {/* Info de Entrega Pequeña */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
                  <Store className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Método de entrega</p>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900">Recojo en Tienda</p>
                    <a
                      href="https://maps.app.goo.gl/xEYuLvHZRJKHv6MY7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium mt-0.5"
                    >
                      <MapPin className="size-3" />
                      Ver ubicación
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div >

      {/* BARRA INFERIOR STICKY (SOLO MÓVIL) */}
      < div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-30 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] safe-area-pb" >
        <div className="container mx-auto flex gap-3 items-center">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium mb-0.5">
              {order.estado === "esperando_confirmacion" ? "Total con cambios" : "Total del Pedido"}
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {(order.estado !== "esperando_confirmacion" && order.total_final === 0 && order.total_estimado === 0 && order.items.some(i => i.mostrar_precio_web === false && !i.is_recovered_price && (!i.precio_final || i.precio_final === 0)))
                ? <span className="text-lg text-orange-500">Por confirmar</span>
                : `S/ ${(order.estado === "esperando_confirmacion" ? calculateRevisionTotal() : (order.total_final || order.total_estimado)).toFixed(2)}`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canCancelOrder && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCancelModal(true)}
                className="size-12 rounded-xl border-red-100 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-200 shrink-0"
              >
                <XCircle className="size-6" />
              </Button>
            )}

            {(order.estado === "esperando_confirmacion" || isPaymentRejected) ? (
              <Button
                className="flex-1 px-6 bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-orange-200"
                onClick={handleAcceptRevision}
                disabled={loading}
              >
                Confirmar
              </Button>
            ) : (
              <div className={`px-4 py-2 rounded-xl font-bold text-sm text-center min-w-[120px] flex items-center justify-center gap-2 border ${estadoConfig.className.replace('bg-gradient-to-br', 'bg-white').replace('text-', 'text-')}`}>
                <IconoEstado className="size-4" />
                {estadoConfig.label}
              </div>
            )}
          </div>
        </div>
      </div >

      {/* Modal de Pago Rechazado */}
      <PaymentRejectedModal
        isOpen={isPaymentRejected}
        total={Math.abs(calculateRevisionTotal() - 0.01) > 0.01 ? calculateRevisionTotal() : (order.total_final || order.total_estimado)}
        paymentMethod={revisionPaymentMethod}
        payAmount={revisionPagaCon}
        isFullPayment={pagoCompletoRevision}
        onMethodChange={setRevisionPaymentMethod}
        onAmountChange={setRevisionPagaCon}
        onFullPaymentToggle={setPagoCompletoRevision}
        onConfirm={handleAcceptRevision}
        onCancelOrder={() => setShowCancelModal(true)}
        isLoading={loading}
        originalPayAmount={order.pago?.monto_paga_con}
      />

      {/* Modal Confirmación Eliminar Item */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-red-50 p-3 rounded-full">
                <Trash2 className="size-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900">¿Eliminar producto?</h3>
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de quitar <span className="font-semibold text-gray-700">{itemToDelete.nombre}</span> de este pedido?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <Button variant="outline" onClick={() => setItemToDelete(null)} className="w-full h-11 rounded-xl">
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDeleteItem} className="w-full bg-red-500 hover:bg-red-600 h-11 rounded-xl">
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div >
  );
}