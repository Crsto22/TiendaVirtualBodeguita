"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationToggleProps {
    showLabel?: boolean;
    className?: string;
    variant?: 'default' | 'simple' | 'card';
}

export function NotificationToggle({ showLabel = true, className, variant = 'default' }: NotificationToggleProps) {
    const { user, requestNotificationPermission, notificationPermission, fcmToken } = useAuth();
    const [loading, setLoading] = useState(false);

    // Estado local para feedback inmediato visual (aunque dependemos de fcmToken/user para source of truth)
    // Derivamos el estado "activado" si existe un token FCM guardado en el user context
    const isEnabled = !!fcmToken && notificationPermission === 'granted';

    const handleToggle = async (checked: boolean) => {
        if (!user) return;
        setLoading(true);

        try {
            if (checked) {
                // ACTIVAR NOTIFICACIONES: Solicitar permiso y generar token
                // Esto automáticamente guarda el token en Firestore gracias a AuthContext/useFCM
                await requestNotificationPermission();
                toast.success("Notificaciones activadas");
            } else {
                // DESACTIVAR NOTIFICACIONES: Borrar token de Firestore
                // De esta forma el backend pierde la "dirección" de envío y dejan de llegar
                const { deleteField } = await import("firebase/firestore"); // Import dinámico para asegurar
                const userRef = doc(db, "usuarios", user.uid);

                await updateDoc(userRef, {
                    fcmToken: deleteField(),
                    fcmTokenUpdatedAt: deleteField()
                });

                // Forzamos la actualización local del estado si es necesario, 
                // aunque el listener de AuthContext debería detectarlo.
                toast.info("Notificaciones desactivadas para este dispositivo");
            }
        } catch (error) {
            console.error("Error toggling notifications:", error);
            toast.error("Error al actualizar preferencias");
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'simple') {
        return (
            <div className={cn("flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-gray-100 py-1.5 px-3 rounded-full transition-all active:scale-95 touch-manipulation", className)}>
                {showLabel && (
                    <span className="text-xs md:text-sm font-semibold text-gray-600 tracking-tight">
                        {isEnabled ? "Notificaciones activas" : "Activar notificaciones"}
                    </span>
                )}
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-primary h-5 w-9 md:h-6 md:w-11"
                    />
                )}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className={cn("flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm", className)}>
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg transition-colors shrink-0", isEnabled ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400")}>
                        {isEnabled ? <Bell className="h-4 w-4 md:h-5 md:w-5" /> : <BellOff className="h-4 w-4 md:h-5 md:w-5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-darkblue truncate">Notificaciones</span>
                        <span className="text-xs text-gray-500 truncate">
                            {isEnabled ? "Recibirás actualizaciones" : "No te pierdas nada"}
                        </span>
                    </div>
                </div>
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary ml-2" />
                ) : (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-primary scale-90 md:scale-100 ml-2"
                    />
                )}
            </div>
        );
    }

    // Default variant (Perfil style)
    return (
        <div className={cn("flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100", className)}>
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className={`p-2.5 md:p-3 rounded-xl transition-colors shrink-0 ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                    {isEnabled ? (
                        <Bell className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                        <BellOff className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-darkblue text-sm md:text-base truncate">
                        Notificaciones de pedidos
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                        {isEnabled
                            ? "Recibirás alertas del estado de tus pedidos"
                            : "Activa para recibir alertas de tu pedido"
                        }
                    </p>
                    {notificationPermission === 'denied' && (
                        <p className="text-[10px] md:text-xs text-red-500 mt-0.5 font-medium flex items-center gap-1">
                            <span>⚠️</span> Bloqueadas en navegador
                        </p>
                    )}
                </div>
            </div>
            <div className="pl-2 shrink-0">
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        disabled={notificationPermission === 'denied'}
                        className="data-[state=checked]:bg-primary"
                    />
                )}
            </div>
        </div>
    );
}
