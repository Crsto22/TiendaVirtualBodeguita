import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="relative mb-6 h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 animate-in zoom-in-50 duration-500">
                <Image
                    src="/Logo.png"
                    alt="Vanesa Bodeguita Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <h1 className="mb-2 font-heading text-3xl sm:text-4xl md:text-6xl font-black text-darkblue tracking-tight">
                404
            </h1>

            <h2 className="mb-3 sm:mb-4 font-heading text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                ¡Ups! Página no encontrada
            </h2>

            <p className="mb-8 max-w-xs sm:max-w-md text-sm sm:text-base text-gray-500 font-body leading-relaxed px-2">
                Parece que la página que buscas no existe o se ha movido de lugar.
                Revisa la dirección o vuelve a nuestra portada.
            </p>

            <Button asChild className="w-full sm:w-auto h-12 px-8 gap-2 rounded-xl bg-primary hover:bg-green-700 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 font-bold text-base">
                <Link href="/">
                    <Home className="h-5 w-5" />
                    Volver al Inicio
                </Link>
            </Button>

            {/* Decoración de fondo simple */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl opacity-60" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-3xl opacity-60" />
            </div>
        </div>
    );
}
