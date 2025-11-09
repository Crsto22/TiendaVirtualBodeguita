"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Search, ShoppingBag } from "lucide-react";

export function MobileDock() {
  const pathname = usePathname();

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
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/20 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon 
                className={`h-6 w-6 transition-transform ${
                  isActive ? "scale-110" : ""
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-xs font-semibold ${
                  isActive ? "text-primary" : ""
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
