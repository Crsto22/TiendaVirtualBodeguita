/**
 * Custom Hook: useOrderActions
 * Maneja todas las acciones relacionadas con pedidos
 * Incluye: cancelar, actualizar items, eliminar items y aceptar revisión
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Order, OrderItem } from "@/types/order";
import { toast } from "sonner";
import {
  redondearTotal,
  calcularPrecioSubstituto,
  obtenerCantidadSubstituto,
  esPropouestaFija,
} from "@/lib/order-utils";
import { validarConfirmacionRevision } from "@/lib/order-validations";

interface UseOrderActionsParams {
  order: Order | null;
  substituteSelections: Record<string, Record<string, number>>;
  canceledItems: Record<string, boolean>;
  revisionPaymentMethod: "efectivo" | "yape" | null;
  revisionPagaCon: string;
  calculateRevisionTotal: () => number;
}

interface UseOrderActionsReturn {
  // Estados de carga
  isCancelling: boolean;
  isUpdating: boolean;

  // Acciones
  cancelOrder: () => Promise<void>;
  updateItem: (itemId: string, updates: Partial<OrderItem>) => Promise<void>;
  deleteItem: (item: OrderItem, onSuccess?: () => void) => Promise<void>;
  acceptRevision: () => Promise<void>;
}

export function useOrderActions({
  order,
  substituteSelections,
  canceledItems,
  revisionPaymentMethod,
  revisionPagaCon,
  calculateRevisionTotal,
}: UseOrderActionsParams): UseOrderActionsReturn {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Cancela (elimina) el pedido completo
   */
  const cancelOrder = useCallback(async () => {
    if (!order) return;

    setIsCancelling(true);
    try {
      const orderRef = doc(db, "pedidos", order.orderId);
      await deleteDoc(orderRef);

      toast.success("Pedido eliminado correctamente");

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/inicio");
      }, 500);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      toast.error("Error al eliminar el pedido");
    } finally {
      setIsCancelling(false);
    }
  }, [order, router]);

  /**
   * Actualiza un item individual del pedido
   */
  const updateItem = useCallback(
    async (itemId: string, updates: Partial<OrderItem>) => {
      if (!order) return;

      try {
        const updatedItems = order.items.map((i) => {
          if (i.itemId === itemId) {
            return { ...i, ...updates };
          }
          return i;
        });

        const newTotal = updatedItems.reduce(
          (acc, i) => acc + (i.precio_final || 0),
          0
        );

        await updateDoc(doc(db, "pedidos", order.orderId), {
          items: updatedItems,
          total_estimado: newTotal,
        });
      } catch (err) {
        console.error("Error al actualizar item:", err);
        toast.error("Error al actualizar producto");
      }
    },
    [order]
  );

  /**
   * Elimina un item del pedido
   */
  const deleteItem = useCallback(
    async (item: OrderItem, onSuccess?: () => void) => {
      if (!order) return;

      try {
        const updatedItems = order.items.filter(
          (i) => i.itemId !== item.itemId
        );
        const newTotal = updatedItems.reduce(
          (acc, i) => acc + (i.precio_final || 0),
          0
        );

        await updateDoc(doc(db, "pedidos", order.orderId), {
          items: updatedItems,
          total_estimado: newTotal,
        });

        toast.success("Producto eliminado del pedido");
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Error al eliminar item:", err);
        toast.error("Error al eliminar producto");
      }
    },
    [order]
  );

  /**
   * Acepta la revisión del pedido y actualiza todos los cambios
   */
  const acceptRevision = useCallback(async () => {
    if (!order) return;

    const total = calculateRevisionTotal();

    // Validar antes de proceder
    const validacion = validarConfirmacionRevision({
      order,
      metodo: revisionPaymentMethod,
      pagaCon: revisionPagaCon,
      total,
      substituteSelections,
      canceledItems,
    });

    if (!validacion.valido) {
      toast.error(validacion.mensaje || "Error en la validación");
      return;
    }

    setIsUpdating(true);
    try {
      const newItems: any[] = [];
      let newTotal = 0;

      const mainItems = order.items.filter((i) => !i.es_sustituto);
      const substitutes = order.items.filter((i) => i.es_sustituto);

      mainItems.forEach((item) => {
        // Si está cancelado, no lo agregamos
        if (canceledItems[item.itemId]) {
          return;
        }

        // Sin stock total
        if (item.estado_item === "sin_stock") {
          const selections = substituteSelections[item.itemId] || {};
          const selectedSubIds = Object.keys(selections);

          if (selectedSubIds.length > 0) {
            selectedSubIds.forEach((subID, index) => {
              const subItem = substitutes.find((s) => s.itemId === subID);
              const finalQty = selections[subID];

              if (subItem && finalQty > 0) {
                const precioCalculado = calcularPrecioSubstituto(
                  subItem,
                  finalQty
                );
                const cantidadFinal = obtenerCantidadSubstituto(
                  subItem,
                  finalQty
                );

                const newItem = {
                  ...subItem,
                  itemId:
                    index === 0
                      ? item.itemId
                      : `sub-${item.itemId}-${Date.now()}-${index}`,
                  cantidad_solicitada: cantidadFinal,
                  cantidad_final: cantidadFinal,
                  precio_final: precioCalculado,
                  estado_item: "disponible",
                  es_sustituto: false,
                  sustituye_a: undefined,
                };
                delete (newItem as any).sustituye_a;
                newItems.push(newItem);
                newTotal += precioCalculado;
              }
            });
          }
        }
        // Stock parcial
        else if (item.estado_item === "stock_parcial") {
          // Agregar item reducido
          const reducedItem = {
            ...item,
            cantidad_solicitada: item.cantidad_final || 0,
            estado_item: "modificado",
            precio_final:
              (Number(item.precio_base) || 0) * (item.cantidad_final || 0),
          };
          newItems.push(reducedItem);
          newTotal += Number(reducedItem.precio_final) || 0;

          // Agregar sustitutos seleccionados
          const selections = substituteSelections[item.itemId] || {};
          Object.entries(selections).forEach(([subID, finalQty]) => {
            const subItem = substitutes.find((s) => s.itemId === subID);
            if (subItem && finalQty > 0) {
              const precioCalculado = calcularPrecioSubstituto(
                subItem,
                finalQty
              );
              const cantidadFinal = obtenerCantidadSubstituto(
                subItem,
                finalQty
              );

              const newSubItem = {
                ...subItem,
                itemId: `sub-${item.itemId}-${Date.now()}-${subID}`,
                cantidad_solicitada: cantidadFinal,
                cantidad_final: cantidadFinal,
                precio_final: precioCalculado,
                estado_item: "disponible",
                es_sustituto: false,
                sustituye_a: undefined,
              };
              delete (newSubItem as any).sustituye_a;
              newItems.push(newSubItem);
              newTotal += precioCalculado;
            }
          });
        }
        // Item normal (sin problemas)
        else {
          const pFinal =
            item.precio_final !== undefined && item.precio_final !== null
              ? item.precio_final
              : Number(item.precio_base) * Number(item.cantidad_solicitada);
          newItems.push(item);
          newTotal += Number(pFinal) || 0;
        }
      });

      // Recalcular envases retornables
      const newEnvasesRetornables = newItems.reduce((acc, item) => {
        if (item.es_retornable) {
          return acc + (Number(item.cantidad_solicitada) || 0);
        }
        return acc;
      }, 0);

      // Aplicar redondeo
      const totalRedondeado = redondearTotal(newTotal);

      // Actualizar Firestore
      const orderRef = doc(db, "pedidos", order.orderId);
      await updateDoc(orderRef, {
        items: newItems,
        total_final: totalRedondeado,
        envases_retornables: newEnvasesRetornables,
        estado: "confirmada",
        expira_en: null,
        requiere_confirmacion: false,
        "revision.requiere_accion": false,
        "pago.metodo": revisionPaymentMethod,
        "pago.monto_paga_con":
          revisionPaymentMethod === "efectivo"
            ? parseFloat(revisionPagaCon)
            : null,
        "pago.rechazo_vuelto": false,
        vuelto:
          revisionPaymentMethod === "efectivo"
            ? parseFloat(revisionPagaCon) - totalRedondeado
            : null,
        historial: [
          ...order.historial,
          {
            estado: "confirmada",
            fecha: new Date(),
            comentario: `Cliente aceptó cambios. Pago: ${revisionPaymentMethod}`,
          },
        ],
      });

      toast.success("¡Pedido actualizado y confirmado!");
    } catch (error) {
      console.error("Error al confirmar revisión:", error);
      toast.error("Ocurrió un error al actualizar el pedido");
    } finally {
      setIsUpdating(false);
    }
  }, [
    order,
    calculateRevisionTotal,
    revisionPaymentMethod,
    revisionPagaCon,
    substituteSelections,
    canceledItems,
  ]);

  return {
    isCancelling,
    isUpdating,
    cancelOrder,
    updateItem,
    deleteItem,
    acceptRevision,
  };
}
