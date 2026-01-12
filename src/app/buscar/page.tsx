"use client";

import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { Search, X, ShoppingCart, Loader2, Recycle, ArrowRight, History, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Asumiendo que tienes cn, si no, puedes usar template literals

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
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para efectos visuales en el header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-10 font-sans selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <MobileDock />

      {/* Modern Sticky Search Header */}
      <section
        className={cn(
          "sticky top-14 md:top-0 z-40 transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/95 shadow-sm border-gray-200"
            : "bg-white border-transparent"
        )}
      >
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-5xl">
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Search className={cn(
                "size-5 transition-colors duration-300",
                isTyping ? "text-primary" : "text-gray-400 group-focus-within:text-primary"
              )} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué estás buscando hoy?"
              className="w-full pl-12 pr-12 py-3.5 md:py-4 text-base md:text-lg bg-gray-100 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:border-primary/50 text-darkblue font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">

        {/* Sección: Búsquedas Recientes */}
        {recentSearches.length > 0 && !searchQuery && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <History className="size-4" />
                Recientes
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 h-8 px-3 rounded-full transition-colors"
              >
                Borrar historial
              </Button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="group flex items-center bg-white hover:bg-white border border-gray-200 rounded-xl shadow-xs cursor-pointer overflow-hidden"
                >
                  <button
                    onClick={() => handleRecentSearchClick(search)}
                    className="px-4 py-2.5 text-sm text-gray-700 group-hover:text-primary font-medium flex-1 text-left transition-colors"
                  >
                    {search}
                  </button>
                  <div className="h-4 w-px bg-gray-200 group-hover:bg-primary/10 transition-colors"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="px-2.5 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label={`Eliminar "${search}"`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección: Estado vacío inicial (Sin historial ni búsqueda) */}
        {recentSearches.length === 0 && !searchQuery && (
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="relative ">
                <Search className="size-12 text-primary/80" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-darkblue mb-3">
              Encuentra tus favoritos
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
              Explora miles de productos frescos y de calidad. Escribe para comenzar.
            </p>
          </section>
        )}

        {/* Sección: Resultados y Estados de Búsqueda */}
        {searchQuery && (
          <section className="space-y-6">

            {/* Header de Resultados */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg md:text-xl font-bold text-darkblue truncate pr-4">
                {isTyping ? (
                  <span className="text-gray-400">Buscando...</span>
                ) : (
                  <>Resultados para <span className="text-primary">"{searchQuery}"</span></>
                )}
              </h2>
              {!isTyping && totalResults > 0 && (
                <Badge variant="secondary" className="bg-darkblue/5 text-darkblue hover:bg-darkblue/10 transition-colors px-3 py-1 text-xs md:text-sm font-medium whitespace-nowrap">
                  {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
                </Badge>
              )}
            </div>

            {/* Contenido Condicional */}
            {isTyping ? (
              // Modern Skeleton Loader
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4 items-start">
                    <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="flex gap-2">
                        <div className="h-5 w-20 bg-gray-200 rounded-md"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded-lg mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="bg-red-50/50 rounded-3xl p-10 text-center border border-red-100 max-w-lg mx-auto mt-8">
                <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm mb-4">
                  <PackageOpen className="size-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Algo salió mal</h3>
                <p className="text-gray-600 mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => performSearch(searchQuery)}
                  className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Intentar de nuevo
                </Button>
              </div>
            ) : searchQuery.trim().length < 3 ? (
              // Min Characters State
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 max-w-lg mx-auto mt-8">
                <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-4">
                  <Search className="size-8 text-primary/40" />
                </div>
                <h3 className="text-lg font-bold text-darkblue mb-2">Sigue escribiendo...</h3>
                <p className="text-gray-500 text-sm">
                  Necesitamos al menos 3 caracteres para buscar.
                  <span className="block mt-1 font-medium text-primary">
                    Faltan {3 - searchQuery.trim().length}
                  </span>
                </p>
              </div>
            ) : results.length === 0 ? (
              // No Results State
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto mt-8">
                <div className="bg-gray-50 p-6 rounded-full w-fit mx-auto mb-6">
                  <PackageOpen className="size-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-darkblue mb-3">
                  Sin resultados
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  No encontramos productos que coincidan con "{searchQuery}".
                  Intenta usar términos más generales.
                </p>
                <Link href="/categorias">
                  <Button className="bg-darkblue text-white hover:bg-darkblue/90 rounded-full px-8 h-12 shadow-lg shadow-darkblue/20 transition-all hover:scale-105">
                    Explorar Categorías
                  </Button>
                </Link>
              </div>
            ) : (
              // Lista de Resultados
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {results.map((product) => (
                  <div key={product.id}>
                    <Link
                      href={`/productos/${product.producto_web}`}
                      className="group"
                    >
                      <div
                        className={`sm:bg-white sm:rounded-2xl sm:shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-full h-[155px] sm:h-[340px] md:h-[380px] flex sm:flex-col group-hover:scale-[1.02] ${
                          product.stock === 0 ? "opacity-60" : ""
                        }`}
                      >
                        {/* Image Container */}
                        <div className="relative w-28 sm:w-full aspect-square overflow-hidden shrink-0 p-2">
                          {product.imagen ? (
                            <Image
                              src={product.imagen}
                              alt={product.nombre}
                              fill
                              className="object-contain"
                              sizes="(max-width: 640px) 112px, (max-width: 1280px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                              <ShoppingCart className="size-8 text-gray-300" />
                            </div>
                          )}

                          {/* Stock Badge */}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                Agotado
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-2 sm:p-3">
                          {/* Category Badge */}
                          {product.categoria_nombre && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-blue-100 bg-blue-50 text-blue-600 font-medium rounded-md max-w-[120px] truncate mb-2 w-fit">
                              {product.categoria_nombre}
                            </Badge>
                          )}

                          {/* Product Title */}
                          <h3 className="font-bold text-xs sm:text-sm text-gray-800 leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {capitalizeText(product.nombre)}
                          </h3>

                          {/* Unit Info */}
                          <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-2">
                            {product.tipo_unidad === 'kilogramo' ? 'Precio por kilogramo' : 'Precio por unidad'}
                          </p>

                          {/* Price and Action */}
                          <div className="mt-auto flex items-end justify-between">
                            <div className="flex flex-col">
                              {product.mostrar_precio_web !== false && (
                                <>
                                  <span className="text-xl sm:text-lg md:text-xl font-bold text-primary truncate">
                                    S/ {(product.precio || 0).toFixed(2)}
                                  </span>
                                  {product.has_precio_alternativo && product.precio_alternativo && (
                                    <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                                      {product.motivo_precio_alternativo}: S/ {product.precio_alternativo.toFixed(2)}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Action Icon */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                              <ArrowRight className="size-3.5 sm:size-4" />
                            </div>
                          </div>

                          {/* Retornable Badge */}
                          {product.retornable && (
                            <div className="mt-2 flex items-center gap-1 text-green-600">
                              <Recycle className="size-3" />
                              <span className="text-[10px] font-semibold">Retornable</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="border-b rounded-full border-gray-200 sm:border-none mt-2"></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}