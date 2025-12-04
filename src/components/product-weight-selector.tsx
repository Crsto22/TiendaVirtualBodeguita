"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useStoreConfigContext } from "@/context/StoreConfigContext";

interface ProductWeightSelectorProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'monto' | 'peso' | 'unidades';

export function ProductWeightSelector({ product, isOpen, onClose }: ProductWeightSelectorProps) {
    const [isDesktop, setIsDesktop] = useState(false);
    const { tiendaAbierta } = useStoreConfigContext();
    const { addItem } = useCartStore();

    // Detectar desktop
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Estado del selector
    const [activeTab, setActiveTab] = useState<TabType>('monto');
    const [monto, setMonto] = useState<string>("");
    const [peso, setPeso] = useState<string>("");
    const [unidadPeso, setUnidadPeso] = useState<'kg' | 'g'>('kg');
    const [unidades, setUnidades] = useState<number>(1);

    // Reset al abrir
    useEffect(() => {
        if (isOpen) {
            setMonto("");
            setPeso("");
            setUnidades(1);
            // Default tab según tipo
            if (product.tipo_producto_kg === 'pieza') setActiveTab('unidades');
            else if (product.tipo_producto_kg === 'peso_fijo') setActiveTab('peso');
            else setActiveTab('monto');
        }
    }, [isOpen, product]);

    // Cálculos
    const precioPorKg = product.precio || 0;



    const handleAddToCart = () => {
        // Aquí adaptamos la lógica para agregar al carrito con metadatos
        // Como el store actual no soporta metadatos complejos, vamos a hackear un poco
        // o asumir que el store se actualizará. Por ahora, agregaremos con una nota simulada en el nombre o similar si es necesario,
        // pero idealmente el store debería soportar `nota` o `cantidad_detalle`.

        // Para este paso, usaremos la cantidad como 1 y el precio calculado como el precio del item,
        // O si es por peso, ajustamos la cantidad para que refleje el precio.

        // ESTRATEGIA ACTUAL:
        // Cantidad = 1
        // Precio = Total calculado
        // Nombre = "Producto (Detalle)"

        let detalle = "";
        let precioFinal = 0;

        if (activeTab === 'monto') {
            const montoNum = parseFloat(monto);
            if (!montoNum) return;
            detalle = `S/ ${montoNum.toFixed(2)}`;
            precioFinal = montoNum;
        } else if (activeTab === 'peso') {
            const pesoNum = parseFloat(peso);
            if (!pesoNum) return;
            const pesoStr = `${pesoNum}${unidadPeso}`;
            precioFinal = (unidadPeso === 'g' ? pesoNum / 1000 : pesoNum) * precioPorKg;
            detalle = pesoStr;
        } else if (activeTab === 'unidades') {
            detalle = `${unidades} unid.`;
            precioFinal = 0; // Precio a confirmar
        }

        // Crear un producto temporal con el precio ajustado y nombre modificado
        // NOTA: Esto es una solución temporal hasta que el backend soporte pedidos detallados
        const productToAdd = {
            ...product,
            nombre: `${product.nombre} (${detalle})`,
            precio: precioFinal,
            mostrar_precio_web: activeTab === 'monto', // Solo mostrar precio si es por monto
            // Hack para que el store lo trate como item único si tiene diferente detalle
            id: `${product.id}-${Date.now()}`
        };

        addItem(productToAdd);
        onClose();
    };

    const renderContent = () => (
        <div className="space-y-6 py-4">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
                {product.tipo_producto_kg === 'granel' && (
                    <>
                        <button
                            onClick={() => setActiveTab('monto')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'monto' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Monto (S/)
                        </button>
                        <button
                            onClick={() => setActiveTab('peso')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'peso' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Peso
                        </button>
                    </>
                )}

                {product.tipo_producto_kg === 'pieza' && (
                    <>
                        <button
                            onClick={() => setActiveTab('unidades')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'unidades' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Unidades
                        </button>
                        <button
                            onClick={() => setActiveTab('peso')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'peso' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Peso
                        </button>
                        <button
                            onClick={() => setActiveTab('monto')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'monto' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Monto
                        </button>
                    </>
                )}

                {product.tipo_producto_kg === 'peso_fijo' && (
                    <button
                        onClick={() => setActiveTab('peso')}
                        className="flex-1 py-2 text-sm font-medium rounded-lg bg-white shadow text-primary"
                    >
                        Peso
                    </button>
                )}
            </div>

            {/* Inputs */}
            <div className="min-h-[120px] flex flex-col justify-center">
                {activeTab === 'monto' && (
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">¿Cuánto deseas comprar?</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">S/</span>
                            <Input
                                type="number"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="pl-12 h-14 text-2xl font-bold rounded-full border-2 border-gray-200"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        {monto && parseFloat(monto) < 0.50 && (
                            <p className="text-sm text-red-500 font-medium text-center">
                                El monto mínimo es S/ 0.50
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'peso' && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 block mb-2 ">Peso</label>
                                <Input
                                    type="number"
                                    value={peso}
                                    onChange={(e) => setPeso(e.target.value)}
                                    className="h-14 text-2xl font-bold rounded-full border-2 border-gray-200"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Unidad</label>
                                <select
                                    value={unidadPeso}
                                    onChange={(e) => setUnidadPeso(e.target.value as 'kg' | 'g')}
                                    className="w-full h-14 rounded-full border-2 border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="kg">Kg</option>
                                    <option value="g">g</option>
                                </select>
                            </div>
                        </div>

                        {/* Quick Access Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: "1/8", value: 0.125, unit: 'g' },
                                { label: "1/4", value: 0.250, unit: 'g' },
                                { label: "1/2", value: 0.500, unit: 'g' },
                                { label: "1 kg", value: 1.000, unit: 'kg' },
                            ].map((btn) => (
                                <button
                                    key={btn.label}
                                    onClick={() => {
                                        if (btn.unit === 'g') {
                                            setUnidadPeso('g');
                                            setPeso((btn.value * 1000).toString());
                                        } else {
                                            setUnidadPeso('kg');
                                            setPeso(btn.value.toString());
                                        }
                                    }}
                                    className="py-2 px-1 text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Feedback Message */}
                        {peso && parseFloat(peso) > 0 && (
                            <p className="text-sm text-primary font-medium text-center bg-primary/5 py-2 rounded-lg">
                                Usted está pidiendo {peso} {unidadPeso === 'kg' ? (parseFloat(peso) === 1 ? 'kilo' : 'kilos') : 'gramos'} de {product.nombre.toLowerCase()}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'unidades' && (
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700 text-center block">Cantidad de unidades</label>
                        <div className="flex items-center justify-center gap-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 rounded-full border-2"
                                onClick={() => setUnidades(Math.max(1, unidades - 1))}
                            >
                                <Minus className="size-6" />
                            </Button>
                            <span className="text-4xl font-bold text-darkblue w-16 text-center">{unidades}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 rounded-full border-2"
                                onClick={() => setUnidades(unidades + 1)}
                            >
                                <Plus className="size-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4">
                {tiendaAbierta && (
                    <Button
                        className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-full"
                        onClick={handleAddToCart}
                        disabled={
                            (activeTab === 'monto' && (!parseFloat(monto) || parseFloat(monto) < 0.50)) ||
                            (activeTab === 'peso' && !parseFloat(peso))
                        }
                    >
                        <ShoppingCart className="mr-2 size-5" />
                        Agregar al Carrito
                    </Button>
                )}
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center text-darkblue">
                            {product.nombre}
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
                        {product.nombre}
                    </SheetTitle>
                </SheetHeader>
                {renderContent()}
            </SheetContent>
        </Sheet>
    );
}
