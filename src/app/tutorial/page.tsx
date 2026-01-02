"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { Button } from "@/components/ui/button";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import {
    Search,
    ShoppingCart,
    Wallet,
    Store,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Scale,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function TutorialPage() {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 1,
            title: "Explora y Elige",
            description: "Navega por nuestras categorías o usa el buscador. Presiona el botón '+' para sumar antojitos a tu carrito.",
            icon: Search,
            color: "bg-blue-100 text-blue-600",
            imageSrc: "/Tutorial/1.png"
        },
        {
            id: 2,
            title: "Personaliza tu Pedido",
            description: "Pide por **Unidades**, **Kilos** o **Monto en Soles**. Si ves 'Consultar', cotizaremos el precio exacto en tienda.",
            icon: Scale,
            color: "bg-pink-100 text-pink-600",
            imageSrc: "/Tutorial/2.png"
        },
        {
            id: 3,
            title: "Revisa tu Carrito",
            description: "Toca el ícono de la bolsa para ver tu resumen. Ajusta cantidades y verifica tu total aproximado.",
            icon: ShoppingCart,
            color: "bg-orange-100 text-orange-600",
            imageSrc: "/Tutorial/3.png"
        },
        {
            id: 4,
            title: "Elige Cómo Pagar",
            description: "Selecciona **Efectivo** o **Yape/Plin**. ¡Tranquilo! No pagas nada en la web, todo es al recoger.",
            icon: Wallet,
            color: "bg-purple-100 text-purple-600",
            imageSrc: "/Tutorial/4.png"
        },
        {
            id: 5,
            title: "Revisión y Sustitutos",
            description: "Si algo falta, recibirás alertas con **productos similares**. Puedes aceptar la sugerencia o rechazarla desde tu celular antes de confirmar.",
            icon: CheckCircle2,
            color: "bg-orange-100 text-orange-600",
            imageSrc: "/Tutorial/propuesta.png"
        },
        {
            id: 6,
            title: "Recoge en Tienda",
            description: "Espera la notificación **'Listo para Recojo'**. Tienes 3 horas para pasar por tu pedido sin hacer cola.",
            icon: Store,
            color: "bg-green-100 text-green-600",
            imageSrc: "/Tutorial/5.png"
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const currentData = steps[currentStep];

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-0 font-sans">
            <Navbar />
            <MobileDock />

            <div className="container mx-auto px-4 pt-2 md:pt-12 max-w-6xl h-[calc(100vh-140px)] md:h-auto flex flex-col justify-center">

                {/* Header Compacto (Oculto en móvil para ganar espacio) */}
                <div className="text-center mb-8 md:mb-12 hidden md:block">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-2 uppercase">
                        Guía Rápida
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-darkblue">
                        ¿Cómo comprar?
                    </h1>
                </div>

                {/* --- WIZARD INTERACTIVO --- */}
                <div className="bg-gray-50 rounded-3xl md:rounded-[2.5rem] p-4 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center h-full md:h-auto">

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-16 items-center">

                        {/* MOCKUP (Visible en Mobile Primero) */}
                        <div className="order-1 md:order-2 flex justify-center py-2 md:py-4 bg-white/50 rounded-3xl">
                            <div className="relative w-[170px] h-[340px] sm:w-[240px] sm:h-[480px] md:w-[280px] md:h-[560px] transition-all duration-500">
                                <PhoneMockup className="w-full h-full shadow-2xl border-gray-800">
                                    <div className="relative w-full h-full bg-gray-100">
                                        {/* Transición de Imagen */}
                                        <Image
                                            key={currentData.imageSrc} // Key changes force re-render/anim
                                            src={currentData.imageSrc}
                                            alt={currentData.title}
                                            fill
                                            className="object-cover object-top animate-in fade-in zoom-in-95 duration-500"
                                            priority
                                        />
                                    </div>
                                </PhoneMockup>
                            </div>
                        </div>

                        {/* TEXTO Y CONTROLES */}
                        <div className="order-2 md:order-1 flex flex-col justify-center space-y-3 md:space-y-8 text-center md:text-left">

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-2xl ${currentData.color} transition-colors duration-300`}>
                                    <currentData.icon className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <span className="text-gray-400 font-bold text-[10px] md:text-sm tracking-widest uppercase">
                                    Paso {currentStep + 1} de {steps.length}
                                </span>
                            </div>

                            <div className="space-y-2 md:space-y-4">
                                <h2 className="text-xl md:text-5xl font-extrabold text-gray-900 leading-tight transition-all duration-300">
                                    {currentData.title}
                                </h2>
                                <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0 min-h-[50px] md:min-h-[80px]">
                                    {/* Render markdown-like bold */}
                                    {currentData.description.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                        part.startsWith('**') && part.endsWith('**')
                                            ? <strong key={i} className="text-gray-800 font-bold text-base md:text-xl">{part.slice(2, -2)}</strong>
                                            : part
                                    )}
                                </p>
                            </div>

                            {/* Navigation Buttons Mobile Optimized */}
                            <div className="flex items-center justify-center md:justify-start gap-3 pt-1 w-full">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="h-10 md:h-12 flex-1 md:flex-none md:w-auto px-4 rounded-xl border-2 hover:bg-gray-50 text-gray-600 font-bold disabled:opacity-30 disabled:hidden text-xs md:text-base"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-0 md:mr-2" />
                                    <span className="hidden md:inline">Anterior</span>
                                </Button>

                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        onClick={nextStep}
                                        className="h-10 md:h-12 flex-[2] md:flex-none md:w-auto px-6 rounded-xl bg-darkblue hover:bg-darkblue/90 text-white font-bold shadow-lg shadow-darkblue/20 transition-all active:scale-95 group text-xs md:text-base"
                                    >
                                        Siguiente
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="h-10 md:h-12 flex-[2] md:flex-none md:w-auto px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs md:text-base"
                                    >
                                        <Link href="/inicio">
                                            ¡Empezar!
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            {/* Dots Indicator (Mobile) */}
                            <div className="flex justify-center gap-1.5 md:hidden pt-1">
                                {steps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentStep(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? "w-6 bg-darkblue" : "w-1.5 bg-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={className}>
            {children}
        </span>
    );
}
