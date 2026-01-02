import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Wallet, Banknote, XCircle } from "lucide-react";
import Image from "next/image";

interface PaymentRejectedModalProps {
    isOpen: boolean;
    total: number;
    paymentMethod: "efectivo" | "yape" | null;
    payAmount: string;
    isFullPayment: boolean;
    onMethodChange: (method: "efectivo" | "yape") => void;
    onAmountChange: (amount: string) => void;
    onFullPaymentToggle: (isFull: boolean) => void;
    onConfirm: () => void;
    onCancelOrder: () => void;
    isLoading: boolean;
    originalPayAmount?: number;
}

export function PaymentRejectedModal({
    isOpen,
    total,
    paymentMethod,
    payAmount,
    isFullPayment,
    onMethodChange,
    onAmountChange,
    onFullPaymentToggle,
    onConfirm,
    onCancelOrder,
    isLoading,
    originalPayAmount = 0
}: PaymentRejectedModalProps) {

    // Efecto para asegurar que si se abre el modal, tengamos un método seleccionado por defecto
    useEffect(() => {
        if (isOpen && !paymentMethod) {
            onMethodChange("efectivo");
        }
    }, [isOpen, paymentMethod, onMethodChange]);

    const isValidAmount =
        paymentMethod === "yape" ||
        (paymentMethod === "efectivo" && (
            isFullPayment || (parseFloat(payAmount) >= total)
        ));

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md bg-white p-0 gap-0 overflow-hidden border-0 shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header de Alerta */}
                <div className="bg-red-50 p-6 pb-8 text-center border-b border-red-100">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-white animate-in zoom-in-50 duration-300">
                        <Banknote className="size-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-xl font-extrabold text-red-900 mb-2">
                        ¡Necesitamos cambiar el pago!
                    </DialogTitle>
                    <p className="text-red-700/90 text-sm leading-relaxed max-w-[90%] mx-auto">
                        El vendedor indica que <strong>no tiene sencillo</strong> para tu pago de S/ {(originalPayAmount || 0).toFixed(2)}.
                        Por favor, intenta pagar con el monto exacto o usa Yape.
                    </p>
                </div>

                <div className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-center">
                        Selecciona nuevo método
                    </h3>

                    {/* Selección de Método */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div
                            onClick={() => onMethodChange("efectivo")}
                            className={`
                  cursor-pointer relative p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 group h-24
                  ${paymentMethod === "efectivo"
                                    ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20"
                                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                `}
                        >
                            {paymentMethod === "efectivo" && (
                                <div className="absolute top-2 right-2 text-emerald-500">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            )}
                            <div className="size-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                                <Image src="/MetodoPago/Efectivo.png" alt="Efectivo" width={20} height={20} className="object-contain" />
                            </div>
                            <span className={`font-bold text-sm ${paymentMethod === "efectivo" ? "text-emerald-700" : "text-slate-600"}`}>Efectivo</span>
                        </div>

                        <div
                            onClick={() => onMethodChange("yape")}
                            className={`
                  cursor-pointer relative p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 group h-24
                  ${paymentMethod === "yape"
                                    ? "border-purple-500 bg-purple-50/50 ring-1 ring-purple-500/20"
                                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}
                `}
                        >
                            {paymentMethod === "yape" && (
                                <div className="absolute top-2 right-2 text-purple-500">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            )}
                            <div className="size-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
                                <Image src="/MetodoPago/Yape.png" alt="Yape" width={20} height={20} className="object-contain rounded-sm" />
                            </div>
                            <span className={`font-bold text-sm ${paymentMethod === "yape" ? "text-purple-700" : "text-slate-600"}`}>Yape</span>
                        </div>
                    </div>

                    {/* Input Dinámico Efectivo */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === "efectivo" ? "max-h-48 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <button
                                    onClick={() => {
                                        const nuevo = !isFullPayment;
                                        onFullPaymentToggle(nuevo);
                                        if (nuevo) onAmountChange(total.toFixed(2));
                                        else onAmountChange("");
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isFullPayment
                                        ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                                        : "bg-white border-gray-300 text-slate-500 hover:border-emerald-300"
                                        }`}
                                >
                                    <div className={`size-3.5 rounded-full border flex items-center justify-center transition-colors ${isFullPayment ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"}`}>
                                        {isFullPayment && <CheckCircle2 className="size-2.5 text-white" />}
                                    </div>
                                    Pagar monto exacto
                                </button>
                            </div>

                            {!isFullPayment ? (
                                <div className="relative max-w-[180px] mx-auto">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">S/</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={payAmount}
                                        onChange={(e) => onAmountChange(e.target.value)}
                                        className="w-full bg-white text-center pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-xl font-bold text-slate-800 placeholder:text-gray-300 outline-none"
                                        autoFocus={paymentMethod === "efectivo" && !isFullPayment}
                                    />
                                </div>
                            ) : (
                                <p className="text-center text-emerald-600 font-bold text-base">
                                    Exacto: S/ {total.toFixed(2)}
                                </p>
                            )}

                            {/* Vuelto preview */}
                            {!isFullPayment && payAmount && parseFloat(payAmount) >= total && (
                                <div className="mt-3 text-center">
                                    <span className="text-xs text-slate-500">Vuelto: </span>
                                    <span className="text-sm font-bold text-emerald-600">S/ {(parseFloat(payAmount) - total).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-3">
                        <Button
                            onClick={onConfirm}
                            disabled={!isValidAmount || isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base font-bold shadow-md shadow-slate-200"
                        >
                            {isLoading ? "Actualizando..." : "Actualizar Pago"}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onCancelOrder}
                            disabled={isLoading}
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-10 rounded-xl text-sm font-medium"
                        >
                            No puedo pagar, cancelar pedido
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
