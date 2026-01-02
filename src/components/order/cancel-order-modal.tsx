"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, isLoading }: CancelOrderModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-none shadow-xl rounded-2xl">
                <DialogHeader className="space-y-3">
                    <div className="flex justify-center">
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertCircle className="size-8 text-red-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-center text-darkblue">
                        ¿Estás seguro que deseas cancelar este pedido?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500 text-sm sm:text-base">
                        Esta acción no se puede deshacer. El pedido será cancelado permanentemente.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 sm:space-x-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-1/2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-darkblue rounded-full h-10 sm:h-11 text-sm sm:text-base font-medium"
                    >
                        No, mantener
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full h-10 sm:h-11 text-sm sm:text-base font-medium"
                    >
                        {isLoading ? "Cancelando..." : "Sí, cancelar pedido"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
