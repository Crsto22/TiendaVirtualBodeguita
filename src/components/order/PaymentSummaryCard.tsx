/**
 * PaymentSummaryCard Component
 * Resumen financiero completo con detalles de pago, redondeo y acciones
 */

import { Wallet, Recycle, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { redondearTotal } from "@/lib/order-utils";
import { Order } from "@/types/order";

interface PaymentSummaryCardProps {
  order: Order;
  revisionTotal?: number;
  isRevision?: boolean;
  canCancelOrder?: boolean;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PaymentSummaryCard({
  order,
  revisionTotal,
  isRevision = false,
  canCancelOrder = false,
  showConfirmButton = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: PaymentSummaryCardProps) {
  const subtotal = order.total_final || order.total_estimado;
  const totalRedondeado = redondearTotal(subtotal);
  const ajusteRedondeo = totalRedondeado - subtotal;
  const mostrarDesglose = subtotal > 0;

  // Para revisión, usar el total calculado dinámicamente
  const displayTotal = isRevision && revisionTotal !== undefined 
    ? revisionTotal 
    : totalRedondeado;

  const hasPricesPending = 
    order.total_final === 0 && 
    order.total_estimado === 0 && 
    order.items.some(
      (i) =>
        i.mostrar_precio_web === false &&
        !i.is_recovered_price &&
        (!i.precio_final || i.precio_final === 0)
    );

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 text-gray-700 pb-4 border-b border-gray-100">
          <div className="bg-gray-100 p-2 rounded-xl">
            <Wallet className="size-5 text-gray-600" />
          </div>
          <span className="font-semibold">Resumen de Pago</span>
        </div>

        {/* Detalles de pago */}
        <div className="space-y-3 text-sm">
          {/* Subtotal - No mostrar en revisión */}
          {mostrarDesglose && !isRevision && (
            <div className="flex justify-between items-center text-gray-600">
              <span>Subtotal productos</span>
              <span className="font-medium text-gray-900">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>
          )}

          {/* Redondeo - Solo si hay ajuste y no es revisión */}
          {ajusteRedondeo !== 0 && subtotal > 0 && !isRevision && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ajuste por redondeo</span>
              <span
                className={`font-semibold ${
                  ajusteRedondeo > 0 ? "text-orange-600" : "text-green-600"
                }`}
              >
                {ajusteRedondeo > 0 ? "+" : ""}S/ {ajusteRedondeo.toFixed(2)}
              </span>
            </div>
          )}

          {/* Método de pago */}
          {order.pago?.metodo && (
            <div className="flex justify-between items-center text-gray-600">
              <span>Método</span>
              <span className="font-medium text-gray-900 capitalize flex items-center gap-2">
                {order.pago.metodo === "yape" ? (
                  <>
                    <Image
                      src="/MetodoPago/Yape.png"
                      alt="Yape"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    Yape
                  </>
                ) : (
                  "Efectivo"
                )}
              </span>
            </div>
          )}

          {/* Paga con (efectivo) */}
          {order.pago?.metodo === "efectivo" && order.pago.monto_paga_con && (
            <>
              <div className="flex justify-between items-center text-gray-600">
                <span>Paga con</span>
                <span className="font-medium text-gray-900">
                  S/ {order.pago.monto_paga_con.toFixed(2)}
                  {(order.vuelto === 0 ||
                    order.vuelto === null ||
                    Math.abs(
                      order.pago.monto_paga_con -
                        (order.total_final || order.total_estimado)
                    ) < 0.05) && (
                    <span className="ml-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      (Completo)
                    </span>
                  )}
                </span>
              </div>
              {order.vuelto && order.vuelto > 0 ? (
                <div className="flex justify-between items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <span>Vuelto a recibir</span>
                  <span className="font-bold">S/ {order.vuelto.toFixed(2)}</span>
                </div>
              ) : null}
            </>
          )}

          {/* Envases retornables */}
          {order.envases_retornables > 0 && (
            <div className="flex justify-between items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">
                <Recycle className="size-3" /> Envases
              </span>
              <span className="font-bold">{order.envases_retornables} u.</span>
            </div>
          )}
        </div>

        {/* Total Grande */}
        <div className="pt-4 border-t border-gray-100 mt-2">
          {isRevision ? (
            <div className="flex justify-between items-end">
              <span className="text-orange-700 font-semibold text-sm mb-1">
                Total tras cambios
              </span>
              <span className="text-3xl font-bold text-orange-600 tracking-tight">
                S/ {displayTotal.toFixed(2)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-medium text-sm mb-1">
                  {order.total_final && order.total_final > 0
                    ? "Total"
                    : "Total Estimado"}
                </span>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {hasPricesPending ? (
                    <span className="text-xl text-orange-500">Por confirmar</span>
                  ) : (
                    `S/ ${displayTotal.toFixed(2)}`
                  )}
                </span>
              </div>
              {order.requiere_confirmacion && (
                <p className="text-xs text-darkblue mt-2 flex items-start gap-1.5 bg-gray-100 p-2 rounded-lg border border-gray-200">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-red-500" />
                  El precio final podría variar tras la revisión.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Botón de Confirmar Cambios (Desktop) */}
      {showConfirmButton && onConfirm && (
        <div className="hidden lg:block bg-gradient-to-b from-orange-50 to-white p-4 border-t border-orange-100">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl shadow-lg shadow-orange-500/20 font-bold tracking-wide transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="mr-2 size-5" />
            Confirmar Cambios
          </Button>
        </div>
      )}

      {/* Botón de Cancelar (Desktop) */}
      {canCancelOrder && onCancel && (
        <div className="hidden lg:block bg-gray-50 p-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full bg-white hover:bg-red-50 text-red-600 border-red-100 hover:border-red-200 h-11 rounded-xl shadow-sm hover:shadow transition-all"
          >
            Cancelar Pedido
          </Button>
        </div>
      )}
    </div>
  );
}
