import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/product';

// Interface del estado del carrito
interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Acciones
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  updateCantidadHelada: (id: string, cantidadHelada: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Agregar item al carrito
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === newItem.id);

        if (existingItem) {
          // Si el item ya existe, incrementar cantidad sin límite
          set({
            items: items.map(item =>
              item.id === newItem.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            ),
          });
        } else {
          // Si es nuevo, agregarlo con cantidad 1
          set({
            items: [...items, { ...newItem, cantidad: 1 }],
          });
        }
        // NO abrimos el carrito automáticamente
      },

      // Eliminar item del carrito
      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id),
        });
      },

      // Actualizar cantidad de un item
      updateQuantity: (id, cantidad) => {
        if (cantidad <= 0) {
          // Si la cantidad es 0 o menos, eliminar el item
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map(item => {
            if (item.id === id) {
              // Sin límite de cantidad
              const newCantidad = cantidad;
              // Si la cantidad helada es mayor que la nueva cantidad, ajustarla
              const newCantidadHelada = item.cantidad_helada ? Math.min(item.cantidad_helada, newCantidad) : 0;
              return { ...item, cantidad: newCantidad, cantidad_helada: newCantidadHelada };
            }
            return item;
          }),
        });
      },

      // Actualizar cantidad de bebidas heladas
      updateCantidadHelada: (id, cantidadHelada) => {
        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, cantidad_helada: Math.max(0, Math.min(cantidadHelada, item.cantidad)) }
              : item
          ),
        });
      },

      // Limpiar todo el carrito
      clearCart: () => {
        set({ items: [] });
      },

      // Toggle del sidebar del carrito
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      // Abrir carrito
      openCart: () => {
        set({ isOpen: true });
      },

      // Cerrar carrito
      closeCart: () => {
        set({ isOpen: false });
      },

      // Obtener total de items (suma de cantidades)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      // Obtener subtotal (sin delivery)
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          // Precio base
          const precioBase = item.precio || 0;
          
          // Verificar si es bebida helada (solo si motivo es "Helada")
          const esBebidaHelada = item.has_precio_alternativo && 
                                 item.motivo_precio_alternativo === 'Helada' &&
                                 item.precio_alternativo &&
                                 (item.cantidad_helada || 0) > 0;
          
          if (esBebidaHelada) {
            // Calcular: (cantidad normal * precio normal) + (cantidad helada * precio helado)
            const cantidadNormal = item.cantidad - (item.cantidad_helada || 0);
            const precioNormal = cantidadNormal * precioBase;
            const precioHelado = (item.cantidad_helada || 0) * (item.precio_alternativo || precioBase);
            return total + precioNormal + precioHelado;
          }
          
          // Precio normal para todos los demás productos
          return total + (precioBase * item.cantidad);
        }, 0);
      },

      // Obtener total (con delivery si aplica)
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const delivery = 0; // Por ahora delivery gratis
        return subtotal + delivery;
      },
    }),
    {
      name: 'vanesa-cart-storage', // Nombre en localStorage
      storage: createJSONStorage(() => localStorage), // Usar localStorage
    }
  )
);
