import Image from "next/image";
import Link from "next/link";
import { Poppins, Montserrat } from "next/font/google";

const poppins = Poppins({
  weight: ['700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['300', '400'],
  subsets: ['latin'],
  display: 'swap',
});

export function FeaturedCategories() {
  return (
    <section className=" bg-white">
      <div className="container mx-auto px-4">
        {/* Scroll horizontal en móvil, grid en desktop */}
        <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:snap-none">
          {/* Card Cerveza */}
          <Link 
            href="/coleccion/bebidas-alcohólicas"
            className="block shrink-0 w-[90vw] sm:w-[85vw] md:w-auto snap-center md:col-span-2 lg:col-span-1"
          >
            <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-36 sm:h-40 md:h-48 cursor-pointer active:scale-95" style={{ backgroundColor: '#f38b00' }}>
              <div className="flex items-stretch h-full">
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center min-w-0">
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-white/90 transition-colors leading-tight ${poppins.className}`}>
                    Las mejores cervezas frías
                  </h3>
                  <p className={`text-xs sm:text-sm md:text-base text-white/90 font-light leading-snug ${montserrat.className}`}>
                    Para compartir los mejores momentos
                  </p>
                </div>
                <div className="relative w-32 sm:w-40 md:w-48 shrink-0">
                  <Image
                    src="/Inicio/Cerveza.svg"
                    alt="Cerveza"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Card Galletas */}
          <Link 
            href="/coleccion/galletas"
            className="block shrink-0 w-[90vw] sm:w-[85vw] md:w-auto snap-center"
          >
            <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-36 sm:h-40 md:h-48 cursor-pointer active:scale-95" style={{ backgroundColor: '#a9000f' }}>
              <div className="flex items-stretch h-full">
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center min-w-0">
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-white/90 transition-colors leading-tight ${poppins.className}`}>
                    Galletas que enamoran
                  </h3>
                  <p className={`text-xs sm:text-sm md:text-base text-white/90 font-light leading-snug ${montserrat.className}`}>
                    Perfectas para el desayuno y la lonchera
                  </p>
                </div>
                <div className="relative w-32 sm:w-40 md:w-48 shrink-0">
                  <Image
                    src="/Inicio/Galleta.svg"
                    alt="Galletas"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Card Detergente */}
          <Link 
            href="/coleccion/productos-de-limpieza"
            className="block shrink-0 w-[90vw] sm:w-[85vw] md:w-auto snap-center"
          >
            <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-36 sm:h-40 md:h-48 cursor-pointer active:scale-95" style={{ backgroundColor: '#87369b' }}>
              <div className="flex items-stretch h-full">
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center min-w-0">
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-white/90 transition-colors leading-tight ${poppins.className}`}>
                    Confianza en cada lavado
                  </h3>
                  <p className={`text-xs sm:text-sm md:text-base text-white/90 font-light leading-snug ${montserrat.className}`}>
                    Detergentes rendidores y efectivos
                  </p>
                </div>
                <div className="relative w-32 sm:w-40 md:w-48 shrink-0">
                  <Image
                    src="/Inicio/Detergente.svg"
                    alt="Detergente"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
