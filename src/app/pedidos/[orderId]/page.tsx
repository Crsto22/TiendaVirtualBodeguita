"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Hooks
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderTimer } from "@/hooks/useOrderTimer";
import { useOrderRevision } from "@/hooks/useOrderRevision";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useOrderDeletion } from "@/hooks/useOrderDeletion";


// Components
import { OrderHeader } from "@/components/order/OrderHeader";
import { OrderStatusCard } from "@/components/order/OrderStatusCard";
import { OrderItemsList } from "@/components/order/OrderItemsList";
import { OrderRevisionSection } from "@/components/order/OrderRevisionSection";
import { PaymentSummaryCard } from "@/components/order/PaymentSummaryCard";
import { DeliveryInfoCard } from "@/components/order/DeliveryInfoCard";
import { YapePaymentCard } from "@/components/order/YapePaymentCard";
import { OrderBottomBar } from "@/components/order/OrderBottomBar";
import { OrderNotificationBanner } from "@/components/order/OrderNotificationBanner";

import { CancelOrderModal } from "@/components/order/cancel-order-modal";
import { PaymentRejectedModal } from "@/components/order/payment-rejected-modal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;


  // 1. Data Fetching
  const { order, loading: loadingData, error } = useOrderData(orderId);

  // 2. Timer Logic
  const { timeRemaining, isExpired, minutes, seconds } = useOrderTimer(order);

  // 3. Revision Logic (Substitutes & Payment Form)
  const {
    substituteSelections,
    canceledItems,
    revisionPaymentMethod,
    revisionPagaCon,
    pagoCompletoRevision,
    updateSubstituteQty,
    toggleCancelItem,
    clearSubstitutes,
    setRevisionPaymentMethod,
    setRevisionPagaCon,
    setPagoCompletoRevision,
    calculateRevisionTotal,
  } = useOrderRevision(order);

  // 4. Actions (Update, Delete, Cancel, Confirm)
  const {
    cancelOrder,
    updateItem,
    deleteItem,
    acceptRevision,
    isCancelling,
    isUpdating,
  } = useOrderActions({
    order,
    substituteSelections,
    canceledItems,
    revisionPaymentMethod,
    revisionPagaCon,
    calculateRevisionTotal,
  });

  // 5. Deletion Logic (Confirmation Modal)
  const {
    itemToDelete,
    setItemToDelete,
    showCancelModal,
    setShowCancelModal,
    handleRequestDelete,
    handleConfirmDelete,
  } = useOrderDeletion({ order, deleteItemAction: deleteItem });

  // derived state
  const isPaymentRejected = order?.pago?.rechazo_vuelto === true;
  const canCancelOrder =
    order?.estado === "pendiente" ||
    order?.estado === "esperando_confirmacion" ||
    isPaymentRejected;

  // -- Render States --

  // 1. Loading
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  // 2. Error
  if (error || !order) {
    let errorMessage = "No pudimos cargar la información solicitada.";
    if (error === "Pedido no encontrado" || error === "ID de pedido no válido") {
      errorMessage = "El pedido fue eliminado.";
    } else if (error === "Error al cargar el pedido") {
      errorMessage = "Es posible que el vendedor haya eliminado tu pedido.";
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 px-6">
        <div className="w-full max-w-sm sm:max-w-md text-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
            <Image
              src="/Pedidos/PedidoCancelado.png"
              alt="Pedido no encontrado"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {error || "Error"}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed px-4">
            {errorMessage}
          </p>
          <Button
            onClick={() => router.push("/inicio")}
            className="w-full max-w-xs mx-auto rounded-full text-white h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="size-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // 3. Expired
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 px-6">
        <div className="w-full max-w-sm sm:max-w-md text-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
            <Image
              src="/Pedidos/PedidoCancelado.png"
              alt="Tiempo Agotado"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            ¡Se agotó el tiempo!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed px-4">
            El tiempo de espera para confirmar tu pedido ha finalizado.
          </p>
          <Button
            onClick={() => router.push("/inicio")}
            className="w-full max-w-xs mx-auto rounded-full text-white h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            Hacer otro pedido
          </Button>
        </div>
      </div>
    );
  }

  // 4. Main Content (Orchestrator)
  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-10">
      {/* Modales */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={cancelOrder}
        isLoading={isCancelling}
      />

      <PaymentRejectedModal
        isOpen={isPaymentRejected}
        total={Math.abs(calculateRevisionTotal() - 0.01) > 0.01 ? calculateRevisionTotal() : (order.total_final || order.total_estimado)}
        paymentMethod={revisionPaymentMethod}
        payAmount={revisionPagaCon}
        isFullPayment={pagoCompletoRevision}
        onMethodChange={setRevisionPaymentMethod}
        onAmountChange={setRevisionPagaCon}
        onFullPaymentToggle={setPagoCompletoRevision}
        onConfirm={acceptRevision}
        onCancelOrder={() => setShowCancelModal(true)}
        isLoading={isUpdating}
        originalPayAmount={order.pago?.monto_paga_con}
      />

      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-red-50 p-3 rounded-full">
                <Trash2 className="size-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900">
                  ¿Eliminar producto?
                </h3>
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de quitar{" "}
                  <span className="font-semibold text-gray-700">
                    {itemToDelete.nombre}
                  </span>{" "}
                  de este pedido?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  onClick={() => setItemToDelete(null)}
                  className="w-full h-11 rounded-xl border-gray-200 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="w-full bg-red-500 hover:bg-red-600 h-11 rounded-xl cursor-pointer"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex flex-col transition-all duration-300">
        <OrderHeader
          numeroOrden={order.numeroOrden}
          timeRemaining={timeRemaining}
          minutes={minutes}
          seconds={seconds}
          showTimer={order.estado === "esperando_confirmacion"}
        />

        {/* Barra de Notificaciones Móvil (Sticky) */}
        <OrderNotificationBanner variant="mobile" />
      </div>

      {/* Barra de Notificaciones Desktop (Static) */}
      <OrderNotificationBanner variant="desktop" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">


          {/* COLUMNA IZQUIERDA (Productos) */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            {/* Tarjeta de Pago Yape (Desktop) */}
            <YapePaymentCard
              estado={order.estado}
              metodoPago={order.pago?.metodo || ""}
              className="hidden lg:flex"
            />

            {/* Lista de Productos */}
            <OrderItemsList
              order={order}
              isEditing={order.estado === "esperando_confirmacion"}
              substituteSelections={substituteSelections}
              canceledItems={canceledItems}
              onUpdateItem={(itemId, updates) => updateItem(itemId, updates)}
              onDeleteItem={handleRequestDelete}
              onUpdateSubstituteQty={updateSubstituteQty}
              onToggleCancelItem={toggleCancelItem}
              onClearSubstitutes={clearSubstitutes}
              onShowCancelModal={() => setShowCancelModal(true)}
            />

            {/* Sección de Revisión de Pago */}
            {order.estado === "esperando_confirmacion" && (
              <OrderRevisionSection
                revisionPaymentMethod={revisionPaymentMethod}
                revisionPagaCon={revisionPagaCon}
                pagoCompletoRevision={pagoCompletoRevision}
                revisionTotal={calculateRevisionTotal()}
                onMethodChange={setRevisionPaymentMethod}
                onAmountChange={setRevisionPagaCon}
                onFullPaymentToggle={setPagoCompletoRevision}
              />
            )}
          </div>

          {/* COLUMNA DERECHA (Resumen y Estado) */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Tarjeta de Estado */}
              <OrderStatusCard order={order} />

              {/* Yape Card (Mobile) */}
              <YapePaymentCard
                estado={order.estado}
                metodoPago={order.pago?.metodo || ""}
                className="lg:hidden"
              />

              {/* Resumen de Pago */}
              <PaymentSummaryCard
                order={order}
                isRevision={order.estado === "esperando_confirmacion"}
                revisionTotal={calculateRevisionTotal()}
                canCancelOrder={canCancelOrder}
                showConfirmButton={order.estado === "esperando_confirmacion"}
                onConfirm={acceptRevision}
                onCancel={() => setShowCancelModal(true)}
                isLoading={isUpdating}
              />

              {/* Información de Entrega */}
              <DeliveryInfoCard />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior (Solo Móvil) */}
      <OrderBottomBar
        order={order}
        isRevision={order.estado === "esperando_confirmacion"}
        revisionTotal={calculateRevisionTotal()}
        canCancelOrder={canCancelOrder}
        showConfirmButton={Boolean((order.estado === "esperando_confirmacion" || isPaymentRejected))}
        onConfirm={acceptRevision}
        onCancel={() => setShowCancelModal(true)}
        isLoading={isUpdating}
      />
    </div>
  );
}