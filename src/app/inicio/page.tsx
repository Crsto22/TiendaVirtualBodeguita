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
      src: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1200&h=500&fit=crop",
      alt: "Ofertas especiales de la semana"
    },
    {
      src: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&h=500&fit=crop",
      alt: "Productos frescos todos los días"
    },
    {
      src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=500&fit=crop",
      alt: "Delivery rápido a domicilio"
    },
    {
      src: "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=1200&h=500&fit=crop",
      alt: "Promociones en bebidas"
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
