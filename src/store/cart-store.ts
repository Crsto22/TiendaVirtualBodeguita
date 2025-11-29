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
          // Si el item ya existe, incrementar cantidad (respetando stock)
          set({
            items: items.map(item =>
              item.id === newItem.id
                ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) }
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
          items: get().items.map(item =>
            item.id === id
              ? { ...item, cantidad: Math.min(cantidad, item.stock) }
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
          const precio = item.has_precio_alternativo && item.precio_alternativo
            ? item.precio_alternativo
            : (item.precio || 0);
          return total + (precio * item.cantidad);
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
