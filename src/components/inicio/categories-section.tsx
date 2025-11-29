"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { categories } from "@/data/categories";

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
            {categories.map((category, index) => {
              // Convertir nombre de categoría a slug URL-friendly
              const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Link
                  key={index}
                  href={`/coleccion/${encodeURIComponent(categorySlug)}`}
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
              );
            })}
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
