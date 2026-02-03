"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, ShoppingBag } from "lucide-react";
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
      id: 'inicio',
      href: "/inicio",
      icon: Home,
      label: 'Inicio'
    },
    {
      id: 'categorias',
      href: "/categorias",
      icon: Grid,
      label: 'Categorías'
    },
    {
      id: 'buscar',
      href: "/buscar",
      icon: Search,
      label: 'Buscar'
    },
    {
      id: 'pedidos',
      href: "/pedidos",
      icon: ShoppingBag,
      label: 'Pedidos',
      badge: activeOrdersCount
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none">
      <div className="w-full bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-200 flex items-stretch justify-around pointer-events-auto safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative pt-3 pb-2 flex-1 flex flex-col items-center justify-center gap-1.5 group select-none"
            >
              {/* Top Line Marker */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-secondary shadow-[0_0_12px] shadow-secondary transition-all duration-500 ease-out origin-center ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`} />

              <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary -translate-y-0.5' : 'text-darkblue/50 group-hover:bg-slate-50'
                }`}>
                <Icon
                  size={20}
                  className="transition-transform duration-300"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              <span className={`text-[10px] font-heading font-bold tracking-wide uppercase transition-colors duration-300 ${isActive ? 'text-darkblue' : 'text-slate-400'
                }`}>
                {item.label}
              </span>

              {/* Badge de pedidos activos */}
              {(item.badge && item.badge > 0) ? (
                <span className="absolute top-2 right-[20%] min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-body font-bold rounded-full px-1 shadow-md z-20">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
