"use client";

import { useState, useEffect } from "react";
import { BellOff, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface OrderNotificationBannerProps {
    variant: "mobile" | "desktop";
    className?: string;
}

export function OrderNotificationBanner({ variant, className }: OrderNotificationBannerProps) {
    const { user, requestNotificationPermission, notificationPermission, fcmToken } = useAuth();

    // States
    const [showNotificationBanner, setShowNotificationBanner] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    // Check dismissal state on mount
    useEffect(() => {
        const isHidden = localStorage.getItem("notification_banner_dismissed");
        if (!isHidden) {
            setShowNotificationBanner(true);
        }
    }, []);

    const isNotificationsEnabled = !!fcmToken && notificationPermission === "granted";

    // Hide criteria
    if (!user || isNotificationsEnabled || !showNotificationBanner) {
        return null;
    }

    const handleActivateNotifications = async () => {
        setIsActivating(true);
        try {
            await requestNotificationPermission();
            toast.success("Notificaciones activadas");
        } catch (error) {
            console.error(error);
            toast.error("Error al activar notificaciones");
        } finally {
            setIsActivating(false);
        }
    };

    const handleDismissBanner = () => {
        setShowNotificationBanner(false);
        localStorage.setItem("notification_banner_dismissed", "true");
    };

    const commonClasses = "w-full bg-gray-200 text-white px-4 py-3 items-center justify-between gap-4 text-sm animate-in slide-in-from-top-2 duration-300 border-b border-gray-300";

    if (variant === "mobile") {
        return (
            <div className={cn(commonClasses, "flex lg:hidden", className)}>
                <div className="flex items-center gap-3">
                    <BellOff className="md:size-5 text-gray-400 shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-600 md:text-base text-xs">
                        <span>Las notificaciones de pedidos están desactivadas.</span>
                        <button
                            onClick={handleActivateNotifications}
                            disabled={isActivating}
                            className="font-semibold underline hover:text-gray-500 disabled:opacity-50 transition-colors text-left"
                        >
                            {isActivating ? "Activando..." : "Activar"}
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismissBanner}
                    className="p-1 hover:bg-gray-300 rounded-full transition-colors shrink-0"
                    aria-label="Cerrar notificación"
                >
                    <X className="size-5 text-gray-400" />
                </button>
            </div>
        );
    }

    // Desktop
    return (
        <div className={cn(commonClasses, "hidden lg:flex", className)}>
            <div className="flex items-center gap-3 container mx-auto max-w-6xl px-0">
                <div className="flex items-center gap-3">
                    <BellOff className="size-5 text-gray-400 shrink-0" />
                    <div className="flex items-center gap-2 text-gray-600 text-base">
                        <span>Las notificaciones de pedidos están desactivadas.</span>
                        <button
                            onClick={handleActivateNotifications}
                            disabled={isActivating}
                            className="font-semibold underline hover:text-gray-500 disabled:opacity-50 transition-colors"
                        >
                            {isActivating ? "Activando..." : "Activar"}
                        </button>
                    </div>
                </div>
            </div>
            <button
                onClick={handleDismissBanner}
                className="p-1 hover:bg-gray-300 rounded-full transition-colors shrink-0"
                aria-label="Cerrar notificación"
            >
                <X className="size-5 text-gray-400" />
            </button>
        </div>
    );
}
