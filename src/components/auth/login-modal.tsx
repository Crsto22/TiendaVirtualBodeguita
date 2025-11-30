"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";


import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isDesktop, setIsDesktop] = useState(false);
    const { signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Detectar desktop
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const user = await signInWithGoogle();
            if (user) {
                toast.success(`Bienvenido, ${user.nombre}`, {
                    duration: 3000,
                });
            }
            onClose();
        } catch (error) {
            console.error("Error en login:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => (
        <div className="flex flex-col items-center space-y-6 py-6 ">
            <Image
                src="/Bienvenida.png"
                alt="Bienvenida"
                width={150}
                height={150}
                className="object-contain"
                priority
            />
            <div className="text-center space-y-2 -mt-5">
                <p className="text-gray-600">
                    Inicia sesión para gestionar tus pedidos y direcciones
                </p>
            </div>

            <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 flex items-center justify-center border border-gray-200 gap-3 text-base font-medium cursor-pointer hover:bg-gray-50 transition-colors rounded-full"
            >
                {isLoading ? (
                    <div className="size-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                )}
                {isLoading ? "Iniciando sesión..." : "Continuar con Google"}
            </Button>

            <p className="text-xs text-center text-gray-500 px-4">
                Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center text-darkblue">
                            Bienvenido
                        </DialogTitle>
                    </DialogHeader>
                    {renderContent()}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="rounded-t-[20px] px-4 pt-6 pb-8 bg-white data-[state=open]:duration-300 data-[state=closed]:duration-200 will-change-transform">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl font-bold text-center text-darkblue">
                        Bienvenido
                    </SheetTitle>
                </SheetHeader>
                {renderContent()}
            </SheetContent>
        </Sheet>
    );
}
