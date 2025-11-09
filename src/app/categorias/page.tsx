import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import Link from "next/link";

export default function CategoriasPage() {
  const categorias = [
    { 
      emoji: "🥤", 
      name: "Bebidas", 
      count: "50+ productos",
      description: "Gaseosas, jugos, agua y más",
      color: "from-blue-400 to-blue-600"
    },
    { 
      emoji: "🍞", 
      name: "Panadería", 
      count: "30+ productos",
      description: "Pan fresco, galletas y pasteles",
      color: "from-amber-400 to-amber-600"
    },
    { 
      emoji: "🥫", 
      name: "Enlatados", 
      count: "40+ productos",
      description: "Conservas, atún, legumbres",
      color: "from-red-400 to-red-600"
    },
    { 
      emoji: "🧃", 
      name: "Lácteos", 
      count: "25+ productos",
      description: "Leche, yogurt, queso",
      color: "from-cyan-400 to-cyan-600"
    },
    { 
      emoji: "🍪", 
      name: "Snacks", 
      count: "60+ productos",
      description: "Papas, chocolates, dulces",
      color: "from-yellow-400 to-yellow-600"
    },
    { 
      emoji: "🧼", 
      name: "Limpieza", 
      count: "35+ productos",
      description: "Detergentes, jabones, desinfectantes",
      color: "from-green-400 to-green-600"
    },
    { 
      emoji: "🍎", 
      name: "Frutas", 
      count: "20+ productos",
      description: "Frutas frescas de temporada",
      color: "from-pink-400 to-pink-600"
    },
    { 
      emoji: "🥩", 
      name: "Carnes", 
      count: "15+ productos",
      description: "Pollo, res, cerdo fresco",
      color: "from-rose-400 to-rose-600"
    },
    { 
      emoji: "🍝", 
      name: "Abarrotes", 
      count: "45+ productos",
      description: "Fideos, arroz, aceite",
      color: "from-orange-400 to-orange-600"
    },
    { 
      emoji: "🧊", 
      name: "Congelados", 
      count: "20+ productos",
      description: "Helados, carnes, verduras",
      color: "from-indigo-400 to-indigo-600"
    },
    { 
      emoji: "🍷", 
      name: "Licores", 
      count: "30+ productos",
      description: "Cervezas, vinos, licores",
      color: "from-purple-400 to-purple-600"
    },
    { 
      emoji: "👶", 
      name: "Bebés", 
      count: "25+ productos",
      description: "Pañales, leches, alimentos",
      color: "from-teal-400 to-teal-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <MobileDock />

      {/* Header */}
      <section className="bg-linear-to-r from-primary to-primary/90 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">Todas las Categorías</h1>
          <p className="text-lg opacity-90">Explora nuestros productos organizados por categoría</p>
        </div>
      </section>

      {/* Categorías Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categorias.map((categoria, index) => (
              <Link
                key={index}
                href={`/productos?categoria=${categoria.name.toLowerCase()}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-secondary transform hover:-translate-y-2">
                  {/* Header con gradiente */}
                  <div className={`bg-linear-to-br ${categoria.color} p-6 text-center`}>
                    <div className="text-6xl mb-2">{categoria.emoji}</div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-darkblue mb-1 group-hover:text-primary transition-colors">
                      {categoria.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{categoria.description}</p>
                    <p className="text-xs font-semibold text-secondary">{categoria.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-darkblue mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Usa nuestra búsqueda inteligente para encontrar cualquier producto rápidamente
          </p>
          <Link
            href="/buscar"
            className="inline-block bg-secondary hover:bg-secondary/90 text-white font-bold px-8 py-3 rounded-full transition-colors"
          >
            Ir a Buscar
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darkblue text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 Vanesa Bodeguita. Todos los derechos reservados.</p>
          <p className="text-sm text-gray-400">Tu bodega de confianza en el barrio</p>
        </div>
      </footer>
    </div>
  );
}
