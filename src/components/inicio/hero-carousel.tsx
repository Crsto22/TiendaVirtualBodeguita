"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroCarouselProps {
  images: {
    desktopSrc: string;
    mobileSrc: string;
    alt: string;
    href?: string;
  }[];
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center"
    },
    [Autoplay({ delay: 6000, stopOnInteraction: false })] // Increased delay for better reading
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => {
            const content = (
              <>
                {/* Contenedor Mobile (Visible solo en móvil) */}
                <div className="relative w-full aspect-[4/3] md:hidden">
                  <Image
                    src={image.mobileSrc}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                {/* Contenedor Desktop (Visible solo en tablet/desktop) */}
                <div className="relative w-full hidden md:block aspect-[1920/500]">
                  <Image
                    src={image.desktopSrc}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </>
            );

            return (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                {image.href ? (
                  <Link href={image.href} className="block w-full h-full cursor-pointer">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${index === selectedIndex
              ? "bg-secondary w-8 md:w-10"
              : "bg-white/60 hover:bg-white/80"
              }`}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
