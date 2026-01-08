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
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Order, CreateOrderData, EstadoPedido, OrderItem } from "@/types/order";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: CreateOrderData) => Promise<string | null>;
  fetchUserOrders: () => Promise<void>;
  fetchOrdersByDate: (fecha: Date) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, newStatus: EstadoPedido) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: false,
  createOrder: async () => null,
  fetchUserOrders: async () => { },
  fetchOrdersByDate: async () => { },
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

  // Obtener todos los pedidos del usuario
  const fetchUserOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);

    try {
      const ordersRef = collection(db, "pedidos");
      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
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

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      toast.error("Error al cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Obtener pedidos filtrados por fecha específica
  const fetchOrdersByDate = useCallback(async (fecha: Date) => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);

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

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error al obtener pedidos por fecha:", error);
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
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
