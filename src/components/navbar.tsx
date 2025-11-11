"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SearchModal from "@/components/search-modal";
import CartSidebar from "@/components/cart-sidebar";

export function Navbar() {
  const [cartTotal, setCartTotal] = useState(16.8); // TODO: Conectar con estado global
  const [cartItems, setCartItems] = useState(3); // TODO: Conectar con estado global
  const [openSearch, setOpenSearch] = useState(false);
  const [openCart, setOpenCart] = useState(false);

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

            {/* Categorías Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-2 border-darkblue text-darkblue hover:bg-darkblue hover:text-white font-semibold rounded-full px-6 py-2 transition-colors"
            >
              Categorías
              <ChevronDown className="h-4 w-4" />
            </Button>
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

            {/* User Icon - Desktop only */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:block text-darkblue hover:text-primary  rounded-full"
            >
              <User className="size-6!"   />
            </Button>

            {/* Cart Button */}
            <Button
              onClick={() => setOpenCart(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-4 py-2 flex items-center gap-2 relative"
            >
              <ShoppingCart className="size-6!"  />
              <span className="hidden sm:inline">S/ {cartTotal.toFixed(2)}</span>
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />
      <CartSidebar open={openCart} onClose={() => setOpenCart(false)} />
    </nav>
  );
}
