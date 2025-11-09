"use client";

import { useState, useEffect } from "react";
import { CinematicLoader } from "@/components/cinematic-loader";

export function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Mostrar el loader por 3 segundos
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Ocultar completamente después de la animación de fade
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <CinematicLoader fadeOut={fadeOut} />}
      {children}
    </>
  );
}
