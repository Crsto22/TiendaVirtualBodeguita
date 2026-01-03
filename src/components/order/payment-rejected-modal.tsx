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
                className="w-[90vw] max-w-sm bg-white p-0 gap-0 overflow-hidden border-0 shadow-xl rounded-[1.5rem] mx-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header Compacto */}
                <div className="bg-red-50/80 backdrop-blur-sm p-5 text-center border-b border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/50 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl" />

                    <div className="flex flex-col items-center relative z-10">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-white/60">
                            <Banknote className="size-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-lg font-black text-red-950 mb-1">
                            ¡Necesitamos sencillo!
                        </DialogTitle>
                        <p className="text-red-900/80 text-sm leading-snug px-2">
                            No tenemos vuelto para <span className="font-bold text-red-900">S/ {(originalPayAmount || 0).toFixed(2)}</span>.
                            <br className="hidden sm:block" /> Por favor paga exacto o usa Yape.
                        </p>
                    </div>
                </div>

                <div className="p-5">
                    {/* Selección de Método */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <button
                            onClick={() => onMethodChange("efectivo")}
                            className={`
                  relative p-2.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500/50
                  ${paymentMethod === "efectivo"
                                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                                    : "border-slate-100 bg-white hover:bg-slate-50 text-slate-400 grayscale hover:grayscale-0"}
                `}
                        >
                            {paymentMethod === "efectivo" && (
                                <div className="absolute top-1 right-1 text-emerald-500 bg-white rounded-full">
                                    <CheckCircle2 className="size-3.5" />
                                </div>
                            )}
                            <Image src="/MetodoPago/Efectivo.png" alt="Efectivo" width={24} height={24} className="object-contain drop-shadow-sm" />
                            <span className={`font-bold text-xs ${paymentMethod === "efectivo" ? "text-emerald-700" : "text-slate-500"}`}>Efectivo</span>
                        </button>

                        <button
                            onClick={() => onMethodChange("yape")}
                            className={`
                  relative p-2.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500/50
                  ${paymentMethod === "yape"
                                    ? "border-purple-500 bg-purple-50/50 shadow-sm"
                                    : "border-slate-100 bg-white hover:bg-slate-50 text-slate-400 grayscale hover:grayscale-0"}
                `}
                        >
                            {paymentMethod === "yape" && (
                                <div className="absolute top-1 right-1 text-purple-500 bg-white rounded-full">
                                    <CheckCircle2 className="size-3.5" />
                                </div>
                            )}
                            <Image src="/MetodoPago/Yape.png" alt="Yape" width={24} height={24} className="object-contain rounded-md drop-shadow-sm" />
                            <span className={`font-bold text-xs ${paymentMethod === "yape" ? "text-purple-700" : "text-slate-500"}`}>Yape</span>
                        </button>
                    </div>

                    {/* Input Dinámico Efectivo */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === "efectivo" ? "max-h-48 opacity-100 mb-5" : "max-h-0 opacity-0 mb-0"}`}>
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 ring-1 ring-slate-100">

                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold text-slate-500 ml-1">Monto a pagar</span>
                                <button
                                    onClick={() => {
                                        const nuevo = !isFullPayment;
                                        onFullPaymentToggle(nuevo);
                                        if (nuevo) onAmountChange(total.toFixed(2));
                                        else onAmountChange("");
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wide transition-all active:scale-95 ${isFullPayment
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
                                        : "bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500"
                                        }`}
                                >
                                    {isFullPayment ? "Pago Exacto" : "Usar Monto Exacto"}
                                </button>
                            </div>

                            {!isFullPayment ? (
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">S/</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={payAmount}
                                        onChange={(e) => onAmountChange(e.target.value)}
                                        className="w-full bg-white text-center pl-8 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all shadow-sm"
                                        autoFocus={paymentMethod === "efectivo" && !isFullPayment}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white py-2.5 rounded-xl border border-emerald-100 text-center shadow-sm">
                                    <p className="text-emerald-600 font-bold text-lg">
                                        S/ {total.toFixed(2)}
                                    </p>
                                </div>
                            )}

                            {/* Vuelto preview line */}
                            {!isFullPayment && payAmount && parseFloat(payAmount) >= total && (
                                <div className="mt-2.5 flex justify-between items-center px-2 bg-emerald-50/50 rounded-lg py-1 border border-emerald-100/50">
                                    <span className="text-[10px] font-bold text-emerald-600/70 uppercase">Vuelto estimado</span>
                                    <span className="text-sm font-black text-emerald-600">S/ {(parseFloat(payAmount) - total).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2.5">
                        <Button
                            onClick={onConfirm}
                            disabled={!isValidAmount || isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 disabled:shadow-none transition-all active:scale-[0.98]"
                        >
                            {isLoading ? "Actualizando..." : "Confirmar Cambio"}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onCancelOrder}
                            disabled={isLoading}
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-10 rounded-xl text-xs font-semibold uppercase tracking-wide opacity-80 hover:opacity-100"
                        >
                            Cancelar Pedido
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
