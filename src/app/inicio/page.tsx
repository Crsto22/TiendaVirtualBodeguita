import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { HeroCarousel } from "@/components/inicio/hero-carousel";
import { CategoriesSection } from "@/components/inicio/categories-section";
import { ProductsSection } from "@/components/product/products-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InicioPage() {
  // Imágenes de publicidad - Reemplaza estas URLs con tus imágenes reales
  const publicidades = [
    {
      desktopSrc: "/Carousel/baner1.png",
      mobileSrc: "/Carousel/baner1-movil.png",
      alt: "Gran Inauguración Online"
    },
    // Placeholder para cuando tengas más banners
    {
      desktopSrc: "/Carousel/baner1.png",
      mobileSrc: "/Carousel/baner1-movil.png",
      alt: "Ofertas de Lanzamiento"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Hero Carousel - Publicidades */}
      <HeroCarousel images={publicidades} />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Products Section */}
      <ProductsSection />
    </div>
  );
}
