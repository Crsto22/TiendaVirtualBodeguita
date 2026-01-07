// Configuración SEO centralizada para toda la aplicación

export const SEO_CONFIG = {
  // URL base del sitio
  baseUrl: 'https://www.vanesabodeguita.com',
  
  // Información del negocio
  businessName: 'Vanesa Bodeguita',
  businessDescription: 'Tu bodega de confianza con los mejores productos y precios. Compra online y recoge en tienda.',
  
  // Información de contacto
  location: {
    city: 'Lima',
    country: 'Perú',
    countryCode: 'PE',
  },
  
  // Keywords principales
  mainKeywords: [
    'bodega online',
    'abarrotes',
    'productos frescos',
    'compras online',
    'bodega Lima',
    'snacks',
    'bebidas',
    'comida',
    'recojo en tienda',
    'delivery bodega',
    'productos de bodega',
  ],
  
  // Imágenes por defecto
  defaultImage: '/Logo.png',
  ogImage: '/Logo.png', // Considera crear una imagen de 1200x630 específica para OG
  
  // Redes sociales (opcional - agregar cuando tengas)
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
  },
  
  // Configuración de robots
  robots: {
    index: true,
    follow: true,
  },
};

// Función helper para generar URLs completas
export function getAbsoluteUrl(path: string): string {
  return `${SEO_CONFIG.baseUrl}${path}`;
}

// Función helper para capitalizar texto (útil para títulos)
export function capitalizeText(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
