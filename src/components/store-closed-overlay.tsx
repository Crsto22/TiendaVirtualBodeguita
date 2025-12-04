"use client";

import { useStoreConfig } from "@/hooks/useStoreConfig";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function StoreClosedOverlay() {
  const { tiendaAbierta, loading } = useStoreConfig();
  const [isDismissed, setIsDismissed] = useState(false);
  const [wasClosedBefore, setWasClosedBefore] = useState(false);

  // Detectar cambios en tiendaAbierta y mostrar toast cuando se abre
  useEffect(() => {
    if (!loading) {
      // Si la tienda está cerrada, marcar que estuvo cerrada
      if (!tiendaAbierta) {
        setWasClosedBefore(true);
      }
      
      // Si la tienda se abrió Y antes estuvo cerrada, mostrar toast
      if (tiendaAbierta && wasClosedBefore) {
        toast.success("¡Ya abrimos la tienda! 🎉", {
          description: "Ahora puedes agregar productos al carrito y realizar pedidos.",
          duration: 3000,
        });
        setWasClosedBefore(false); // Resetear para que no se muestre de nuevo
      }
    }
  }, [tiendaAbierta, loading, wasClosedBefore]);

  // Resetear isDismissed cuando cambia el estado de tiendaAbierta
  useEffect(() => {
    if (!tiendaAbierta) {
      setIsDismissed(false);
    }
  }, [tiendaAbierta]);

  // No mostrar nada mientras carga
  if (loading) return null;

  // Si la tienda está abierta o el usuario ya cerró el overlay, no mostrar nada
  if (tiendaAbierta || isDismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center relative animate-in fade-in zoom-in duration-300 will-change-transform">
        {/* Imagen de tienda cerrada */}
        <div className="mb-6">
          <Image
            src="/ImgAplicativo/TiendaCerrada.png"
            alt="Tienda cerrada"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />
        </div>

        {/* Título */}
        <h2 className="text-2xl sm:text-3xl font-bold text-darkblue mb-3">
          Tienda Cerrada
        </h2>

        {/* Mensaje */}
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          La tienda está cerrada en este momento. Volvemos pronto para atenderte mejor.
        </p>

        {/* Botón para explorar productos */}
        <Button
          onClick={() => setIsDismissed(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Explorar productos
        </Button>

        {/* Nota adicional */}
        <p className="text-xs text-gray-500 mt-4">
          Puedes ver nuestro catálogo, pero no podrás realizar pedidos en este momento.
        </p>
      </div>
    </div>
  );
}
