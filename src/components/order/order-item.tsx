import Image from "next/image";
import {
    Minus,
    Plus,
    Trash2,
    Package,
    Snowflake,
    ThermometerSun,
    Recycle,
    AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SubstituteCarousel } from "./substitute-carousel";
import { capitalizeText } from "@/constants/order-config";
import { Order, OrderItem as IOrderItem } from "@/types/order";

interface OrderItemProps {
    item: IOrderItem;
    order: Order;
    orderState: string;
    isEditing: boolean;
    substitutes: IOrderItem[];
    substituteSelections: Record<string, Record<string, number>>;
    canceledItems: Record<string, boolean>;
    onUpdateItem: (itemId: string, updates: Partial<IOrderItem>) => void;
    onDelete: (item: IOrderItem) => void;
    onUpdateSubstituteQty: (
        parentId: string,
        subId: string,
        qty: number
    ) => void;
    onToggleCancelItem: (parentId: string) => void;
    onClearSubstitutes: (parentId: string) => void;
    onShowCancelModal: () => void;
}

export function OrderItem({
    item,
    order,
    orderState,
    isEditing,
    substitutes,
    substituteSelections,
    canceledItems,
    onUpdateItem,
    onDelete,
    onUpdateSubstituteQty,
    onToggleCancelItem,
    onClearSubstitutes,
    onShowCancelModal,
}: OrderItemProps) {
    const isSinStock = item.estado_item === "sin_stock";
    const isPartialStock = item.estado_item === "stock_parcial";

    // Logic from original file to determine current quantity and max quantity
    const currentQty = item.cantidad_final ?? item.cantidad_solicitada;
    const missingQty = isPartialStock
        ? item.cantidad_solicitada - currentQty
        : 0;

    const maxQty =
        item.stock_disponible ??
        (isPartialStock
            ? item.cantidad_final ?? 0
            : item.cantidad_solicitada);

    const handleQtyChange = (delta: number) => {
        const newQty = currentQty + delta;

        if (newQty < 1) return;
        if (newQty > maxQty) {
            toast.error(`No puedes superar la cantidad máxima disponible (${maxQty})`);
            return;
        }

        const effectiveUnitPrice = (item.precio_helada && item.cantidad_helada > 0)
            ? item.precio_helada
            : (item.precio_base || 0);

        const updates: Partial<IOrderItem> = {
            cantidad_final: newQty,
            precio_final: effectiveUnitPrice * newQty,
        };

        // Include stock_disponible update if partial stock and not set
        if (
            isPartialStock &&
            (item.stock_disponible === undefined || item.stock_disponible === null)
        ) {
            updates.stock_disponible = item.cantidad_final;
        }

        onUpdateItem(item.itemId, updates);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Item Principal */}
            <div
                className={`
          bg-white rounded-2xl p-4 shadow-sm border flex flex-col sm:flex-row gap-4 transition-all relative
          ${isSinStock
                        ? "border-red-100 bg-red-50/20"
                        : isPartialStock
                            ? "border-orange-100 bg-orange-50/20"
                            : "border-gray-100 hover:shadow-md"
                    }
        `}
            >
                {/* Botón Eliminar (Solo en revisión) */}
                {isEditing && (
                    <button
                        onClick={() => onDelete(item)}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}

                <div className="flex gap-4 w-full">
                    {/* Imagen del Producto */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2">
                        {item.imagen ? (
                            <Image
                                src={item.imagen}
                                alt={item.nombre}
                                fill
                                className={`object-contain p-1 ${isSinStock ? "grayscale opacity-70" : ""
                                    }`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="size-8 text-gray-300" />
                            </div>
                        )}
                        {(isSinStock || isPartialStock) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
                                <span
                                    className={`${isSinStock ? "bg-red-500" : "bg-orange-500"
                                        } text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm`}
                                >
                                    {isSinStock ? "AGOTADO" : "INCOMPLETO"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info del Producto */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="pr-8">
                            <h4
                                className={`font-semibold line-clamp-2 text-sm sm:text-base mb-1 ${isSinStock
                                    ? "text-gray-500 line-through decoration-red-400"
                                    : isPartialStock
                                        ? "text-gray-700"
                                        : "text-gray-900"
                                    }`}
                            >
                                {capitalizeText(item.nombre)}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] h-5 px-1.5 font-normal bg-gray-100 text-gray-600"
                                >
                                    {item.tipo_unidad === "kilogramo" ? "x Kg" : "Unidad"}
                                </Badge>
                                {/* Badges de Temperatura y Retornable */}
                                {item.cantidad_helada > 0 && (
                                    <Badge className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 border-blue-100 font-normal">
                                        <Snowflake className="size-3 mr-1" />
                                        {item.cantidad_helada > 1 ? "Heladas" : "Helada"}
                                    </Badge>
                                )}
                                {(item.es_bebida ||
                                    (item.precio_helada !== null &&
                                        item.precio_helada !== undefined)) &&
                                    item.cantidad_helada === 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] h-5 px-1.5 bg-orange-50 text-orange-600 border-orange-100 font-normal"
                                        >
                                            <ThermometerSun className="size-3 mr-1" />
                                            Sin Helar
                                        </Badge>
                                    )}
                                {item.es_retornable && (
                                    <Badge className="text-[10px] h-5 px-1.5 bg-green-50 text-green-600 border-green-100 font-normal">
                                        <Recycle className="size-3 mr-1" />
                                        Retornable
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-end justify-between mt-2 sm:mt-0">
                            {/* Control de Cantidad */}
                            <div className="flex flex-col">
                                {isEditing && item.tipo_unidad !== "kilogramo" ? (
                                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                        <button
                                            onClick={() => handleQtyChange(-1)}
                                            disabled={currentQty <= 1}
                                            className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-30"
                                        >
                                            <Minus className="size-3.5 text-gray-600" />
                                        </button>
                                        <span className="text-sm font-bold text-gray-900 w-4 text-center">
                                            {currentQty}
                                        </span>
                                        <button
                                            onClick={() => handleQtyChange(1)}
                                            disabled={currentQty >= maxQty}
                                            className="p-1 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="size-3.5 text-gray-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <p
                                        className={`text-sm font-medium ${isSinStock ? "text-gray-400" : "text-gray-500"
                                            }`}
                                    >
                                        Cant:{" "}
                                        <span
                                            className={
                                                isSinStock
                                                    ? "text-gray-500"
                                                    : isPartialStock
                                                        ? "text-orange-700 font-bold"
                                                        : "text-gray-900"
                                            }
                                        >
                                            {item.tipo_unidad === "kilogramo" && item.detalle
                                                ? item.detalle
                                                : currentQty}{" "}
                                            {isPartialStock && (
                                                <span className="text-xs font-normal text-gray-500">
                                                    (Solo {item.cantidad_final})
                                                </span>
                                            )}
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Precio */}
                            <div className="text-right">
                                {isSinStock ? (
                                    <span className="text-sm font-bold text-red-500">
                                        No disponible
                                    </span>
                                ) : (
                                    <>
                                        {/* Precio Unitario */}
                                        {item.tipo_unidad !== "kilogramo" && (
                                            <span className="text-[10px] text-gray-500 font-medium block">
                                                {item.mostrar_precio_web !== false ||
                                                    item.is_recovered_price ||
                                                    (item.precio_final && item.precio_final > 0)
                                                    ? `S/ ${((item.precio_helada && item.cantidad_helada > 0) ? item.precio_helada : (item.precio_base || 0)).toFixed(2)} c/u`
                                                    : ""}
                                            </span>
                                        )}

                                        {/* Precio Final */}
                                        {(() => {
                                            const effectiveUnitPrice = (item.precio_helada && item.cantidad_helada > 0) ? item.precio_helada : (item.precio_base || 0);
                                            const precioTotal = item.precio_final ?? (effectiveUnitPrice * currentQty);

                                            // Si el precio es 0, mostrar "Consultar"
                                            if (precioTotal === 0) {
                                                return (
                                                    <span className="text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md whitespace-nowrap border border-orange-100 mt-1 inline-block">
                                                        Consultar
                                                    </span>
                                                );
                                            }

                                            // Si tiene precio, mostrarlo
                                            if (item.mostrar_precio_web !== false ||
                                                item.tipo_unidad === "kilogramo" ||
                                                item.is_recovered_price ||
                                                (item.precio_final && item.precio_final > 0)) {
                                                return (
                                                    <p
                                                        className={`font-bold text-base sm:text-lg ${item.precio_final ? "text-blue-600" : "text-gray-900"
                                                            }`}
                                                    >
                                                        S/ {precioTotal.toFixed(2)}
                                                    </p>
                                                );
                                            }

                                            // Por defecto, mostrar "Consultar"
                                            return (
                                                <span className="text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md whitespace-nowrap border border-orange-100 mt-1 inline-block">
                                                    Consultar
                                                </span>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE SUSTITUTOS */}
            {(isSinStock || isPartialStock) &&
                substitutes.length > 0 &&
                orderState === "esperando_confirmacion" && (
                    <div className="ml-4 pl-4 border-l-2 border-dashed border-orange-200 space-y-3 pt-1 pb-2">
                        <div className="bg-orange-50 rounded-xl p-3 flex items-start gap-3">
                            <AlertCircle className="size-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-orange-800">
                                    {isSinStock
                                        ? "Producto Agotado"
                                        : `Faltan ${missingQty} unidades`}
                                </p>
                                <p className="text-orange-700 leading-tight mt-1 text-xs">
                                    {isSinStock
                                        ? "El vendedor te sugiere estas opciones como reemplazo. Selecciona una:"
                                        : `Solo hay ${currentQty} ${item.cantidad_helada > 0 ? "heladas" : "unidades"
                                        } en stock. Para l${missingQty > 1 ? "as" : "a"} ${missingQty} faltante${missingQty > 1 ? "s" : ""
                                        }, el vendedor sugiere:`}
                                </p>
                            </div>
                        </div>

                        {/* Carousel de sustitutos */}
                        <SubstituteCarousel
                            item={item}
                            subs={substitutes}
                            order={order}
                            canceledItems={canceledItems}
                            substituteSelections={substituteSelections}
                            onUpdateSubstituteQty={onUpdateSubstituteQty}
                            onToggleCancelItem={onToggleCancelItem}
                            onClearSubstitutes={onClearSubstitutes}
                            onShowCancelModal={onShowCancelModal}
                        />
                    </div>
                )}
        </div>
    );
}
