"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingCart, Package, Loader2, ChevronRight, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils"; // Asumiendo que tienes cn, si no, puedes usar template literals

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  // ==========================================
  // LÓGICA ORIGINAL (INTACTA)
  // ==========================================
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
      return;
    }

    if (trimmedQuery.length < 3) {
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
      return;
    }

    setError(null);

    try {
      const response = await searchProducts(trimmedQuery);
      
      if (response.success) {
        setResults(response.data);
        setTotalResults(response.total);
      } else {
        setError('Error al realizar la búsqueda');
        setResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('No se pudo conectar con el servidor');
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    if (query.trim().length >= 3) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
      setResults([]);
      setTotalResults(0);
      setError(null);
    }

    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 3) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, open, performSearch]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
    }
  }, [open]);

  // ==========================================
  // NUEVO DISEÑO (UI MEJORADA)
  // ==========================================
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 bg-white sm:rounded-2xl border-none shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Sticky con Buscador estilo "Command Palette" */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="sr-only">Buscar Productos</DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300">
                {isTyping ? (
                  <Loader2 className="size-5 text-primary animate-spin" />
                ) : (
                  <Search className="size-5 text-slate-400 group-focus-within:text-primary" />
                )}
              </div>
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué estás buscando hoy?"
                className="pl-12 h-14 text-lg bg-slate-50 border-transparent rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-sm placeholder:text-slate-400"
                aria-label="Buscar productos"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 pointer-events-none opacity-0 sm:opacity-100 transition-opacity">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
                  ESC
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Resultados Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 p-2 sm:p-4 min-h-[300px]">
          
          {isTyping ? (
            // Skeleton Loader Moderno
            <div className="space-y-3 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                  <div className="size-16 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-3 bg-slate-100 rounded-full w-1/4 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Estado de Error
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <ShoppingCart className="size-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Ups, algo salió mal</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">{error}</p>
            </div>
          ) : query === "" ? (
            // Estado Inicial (Empty State)
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300 opacity-60">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Search className="size-10 text-slate-300" />
              </div>
              <h3 className="text-base font-medium text-slate-700">Comienza a explorar</h3>
              <p className="text-sm text-slate-400 mt-1">Escribe el nombre de un producto para ver resultados</p>
            </div>
          ) : query.trim().length < 3 ? (
            // Estado "Sigue escribiendo"
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <p className="text-slate-500 text-sm">
                Escribe <span className="font-semibold text-primary">{3 - query.trim().length}</span> caracteres más...
              </p>
            </div>
          ) : results.length === 0 ? (
            // Sin Resultados
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Package className="size-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Sin resultados</h3>
              <p className="text-slate-500 mt-2">
                No encontramos nada para "<span className="font-medium text-slate-900">{query}</span>"
              </p>
            </div>
          ) : (
            // Lista de Resultados
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <span>Resultados ({totalResults})</span>
              </div>
              
              <div className="grid gap-2">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/productos/${p.producto_web}`}
                    onClick={onClose}
                    className="group flex items-start gap-4 p-3 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 hover:shadow-sm ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  >
                    {/* Imagen del producto */}
                    <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {p.imagen ? (
                        <Image 
                          src={p.imagen} 
                          alt={p.nombre} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 768px) 64px, 80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                          <Package className="text-slate-300 size-6" />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-16 sm:h-20">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {capitalizeText(p.nombre)}
                          </h3>
                          <ChevronRight className="size-4 text-slate-300 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shrink-0 mt-1" />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {p.categoria_nombre && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] px-1.5 h-5 font-normal border-0 gap-1">
                              <Tag className="size-3 opacity-50" />
                              {p.categoria_nombre}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-auto">
                        <span className="text-xs text-slate-400 font-medium">
                          {p.tipo_unidad === 'kilogramo' ? 'Precio por kg' : 'Precio por unidad'}
                        </span>
                        
                        {p.mostrar_precio_web !== false && (
                          <div className="flex items-baseline gap-1">
                             <span className="text-xs text-slate-400 font-normal self-start mt-1">S/</span>
                             <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                               {(p.precio || 0).toFixed(2)}
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer opcional para branding o acciones rápidas */}
        {results.length > 0 && (
          <div className="hidden sm:flex bg-slate-50 border-t border-slate-100 p-2 px-4 justify-between items-center text-[10px] text-slate-400">
            <span>Usa las flechas para navegar</span>
            <span>Enter para seleccionar</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}