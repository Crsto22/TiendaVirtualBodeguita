"use client";

import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function PedidosPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Header */}
      <section className="bg-linear-to-r from-primary to-primary/90 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">Mis Pedidos</h1>
          <p className="text-base md:text-lg opacity-90">Revisa el estado de tus pedidos</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {user ? (
          <div className="max-w-4xl mx-auto">
            {/* Content for logged in users */}
            <div className="bg-white rounded-xl p-8 md:p-12 text-center border-2 border-dashed border-gray-300">
              <div className="flex justify-center mx-auto mb-4">
                <Image
                  src="/Pedidos1.png"
                  alt="Historial de Pedidos"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-darkblue mb-2">
                Historial de Pedidos
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Aquí aparecerán tus pedidos una vez que realices una compra.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 md:py-8 text-center">
            <div className="bg-white p-6 md:p-12 rounded-3xl shadow-lg max-w-md w-full border border-gray-100">
              <div className="flex justify-center mx-auto mb-4 md:mb-6">
                <Image
                  src="/Pedidos.png"
                  alt="Acceso Restringido"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-darkblue mb-3 md:mb-4">Acceso Restringido</h2>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                Inicie sesión para ver sus pedidos
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Por favor, utiliza el botón de iniciar sesión en la parte superior para acceder a tu historial.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
