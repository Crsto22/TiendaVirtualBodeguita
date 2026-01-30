export interface Category {
  name: string;
  image: string;
  color: string;
  href: string;
  description?: string;
}

export const categories: Category[] = [
  { 
    name: "Snacks y cereales", 
    image: "/Categorias/SnacksYCereales.png", 
    color: "bg-gradient-to-br from-amber-600 to-amber-800", 
    href: "/categorias",
    description: "Papas, cereales, galletas"
  },
  { 
    name: "Abarrotes", 
    image: "/Categorias/Abarrotes.png", 
    color: "bg-gradient-to-br from-gray-500 to-gray-700", 
    href: "/categorias",
    description: "Fideos, arroz, aceite"
  },
  { 
    name: "Bebidas", 
    image: "/Categorias/Bebidas.png", 
    color: "bg-gradient-to-br from-cyan-600 to-cyan-800", 
    href: "/categorias",
    description: "Gaseosas, jugos, agua"
  },
  { 
    name: "Galletas", 
    image: "/Categorias/Galletas.png", 
    color: "bg-gradient-to-br from-yellow-600 to-yellow-800", 
    href: "/categorias",
    description: "Dulces y saladas"
  },
  { 
    name: "GAS", 
    image: "/Categorias/Gas.png", 
    color: "bg-gradient-to-br from-slate-500 to-slate-700", 
    href: "/categorias",
    description: "Gas para cocinar"
  },
  { 
    name: "Chocolates y dulces", 
    image: "/Categorias/ChocolatesyDulces.png", 
    color: "bg-gradient-to-br from-amber-700 to-amber-900", 
    href: "/categorias",
    description: "Chocolates, caramelos"
  },
  { 
    name: "Grasas y Aceites", 
    image: "/Categorias/GrasasYAceites.png", 
    color: "bg-gradient-to-br from-lime-600 to-lime-800", 
    href: "/categorias",
    description: "Aceites, mantecas"
  },
  { 
    name: "Panadería", 
    image: "/Categorias/Panaderia.png", 
    color: "bg-gradient-to-br from-orange-400 to-orange-600", 
    href: "/categorias",
    description: "Pan fresco, pasteles"
  },
  { 
    name: "Carnes", 
    image: "/Categorias/Carnes.png", 
    color: "bg-gradient-to-br from-red-500 to-red-700", 
    href: "/categorias",
    description: "Pollo, res, cerdo"
  },
  { 
    name: "Frutas", 
    image: "/Categorias/Frutas.png", 
    color: "bg-gradient-to-br from-green-500 to-green-700", 
    href: "/categorias",
    description: "Frutas frescas"
  },
  { 
    name: "Verduras", 
    image: "/Categorias/Verduras.png", 
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700", 
    href: "/categorias",
    description: "Verduras frescas"
  },
  { 
    name: "Lacteos y Huevos", 
    image: "/Categorias/LacteosYHuevos.png", 
    color: "bg-gradient-to-br from-blue-400 to-blue-600", 
    href: "/categorias",
    description: "Leche, yogurt, queso"
  },
  { 
    name: "Helados y Congelados", 
    image: "/Categorias/HeladosyCongelados.png", 
    color: "bg-gradient-to-br from-sky-400 to-sky-600", 
    href: "/categorias",
    description: "Helados, congelados"
  },
  { 
    name: "Alimentos Para Animales", 
    image: "/Categorias/AlimentosParaAnimales.png", 
    color: "bg-gradient-to-br from-orange-600 to-orange-800", 
    href: "/categorias",
    description: "Comida para mascotas"
  },
  { 
    name: "Bebidas Alcohólicas", 
    image: "/Categorias/BebidasAlcoholicas.png", 
    color: "bg-gradient-to-br from-rose-600 to-rose-800", 
    href: "/categorias",
    description: "Cervezas, vinos, licores"
  },
  { 
    name: "Bebidas Gaseosas", 
    image: "/Categorias/BebidasGaseosas.png", 
    color: "bg-gradient-to-br from-blue-500 to-blue-700", 
    href: "/categorias",
    description: "Gaseosas variadas"
  },
  { 
    name: "Bebidas y Alimentos Instantaneas", 
    image: "/Categorias/BebidasAlimentosInstantaneas.png", 
    color: "bg-gradient-to-br from-yellow-500 to-yellow-700", 
    href: "/categorias",
    description: "Sopas, cafés instantáneos"
  },
  { 
    name: "Café e Infusiones", 
    image: "/Categorias/CafeEInfusiones.png", 
    color: "bg-gradient-to-br from-stone-600 to-stone-800", 
    href: "/categorias",
    description: "Café, té, mates"
  },
  { 
    name: "Condimentos y Esencias", 
    image: "/Categorias/CondimentosYEsencias.png", 
    color: "bg-gradient-to-br from-lime-500 to-lime-700", 
    href: "/categorias",
    description: "Especias, salsas"
  },
  { 
    name: "Cuidado Personal", 
    image: "/Categorias/CuidadoPersonal.png", 
    color: "bg-gradient-to-br from-purple-400 to-purple-600", 
    href: "/categorias",
    description: "Jabones, shampoo"
  },
  { 
    name: "Embutidos", 
    image: "/Categorias/Embutidos.png", 
    color: "bg-gradient-to-br from-red-600 to-red-800", 
    href: "/categorias",
    description: "Jamón, salchichas"
  },
  { 
    name: "Enlatados", 
    image: "/Categorias/Enlatados.png", 
    color: "bg-gradient-to-br from-gray-400 to-gray-600", 
    href: "/categorias",
    description: "Conservas, atún"
  },
  { 
    name: "Fideos", 
    image: "/Categorias/Fideos.png", 
    color: "bg-gradient-to-br from-amber-400 to-amber-600", 
    href: "/categorias",
    description: "Pastas variadas"
  },
  { 
    name: "Harinas", 
    image: "/Categorias/Harinas.png", 
    color: "bg-gradient-to-br from-amber-200 to-amber-400", 
    href: "/categorias",
    description: "Harinas para cocinar"
  },
  { 
    name: "Licorería", 
    image: "/Categorias/Licoreria.png", 
    color: "bg-gradient-to-br from-rose-700 to-rose-900", 
    href: "/categorias",
    description: "Licores premium"
  },
  { 
    name: "Productos de Limpieza", 
    image: "/Categorias/ProductosDeLimpieza.png", 
    color: "bg-gradient-to-br from-teal-500 to-teal-700", 
    href: "/categorias",
    description: "Detergentes, lejía"
  },
  { 
    name: "Útiles Escolares", 
    image: "/Categorias/UtilesEscolares.png", 
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600", 
    href: "/categorias",
    description: "Cuadernos, lapiceros"
  },
];
