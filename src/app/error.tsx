"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Aquí podrías registrar el error en un servicio de seguimiento
        console.error("Error capturado por la barrera global:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="relative mb-6 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 grayscale opacity-80">
                <Image
                    src="/Logo.png"
                    alt="Vanesa Bodeguita Logo"
                    fill
                    className="object-contain"
                />
            </div>

            <h1 className="mb-2 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-darkblue">
                ¡Algo salió mal!
            </h1>

            <p className="mb-8 max-w-xs sm:max-w-md text-sm sm:text-base text-gray-500 font-body leading-relaxed px-2">
                Lo sentimos, ha ocurrido un error inesperado al cargar esta página.
                Por favor, intenta recargar o vuelve más tarde.
            </p>

            <div className="flex flex-col w-full max-w-[280px] sm:max-w-md gap-3 sm:flex-row sm:gap-4 justify-center">
                <Button
                    onClick={() => reset()}
                    className="w-full sm:w-auto h-11 gap-2 bg-primary hover:bg-green-700 text-white shadow-md rounded-xl font-semibold active:scale-95"
                >
                    <RefreshCw className="h-4 w-4" />
                    Intentar de nuevo
                </Button>

                <Button
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto h-11 gap-2 border-darkblue/20 text-darkblue hover:bg-darkblue/5 rounded-xl font-semibold active:scale-95"
                >
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Volver al Inicio
                    </Link>
                </Button>
            </div>

            {/* Decoración de fondo simple */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] h-[30%] w-[30%] rounded-full bg-red-500/5 blur-3xl opacity-50" />
            </div>
        </div>
    );
}
