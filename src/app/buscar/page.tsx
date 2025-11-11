"use client";

import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { Search, X, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

// Función para capitalizar texto
function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const RECENT_SEARCHES_KEY = 'vanesa-recent-searches';
const MAX_RECENT_SEARCHES = 8;

export default function BuscarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Cargar búsquedas recientes al montar el componente
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        }
      } catch (err) {
        console.error('Error al cargar búsquedas recientes:', err);
      }
    };

    loadRecentSearches();
  }, []);

  // Guardar búsqueda en el historial
  const saveToRecentSearches = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 3) return;

    setRecentSearches((prev) => {
      // Eliminar duplicados y agregar al inicio
      const filtered = prev.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase());
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      // Guardar en localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error al guardar búsqueda:', err);
      }
      
      return updated;
    });
  }, []);

  // Eliminar una búsqueda específica
  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(s => s !== query);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error al eliminar búsqueda:', err);
      }
      return updated;
    });
  }, []);

  // Limpiar todas las búsquedas recientes
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error('Error al limpiar búsquedas:', err);
    }
  }, []);

  // Función de búsqueda
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
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

    // Mantener isTyping true mientras busca
    setError(null);

    try {
      const response = await searchProducts(trimmedQuery);
      
      if (response.success) {
        setResults(response.data);
        setTotalResults(response.total);
        
        // Guardar en historial automáticamente si hay resultados
        if (response.data.length > 0) {
          saveToRecentSearches(trimmedQuery);
        }
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
  }, [saveToRecentSearches]);

  // Efecto con debounce para búsqueda
  useEffect(() => {
    // Marcar que el usuario está escribiendo solo si hay suficientes caracteres
    if (searchQuery.trim().length >= 3) {
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
      if (searchQuery.trim().length >= 3) {
        performSearch(searchQuery);
      }
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, performSearch]);

  // Manejar click en búsqueda reciente
  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQuery(query);
    // La búsqueda se ejecutará automáticamente por el useEffect
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Search Header */}
      <section className="bg-white sticky top-14 md:top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 sm:left-4 text-gray-400 size-5 sm:size-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-5 sm:size-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Búsquedas recientes */}
        {recentSearches.length > 0 && !searchQuery && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-xl font-bold text-darkblue flex items-center gap-2">
                <Search className="size-4 sm:size-5 text-primary" />
                Búsquedas recientes
              </h2>
              <Button 
                variant="ghost" 
                onClick={clearRecentSearches}
                className="text-xs sm:text-sm text-primary hover:text-primary/80 h-8 px-2 sm:px-3"
              >
                Limpiar todo
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-gray-200 hover:border-primary transition-all group shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={() => handleRecentSearchClick(search)}
                    className="text-xs sm:text-sm text-gray-700 group-hover:text-primary font-medium transition-colors"
                  >
                    {search}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Eliminar "${search}"`}
                  >
                    <X className="size-3.5 sm:size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mensaje cuando no hay búsquedas recientes */}
        {recentSearches.length === 0 && !searchQuery && (
          <section className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-dashed border-gray-200 max-w-md mx-auto">
              <Search className="size-12 sm:size-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold text-darkblue mb-2">
                No hay búsquedas recientes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Tus búsquedas se guardarán aquí para que puedas acceder a ellas fácilmente
              </p>
            </div>
          </section>
        )}

        {/* Resultados de búsqueda */}
        {searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-bold text-darkblue">
                Resultados: <span className="text-primary">"{searchQuery}"</span>
              </h2>
              {totalResults > 0 && (
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                  {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
                </Badge>
              )}
            </div>

            {isTyping ? (
              // Skeleton loader mientras el usuario escribe y busca
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
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
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center border-2 border-red-200">
                <div className="size-12 sm:size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ShoppingCart className="size-6 sm:size-8 text-red-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-darkblue mb-2">
                  Error en la búsqueda
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">{error}</p>
              </div>
            ) : searchQuery.trim().length < 3 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center border-2 border-dashed border-gray-300">
                <Search className="mx-auto mb-3 sm:mb-4 text-gray-300 size-12 sm:size-16" />
                <h3 className="text-base sm:text-lg font-bold text-darkblue mb-2">
                  Escribe más caracteres
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Necesitas escribir al menos 3 caracteres ({3 - searchQuery.trim().length} más)
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center border-2 border-dashed border-gray-300">
                <Search className="mx-auto mb-3 sm:mb-4 text-gray-400 size-12 sm:size-16" />
                <h3 className="text-base sm:text-lg font-bold text-darkblue mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
                  Intenta con otras palabras clave o explora nuestras categorías
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white text-sm h-9 sm:h-10">
                  Ver todas las categorías
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.producto_web}`}
                    className="group bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-primary/30 p-3 sm:p-4 flex gap-3 sm:gap-4 items-center transition-all duration-200 hover:shadow-md"
                  >
                    {product.imagen ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 ring-2 ring-gray-100 group-hover:ring-primary/20">
                        <Image 
                          src={product.imagen} 
                          alt={product.nombre} 
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
                        {product.categoria_nombre && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 border-primary/30 text-primary max-w-[120px] truncate">
                            {product.categoria_nombre}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
                          {product.tipo_unidad === 'kilogramo' ? 'Por kg' : 'Unidad'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-xs sm:text-sm text-darkblue group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {capitalizeText(product.nombre)}
                      </h3>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-bold text-primary">
                          S/ {product.precio.toFixed(2)}
                        </span>
                        {product.has_precio_alternativo && product.precio_alternativo && (
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {product.motivo_precio_alternativo}: S/ {product.precio_alternativo.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
