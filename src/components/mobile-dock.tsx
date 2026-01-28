"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Search, ShoppingBag } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

export function MobileDock() {
  const pathname = usePathname();
  const { orders } = useOrder();

  // Contar pedidos activos (no entregados ni cancelados)
  const activeOrdersCount = orders.filter(
    (order) => order.estado !== "entregada" && order.estado !== "cancelada"
  ).length;

  const navItems = [
    {
      name: "Inicio",
      href: "/inicio",
      icon: Home,
    },
    {
      name: "Categorías",
      href: "/categorias",
      icon: Grid3x3,
    },
    {
      name: "Buscar",
      href: "/buscar",
      icon: Search,
    },
    {
      name: "Pedidos",
      href: "/pedidos",
      icon: ShoppingBag,
      ...(activeOrdersCount > 0 && { badge: activeOrdersCount }),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const hasBadge = 'badge' in item && item.badge && item.badge > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-1 w-16 cursor-pointer border-none bg-transparent p-0 outline-none"
            >
              {/* Contenedor del Icono (Píldora) */}
              <div
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-transparent text-gray-500 group-hover:bg-gray-50"
                  }`}
              >
                <Icon
                  className="h-5 w-5 transition-transform duration-200"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Badge de pedidos activos */}
                {hasBadge && (
                  <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
                    {(item.badge ?? 0) > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>

              {/* Texto */}
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-primary font-bold" : "text-gray-500"
                  }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
