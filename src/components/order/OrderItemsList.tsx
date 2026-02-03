/**
 * OrderItemsList Component
 * Wrapper para la lista de productos, filtra y pasa props a OrderItem
 */

import { ShoppingBag } from "lucide-react";
import { OrderItem } from "./order-item";
import { Order, OrderItem as IOrderItem } from "@/types/order";

interface OrderItemsListProps {
  order: Order;
  isEditing: boolean;
  substituteSelections: Record<string, Record<string, number>>;
  canceledItems: Record<string, boolean>;
  onUpdateItem: (itemId: string, updates: Partial<IOrderItem>) => void;
  onDeleteItem: (item: IOrderItem) => void;
  onUpdateSubstituteQty: (parentId: string, subId: string, qty: number) => void;
  onToggleCancelItem: (parentId: string) => void;
  onClearSubstitutes: (parentId: string) => void;
  onShowCancelModal: () => void;
}

export function OrderItemsList({
  order,
  isEditing,
  substituteSelections,
  canceledItems,
  onUpdateItem,
  onDeleteItem,
  onUpdateSubstituteQty,
  onToggleCancelItem,
  onClearSubstitutes,
  onShowCancelModal,
}: OrderItemsListProps) {
  // Filtrar solo items principales (no sustitutos)
  const mainItems = order.items.filter((item) => !item.es_sustituto);

  return (
    <div className="space-y-6">
      {/* Cabecera de Lista */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          Productos{" "}
          <span className="text-gray-400 text-sm font-normal">
            ({mainItems.length})
          </span>
        </h3>
      </div>

      {/* Lista de Items */}
      <div className="space-y-4">
        {mainItems.map((item) => {
          const subs = order.items.filter(
            (i) => i.es_sustituto && i.sustituye_a === item.itemId
          );

          return (
            <OrderItem
              key={item.itemId}
              item={item}
              order={order}
              orderState={order.estado}
              isEditing={isEditing}
              substitutes={subs}
              substituteSelections={substituteSelections}
              canceledItems={canceledItems}
              onUpdateItem={onUpdateItem}
              onDelete={onDeleteItem}
              onUpdateSubstituteQty={onUpdateSubstituteQty}
              onToggleCancelItem={onToggleCancelItem}
              onClearSubstitutes={onClearSubstitutes}
              onShowCancelModal={onShowCancelModal}
            />
          );
        })}
      </div>
    </div>
  );
}
