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

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-none shadow-xl rounded-2xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-center text-darkblue">
                        ¿Estás seguro que deseas cerrar sesión?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500 text-sm sm:text-base">
                        Se cerrará tu sesión actual en este dispositivo.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 sm:space-x-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-1/2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-darkblue rounded-full h-10 sm:h-11 text-sm sm:text-base font-medium"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full h-10 sm:h-11 text-sm sm:text-base font-medium"
                    >
                        Cerrar sesión
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
