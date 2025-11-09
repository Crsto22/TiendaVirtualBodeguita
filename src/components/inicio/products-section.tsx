"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  category: string;
  stock: number;
  discount?: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Coca Cola 2L",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop",
    price: 8.50,
    oldPrice: 10.00,
    rating: 4.5,
    category: "Bebidas",
    stock: 50,
    discount: 15,
  },
  {
    id: 2,
    name: "Aceite Primor 1L",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
    price: 12.90,
    rating: 4.8,
    category: "Abarrotes",
    stock: 30,
  },
  {
    id: 3,
    name: "Arroz Superior 5kg",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    price: 18.50,
    oldPrice: 22.00,
    rating: 4.7,
    category: "Abarrotes",
    stock: 25,
    discount: 16,
  },
  {
    id: 4,
    name: "Leche Gloria Entera 1L",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    price: 4.20,
    rating: 4.6,
    category: "Lácteos",
    stock: 100,
  },
  {
    id: 5,
    name: "Pan Integral Bimbo",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    price: 5.80,
    rating: 4.3,
    category: "Panadería",
    stock: 40,
  },
  {
    id: 6,
    name: "Galletas Oreo Pack",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    price: 7.50,
    oldPrice: 9.00,
    rating: 4.9,
    category: "Galletas",
    stock: 60,
    discount: 17,
  },
  {
    id: 7,
    name: "Fideos Don Vittorio 1kg",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop",
    price: 4.50,
    rating: 4.4,
    category: "Fideos",
    stock: 80,
  },
  {
    id: 8,
    name: "Atún Florida Pack x3",
    image: "https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=400&h=400&fit=crop",
    price: 15.90,
    oldPrice: 18.50,
    rating: 4.6,
    category: "Enlatados",
    stock: 45,
    discount: 14,
  },
  {
    id: 9,
    name: "Chocolate Sublime",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop",
    price: 2.50,
    rating: 4.8,
    category: "Chocolates",
    stock: 120,
  },
  {
    id: 10,
    name: "Café Nescafé Clásico 200g",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    price: 16.50,
    rating: 4.7,
    category: "Café",
    stock: 35,
  },
];

export function ProductsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollPosition =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className=" bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-darkblue">
            Productos Destacados
          </h2>
          <Link href="/categorias">
            <Button variant="outline" className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-white">
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute hidden md:flex left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5 md:size-6" />
          </button>

          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth md:px-10"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="group shrink-0"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-[160px] md:w-[200px] lg:w-[220px] h-[280px] md:h-[340px] flex flex-col group-hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative h-[140px] md:h-[180px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1 p-3 md:p-4">
                    {/* Category */}
                    <span className="text-xs text-primary font-medium mb-1">
                      {product.category}
                    </span>

                    {/* Product Name */}
                    <h3 className="text-sm md:text-base font-semibold text-darkblue mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Price and Cart Container */}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg md:text-xl font-bold text-primary">
                        S/ {product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Lógica para agregar al carrito
                        }}
                        className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
                        aria-label="Agregar al carrito"
                      >
                        <ShoppingCart className="size-4 md:size-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 hidden md:flex -translate-y-1/2 translate-x-3 md:translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-5 md:size-6" />
          </button>
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 md:hidden flex justify-center">
          <Link href="/categorias">
            <Button className="bg-primary hover:bg-primary/90 text-white w-full">
              Ver todos los productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
