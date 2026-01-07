import { MetadataRoute } from 'next'
import { categories } from '@/data/categories'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.vanesabodeguita.com'

  // URLs estáticas
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/inicio`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tutorial`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // URLs de categorías dinámicas
  const categoryUrls = categories.map((category) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-')
    return {
      url: `${baseUrl}/coleccion/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  })

  // URL de todas las colecciones
  const allCollectionUrl = {
    url: `${baseUrl}/coleccion/todas`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }

  return [...staticUrls, allCollectionUrl, ...categoryUrls]
}
