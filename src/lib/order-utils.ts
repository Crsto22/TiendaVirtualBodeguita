import { CartItem } from "@/types/product";
import { CreateOrderData, OrderItem } from "@/types/order";

/**
 * Convierte los items del carrito a items de pedido
 * @param cartItems Items del carrito de Zustand
 * @returns Items preparados para el pedido
 */
// Palabras clave para detectar bebidas si no está configurado explícitamente
const BEVERAGE_KEYWORDS = [
  "gaseosa", "agua", "cerveza", "bebida", "refresco", "jugo", "nectar",
  "sporade", "powerade", "volt", "cifrut", "monster", "red bull", "maltin",
  "guarana", "coca cola", "inca kola", "pepsi", "sprite", "fanta", "7up", "crush",
  "concordia", "san luis", "cielo", "loa", "san mateo", "pilsen", "cristal",
  "cusqueña", "trujillo", "arequipeña", "corona", "heineken", "stella", "budweiser",
  "vino", "ron", "whisky", "pisco", "vodka", "tequila", "licor", "trago", "rehidratante",
  "frugos", "pulp", "bio", "electrolight"
];

function isBeverage(item: CartItem): boolean {
  // 1. Configuración explícita de frío
  if (item.has_precio_alternativo && item.motivo_precio_alternativo === "Helada") return true;
  if (item.cantidad_helada && item.cantidad_helada > 0) return true;

  // 2. Búsqueda por palabras clave
  const textToSearch = (item.nombre + " " + (item.categoria_nombre || "")).toLowerCase();
  return BEVERAGE_KEYWORDS.some(k => textToSearch.includes(k));
}

export function convertCartItemsToOrderItems(
  cartItems: CartItem[]
): Omit<OrderItem, "itemId" | "estado_item" | "requiere_confirmacion">[] {
  return cartItems.flatMap((item) => {
    const cantidadHelada = item.cantidad_helada || 0;
    const cantidadNormal = item.cantidad - cantidadHelada;
    const esBebida = isBeverage(item);

    // Caso 1: Mezcla de heladas y normales -> Separar en dos items
    if (cantidadHelada > 0 && cantidadNormal > 0) {
      const itemHelado = {
        productoId: item.id,
        nombre: `${item.nombre} (Helada)`,
        imagen: item.imagen || null,
        tipo_unidad: item.tipo_unidad as "unidad" | "kilogramo",
        cantidad_solicitada: cantidadHelada,
        cantidad_helada: cantidadHelada,
        detalle: item.detalle || null,
        precio_base: item.precio,
        precio_helada: item.precio_alternativo || null,
        mostrar_precio_web: item.mostrar_precio_web !== false,
        es_retornable: item.retornable || false,
        es_bebida: true,
      };

      const itemNormal = {
        productoId: item.id,
        nombre: item.nombre,
        imagen: item.imagen || null,
        tipo_unidad: item.tipo_unidad as "unidad" | "kilogramo",
        cantidad_solicitada: cantidadNormal,
        cantidad_helada: 0,
        detalle: item.detalle || null,
        precio_base: item.precio,
        precio_helada: item.precio_alternativo || null,
        mostrar_precio_web: item.mostrar_precio_web !== false,
        es_retornable: item.retornable || false,
        es_bebida: true, // Sigue siendo bebida aunque no sea helada
      };

      return [itemHelado, itemNormal];
    }

    // Caso 2: Todo helado o Todo normal (o sin opción de frío)
    return [{
      productoId: item.id,
      nombre: (cantidadHelada > 0 && cantidadHelada === item.cantidad) ? `${item.nombre} (Helada)` : item.nombre,
      imagen: item.imagen || null,
      tipo_unidad: item.tipo_unidad as "unidad" | "kilogramo",
      cantidad_solicitada: item.cantidad,
      cantidad_helada: cantidadHelada,
      detalle: item.detalle || null,
      precio_base: item.precio,
      precio_helada: item.precio_alternativo || null,
      mostrar_precio_web: item.mostrar_precio_web !== false,
      es_retornable: item.retornable || false,
      es_bebida: esBebida,
    }];
  });
}

/**
 * Calcula el total estimado del carrito considerando precios helados
 * @param cartItems Items del carrito
 * @returns Total estimado
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    // Si no muestra precio web, no sumarlo al total estimado
    if (item.mostrar_precio_web === false) {
      return total;
    }

    const precioBase = item.precio || 0;
    const cantidadHelada = item.cantidad_helada || 0;

    // Verificar si es bebida helada con precio alternativo
    const esBebidaHelada =
      item.has_precio_alternativo &&
      item.motivo_precio_alternativo === "Helada" &&
      item.precio_alternativo &&
      cantidadHelada > 0;

    if (esBebidaHelada) {
      // Calcular: (cantidad normal * precio normal) + (cantidad helada * precio helado)
      const cantidadNormal = item.cantidad - cantidadHelada;
      const precioNormal = cantidadNormal * precioBase;
      const precioHelado = cantidadHelada * (item.precio_alternativo || precioBase);
      return total + precioNormal + precioHelado;
    }

    // Precio normal para todos los demás productos
    return total + precioBase * item.cantidad;
  }, 0);
}

/**
 * Cuenta el total de envases retornables en el carrito
 * @param cartItems Items del carrito
 * @returns Cantidad de envases retornables
 */
export function countReturnableBottles(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    if (item.retornable) {
      return total + item.cantidad;
    }
    return total;
  }, 0);
}

/**
 * Valida que el carrito tenga productos con precio para calcular el total
 * @param cartItems Items del carrito
 * @returns true si hay al menos un producto con precio visible
 */
export function hasVisiblePrices(cartItems: CartItem[]): boolean {
  return cartItems.some((item) => item.mostrar_precio_web !== false && item.precio !== null);
}
