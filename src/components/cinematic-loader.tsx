"use client";

import Image from "next/image";
import "./cinematic-loader.css";

interface CinematicLoaderProps {
  fadeOut?: boolean;
}

export function CinematicLoader({ fadeOut = false }: CinematicLoaderProps) {
  return (
    <div
      className="fixed inset-0 min-h-screen w-full flex items-center justify-center overflow-hidden bg-primary transition-opacity duration-600 ease-out z-100"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      {/* Círculo que se expande hasta llenar la pantalla */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="loader-circle rounded-full bg-secondary absolute" />
      </div>

      {/* Logo en el centro */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="loader-logo w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/Logo.png"
            alt="Vanesa Bodeguita"
            width={160}
            height={160}
            className="w-full h-full object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}
