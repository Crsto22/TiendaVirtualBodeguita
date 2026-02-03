/**
 * Custom Hook: useOrderRevision
 * Maneja el estado completo de la revisión de pedidos
 * Incluye sustitutos, método de pago y cálculos de total
 */

import { useState, useCallback, useMemo } from "react";
import { Order } from "@/types/order";
import {
  calcularPrecioSubstituto,
  esPropouestaFija,
  obtenerCantidadSubstituto,
} from "@/lib/order-utils";

interface UseOrderRevisionReturn {
  // Estados de selección de sustitutos
  substituteSelections: Record<string, Record<string, number>>;
  canceledItems: Record<string, boolean>;

  // Estados de método de pago
  revisionPaymentMethod: "efectivo" | "yape" | null;
  revisionPagaCon: string;
  pagoCompletoRevision: boolean;

  // Métodos para actualizar sustitutos
  updateSubstituteQty: (
    parentId: string,
    substituteId: string,
    quantity: number
  ) => void;
  toggleCancelItem: (parentId: string) => void;
  clearSubstitutes: (parentId: string) => void;

  // Métodos para actualizar pago
  setRevisionPaymentMethod: (method: "efectivo" | "yape" | null) => void;
  setRevisionPagaCon: (amount: string) => void;
  setPagoCompletoRevision: (isComplete: boolean) => void;

  // Cálculo de total
  calculateRevisionTotal: () => number;
}

export function useOrderRevision(
  order: Order | null
): UseOrderRevisionReturn {
  // Estados de sustitutos
  const [substituteSelections, setSubstituteSelections] = useState<
    Record<string, Record<string, number>>
  >({});
  const [canceledItems, setCanceledItems] = useState<Record<string, boolean>>(
    {}
  );

  // Estados de método de pago
  const [revisionPaymentMethod, setRevisionPaymentMethod] = useState<
    "efectivo" | "yape" | null
  >(null);
  const [revisionPagaCon, setRevisionPagaCon] = useState<string>("");
  const [pagoCompletoRevision, setPagoCompletoRevision] =
    useState<boolean>(false);

  // Inicializar método de pago si el pedido ya tiene uno
  useState(() => {
    if (
      order &&
      (order.estado === "esperando_confirmacion" ||
        order.pago?.rechazo_vuelto) &&
      order.pago
    ) {
      setRevisionPaymentMethod(order.pago.metodo);
      setRevisionPagaCon(
        order.pago.monto_paga_con
          ? order.pago.monto_paga_con.toString()
          : ""
      );
    }
  });

  /**
   * Actualiza la cantidad de un sustituto seleccionado
   */
  const updateSubstituteQty = useCallback(
    (parentId: string, substituteId: string, quantity: number) => {
      // Si el item está cancelado, descancelarlo al seleccionar sustituto
      if (canceledItems[parentId]) {
        setCanceledItems((prev) => ({ ...prev, [parentId]: false }));
      }

      setSubstituteSelections((prev) => {
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
            [substituteId]: quantity,
          },
        };
      });
    },
    [canceledItems]
  );

  /**
   * Marca/desmarca un item para cancelación
   */
  const toggleCancelItem = useCallback((parentId: string) => {
    setCanceledItems((prev) => {
      const isCanceling = !prev[parentId];
      // Si cancelamos el item, limpiamos sus sustitutos seleccionados
      if (isCanceling) {
        setSubstituteSelections((curr) => {
          const next = { ...curr };
          delete next[parentId];
          return next;
        });
      }
      return { ...prev, [parentId]: isCanceling };
    });
  }, []);

  /**
   * Limpia las selecciones de sustitutos (opción "Solo lo que hay")
   */
  const clearSubstitutes = useCallback((parentId: string) => {
    setSubstituteSelections((prev) => {
      const { [parentId]: _, ...rest } = prev;
      return rest;
    });
    setCanceledItems((prev) => ({ ...prev, [parentId]: false }));
  }, []);

  /**
   * Calcula el total del pedido considerando cambios de revisión
   */
  const calculateRevisionTotal = useCallback(() => {
    if (!order) return 0;
    let currentTotal = 0;

    // Helper interno para sumar sustitutos seleccionados
    const sumarSubstitutos = (itemId: string) => {
      const selections = substituteSelections[itemId] || {};
      const subs = order.items.filter(
        (s) => s.es_sustituto && s.sustituye_a === itemId
      );
      Object.entries(selections).forEach(([subId, qty]) => {
        const sub = subs.find((s) => s.itemId === subId);
        if (sub && qty > 0) {
          currentTotal += calcularPrecioSubstituto(sub, qty);
        }
      });
    };

    order.items.forEach((i) => {
      if (i.es_sustituto) return;
      if (canceledItems[i.itemId]) return;

      if (i.estado_item === "stock_parcial") {
        currentTotal +=
          (Number(i.precio_base) || 0) * (i.cantidad_final || 0);
        sumarSubstitutos(i.itemId);
      } else if (i.estado_item === "sin_stock") {
        sumarSubstitutos(i.itemId);
      } else {
        const unitPrice =
          i.precio_helada && i.cantidad_helada > 0
            ? Number(i.precio_helada)
            : Number(i.precio_base);
        currentTotal += unitPrice * Number(i.cantidad_solicitada);
      }
    });

    return currentTotal;
  }, [order, substituteSelections, canceledItems]);

  return {
    // Estados
    substituteSelections,
    canceledItems,
    revisionPaymentMethod,
    revisionPagaCon,
    pagoCompletoRevision,

    // Métodos de sustitutos
    updateSubstituteQty,
    toggleCancelItem,
    clearSubstitutes,

    // Métodos de pago
    setRevisionPaymentMethod,
    setRevisionPagaCon,
    setPagoCompletoRevision,

    // Cálculo
    calculateRevisionTotal,
  };
}
