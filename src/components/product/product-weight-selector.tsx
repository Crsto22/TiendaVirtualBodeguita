"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Minus, Plus, ShoppingCart, Scale, Coins, Package } from "lucide-react";
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
            else if (product.tipo_producto_kg === 'precio_directo') setActiveTab('monto');
            else setActiveTab('monto');
        }
    }, [isOpen, product]);

    // Cálculos
    const precioPorKg = product.precio || 0;
    const tienePrecionoMostrar = product.mostrar_precio_web === false;

    // Calcular precio en tiempo real según el tab activo
    const calcularPrecioTotal = (): number => {
        if (tienePrecionoMostrar) return 0;

        if (activeTab === 'monto') {
            return parseFloat(monto) || 0;
        } else if (activeTab === 'peso') {
            const pesoNum = parseFloat(peso) || 0;
            const pesoEnKg = unidadPeso === 'g' ? pesoNum / 1000 : pesoNum;
            return pesoEnKg * precioPorKg;
        } else if (activeTab === 'unidades') {
            return 0;
        }
        return 0;
    };

    // Calcular peso en gramos
    const calcularPesoEnGramos = (): number => {
        if (activeTab === 'peso') {
            const pesoNum = parseFloat(peso) || 0;
            return unidadPeso === 'g' ? pesoNum : pesoNum * 1000;
        } else if (activeTab === 'monto') {
            const montoNum = parseFloat(monto) || 0;
            if (precioPorKg === 0) return 0;
            const pesoEnKg = montoNum / precioPorKg;
            return pesoEnKg * 1000;
        }
        return 0;
    };

    const precioCalculado = calcularPrecioTotal();
    const gramosCalculados = calcularPesoEnGramos();

    const handleAddToCart = () => {
        let detalle = "";
        let precioFinal = 0;
        let mostrarPrecio = product.mostrar_precio_web !== false;

        if (activeTab === 'monto') {
            const montoNum = parseFloat(monto);
            if (!montoNum) return;

            // Si está comprando por MONTO, siempre hay precio definido (el que ingresó el usuario)
            if (tienePrecionoMostrar) {
                // Si no tiene precio, solo mostramos el monto
                detalle = `S/ ${montoNum.toFixed(2)}`;
            } else {
                // Si tiene precio, calculamos y mostramos el peso
                const gramos = Math.round(gramosCalculados);
                detalle = gramos >= 1000
                    ? `${(gramos / 1000).toFixed(2)} kg`
                    : `${gramos} g`;
            }
            precioFinal = montoNum;
            mostrarPrecio = true; // Siempre mostrar precio cuando compra por monto
        } else if (activeTab === 'peso') {
            const pesoNum = parseFloat(peso);
            if (!pesoNum) return;

            const gramos = unidadPeso === 'g' ? pesoNum : pesoNum * 1000;
            detalle = gramos >= 1000
                ? `${(gramos / 1000).toFixed(2)} kg`
                : `${Math.round(gramos)} g`;

            if (tienePrecionoMostrar) {
                precioFinal = 0;
                mostrarPrecio = false;
            } else {
                precioFinal = precioCalculado;
                mostrarPrecio = true;
            }
        } else if (activeTab === 'unidades') {
            detalle = `${unidades} unid.`;
            precioFinal = 0;
            mostrarPrecio = false;
        }

        const productToAdd = {
            ...product,
            nombre: `${product.nombre} (${detalle})`,
            precio: precioFinal,
            mostrar_precio_web: mostrarPrecio,
            id: `${product.id}-${Date.now()}`
        };

        addItem(productToAdd);
        onClose();
    };

    // --- RENDERIZADO DEL CONTENIDO ---
    const renderContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-8 py-2">
                
                {/* Selector de Pestañas Moderno */}
                <div className="flex p-1.5 bg-slate-100 rounded-2xl mx-auto max-w-sm">
                    {product.tipo_producto_kg === 'granel' && (
                        <>
                            <button
                                onClick={() => setActiveTab('monto')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    activeTab === 'monto' 
                                    ? 'bg-white text-primary shadow-sm shadow-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Coins size={16} />
                                Monto
                            </button>
                            <button
                                onClick={() => setActiveTab('peso')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    activeTab === 'peso' 
                                    ? 'bg-white text-primary shadow-sm shadow-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Scale size={16} />
                                Peso
                            </button>
                        </>
                    )}

                    {product.tipo_producto_kg === 'pieza' && (
                        <>
                            <button
                                onClick={() => setActiveTab('unidades')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'unidades' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Package size={16} /> Unidades
                            </button>
                            <button
                                onClick={() => setActiveTab('peso')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'peso' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Scale size={16} /> Peso
                            </button>
                            <button
                                onClick={() => setActiveTab('monto')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'monto' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Coins size={16} /> Monto
                            </button>
                        </>
                    )}

                    {product.tipo_producto_kg === 'peso_fijo' && (
                        <div className="w-full text-center py-2 text-sm font-bold text-primary">
                            Venta por Peso
                        </div>
                    )}

                    {product.tipo_producto_kg === 'precio_directo' && (
                        <button
                            onClick={() => setActiveTab('monto')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-white text-primary shadow-sm shadow-slate-200"
                        >
                            <Coins size={16} />
                            Monto
                        </button>
                    )}
                </div>

                {/* Área de Inputs Principal */}
                <div className="flex flex-col items-center justify-center min-h-[140px]">
                    
                    {/* --- TAB: MONTO --- */}
                    {activeTab === 'monto' && (
                        <div className="w-full max-w-xs space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="relative group">
                                <label className="block text-center text-sm font-medium text-slate-400 mb-1">
                                    ¿Cuánto deseas gastar?
                                </label>
                                <div className="relative flex items-center justify-center">
                                    <span className={`text-4xl md:text-5xl  font-bold transition-colors ${monto ? 'text-primary' : 'text-slate-300'}`}>S/</span>
                                    <Input
                                        type="number"
                                        value={monto}
                                        onChange={(e) => setMonto(e.target.value)}
                                        className="w-full text-center text-5xl md:text-5xl  font-bold h-auto border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-slate-200 text-slate-800 bg-transparent"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <div className="h-0.5 w-1/2 bg-slate-100 mx-auto mt-2 group-focus-within:bg-primary/50 transition-colors" />
                            </div>

                            {/* Botones Rápidos de Monto */}
                            <div className="grid grid-cols-3 gap-2 px-2">
                                {[0.50, 1,3].map((valor) => (
                                    <button
                                        key={valor}
                                        onClick={() => setMonto(valor.toFixed(2))}
                                        className="py-2.5 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary text-slate-600 bg-white"
                                    >
                                        S/ {valor.toFixed(2)}
                                    </button>
                                ))}
                            </div>

                            {/* Mensaje de Error */}
                            {monto && parseFloat(monto) < 0.50 && (
                                <div className="bg-red-50 text-red-500 text-xs font-medium py-2 px-4 rounded-full text-center mx-auto w-fit">
                                    Mínimo S/ 0.50
                                </div>
                            )}

                            {/* Tarjeta de Resumen (Feedback) */}
                            {!tienePrecionoMostrar && monto && parseFloat(monto) >= 0.50 && (
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Recibirás aprox.</p>
                                    <div className="text-2xl font-bold text-primary">
                                        {gramosCalculados >= 1000 
                                            ? `${(gramosCalculados / 1000).toFixed(2)} kg` 
                                            : `${Math.round(gramosCalculados)} g`}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">de {product.nombre.toLowerCase()}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: PESO --- */}
                    {activeTab === 'peso' && (
                        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
                             <label className="block text-center text-sm font-medium text-slate-400">
                                Ingrese el peso deseado
                            </label>

                            <div className="flex items-end justify-center gap-2">
                                <Input
                                    type="number"
                                    value={peso}
                                    onChange={(e) => setPeso(e.target.value)}
                                    className="w-32 md:w-40 lg:w-48 text-center text-4xl md:text-5xl  font-bold h-auto border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-slate-200 text-slate-800 bg-transparent"
                                    placeholder="0"
                                    autoFocus
                                />
                                <div className="pb-3 md:pb-4">
                                    <select
                                        value={unidadPeso}
                                        onChange={(e) => setUnidadPeso(e.target.value as 'kg' | 'g')}
                                        className="bg-slate-100 font-bold text-slate-600 rounded-lg px-2 py-1 text-sm md:text-base lg:text-lg border-none focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">gr</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botones Rápidos (Chips) */}
                            <div className="grid grid-cols-4 gap-2 px-2">
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
                                        className="py-2.5 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary text-slate-600 bg-white"
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            {/* Feedback Message */}
                            {peso && parseFloat(peso) > 0 && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-sm text-center text-slate-600 mb-2">
                                        Pidiendo <span className="font-bold text-slate-800">{peso} {unidadPeso === 'kg' ? (parseFloat(peso) === 1 ? 'kilo' : 'kilos') : 'gramos'}</span>
                                    </p>
                                    
                                    {!tienePrecionoMostrar && precioCalculado > 0 && (
                                        <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Total Estimado</span>
                                            <span className="text-xl font-bold text-primary">S/ {precioCalculado.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: UNIDADES --- */}
                    {activeTab === 'unidades' && (
                        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <label className="block text-center text-sm font-medium text-slate-400">
                                Cantidad de unidades
                            </label>
                            
                            <div className="flex items-center justify-center gap-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-14 rounded-full border-2 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                    onClick={() => setUnidades(Math.max(1, unidades - 1))}
                                >
                                    <Minus className="size-6" strokeWidth={2.5} />
                                </Button>
                                
                                <div className="w-20 md:w-28 text-center">
                                    <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 tracking-tight">{unidades}</span>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-14 rounded-full border-2 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                    onClick={() => setUnidades(unidades + 1)}
                                >
                                    <Plus className="size-6" strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Botón de Acción */}
            <div className="mt-auto pt-6 pb-2">
                {tiendaAbierta && (
                    <Button
                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        onClick={handleAddToCart}
                        disabled={
                            (activeTab === 'monto' && (!parseFloat(monto) || parseFloat(monto) < 0.50)) ||
                            (activeTab === 'peso' && !parseFloat(peso))
                        }
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="size-5" />
                            <span>Agregar al Carrito</span>
                        </div>
                    </Button>
                )}
            </div>
        </div>
    );

    // Renderizado condicional Desktop (Dialog) vs Mobile (Sheet)
    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md bg-white p-6 rounded-3xl shadow-2xl border-0">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-bold text-center text-slate-800">
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
            <SheetContent 
                side="bottom" 
                className="rounded-t-4xl px-6 pt-8 pb-8 bg-white border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]  data-[state=open]:duration-300 data-[state=closed]:duration-200 will-change-transform"
            >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold text-center text-slate-800">
                        {product.nombre}
                    </SheetTitle>
                </SheetHeader>
                {renderContent()}
            </SheetContent>
        </Sheet>
    );
}