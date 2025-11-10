"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getProductsClient } from "@/lib/api";
import { Category } from "@/types/product";

// Función para capitalizar texto (primera letra mayúscula, resto minúscula)
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Componente individual para el carrusel de cada categoría
function CategoryCarousel({ category }: { category: Category }) {
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

  if (!category.productos || category.productos.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-darkblue">
          {category.categoria_nombre}
        </h3>
        <Link href={`/categorias/${category.categoria_id}`}>
          <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm">
            Ver más →
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
          {category.productos.map((product) => (
            <Link
              key={product.id}
              href={`/productos/${product.producto_web}`}
              className="group shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-[150px] sm:w-40 md:w-[200px] lg:w-[220px] h-[260px] sm:h-[280px] md:h-[340px] flex flex-col group-hover:scale-[1.02]">
                {/* Image Container */}
                <div className="relative h-[120px] sm:h-[140px] md:h-[180px] bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.imagen ? (
                    <Image
                      src={product.imagen}
                      alt={product.nombre}
                      fill
                      className=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ShoppingCart className="size-8 sm:size-10 md:size-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1 p-2 sm:p-3 md:p-4">
                  {/* Product Name */}
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-darkblue mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {capitalizeText(product.nombre)}
                  </h3>
                  
                  {/* Unit Type */}
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
                    {product.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                  </p>

                  {/* Price and Cart Container */}
                  <div className="mt-auto flex items-center justify-between gap-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                        S/ {product.precio.toFixed(2)}
                      </span>
                      {product.has_precio_alternativo && product.precio_alternativo && (
                        <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {product.motivo_precio_alternativo}: S/ {product.precio_alternativo.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Lógica para agregar al carrito
                      }}
                      className="bg-primary text-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      aria-label="Agregar al carrito"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="size-3.5 sm:size-4 md:size-5" />
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
    </div>
  );
}

export function ProductsSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await getProductsClient();
        
        // Filtrar categorías que tienen productos y tomar solo las primeras 5
        const categoriesWithProducts = response.data
          .filter(category => category.productos && category.productos.length > 0)
          .slice(0, 5);
        
        setCategories(categoriesWithProducts);
        setError(null);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-darkblue mb-6">
            Productos por Categoría
          </h2>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-8">
              <div className="h-8 bg-gray-300 rounded w-48 mb-4 animate-pulse" />
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="shrink-0">
                    <div className="bg-gray-200 rounded-2xl w-40 md:w-[200px] lg:w-[220px] h-[280px] md:h-[340px] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Render each category with its carousel */}
        {categories.map((category) => (
          <CategoryCarousel key={category.categoria_id} category={category} />
        ))}

        {/* Mobile View All Button */}
        <div className="mt-6 md:hidden flex justify-center">
          <Link href="/categorias">
            <Button className="bg-primary hover:bg-primary/90 text-white w-full">
              Ver todas las categorías
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
