"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot, // Import onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Order, CreateOrderData, EstadoPedido, OrderItem } from "@/types/order";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { AlertTriangle, PackageCheck, ChevronRight, Clock, Search, CheckCircle2, Package, Truck, XCircle, LucideIcon } from "lucide-react";

// Configuración de iconos por estado para toasts (sin colores, usa predeterminado)
const TOAST_STATUS_ICONS: Record<EstadoPedido, LucideIcon> = {
  pendiente: Clock,
  en_revision: Search,
  esperando_confirmacion: AlertTriangle,
  confirmada: CheckCircle2,
  preparando: Package,
  lista: PackageCheck,
  entregada: Truck,
  cancelada: XCircle,
};

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: CreateOrderData) => Promise<string | null>;
  // fetchUserOrders ya no es necesario llamarlo manualmente, pero mantenemos la firma por compatibilidad si es necesario
  fetchUserOrders: () => Promise<void>;
  fetchOrdersByDate: (fecha: Date) => Promise<Order[]>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, newStatus: EstadoPedido) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: false,
  createOrder: async () => null,
  fetchUserOrders: async () => { },
  fetchOrdersByDate: async () => [],
  fetchOrderById: async () => null,
  updateOrderStatus: async () => false,
});

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Generar número de orden único
  const generateOrderNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${year}${month}${day}-${random}`;
  };

  // Crear un nuevo pedido
  const createOrder = useCallback(
    async (orderData: CreateOrderData): Promise<string | null> => {
      if (!user) {
        toast.error("Debes iniciar sesión para realizar un pedido");
        return null;
      }

      setLoading(true);

      try {
        // Determinar si el pedido requiere confirmación
        const requiereConfirmacion = orderData.items.some(
          (item) =>
            (item.mostrar_precio_web === false && item.tipo_unidad !== "kilogramo") ||
            (item.tipo_unidad === "kilogramo" && (item.precio_base === 0 || item.precio_base === null))
        );

        // Preparar items con estado inicial
        const itemsConEstado: OrderItem[] = orderData.items.map((item, index) => ({
          ...item,
          itemId: `item-${Date.now()}-${index}`,
          estado_item: "disponible",
          requiere_confirmacion:
            (item.mostrar_precio_web === false && item.tipo_unidad !== "kilogramo") ||
            (item.tipo_unidad === "kilogramo" && (item.precio_base === 0 || item.precio_base === null)),
        }));

        // Construir el objeto del pedido
        const now = new Date();
        const newOrder: any = {
          userId: user.uid,
          numeroOrden: generateOrderNumber(),
          estado: "pendiente",
          fecha_creacion: serverTimestamp(),
          fecha_actualizacion: serverTimestamp(),
          cliente: orderData.cliente,
          pago: orderData.pago,
          items: itemsConEstado,
          total_estimado: orderData.total_estimado,
          envases_retornables: orderData.envases_retornables,
          requiere_confirmacion: requiereConfirmacion,
          historial: [
            {
              estado: "pendiente",
              fecha: now,
              comentario: "Pedido creado por el cliente",
            },
          ],
        };

        // Agregar campos opcionales solo si tienen valor
        if (orderData.notas_cliente) {
          newOrder.notas_cliente = orderData.notas_cliente;
        }

        // Calcular vuelto si es pago en efectivo
        if (orderData.pago.metodo === "efectivo" && orderData.pago.monto_paga_con) {
          newOrder.vuelto = orderData.pago.monto_paga_con - orderData.total_estimado;
        }

        // Guardar en Firestore
        const ordersRef = collection(db, "pedidos");
        const docRef = await addDoc(ordersRef, newOrder);

        toast.success("¡Pedido creado exitosamente!", {
          description: `Número de orden: ${newOrder.numeroOrden}`,
        });

        return docRef.id;
      } catch (error) {
        console.error("Error al crear el pedido:", error);
        toast.error("Error al crear el pedido", {
          description: "Por favor intenta nuevamente",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const pathname = usePathname();
  const router = useRouter();


  // Refs para seguimiento sin dependencias
  const pathnameRef = useRef(pathname);
  const ordersStatusRef = useRef<Record<string, EstadoPedido>>({});

  // Actualizar ref del pathname
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Listener en tiempo real para pedidos
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);

    // Optimización: Solo escuchar pedidos de HOY
    // Esto reduce drásticamente las lecturas.
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const ordersRef = collection(db, "pedidos");
    // Nota: No excluimos 'entregada'/'cancelada' explícitamente en la query
    // porque necesitamos recibir el evento de cambio a 'entregada' para mostrar el toast.
    // Al filtrar por fecha (HOY), el volumen de datos ya es mínimo.
    const q = query(
      ordersRef,
      where("userId", "==", user.uid),
      where("fecha_creacion", ">=", Timestamp.fromDate(inicioDia)),
      orderBy("fecha_creacion", "desc")
    );

    // console.log("Setting up snapshot listener for user:", user.uid);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Procesar cambios para notificaciones
      snapshot.docChanges().forEach((change) => {
        const orderData = change.doc.data() as Order;
        const orderId = change.doc.id;
        const newStatus = orderData.estado;

        if (change.type === "added") {
          // Registrar estado inicial
          ordersStatusRef.current[orderId] = newStatus;
        }

        if (change.type === "modified") {
          const prevStatus = ordersStatusRef.current[orderId];

          // Si el estado cambió, mostrar notificación
          if (prevStatus && prevStatus !== newStatus) {
            // Verificar si estamos en la página del detalle de esta orden
            // El usuario pidió: "menos el de orded id osea donde se ve la orden"
            const isOnOrderPage = pathnameRef.current?.includes(`/pedidos/${orderId}`);

            if (!isOnOrderPage) {
              const formattedStatus = newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              // Caso especial: Esperando Confirmación (requiere acción del usuario)
              if (newStatus === 'esperando_confirmacion') {
                const StatusIcon = TOAST_STATUS_ICONS.esperando_confirmacion;
                toast.custom((t) => (
                  <div
                    onClick={() => {
                      toast.dismiss(t);
                      router.push(`/pedidos/${orderId}`);
                    }}
                    className="flex items-center gap-2 sm:gap-3 w-full max-w-[calc(100vw-2rem)] sm:max-w-md p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all group"
                  >
                    <div className="shrink-0 p-1.5 sm:p-2 bg-gray-100 rounded-lg">
                      <StatusIcon className="size-4 sm:size-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-darkblue text-xs sm:text-sm truncate sm:whitespace-normal">¡Pedido {orderData.numeroOrden} requiere confirmación!</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Toca para revisar los cambios</p>
                    </div>
                    <ChevronRight className="size-4 sm:size-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                  </div>
                ), { duration: 10000 });
              } else {
                const StatusIcon = TOAST_STATUS_ICONS[newStatus] || TOAST_STATUS_ICONS.pendiente;
                toast.custom((t) => (
                  <div
                    onClick={() => {
                      toast.dismiss(t);
                      router.push(`/pedidos/${orderId}`);
                    }}
                    className="flex items-center gap-2 sm:gap-3 w-full max-w-[calc(100vw-2rem)] sm:max-w-md p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all group"
                  >
                    <div className="shrink-0 p-1.5 sm:p-2 bg-gray-100 rounded-lg">
                      <StatusIcon className="size-4 sm:size-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-darkblue text-xs sm:text-sm truncate sm:whitespace-normal">Pedido {orderData.numeroOrden} está {formattedStatus}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Toca para ver los detalles</p>
                    </div>
                    <ChevronRight className="size-4 sm:size-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                  </div>
                ), { duration: 5000 });
              }
            }
          }

          // Actualizar referencia
          ordersStatusRef.current[orderId] = newStatus;
        }
      });

      // Actualizar estado general con todos los docs
      const currentOrders = snapshot.docs.map((doc) => ({
        orderId: doc.id,
        ...doc.data(),
      } as Order));

      setOrders(currentOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error en listener de pedidos:", error);
      toast.error("Error de conexión al actualizar pedidos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]); // router es estable, user cambia al login

  // Mantener fetchUserOrders como no-op o refresh manual simple si fuera necesario
  // pero ya el listener se encarga.
  const fetchUserOrders = useCallback(async () => {
    // El listener ya se encarga de mantener los pedidos actualizados.
    // Podríamos forzar un refresh si fuera necesario pero onSnapshot suele ser suficiente.
  }, []);

  // Obtener pedidos filtrados por fecha específica (On Demand)
  // Esta función NO actualiza el estado 'orders' del contexto (que es solo hoy/realtime)
  // sino que devuelve los datos para que la página los maneje localmente.
  const fetchOrdersByDate = useCallback(async (fecha: Date): Promise<Order[]> => {
    if (!user) return [];

    try {
      // Establecer inicio del día (00:00:00)
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);

      // Establecer fin del día (23:59:59)
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      const ordersRef = collection(db, "pedidos");
      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
        where("fecha_creacion", ">=", Timestamp.fromDate(inicioDia)),
        where("fecha_creacion", "<=", Timestamp.fromDate(finDia)),
        orderBy("fecha_creacion", "desc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];

      querySnapshot.forEach((doc) => {
        fetchedOrders.push({
          orderId: doc.id,
          ...doc.data(),
        } as Order);
      });

      return fetchedOrders;
    } catch (error) {
      console.error("Error al obtener pedidos por fecha:", error);
      toast.error("Error al cargar historial");
      return [];
    }
  }, [user]);

  // Obtener un pedido específico por ID
  const fetchOrderById = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        const orderRef = doc(db, "pedidos", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          return {
            orderId: orderSnap.id,
            ...orderSnap.data(),
          } as Order;
        }

        return null;
      } catch (error) {
        console.error("Error al obtener pedido:", error);
        return null;
      }
    },
    []
  );

  // Actualizar el estado de un pedido
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: EstadoPedido): Promise<boolean> => {
      try {
        const orderRef = doc(db, "pedidos", orderId);

        await updateDoc(orderRef, {
          estado: newStatus,
          fecha_actualizacion: serverTimestamp(),
          historial: [
            ...(await fetchOrderById(orderId))?.historial || [],
            {
              estado: newStatus,
              fecha: serverTimestamp(),
            },
          ],
        });

        toast.success(`Estado actualizado a: ${newStatus}`);
        return true;
      } catch (error) {
        console.error("Error al actualizar estado:", error);
        toast.error("Error al actualizar el estado del pedido");
        return false;
      }
    },
    [fetchOrderById]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        createOrder,
        fetchUserOrders,
        fetchOrdersByDate,
        fetchOrderById,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
