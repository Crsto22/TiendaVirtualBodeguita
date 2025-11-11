import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

export default function CategoriasPage() {

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Header */}
      <section className="bg-linear-to-r from-primary to-primary/90 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Todas las Categorías</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90">Explora nuestros productos organizados por categoría</p>
        </div>
      </section>

      {/* Categorías Grid */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
            {categories.map((categoria, index) => (
              <Link
                key={index}
                href={`/productos?categoria=${categoria.name.toLowerCase()}`}
                className="flex flex-col items-center group"
              >
                {/* Círculo con imagen */}
                <div
                  className={`${categoria.color} w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 overflow-hidden`}
                >
                  <div className="relative w-full h-full p-3 sm:p-4">
                    <Image
                      src={categoria.image}
                      alt={categoria.name}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                
                {/* Nombre de categoría */}
                <p className="text-[12px] sm:text-xs md:text-sm text-center text-darkblue font-medium group-hover:text-primary transition-colors w-20 sm:w-24 md:w-28 line-clamp-2 leading-tight">
                  {categoria.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
