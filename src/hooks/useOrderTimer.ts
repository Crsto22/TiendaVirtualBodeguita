/**
 * Custom Hook: useOrderTimer
 * Maneja el temporizador de expiración para pedidos en estado de confirmación
 * Calcula tiempo restante y muestra advertencias
 */

import { useState, useEffect, useRef } from "react";
import { Order } from "@/types/order";
import { toast } from "sonner";

interface UseOrderTimerReturn {
  timeRemaining: number | null;
  isExpired: boolean;
  minutes: number;
  seconds: number;
}

export function useOrderTimer(order: Order | null): UseOrderTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const warningShownRef = useRef(false);

  useEffect(() => {
    // Solo calcular tiempo si el pedido existe y tiene fecha de expiración
    if (!order || !order.expira_en) {
      setTimeRemaining(null);
      setIsExpired(false);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expiraEn: any = order.expira_en;
      const expirationTime = expiraEn.toDate
        ? expiraEn.toDate().getTime()
        : new Date(expiraEn).getTime();
      const remaining = Math.max(0, expirationTime - now);

      // Verificar si ha expirado
      if (remaining === 0 && order.estado === "esperando_confirmacion") {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }

      // Mostrar advertencia a los 15 segundos (solo una vez)
      if (
        remaining <= 15000 &&
        remaining > 0 &&
        !warningShownRef.current
      ) {
        toast.warning("El pedido expirará pronto", {
          description: "En 15 segundos se cancelará automáticamente el pedido.",
        });
        warningShownRef.current = true;
      }

      setTimeRemaining(remaining);
    };

    // Calcular inmediatamente
    calculateTimeRemaining();

    // Actualizar cada segundo
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [order]);

  // Formatear tiempo restante en minutos y segundos
  const formatTimeRemaining = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
  };

  const { minutes, seconds } =
    timeRemaining !== null
      ? formatTimeRemaining(timeRemaining)
      : { minutes: 0, seconds: 0 };

  return {
    timeRemaining,
    isExpired,
    minutes,
    seconds,
  };
}
