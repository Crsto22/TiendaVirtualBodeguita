import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { HeroCarousel } from "@/components/inicio/hero-carousel";
import { CategoriesSection } from "@/components/inicio/categories-section";
import { ProductsSection } from "@/components/product/products-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "@/lib/api";

export default async function InicioPage() {
  // Fetch de productos en el servidor (SSR)
  // Esto hace que la página cargue con los datos ya listos, eliminando el lag inicial
  const productsData = await getProducts().catch((err) => {
    console.error("Error fetching initial products:", err);
    return undefined;
  });

  // Imágenes de publicidad - Reemplaza estas URLs con tus imágenes reales
  const publicidades = [
    {
      desktopSrc: "/Carousel/baner1.png",
      mobileSrc: "/Carousel/baner1-movil.png",
      alt: "Gran Inauguración Online"
    },
    {
      desktopSrc: "/Carousel/baner2.png",
      mobileSrc: "/Carousel/baner2-movil.png",
      alt: "Aprende a comprar paso a paso",
      href: "/tutorial"
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
      <ProductsSection initialData={productsData} />
    </div>
  );
}
