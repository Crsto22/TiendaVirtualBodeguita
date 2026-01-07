import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Trash2,
    Package,
    ThermometerSun,
    Snowflake,
    Minus,
    Plus,
    ShoppingCart,
    Scale,
    Hash,
} from "lucide-react";
import { Order } from "@/types/order";
import { capitalizeText } from "@/constants/order-config";
import { toast } from "sonner";

interface SubstituteCarouselProps {
    item: any;
    subs: any[];
    order: Order;
    canceledItems: Record<string, boolean>;
    substituteSelections: Record<string, Record<string, number>>;
    onClearSubstitutes: (parentId: string) => void;
    onToggleCancelItem: (parentId: string) => void;
    onUpdateSubstituteQty: (
        parentId: string,
        subId: string,
        qty: number
    ) => void;
    onShowCancelModal: () => void;
}

export function SubstituteCarousel({
    item,
    subs,
    order,
    canceledItems,
    substituteSelections,
    onClearSubstitutes,
    onToggleCancelItem,
    onUpdateSubstituteQty,
    onShowCancelModal,
}: SubstituteCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollPosition =
                direction === "left"
                    ? scrollContainerRef.current.scrollLeft - scrollAmount
                    : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: "smooth",
            });
        }
    };

    const isSinStock = item.estado_item === "sin_stock";
    const mainItemsCount = order.items.filter((i) => !i.es_sustituto).length;

    return (
        <div className="relative group/carousel -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Previous Button */}
            <button
                onClick={() => scroll("left")}
                className="absolute hidden md:flex left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-100"
                aria-label="Anterior"
            >
                <ChevronLeft className="size-5" />
            </button>

            <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
                {/* Opción 1: Solo lo que hay / Ningún sustituto */}
                <div className="shrink-0">
                    <button
                        onClick={() => onClearSubstitutes(item.itemId)}
                        className={`
              w-[140px] h-[240px] rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-4 transition-all relative
              ${!canceledItems[item.itemId] &&
                                (!substituteSelections[item.itemId] ||
                                    Object.keys(substituteSelections[item.itemId]).length === 0)
                                ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                                : "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50/10"
                            }
            `}
                    >
                        <div
                            className={`p-3 rounded-full ${!canceledItems[item.itemId] &&
                                    (!substituteSelections[item.itemId] ||
                                        Object.keys(substituteSelections[item.itemId]).length === 0)
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                                }`}
                        >
                            <CheckCircle2 className="size-8" />
                        </div>
                        <span className="font-bold text-sm text-center">
                            {isSinStock ? "No sustituir" : "Solo lo que hay"}
                        </span>
                        <span className="text-[10px] text-center opacity-80 leading-tight">
                            {isSinStock
                                ? "Removemos este item"
                                : `Llevar solo ${item.cantidad_final} u.`}
                        </span>
                    </button>
                </div>

                {/* Opción 2: Eliminar Item (o Cancelar Pedido) */}
                <div className="shrink-0">
                    <button
                        onClick={() => {
                            if (mainItemsCount === 1) {
                                onShowCancelModal();
                            } else {
                                onToggleCancelItem(item.itemId);
                            }
                        }}
                        className={`
              w-[140px] h-[240px] rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-4 transition-all relative
              ${canceledItems[item.itemId] && mainItemsCount > 1
                                ? "bg-red-50 border-red-500 text-red-700 shadow-sm"
                                : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50/50"
                            }
            `}
                    >
                        <div
                            className={`size-12 rounded-full flex items-center justify-center border-2 transition-colors
              ${canceledItems[item.itemId] && mainItemsCount > 1
                                    ? "bg-red-100 border-red-500 text-red-600"
                                    : "bg-gray-50 border-gray-200 text-gray-400"
                                }
            `}
                        >
                            {mainItemsCount === 1 ? (
                                <XCircle className="size-6" />
                            ) : (
                                <Trash2 className="size-6" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-sm leading-tight">
                                {mainItemsCount === 1 ? "Cancelar Pedido" : "Eliminar Todo"}
                            </p>
                            <p className="text-[10px] opacity-80 mt-1 leading-tight px-1">
                                {mainItemsCount === 1
                                    ? "Anular toda la orden"
                                    : "No llevar ni el parcial ni sustitutos"}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Cards de Productos Sustitutos */}
                {subs.map((subItem) => {
                    const currentSelections = substituteSelections[item.itemId] || {};
                    const currentQty = currentSelections[subItem.itemId] || 0;
                    const isSelected = currentQty > 0;
                    const maxQty = subItem.cantidad_final || 1;

                    // Detectar si es una propuesta fija (kilogramos con peso/cantidad propuesta)
                    const esPropouestaFija = subItem.peso_propuesto_gramos !== null && subItem.peso_propuesto_gramos !== undefined ||
                        subItem.cantidad_propuesta !== null && subItem.cantidad_propuesta !== undefined;
                    
                    // Obtener la cantidad propuesta (puede ser peso en gramos o unidades)
                    const cantidadPropuesta = subItem.cantidad_propuesta || 1;
                    const detallePropuesta = subItem.detalle || 
                        (subItem.peso_propuesto_gramos ? `${subItem.peso_propuesto_gramos}g` : 
                        (subItem.cantidad_propuesta ? `${subItem.cantidad_propuesta} unids.` : ''));

                    return (
                        <div key={subItem.itemId} className="shrink-0">
                            <div
                                className={`
                bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden w-[160px] flex flex-col h-[240px]
                ${isSelected
                                        ? "ring-2 ring-blue-500 border-blue-500 shadow-md transform scale-[1.02]"
                                        : "border-gray-100 hover:shadow-md hover:border-gray-200"
                                    }
                ${canceledItems[item.itemId]
                                        ? "opacity-50 grayscale pointer-events-none"
                                        : ""
                                    }
              `}
                            >
                                {/* Imagen */}
                                <div className="relative h-[110px] bg-gray-50 flex items-center justify-center p-2">
                                    {subItem.imagen ? (
                                        <Image
                                            src={subItem.imagen}
                                            alt={subItem.nombre}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    ) : (
                                        <Package className="size-10 text-gray-300" />
                                    )}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm z-10">
                                            <CheckCircle2 className="size-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col flex-1 p-3">
                                    <h5 className="font-semibold text-xs text-gray-900 line-clamp-2 mb-1 h-[2.5em]">
                                        {capitalizeText(subItem.nombre)}
                                    </h5>

                                    {/* Badge Sin Helar / Helada - Solo si NO es propuesta fija con detalle de peso/cantidad */}
                                    {!esPropouestaFija && subItem.detalle === "Sin helar" && (
                                        <div className="mb-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] h-5 px-1.5 bg-orange-50 text-orange-600 border-orange-100 font-normal w-fit"
                                            >
                                                <ThermometerSun className="size-3 mr-1" />
                                                Sin Helar
                                            </Badge>
                                        </div>
                                    )}
                                    {!esPropouestaFija && subItem.detalle === "Helada" && (
                                        <div className="mb-1">
                                            <Badge className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 shadow-none font-normal w-fit">
                                                <Snowflake className="size-3 mr-1" />
                                                Helada
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Mostrar detalle de propuesta si es kilogramo con propuesta fija */}
                                    {esPropouestaFija && detallePropuesta && (
                                        <div className="mb-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] h-5 px-1.5 bg-purple-50 text-purple-700 border-purple-100 font-semibold w-fit"
                                            >
                                                {subItem.peso_propuesto_gramos ? (
                                                    <Scale className="size-3 mr-1" />
                                                ) : (
                                                    <Hash className="size-3 mr-1" />
                                                )}
                                                {detallePropuesta}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="mt-auto flex flex-col gap-2">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm font-bold text-blue-600">
                                                S/ {(subItem.precio_final ?? subItem.precio_base ?? 0).toFixed(2)}
                                            </span>
                                            {!esPropouestaFija && (
                                                <span className="text-[10px] text-gray-500">
                                                    Max: {maxQty}
                                                </span>
                                            )}
                                        </div>

                                        {/* PROPUESTA FIJA: Solo botón Añadir/Quitar */}
                                        {esPropouestaFija ? (
                                            isSelected ? (
                                                <Button
                                                    size="sm"
                                                    className="w-full h-8 rounded-full text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300"
                                                    onClick={() =>
                                                        onUpdateSubstituteQty(item.itemId, subItem.itemId, 0)
                                                    }
                                                >
                                                    <XCircle className="size-3 mr-1.5" />
                                                    Quitar
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="w-full h-8 rounded-full text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                                    onClick={() =>
                                                        onUpdateSubstituteQty(item.itemId, subItem.itemId, cantidadPropuesta)
                                                    }
                                                >
                                                    <ShoppingCart className="size-3 mr-1.5" />
                                                    Añadir propuesta
                                                </Button>
                                            )
                                        ) : (
                                            /* PRODUCTO NORMAL: Controles +/- */
                                            isSelected ? (
                                                <div className="flex items-center justify-between bg-gray-50 rounded-full border border-gray-200 p-1">
                                                    <button
                                                        onClick={() =>
                                                            onUpdateSubstituteQty(
                                                                item.itemId,
                                                                subItem.itemId,
                                                                currentQty - 1
                                                            )
                                                        }
                                                        className="size-6 bg-white rounded-full text-gray-600 flex items-center justify-center shadow-sm hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                                                    >
                                                        {currentQty === 1 ? (
                                                            <XCircle className="size-3.5" />
                                                        ) : (
                                                            <Minus className="size-3.5" />
                                                        )}
                                                    </button>

                                                    <span className="text-sm font-bold text-gray-800 tabular-nums px-2">
                                                        {currentQty}
                                                    </span>

                                                    <button
                                                        onClick={() => {
                                                            if (currentQty < maxQty)
                                                                onUpdateSubstituteQty(
                                                                    item.itemId,
                                                                    subItem.itemId,
                                                                    currentQty + 1
                                                                );
                                                            else
                                                                toast.error(`Stock máximo disponible: ${maxQty}`);
                                                        }}
                                                        className={`size-6 rounded-full flex items-center justify-center shadow-sm transition-all ${currentQty >= maxQty
                                                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                                : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                                                            }`}
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="w-full h-8 rounded-full text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                                    onClick={() =>
                                                        onUpdateSubstituteQty(item.itemId, subItem.itemId, 1)
                                                    }
                                                >
                                                    <ShoppingCart className="size-3 mr-1.5" />
                                                    Agregar
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => scroll("right")}
                className="absolute hidden md:flex right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-4 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-100"
                aria-label="Siguiente"
            >
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
}
