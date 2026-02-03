/**
 * DeliveryInfoCard Component
 * Tarjeta pequeña con información de entrega y ubicación
 */

import { Store, MapPin } from "lucide-react";

export function DeliveryInfoCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
        <Store className="size-5 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">Método de entrega</p>
        <div className="flex flex-col">
          <p className="text-sm font-bold text-gray-900">Recojo en Tienda</p>
          <a
            href="https://maps.app.goo.gl/xEYuLvHZRJKHv6MY7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium mt-0.5"
          >
            <MapPin className="size-3" />
            Ver ubicación
          </a>
        </div>
      </div>
    </div>
  );
}
