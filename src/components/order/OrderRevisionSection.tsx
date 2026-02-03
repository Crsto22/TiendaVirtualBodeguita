/**
 * OrderRevisionSection Component
 * Sección completa de revisión: selector de método de pago y monto
 */

import { Wallet, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface OrderRevisionSectionProps {
  revisionPaymentMethod: "efectivo" | "yape" | null;
  revisionPagaCon: string;
  pagoCompletoRevision: boolean;
  revisionTotal: number;
  onMethodChange: (method: "efectivo" | "yape") => void;
  onAmountChange: (amount: string) => void;
  onFullPaymentToggle: (isComplete: boolean) => void;
}

export function OrderRevisionSection({
  revisionPaymentMethod,
  revisionPagaCon,
  pagoCompletoRevision,
  revisionTotal,
  onMethodChange,
  onAmountChange,
  onFullPaymentToggle,
}: OrderRevisionSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-6 shadow-sm mt-6 mb-20 lg:mb-0">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
        <Wallet className="size-5 sm:size-6 text-slate-400" />
        ¿Cómo quieres pagar el nuevo total?
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Opción Efectivo */}
        <div
          onClick={() => onMethodChange("efectivo")}
          className={`
            cursor-pointer relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 group h-auto sm:h-32 aspect-[4/3] sm:aspect-auto
            ${
              revisionPaymentMethod === "efectivo"
                ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20"
                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          {revisionPaymentMethod === "efectivo" && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-emerald-500">
              <CheckCircle2 className="size-5 sm:size-6 fill-emerald-100" />
            </div>
          )}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
            <Image
              src="/MetodoPago/Efectivo.png"
              alt="Efectivo"
              width={32}
              height={32}
              className="object-contain sm:w-10 sm:h-10"
            />
          </div>
          <span
            className={`font-bold text-sm sm:text-base ${
              revisionPaymentMethod === "efectivo"
                ? "text-emerald-700"
                : "text-slate-600"
            }`}
          >
            Efectivo
          </span>
        </div>

        {/* Opción Yape */}
        <div
          onClick={() => onMethodChange("yape")}
          className={`
            cursor-pointer relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 group h-auto sm:h-32 aspect-[4/3] sm:aspect-auto
            ${
              revisionPaymentMethod === "yape"
                ? "border-purple-500 bg-purple-50/30 ring-1 ring-purple-500/20"
                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          {revisionPaymentMethod === "yape" && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-purple-500">
              <CheckCircle2 className="size-5 sm:size-6 fill-purple-100" />
            </div>
          )}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100">
            <Image
              src="/MetodoPago/Yape.png"
              alt="Yape"
              width={32}
              height={32}
              className="object-contain rounded-lg sm:w-10 sm:h-10"
            />
          </div>
          <span
            className={`font-bold text-sm sm:text-base ${
              revisionPaymentMethod === "yape"
                ? "text-purple-700"
                : "text-slate-600"
            }`}
          >
            Yape
          </span>
        </div>
      </div>

      {/* Input Dinámico para Efectivo */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${
            revisionPaymentMethod === "efectivo"
              ? "max-h-72 opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200/60 max-w-md mx-auto transition-all">
          {/* Opción Pago Completo */}
          <div className="mb-4 flex items-center justify-center gap-2 pb-4 border-b border-gray-200/50">
            <button
              onClick={() => {
                const nuevoEstado = !pagoCompletoRevision;
                onFullPaymentToggle(nuevoEstado);
                if (nuevoEstado) {
                  onAmountChange(revisionTotal.toFixed(2));
                } else {
                  onAmountChange("");
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                pagoCompletoRevision
                  ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-slate-600 hover:border-emerald-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  pagoCompletoRevision
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {pagoCompletoRevision && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              Pagaré con el monto exacto
            </button>
          </div>

          {!pagoCompletoRevision && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-center text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-3">
                ¿Con cuánto vas a pagar?
              </label>
              <div className="relative max-w-[200px] sm:max-w-[240px] mx-auto">
                <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl sm:text-2xl">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={revisionPagaCon}
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="w-full bg-white text-center pl-8 sm:pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-2xl sm:text-3xl font-bold text-slate-800 placeholder:text-gray-300 transition-colors shadow-sm outline-none"
                  autoFocus={
                    revisionPaymentMethod === "efectivo" &&
                    !pagoCompletoRevision
                  }
                />
              </div>
            </div>
          )}

          {pagoCompletoRevision && (
            <p className="text-center text-emerald-600 font-bold text-lg animate-in fade-in">
              Pago Completo: S/ {revisionTotal.toFixed(2)}
            </p>
          )}

          {/* Cálculo de vuelto */}
          {revisionPaymentMethod === "efectivo" &&
            !pagoCompletoRevision &&
            revisionPagaCon && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center px-2 sm:px-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  Tu vuelto será:
                </span>
                <span
                  className={`text-base sm:text-lg font-bold ${
                    parseFloat(revisionPagaCon) >= revisionTotal
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {parseFloat(revisionPagaCon) >= revisionTotal
                    ? `S/ ${(parseFloat(revisionPagaCon) - revisionTotal).toFixed(2)}`
                    : "Monto insuficiente"}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
