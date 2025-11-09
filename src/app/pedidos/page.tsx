"use client";

import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState<"activos" | "historial">("activos");

  const pedidosActivos = [
    {
      id: "#ORD-2024-001",
      fecha: "Hoy, 10:30 AM",
      estado: "en-camino",
      total: 45.50,
      items: 5,
      estimado: "15 minutos",
      productos: ["Coca Cola 2L", "Pan integral", "Leche Gloria", "+2 más"]
    },
    {
      id: "#ORD-2024-002",
      fecha: "Hoy, 9:15 AM",
      estado: "preparando",
      total: 28.90,
      items: 3,
      estimado: "25 minutos",
      productos: ["Arroz 1kg", "Aceite", "Sal"]
    }
  ];

  const pedidosHistorial = [
    {
      id: "#ORD-2024-000",
      fecha: "Ayer, 6:45 PM",
      estado: "entregado",
      total: 67.80,
      items: 8,
      productos: ["Gaseosa", "Galletas", "Yogurt", "+5 más"]
    },
    {
      id: "#ORD-2023-999",
      fecha: "25 Oct, 2024",
      estado: "entregado",
      total: 35.20,
      items: 4,
      productos: ["Cerveza", "Papas lays", "Piqueos", "+1 más"]
    },
    {
      id: "#ORD-2023-998",
      fecha: "20 Oct, 2024",
      estado: "cancelado",
      total: 15.50,
      items: 2,
      productos: ["Pan", "Mantequilla"]
    }
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "en-camino":
        return {
          icon: <Truck className="size-5" />,
          text: "En camino",
          color: "bg-blue-100 text-blue-700 border-blue-300"
        };
      case "preparando":
        return {
          icon: <Clock className="size-5" />,
          text: "Preparando",
          color: "bg-yellow-100 text-yellow-700 border-yellow-300"
        };
      case "entregado":
        return {
          icon: <CheckCircle className="size-5" />,
          text: "Entregado",
          color: "bg-green-100 text-green-700 border-green-300"
        };
      case "cancelado":
        return {
          icon: <XCircle className="size-5" />,
          text: "Cancelado",
          color: "bg-red-100 text-red-700 border-red-300"
        };
      default:
        return {
          icon: <Package className="size-5" />,
          text: "Pendiente",
          color: "bg-gray-100 text-gray-700 border-gray-300"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Header */}
      <section className="bg-linear-to-r from-primary to-primary/90 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">Mis Pedidos</h1>
          <p className="text-lg opacity-90">Revisa el estado de tus pedidos</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("activos")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "activos"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pedidos Activos ({pedidosActivos.length})
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "historial"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Historial ({pedidosHistorial.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "activos" ? (
          <div className="space-y-4">
            {pedidosActivos.length > 0 ? (
              pedidosActivos.map((pedido) => {
                const badge = getEstadoBadge(pedido.estado);
                return (
                  <div
                    key={pedido.id}
                    className="bg-white rounded-xl shadow-md border-2 border-gray-100 hover:border-primary transition-all overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-darkblue mb-1">{pedido.id}</h3>
                          <p className="text-sm text-gray-500">{pedido.fecha}</p>
                        </div>
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-semibold text-sm ${badge.color}`}>
                          {badge.icon}
                          {badge.text}
                        </span>
                      </div>

                      {/* Productos */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm mb-2">
                          {pedido.productos.join(", ")}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <div className="text-sm">
                          <span className="text-gray-600">{pedido.items} productos</span>
                          {pedido.estimado && (
                            <span className="text-gray-600"> • Llega en {pedido.estimado}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">S/ {pedido.total.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">
                          Rastrear pedido
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <Package className="mx-auto mb-4 text-gray-400 size-20!" />
                <h3 className="text-xl font-bold text-darkblue mb-2">
                  No tienes pedidos activos
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza a comprar tus productos favoritos
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  Explorar productos
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosHistorial.map((pedido) => {
              const badge = getEstadoBadge(pedido.estado);
              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-100 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-darkblue mb-1">{pedido.id}</h3>
                      <p className="text-sm text-gray-500">{pedido.fecha}</p>
                    </div>
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-semibold text-sm ${badge.color}`}>
                      {badge.icon}
                      {badge.text}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">
                      {pedido.productos.join(", ")}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {pedido.items} productos
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-darkblue">S/ {pedido.total.toFixed(2)}</p>
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-darkblue text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 Vanesa Bodeguita. Todos los derechos reservados.</p>
          <p className="text-sm text-gray-400">Tu bodega de confianza en el barrio</p>
        </div>
      </footer>
    </div>
  );
}
