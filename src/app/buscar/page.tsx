"use client";

import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import { Search, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BuscarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchesTrending = [
    "Coca Cola",
    "Pan integral",
    "Leche Gloria",
    "Arroz",
    "Aceite",
    "Cerveza",
    "Galletas",
    "Papel higiénico",
  ];

  const recentSearches = [
    "Gaseosas 2L",
    "Atún",
    "Yogurt",
    "Detergente",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Aquí iría la lógica de búsqueda
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Search Header */}
      <section className="bg-white border-b sticky top-16 md:top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 size-6!" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-14 pr-12 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-6!" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Búsquedas recientes */}
        {recentSearches.length > 0 && !searchQuery && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-darkblue">Búsquedas recientes</h2>
              <Button variant="ghost" className="text-sm text-primary hover:text-primary/80">
                Limpiar todo
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-gray-200 hover:border-primary transition-colors group"
                >
                  <span className="text-gray-700 group-hover:text-primary">{search}</span>
                  <X className="size-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Búsquedas populares */}
        {!searchQuery && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-secondary size-6!" />
              <h2 className="text-xl font-bold text-darkblue">Búsquedas populares</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {searchesTrending.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="bg-white px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-secondary hover:shadow-md transition-all text-left font-semibold text-darkblue hover:text-secondary"
                >
                  {search}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Resultados de búsqueda (placeholder) */}
        {searchQuery && (
          <section>
            <h2 className="text-xl font-bold text-darkblue mb-4">
              Resultados para "{searchQuery}"
            </h2>
            {isSearching ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Buscando productos...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <Search className="mx-auto mb-4 text-gray-400 size-16!" />
                <h3 className="text-xl font-bold text-darkblue mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta con otras palabras clave o explora nuestras categorías
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Ver todas las categorías
                </Button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-darkblue text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 Vanesa Bodeguita. Todos los derechos reservados.</p>
          <p className="text-sm text-gray-400">Tu bodega de confianza en el barrio</p>
        </div>
      </footer>
    </div>
  );
}
