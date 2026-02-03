/**
 * Custom Hook: useOrderData
 * Maneja la obtención en tiempo real de un pedido desde Firestore
 * Incluye validación de permisos y manejo de estados
 */

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Order } from "@/types/order";
import { useAuth } from "@/context/AuthContext";

interface UseOrderDataReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

export function useOrderData(orderId: string | undefined): UseOrderDataReturn {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esperar a que la autenticación termine
    if (authLoading) return;

    // Validar que el usuario esté autenticado
    if (!user) {
      setError("Usuario no autenticado");
      setLoading(false);
      return;
    }

    // Validar que el orderId sea válido
    if (!orderId || typeof orderId !== "string") {
      setError("ID de pedido no válido");
      setLoading(false);
      return;
    }

    // Configurar listener en tiempo real
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

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie el orderId
    return () => {
      unsubscribe();
    };
  }, [orderId, user, authLoading]);

  return { order, loading, error };
}
