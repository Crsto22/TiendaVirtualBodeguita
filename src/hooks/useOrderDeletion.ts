
import { useState, useCallback } from "react";
import { OrderItem } from "@/types/order";
import { Order } from "@/types/order";

interface UseOrderDeletionParams {
    order: Order | null;
    deleteItemAction: (item: OrderItem) => Promise<void>;
}

interface UseOrderDeletionReturn {
    itemToDelete: OrderItem | null;
    setItemToDelete: (item: OrderItem | null) => void;
    showCancelModal: boolean;
    setShowCancelModal: (show: boolean) => void;
    handleRequestDelete: (item: OrderItem) => void;
    handleConfirmDelete: () => Promise<void>;
}

export function useOrderDeletion({
    order,
    deleteItemAction,
}: UseOrderDeletionParams): UseOrderDeletionReturn {
    const [itemToDelete, setItemToDelete] = useState<OrderItem | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleRequestDelete = useCallback(
        (item: OrderItem) => {
            if (!order) return;
            const activeItemsCount = order.items.filter((i) => !i.es_sustituto).length;

            // Si es el último producto, advertir cancelación de pedido
            if (activeItemsCount <= 1) {
                setShowCancelModal(true);
            } else {
                setItemToDelete(item);
            }
        },
        [order]
    );

    const handleConfirmDelete = useCallback(async () => {
        if (itemToDelete) {
            await deleteItemAction(itemToDelete);
            setItemToDelete(null);
        }
    }, [itemToDelete, deleteItemAction]);

    return {
        itemToDelete,
        setItemToDelete,
        showCancelModal,
        setShowCancelModal,
        handleRequestDelete,
        handleConfirmDelete,
    };
}
