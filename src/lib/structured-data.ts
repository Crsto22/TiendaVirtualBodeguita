// Utilidades para generar Structured Data (JSON-LD) para SEO

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    "@type": string;
    addressCountry: string;
    addressLocality: string;
  };
  contactPoint?: {
    "@type": string;
    contactType: string;
    telephone?: string;
  };
}

export interface ProductSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  brand?: {
    "@type": string;
    name: string;
  };
}

export interface BreadcrumbSchema {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

// Schema de Organización para toda la web
export function generateOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Vanesa Bodeguita",
    url: baseUrl,
    logo: `${baseUrl}/Logo.png`,
    description: "Tu bodega de confianza con los mejores productos y precios. Compra online y recoge en tienda.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PE",
      addressLocality: "Lima",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
    },
  };
}

// Schema de Producto
export function generateProductSchema(
  baseUrl: string,
  product: {
    nombre: string;
    descripcion?: string;
    imagen?: string;
    precio: number;
    slug: string;
    disponible?: boolean;
  }
): ProductSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    description: product.descripcion || `Compra ${product.nombre} en Vanesa Bodeguita`,
    image: product.imagen ? `${baseUrl}${product.imagen}` : `${baseUrl}/Logo.png`,
    offers: {
      "@type": "Offer",
      price: product.precio.toFixed(2),
      priceCurrency: "PEN",
      availability: product.disponible !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl}/productos/${product.slug}`,
    },
    brand: {
      "@type": "Brand",
      name: "Vanesa Bodeguita",
    },
  };
}

// Schema de Breadcrumb
export function generateBreadcrumbSchema(
  baseUrl: string,
  items: Array<{ name: string; url: string }>
): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

// Schema de WebSite con SearchAction
export function generateWebSiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vanesa Bodeguita",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Schema de Colección/Categoría
export function generateCollectionPageSchema(
  baseUrl: string,
  categoryName: string,
  categorySlug: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryName,
    description: description,
    url: `${baseUrl}/coleccion/${categorySlug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Vanesa Bodeguita",
      url: baseUrl,
    },
  };
}
