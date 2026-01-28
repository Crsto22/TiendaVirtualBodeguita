import { Timestamp } from "firebase/firestore";

// Estados posibles del pedido
export type EstadoPedido =
  | "pendiente"
  | "en_revision"
  | "esperando_confirmacion"
  | "confirmada"
  | "preparando"
  | "lista"
  | "entregada"
  | "cancelada";

// Método de pago
export type MetodoPago = "efectivo" | "yape";

// Estado del item individual
export type EstadoItem =
  | "disponible"
  | "stock_insuficiente"
  | "sin_stock"
  | "stock_parcial"
  | "peso_insuficiente"
  | "modificado"
  | "cancelado";

// Tipo de alternativa
export type TipoAlternativa =
  | "marca_equivalente"
  | "otra_presentacion"
  | "otro_tamano"
  | "opcion_vaso";

// Tipo de decisión del cliente
export type TipoDecisionCliente =
  | "aceptar_disponible"
  | "cambiar_a_alternativa"
  | "cancelar_item";

// Alternativa de producto sugerida por el vendedor
export interface ProductoAlternativa {
  alternativaId: string;
  productoId: string;
  nombre: string;
  imagen: string | null;
  tipo_alternativa: TipoAlternativa;
  descripcion: string;
  cantidad_disponible: number;
  precio: number;
  es_retornable: boolean;
}

// Decisión del cliente sobre un item con problemas
export interface DecisionCliente {
  tipo: TipoDecisionCliente;
  alternativa_id?: string;
  fecha: Timestamp | Date;
}

// Item del pedido
export interface OrderItem {
  itemId: string;
  productoId: string;
  nombre: string;
  imagen: string | null;
  tipo_unidad: "unidad" | "kilogramo";

  // Cantidades solicitadas por el cliente
  cantidad_solicitada: number;
  cantidad_helada: number;
  peso_solicitado_gramos?: number;
  detalle?: string | null; // Detalle de la selección del cliente (ej: "250 g", "3 unid")

  // Precios base
  precio_base: number | null;
  precio_helada?: number | null;
  mostrar_precio_web: boolean;
  es_retornable: boolean;
  es_bebida?: boolean;

  // Estado del item (lo completa el vendedor)
  estado_item: EstadoItem;
  stock_disponible?: number;
  peso_disponible_gramos?: number;
  motivo_problema?: string;

  // Alternativas sugeridas por el vendedor
  alternativas?: ProductoAlternativa[];

  // Decisión del cliente (cuando hay problemas)
  decision_cliente?: DecisionCliente;

  // Datos finales (después de confirmación)
  productoId_final?: string;
  nombre_final?: string;
  cantidad_final?: number;
  peso_final_gramos?: number;
  precio_final?: number;
  subtotal_final?: number;

  requiere_confirmacion: boolean;
  es_sustituto?: boolean;
  sustituye_a?: string;
  is_recovered_price?: boolean;
}

// Información del cliente
export interface ClienteInfo {
  nombre: string;
  telefono: string;
  email: string;
  foto_url?: string;
}

// Información de pago
export interface PagoInfo {
  metodo: MetodoPago;
  monto_paga_con?: number; // Solo si paga en efectivo
  comprobante_url?: string; // URL del comprobante de Yape
  rechazo_vuelto?: boolean; // Si el vendedor rechaza el monto por falta de vuelto
}

// Registro en historial de estados
export interface HistorialEstado {
  estado: EstadoPedido;
  fecha: Timestamp | Date;
  comentario?: string;
}

// Pedido completo
export interface Order {
  orderId: string;
  userId: string;
  numeroOrden: string;

  // Estado y fechas
  estado: EstadoPedido;
  fecha_creacion: Timestamp | Date;
  fecha_actualizacion: Timestamp | Date;
  expira_en?: Timestamp | Date | null;

  // Información del cliente
  cliente: ClienteInfo;

  // Información de pago
  pago: PagoInfo;

  // Items del pedido
  items: OrderItem[];

  // Totales
  total_estimado: number;
  total_final?: number;
  vuelto?: number;

  // Envases retornables
  envases_retornables: number;

  // Control de confirmación
  requiere_confirmacion: boolean;
  items_con_problemas?: string[];
  mensaje_vendedor?: string;

  // Notas
  notas_cliente?: string;
  notas_vendedor?: string;

  // Historial de estados
  historial: HistorialEstado[];
}

// Datos para crear un nuevo pedido (desde el carrito)
export interface CreateOrderData {
  cliente: ClienteInfo;
  pago: PagoInfo;
  items: Omit<OrderItem, "itemId" | "estado_item" | "requiere_confirmacion">[];
  total_estimado: number;
  envases_retornables: number;
  notas_cliente?: string;
}
