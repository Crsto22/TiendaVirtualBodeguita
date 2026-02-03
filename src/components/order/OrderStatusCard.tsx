/**
 * OrderStatusCard Component
 * Tarjeta hero que muestra el estado actual del pedido con imagen/ícono
 */

import { MapPin } from "lucide-react";
import Image from "next/image";
import { ESTADO_CONFIG } from "@/constants/order-config";
import { Order } from "@/types/order";

interface OrderStatusCardProps {
  order: Order;
}

export function OrderStatusCard({ order }: OrderStatusCardProps) {
  const estadoConfig = ESTADO_CONFIG[order.estado];
  const IconoEstado = estadoConfig.icon;
  const showLocationButton = order.estado === "lista";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl shadow-lg border ${estadoConfig.className} p-6 transition-all`}
    >
      <div className="flex flex-col items-center text-center relative z-10">
        {(estadoConfig as any).heroImage ? (
          <div className="mb-4 relative">
            {/* Fondo glow para el spinner */}
            <div className="absolute inset-0 bg-white/40 blur-xl rounded-full transform scale-150"></div>
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full border-[5px] ${(estadoConfig as any).borderClass
                  }`}
              ></div>
              {/* Imagen del estado */}
              <div className="w-24 h-24 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-full shadow-inner p-2">
                <Image
                  src={(estadoConfig as any).heroImage}
                  alt={estadoConfig.label}
                  width={(estadoConfig as any).heroImageWidth || 100}
                  height={(estadoConfig as any).heroImageHeight || 100}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`mb-4 p-4 rounded-full bg-white/80 backdrop-blur shadow-sm ${estadoConfig.iconColor}`}
          >
            <IconoEstado className="size-10" />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2 tracking-tight">
          {estadoConfig.label}
        </h2>
        <p className="text-sm opacity-90 font-medium leading-relaxed max-w-[250px]">
          {estadoConfig.description}
        </p>

        {showLocationButton && (
          <a
            href="https://maps.app.goo.gl/xEYuLvHZRJKHv6MY7"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-teal-100 hover:bg-teal-50 hover:scale-105 transition-all"
          >
            <MapPin className="size-4" />
            Ver ubicación de recojo
          </a>
        )}
      </div>
    </div>
  );
}
