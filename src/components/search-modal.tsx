"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingCart, Package, Loader2 } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Función de búsqueda
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    // Limpiar resultados si no hay query
    if (!trimmedQuery) {
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
      return;
    }

    // Requerir mínimo 3 caracteres para buscar
    if (trimmedQuery.length < 3) {
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
      return;
    }

    // Mantener isTyping true durante la búsqueda
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
      // Solo quitar el skeleton cuando tengamos la respuesta
      setIsTyping(false);
    }
  }, []);

  // Efecto con debounce para búsqueda
  useEffect(() => {
    if (!open) return;

    // Marcar que el usuario está escribiendo solo si hay suficientes caracteres
    if (query.trim().length >= 3) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
      // Limpiar resultados si hay menos de 3 caracteres
      setResults([]);
      setTotalResults(0);
      setError(null);
    }

    const debounceTimer = setTimeout(() => {
      // Solo ejecutar búsqueda si hay 3+ caracteres
      if (query.trim().length >= 3) {
        performSearch(query);
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(debounceTimer);
  }, [query, open, performSearch]);

  // Limpiar estado al cerrar el modal
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotalResults(0);
      setError(null);
      setIsTyping(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose} >
      <DialogContent className="max-w-3xl max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 bg-white border-none w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-darkblue flex items-center gap-2">
            <Search className="size-5 sm:size-6 text-primary" />
            Buscar Productos
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tu producto..."
              className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-2xl focus-visible:ring-primary"
              aria-label="Buscar productos"
            />
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-160px)] sm:max-h-[calc(85vh-180px)]">
          {isTyping ? (
            // Skeleton loader mientras el usuario escribe y busca
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4 items-center animate-pulse"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs sm:text-sm text-gray-500 py-2 flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Buscando resultados...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="size-12 sm:size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingCart className="size-6 sm:size-8 text-red-500" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Error en la búsqueda</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">{error}</p>
            </div>
          ) : query === "" ? (
            <div className="p-8 sm:p-12 text-center">
              <Package className="size-12 sm:size-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">Comienza a buscar</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Escribe al menos 3 caracteres para ver resultados</p>
            </div>
          ) : query.trim().length < 3 ? (
            <div className="p-8 sm:p-12 text-center">
              <Search className="size-12 sm:size-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">Escribe más caracteres</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Necesitas escribir al menos 3 caracteres ({3 - query.trim().length} más)
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <ShoppingCart className="size-12 sm:size-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">No encontramos resultados</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="mb-3 px-1 sm:px-2 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
                </p>
                {query && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 max-w-[150px] truncate">
                    "{query}"
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/productos/${p.producto_web}`}
                    onClick={onClose}
                    className="group bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-primary/30 p-3 sm:p-4 flex gap-3 sm:gap-4 items-center transition-all duration-200 hover:shadow-md"
                  >
                    {p.imagen ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 ring-2 ring-gray-100 group-hover:ring-primary/20">
                        <Image 
                          src={p.imagen} 
                          alt={p.nombre} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                        <ShoppingCart className="text-gray-400 size-6 sm:size-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {p.categoria_nombre && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 border-primary/30 text-primary max-w-[120px] truncate">
                            {p.categoria_nombre}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
                          {p.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-xs sm:text-sm text-darkblue group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {capitalizeText(p.nombre)}
                      </h3>
                      
                      <div className="flex items-baseline gap-2">
                        {p.mostrar_precio_web !== false && (
                          <span className="text-base sm:text-lg font-bold text-primary">
                            S/ {(p.precio || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
