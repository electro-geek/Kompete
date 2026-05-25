import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://prepstudio.mritunjay.live/sitemap.xml',
    host: 'https://prepstudio.mritunjay.live',
  }
}
