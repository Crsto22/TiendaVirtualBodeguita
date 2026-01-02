import {
    Clock,
    Package,
    AlertCircle,
    CheckCircle2,
    XCircle,
    LucideIcon,
} from "lucide-react";

export interface EstadoConfigItem {
    label: string;
    className: string;
    iconColor: string;
    icon: LucideIcon;
    description: string;
    heroImage?: string;
    heroImageWidth?: number;
    heroImageHeight?: number;
    borderClass?: string;
}

export const ESTADO_CONFIG: Record<string, EstadoConfigItem> = {
    pendiente: {
        label: "Pendiente",
        // Usamos gradientes para dar un toque más moderno
        className: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800",
        iconColor: "text-yellow-600",
        icon: Clock,
        description: "Tu pedido está esperando ser revisado por el vendedor",
        heroImage: "/Estados/EstadoPendiente.png",
        heroImageWidth: 70,
        heroImageHeight: 70,
        borderClass: "border-transparent border-t-primary border-r-primary/50 animate-spin",
    },
    en_revision: {
        label: "En Revisión",
        className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800",
        iconColor: "text-blue-600",
        icon: Package,
        description: "El vendedor está verificando el stock y los precios",
        heroImage: "/Estados/EstadoRevision.png",
        heroImageWidth: 270,
        heroImageHeight: 270,
        borderClass: "border-transparent border-t-blue-500 border-r-blue-500/50 animate-spin",
    },
    esperando_confirmacion: {
        label: "Esperando Confirmación",
        className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-800",
        iconColor: "text-orange-600",
        icon: AlertCircle,
        description: "Hay cambios en tu pedido que requieren tu aprobación",
        heroImage: "/Estados/Esperando_confirmacion.png",
        heroImageWidth: 100,
        heroImageHeight: 100,
        borderClass: "border-orange-200 animate-pulse",
    },
    confirmada: {
        label: "Confirmada",
        className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800",
        iconColor: "text-green-600",
        icon: CheckCircle2,
        description: "Tu pedido ha sido confirmado correctamente",
        heroImage: "/Estados/Confirmada.png",
        heroImageWidth: 100,
        heroImageHeight: 100,
        borderClass: "border-green-200 animate-pulse",
    },
    preparando: {
        label: "Preparando",
        className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-800",
        iconColor: "text-purple-600",
        icon: Package,
        description: "Estamos preparando tu pedido con cuidado",
        heroImage: "/Estados/EstadoPreparando.png",
        heroImageWidth: 100,
        heroImageHeight: 100,
        borderClass: "border-transparent border-t-purple-500 border-r-purple-500/50 animate-spin",
    },
    lista: {
        label: "Lista para Recojo",
        className: "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 text-teal-800",
        iconColor: "text-teal-600",
        icon: CheckCircle2,
        description: "¡Tu pedido está listo! Puedes pasar a recogerlo",
        heroImage: "/Estados/EstadoLista.png",
        heroImageWidth: 100,
        heroImageHeight: 100,
        borderClass: "border-green-400 animate-pulse",
    },
    entregada: {
        label: "Entregada",
        className: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-800",
        iconColor: "text-gray-600",
        icon: CheckCircle2,
        description: "Pedido completado exitosamente",
        heroImage: "/Estados/EstadoEntregado.png",
        heroImageWidth: 100,
        heroImageHeight: 100,
        borderClass: "border-green-600",
    },
    cancelada: {
        label: "Cancelada",
        className: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800",
        iconColor: "text-red-600",
        icon: XCircle,
        description: "Este pedido fue cancelado",
    },
};

export function capitalizeText(text: string): string {
    return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
