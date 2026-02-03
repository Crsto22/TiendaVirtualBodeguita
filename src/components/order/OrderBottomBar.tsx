/**
 * OrderBottomBar Component
 * Barra inferior sticky solo para móviles con total y acciones
 */

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ESTADO_CONFIG } from "@/constants/order-config";
import { redondearTotal } from "@/lib/order-utils";
import { Order } from "@/types/order";

interface OrderBottomBarProps {
  order: Order;
  revisionTotal?: number;
  isRevision?: boolean;
  canCancelOrder?: boolean;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function OrderBottomBar({
  order,
  revisionTotal,
  isRevision = false,
  canCancelOrder = false,
  showConfirmButton = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: OrderBottomBarProps) {
  const estadoConfig = ESTADO_CONFIG[order.estado];
  const IconoEstado = estadoConfig.icon;

  const displayTotal =
    isRevision && revisionTotal !== undefined
      ? revisionTotal
      : redondearTotal(order.total_final || order.total_estimado);

  const hasPricesPending =
    !isRevision &&
    order.total_final === 0 &&
    order.total_estimado === 0 &&
    order.items.some(
      (i) =>
        i.mostrar_precio_web === false &&
        !i.is_recovered_price &&
        (!i.precio_final || i.precio_final === 0)
    );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-30 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] safe-area-pb">
      <div className="container mx-auto flex gap-3 items-center">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium mb-0.5">
            {isRevision ? "Total con cambios" : "Total del Pedido"}
          </p>
          <p className="text-xl font-extrabold text-slate-900">
            {hasPricesPending ? (
              <span className="text-lg text-orange-500">Por confirmar</span>
            ) : (
              `S/ ${displayTotal.toFixed(2)}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancelOrder && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-3 sm:px-4 h-9 rounded-xl border-red-100 text-white bg-red-500 hover:bg-red-400 hover:border-red-200 shrink-0 text-sm font-medium"
            >
              <XCircle className="size-4 sm:size-5" />
              <span className="ml-1">Cancelar</span>
            </Button>
          )}

          {showConfirmButton && onConfirm ? (
            <Button
              className="flex-1 px-6 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-200"
              onClick={onConfirm}
              disabled={isLoading}
            >
              Confirmar
            </Button>
          ) : (
            <div
              className={`px-4 py-2 rounded-xl font-bold text-sm text-center min-w-[120px] flex items-center justify-center gap-2 border ${estadoConfig.className
                .replace("bg-gradient-to-br", "bg-white")
                .replace("text-", "text-")}`}
            >
              <IconoEstado className="size-4" />
              {estadoConfig.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
