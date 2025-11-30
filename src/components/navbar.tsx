"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, ChevronDown, LogOut, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SearchModal from "@/components/search-modal";
import CartSidebar from "@/components/cart-sidebar";

import { useCartStore } from "@/store/cart-store";
import { categories } from "@/data/categories";
import { useAuth } from "@/context/AuthContext";

import { LoginModal } from "@/components/auth/login-modal";
import { LogoutModal } from "@/components/auth/logout-modal";

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
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);


  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile: Menu Icon */}

          {user ? (
            <div className="md:hidden flex items-center gap-2 border border-gray-200 rounded-full p-1">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                {user.foto_url ? (
                  <Image
                    src={user.foto_url}
                    alt={user.nombre || "Usuario"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.nombre?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <Link
                href="/perfil"
                className="flex items-center justify-center text-darkblue hover:text-primary h-8 w-8"
              >
                <Settings className="size-5" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                onClick={() => setIsLogoutOpen(true)}
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className=" md:hidden  cursor-pointer text-darkblue hover:text-primary border border-gray-200 border-2 rounded-full"
              onClick={() => setIsLoginOpen(true)
              }
            >
              <User className="size-6!" />
            </Button >
          )}
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
            {/* User Section - Desktop */}
            {user ? (
              <div
                className="relative hidden md:block"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <button className="flex items-center gap-2 hover:bg-gray-50 rounded-full pl-1 pr-3 py-1 transition-colors border border-gray-200 hover:border-gray-400">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    {user.foto_url ? (
                      <Image
                        src={user.foto_url}
                        alt={user.nombre || "Usuario"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.nombre?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-darkblue max-w-[100px] truncate">
                    {user.nombre?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`size-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-48 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500">Conectado como</p>
                        <p className="text-sm font-bold text-darkblue truncate">{user.nombre}</p>
                      </div>

                      <Link
                        href="/pedidos"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Package className="size-4" />
                        Pedidos
                      </Link>

                      <Link
                        href="/perfil"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Settings className="size-4" />
                        Ajustes
                      </Link>

                      <button
                        onClick={() => {
                          setIsLogoutOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="size-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:block cursor-pointer text-darkblue hover:text-primary "
                onClick={() => setIsLoginOpen(true)}
              >
                <User className="size-6!" />
              </Button>
            )}

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
        </div >
      </div >
      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutOpen(false);
        }}
      />
      <CartSidebar open={isOpen} onClose={closeCart} />


    </nav >
  );
}
