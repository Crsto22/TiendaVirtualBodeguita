"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, ChevronDown, LogOut, Settings, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SearchModal from "@/components/search-modal";
import CartSidebar from "@/components/cart-sidebar";

import { useCartStore } from "@/store/cart-store";
import { categories } from "@/data/categories";
import { useAuth } from "@/context/AuthContext";
import { useStoreConfigContext } from "@/context/StoreConfigContext";

import { LoginModal } from "@/components/auth/login-modal";
import { LogoutModal } from "@/components/auth/logout-modal";

export function Navbar() {
  // Store config
  const { tiendaAbierta, loading: loadingStoreConfig } = useStoreConfigContext();
  
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
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);


  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Primera fila: Logo, Buscador y Acciones */}
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
              className="md:hidden cursor-pointer text-darkblue hover:text-primary border-2 border-gray-200 rounded-full"
              onClick={() => setIsLoginOpen(true)
              }
            >
              <User className="size-6!" />
            </Button >
          )}
          
          {/* Logo centrado - Solo Mobile */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2">
            <Link href="/inicio" className="block hover:opacity-90 transition-opacity">
              <Image
                src="/Logo.png"
                alt="Vanesa Bodeguita"
                width={90}
                height={90}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Logo y Buscador - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-1">
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

            {/* Buscador - Desktop */}
            <div className="max-w-xl flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar en Vanesa Bodeguita"
                  className="w-full px-4 py-3.5 pr-12 bg-gray-100 rounded-full focus:outline-none focus:border-primary transition-colors text-sm font-semibold placeholder:font-semibold placeholder:text-gray-400"
                  style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                  onClick={() => setOpenSearch(true)}
                  readOnly
                />
                <button
                  onClick={() => setOpenSearch(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white p-3 rounded-full transition-colors"
                >
                  <Search className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
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
                  <div className="absolute right-0 top-full pt-2 w-56 z-50">
                    <div className="bg-yellow-50 rounded-xl shadow-xl border-l-4 border-darkblue p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium">Conectado como</p>
                          <p className="text-sm font-bold text-darkblue truncate mt-1">{user.nombre}</p>
                        </div>
                        <svg className="w-6 h-6 text-darkblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
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

            {/* User Settings Button - Solo cuando está logueado */}
            {user && (
              <div
                className="relative hidden md:block"
                onMouseEnter={() => setUserSettingsOpen(true)}
                onMouseLeave={() => setUserSettingsOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-darkblue hover:text-primary hover:bg-gray-50"
                >
                  <User className="size-6" />
                </Button>

                {/* Settings Dropdown */}
                {userSettingsOpen && (
                  <div className="absolute right-0 top-full pt-2 w-48 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/perfil"
                        onClick={() => setUserSettingsOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Settings className="size-4" />
                        Ajustes
                      </Link>

                      <button
                        onClick={() => {
                          setIsLogoutOpen(true);
                          setUserSettingsOpen(false);
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
            )}

            {/* Cart Button */}
            {loadingStoreConfig ? (
              // Skeleton loader mientras carga el estado de la tienda
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse hidden md:block"></div>
              </div>
            ) : tiendaAbierta ? (
              <Button
                onClick={openCart}
                className="text-darkblue bg-white hover:bg-white cursor-pointer px-4 py-2 flex items-center gap-2 relative"
              >
                <ShoppingCart className="size-6!" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                disabled
                aria-label="Tienda cerrada temporalmente"
                className="bg-red-400 cursor-not-allowed text-white font-semibold rounded-full px-4 py-2 flex items-center gap-2"
              >
                <span className="text-xs md:text-base" aria-hidden="true">CERRADA</span>
                <X className="size-6!" />
              </Button>
            )}
          </div>
        </div>

        {/* Segunda fila: Categorías de Productos - Solo Desktop */}
        <div className="hidden md:flex items-center justify-between pt-3 mt-3">
          {/* Categorías Dropdown - Desktop */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-none text-darkblue font-semibold border-none cursor-pointer hover:bg-white px-6 py-2 transition-colors"
            >
              Categorías de Productos
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
                        className="group flex flex-col items-center p-3 rounded-xl hover:bg-linear-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-200 border-2 border-transparent hover:border-primary/20"
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

          {/* Historial de Pedidos - Desktop */}
          <Link
            href="/pedidos"
            className="text-darkblue text-sm font-semibold  transition-colors px-6 py-2 rounded-full0"
          >
            Historial de Pedidos
          </Link>
        </div>
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
