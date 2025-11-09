"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface Category {
  name: string;
  image: string;
  color: string;
  href: string;
}

const categories: Category[] = [
  { name: "Snacks y cereales", image: "/Categorias/SnacksYCereales.png", color: "bg-[#8B7355]", href: "/categorias" },
  { name: "Abarrotes", image: "/Categorias/Abarrotes.png", color: "bg-[#6B6B6B]", href: "/categorias" },
  { name: "Bebidas", image: "/Categorias/Bebidas.png", color: "bg-[#4A7C8C]", href: "/categorias" },
  { name: "Galletas", image: "/Categorias/Galletas.png", color: "bg-[#A89968]", href: "/categorias" },
  { name: "GAS", image: "/Categorias/Gas.png", color: "bg-[#6B7C8C]", href: "/categorias" },
  { name: "Chocolates y dulces", image: "/Categorias/ChocolatesyDulces.png", color: "bg-[#7B6B5A]", href: "/categorias" },
  { name: "Grasas y Aceites", image: "/Categorias/GrasasYAceites.png", color: "bg-[#8B8B6B]", href: "/categorias" },
  { name: "Panadería", image: "/Categorias/Panaderia.png", color: "bg-[#B8956A]", href: "/categorias" },
  { name: "Carnes", image: "/Categorias/Carnes.png", color: "bg-[#A85A5A]", href: "/categorias" },
  { name: "Frutas", image: "/Categorias/Frutas.png", color: "bg-[#8BAA5A]", href: "/categorias" },
  { name: "Verduras", image: "/Categorias/Verduras.png", color: "bg-[#6B9B5A]", href: "/categorias" },
  { name: "Lácteos y Huevos", image: "/Categorias/LacteosYHuevos.png", color: "bg-[#7BA8C8]", href: "/categorias" },
  { name: "Alimentos Para Animales", image: "/Categorias/AlimentosParaAnimales.png", color: "bg-[#9B7B5A]", href: "/categorias" },
  { name: "Bebidas Alcohólicas", image: "/Categorias/BebidasAlcoholicas.png", color: "bg-[#8B5A5A]", href: "/categorias" },
  { name: "Bebidas Gaseosas", image: "/Categorias/BebidasGaseosas.png", color: "bg-[#5A8BAA]", href: "/categorias" },
  { name: "Bebidas y Alimentos Instantáneos", image: "/Categorias/BebidasAlimentosInstantaneas.png", color: "bg-[#AA8B5A]", href: "/categorias" },
  { name: "Café e Infusiones", image: "/Categorias/CafeEInfusiones.png", color: "bg-[#6B5A4A]", href: "/categorias" },
  { name: "Condimentos y Esencias", image: "/Categorias/CondimentosYEsencias.png", color: "bg-[#7B8B5A]", href: "/categorias" },
  { name: "Cuidado Personal", image: "/Categorias/CuidadoPersonal.png", color: "bg-[#8B7BA8]", href: "/categorias" },
  { name: "Embutidos", image: "/Categorias/Embutidos.png", color: "bg-[#A8685A]", href: "/categorias" },
  { name: "Enlatados", image: "/Categorias/Enlatados.png", color: "bg-[#8B8B8B]", href: "/categorias" },
  { name: "Fideos", image: "/Categorias/Fideos.png", color: "bg-[#C8AA7B]", href: "/categorias" },
  { name: "Harinas", image: "/Categorias/Harinas.png", color: "bg-[#D8C8AA]", href: "/categorias" },
  { name: "Licorería", image: "/Categorias/Licoreria.png", color: "bg-[#9B6B5A]", href: "/categorias" },
  { name: "Productos de Limpieza", image: "/Categorias/ProductosDeLimpieza.png", color: "bg-[#5A9BAA]", href: "/categorias" },
  { name: "Útiles Escolares", image: "/Categorias/UtilesEscolares.png", color: "bg-[#7B9BAA]", href: "/categorias" },
];

export function CategoriesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
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
    <section className="mt-5 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-darkblue mb-6">
          Categorías
        </h2>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute hidden md:flex  left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5 md:size-6" />
          </button>

          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth  md:px-10"
          >
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="flex flex-col items-center group shrink-0"
              >
                <div
                  className={`${category.color} w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-2  shadow-md overflow-hidden`}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={200}
                    height={200}
                    className="object-contain hover:scale-110 transition-transform hover:duration-300"
                  />
                </div>
                <p className="text-xs md:text-sm text-center text-darkblue font-medium group-hover:text-primary transition-colors w-24 md:w-28 lg:w-32">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 hidden md:flex  -translate-y-1/2 translate-x-3 md:translate-x-4 bg-white hover:bg-gray-50 text-darkblue p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10 "
            aria-label="Siguiente"
          >
            <ChevronRight className="size-5 md:size-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
