"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SearchModal from "@/components/search-modal";
import CartSidebar from "@/components/cart-sidebar";
import { useCartStore } from "@/store/cart-store";
import { categories } from "@/data/categories";

import { LoginModal } from "@/components/auth/login-modal";

export function Navbar() {
  // Zustand store - Obtener items directamente para forzar re-render
  const items = useCartStore(state => state.items);
  const isOpen = useCartStore(state => state.isOpen);
  const openCart = useCartStore(state => state.openCart);
  const closeCart = useCartStore(state => state.closeCart);

  // Calcular totales desde los items
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  const [openSearch, setOpenSearch] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile: Menu Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-darkblue hover:text-primary hover:bg-gray-100"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>

          {/* Logo y Categorías - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/inicio" className="shrink-0 hover:opacity-90 transition-opacity">
              <Image
                src="/Logo.png"
                alt="Vanesa Bodeguita"
                width={100}
                height={100}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Categorías Dropdown - Desktop */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Button
                variant="outline"
                className="flex items-center gap-2 border-2 border-darkblue text-darkblue hover:bg-darkblue hover:text-white font-semibold rounded-full px-6 py-2 transition-colors"
              >
                Categorías
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Mega Menu Dropdown */}
              {dropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-[800px] z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-lg font-bold text-darkblue mb-4 px-2">
                      Todas las Categorías
                    </h3>

                    {/* Grid de categorías */}
                    <div className="grid grid-cols-4 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={`/coleccion/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="group flex flex-col items-center p-3 rounded-xl hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-200 border-2 border-transparent hover:border-primary/20"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {/* Imagen de categoría */}
                          <div className="w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-gray-200 group-hover:ring-primary transition-all duration-200 flex items-center justify-center bg-gray-50">
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Nombre */}
                          <p className="text-xs font-semibold text-center text-darkblue group-hover:text-primary transition-colors line-clamp-2 h-8">
                            {category.name}
                          </p>
                        </Link>
                      ))}
                    </div>

                    {/* Footer del dropdown */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                      <Link
                        href="/coleccion/todas"
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Ver todos los productos →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon - Desktop only */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:block text-darkblue hover:text-primary  rounded-full"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="size-6!" />
            </Button>

            {/* User Icon */}
            <Button
              variant="ghost"
              size="icon"
              className=" cursor-pointer rounded-full rounded-full bg-darkblue text-white"
              onClick={() => setIsLoginOpen(true)}
            >
              <User className="size-6!" />
            </Button>

            {/* Cart Button */}
            <Button
              onClick={openCart}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-4 py-2 flex items-center gap-2 relative"
            >
              <ShoppingCart className="size-6!" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CartSidebar open={isOpen} onClose={closeCart} />
    </nav>
  );
}
