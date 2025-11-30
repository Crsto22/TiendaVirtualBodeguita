"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User, Phone, MapPin, MapPinned, LogOut } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { LogoutModal } from "@/components/auth/logout-modal";

export default function PerfilPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        direccion: "",
        referencia: ""
    });

    // Verificar autenticación
    useEffect(() => {
        if (!user) {
            router.push("/");
        } else {
            setIsCheckingAuth(false);
        }
    }, [user, router]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.uid) return;

            setIsLoading(true);
            try {
                const userRef = doc(db, "usuarios", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFormData({
                        nombre: data.nombre || "",
                        telefono: data.telefono || "",
                        direccion: data.direccion || "",
                        referencia: data.referencia || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Error al cargar los datos del perfil");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user?.uid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.uid) return;

        // Validaciones
        if (!formData.nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        if (formData.telefono && (!/^\d+$/.test(formData.telefono) || formData.telefono.length < 9)) {
            toast.error("El teléfono debe tener al menos 9 dígitos numéricos");
            return;
        }

        setIsSaving(true);
        try {
            const userRef = doc(db, "usuarios", user.uid);
            await updateDoc(userRef, {
                nombre: formData.nombre,
                telefono: formData.telefono,
                direccion: formData.direccion,
                referencia: formData.referencia
            });

            toast.success("Datos guardados correctamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setIsLogoutOpen(false);
    };

    // Mostrar loading mientras se verifica la autenticación
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Si no hay usuario después de la verificación, no mostrar nada (ya se redirigió)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />
            <MobileDock />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur opacity-25"></div>
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl relative ring-4 ring-primary/10">
                                    <AvatarImage src={user?.foto_url || ""} alt={user?.nombre || "Usuario"} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-4xl md:text-5xl font-bold">
                                        {user?.nombre?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-grow text-center md:text-left space-y-2 md:pt-4">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-darkblue tracking-tight">
                                {user?.nombre || "Mi Perfil"}
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 font-medium">
                                {user?.email}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 max-w-xl">
                                Actualiza tu información personal para mejorar tu experiencia de compra
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="container mx-auto px-4 -mt-8 md:-mt-12 pb-12 relative">
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[400px] bg-white rounded-3xl shadow-xl">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 md:p-10 lg:p-12">
                            <form onSubmit={handleSave} className="space-y-8">
                                {/* Nombre Completo */}
                                <div className="space-y-3">
                                    <Label htmlFor="nombre" className="text-darkblue font-semibold text-sm md:text-base flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        Nombre Completo
                                    </Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="h-12 md:h-14 text-sm md:text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                                        placeholder="Ingresa tu nombre completo"
                                    />
                                </div>

                                {/* Grid para Teléfono y Dirección */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                    {/* Teléfono */}
                                    <div className="space-y-3">
                                        <Label htmlFor="telefono" className="text-darkblue font-semibold text-sm md:text-base flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className="h-12 md:h-14 text-sm md:text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                                            placeholder="999 999 999"
                                            type="tel"
                                        />
                                    </div>

                                    {/* Dirección */}
                                    <div className="space-y-3">
                                        <Label htmlFor="direccion" className="text-darkblue font-semibold text-sm md:text-base flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            Dirección
                                        </Label>
                                        <Input
                                            id="direccion"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            className="h-12 md:h-14 text-sm md:text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                                            placeholder="Av. Principal 123"
                                        />
                                    </div>
                                </div>

                                {/* Referencia */}
                                <div className="space-y-3">
                                    <Label htmlFor="referencia" className="text-darkblue font-semibold text-sm md:text-base flex items-center gap-2">
                                        <MapPinned className="h-4 w-4 text-primary" />
                                        Referencia
                                    </Label>
                                    <Input
                                        id="referencia"
                                        name="referencia"
                                        value={formData.referencia}
                                        onChange={handleInputChange}
                                        className="h-12 md:h-14 text-sm md:text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                                        placeholder="Frente al parque, esquina con..."
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="pt-4 space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 md:h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                                                Guardando cambios...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>

                                    {/* Logout Button */}
                                    <Button
                                        type="button"
                                        onClick={() => setIsLogoutOpen(true)}
                                        variant="outline"
                                        className="w-full h-12 md:h-14 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-sm md:text-base rounded-xl"
                                    >
                                        <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                        Cerrar Sesión
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
