/**
 * Funciones de validación para pedidos
 * Valida métodos de pago, montos y decisiones de sustitutos
 */

import { Order } from "@/types/order";
import { redondearTotal } from "./order-utils";

/**
 * Valida que se haya seleccionado un método de pago
 * @param metodo Método de pago seleccionado
 * @returns Objeto con resultado de validación
 */
export function validarMetodoPago(metodo: "efectivo" | "yape" | null): {
  valido: boolean;
  mensaje?: string;
} {
  if (!metodo) {
    return {
      valido: false,
      mensaje: "Debes seleccionar un método de pago para el nuevo total",
    };
  }
  return { valido: true };
}

/**
 * Valida que el monto de efectivo sea suficiente para cubrir el total
 * @param pagaCon Monto con el que paga el cliente
 * @param total Total del pedido
 * @returns Objeto con resultado de validación
 */
export function validarMontoEfectivo(
  pagaCon: string,
  total: number
): {
  valido: boolean;
  mensaje?: string;
} {
  const monto = parseFloat(pagaCon);
  const totalRedondeado = redondearTotal(total);

  if (isNaN(monto)) {
    return {
      valido: false,
      mensaje: "El monto ingresado no es válido",
    };
  }

  if (monto < totalRedondeado) {
    return {
      valido: false,
      mensaje: `El monto con el que pagas debe ser mayor o igual al total (S/ ${totalRedondeado.toFixed(2)})`,
    };
  }

  return { valido: true };
}

/**
 * Valida que se haya tomado una decisión para todos los items con problemas de stock
 * @param order Orden actual
 * @param substituteSelections Selecciones de sustitutos
 * @param canceledItems Items marcados para cancelar
 * @returns Objeto con resultado de validación
 */
export function validarDecisionesSubstitutos(
  order: Order,
  substituteSelections: Record<string, Record<string, number>>,
  canceledItems: Record<string, boolean>
): {
  valido: boolean;
  mensaje?: string;
  itemsPendientes: string[];
} {
  const mainItems = order.items.filter((i) => !i.es_sustituto);
  const itemsPendientes: string[] = [];

  mainItems.forEach((item) => {
    const hasSubstitutes = order.items.some(
      (s) => s.es_sustituto && s.sustituye_a === item.itemId
    );
    const isProblem =
      item.estado_item === "sin_stock" || item.estado_item === "stock_parcial";

    // Si no hay problema de stock, no requiere decisión
    if (!isProblem || !hasSubstitutes) return;

    const isCanceled = canceledItems[item.itemId];
    const hasSelections =
      substituteSelections[item.itemId] &&
      Object.keys(substituteSelections[item.itemId]).length > 0;

    // Para items sin stock total, debe elegir algo o cancelar
    if (item.estado_item === "sin_stock" && !isCanceled && !hasSelections) {
      // Permitimos que se auto-cancele si no hace nada
      // itemsPendientes.push(item.nombre);
    }

    // Para stock parcial, puede aceptar lo disponible sin elegir sustitutos
  });

  if (itemsPendientes.length > 0) {
    return {
      valido: false,
      mensaje: "Por favor selecciona una opción para todos los productos agotados",
      itemsPendientes,
    };
  }

  return { valido: true, itemsPendientes: [] };
}

/**
 * Valida el estado completo antes de confirmar una revisión
 * @param params Parámetros de validación
 * @returns Objeto con resultado de validación completa
 */
export function validarConfirmacionRevision(params: {
  order: Order;
  metodo: "efectivo" | "yape" | null;
  pagaCon: string;
  total: number;
  substituteSelections: Record<string, Record<string, number>>;
  canceledItems: Record<string, boolean>;
}): {
  valido: boolean;
  mensaje?: string;
} {
  const { order, metodo, pagaCon, total, substituteSelections, canceledItems } =
    params;

  // 1. Validar método de pago
  const validacionMetodo = validarMetodoPago(metodo);
  if (!validacionMetodo.valido) {
    return validacionMetodo;
  }

  // 2. Validar monto si es efectivo
  if (metodo === "efectivo") {
    const validacionMonto = validarMontoEfectivo(pagaCon, total);
    if (!validacionMonto.valido) {
      return validacionMonto;
    }
  }

  // 3. Validar decisiones de sustitutos (opcional, comentado por ahora)
  // const validacionSubstitutos = validarDecisionesSubstitutos(
  //   order,
  //   substituteSelections,
  //   canceledItems
  // );
  // if (!validacionSubstitutos.valido) {
  //   return validacionSubstitutos;
  // }

  return { valido: true };
}
