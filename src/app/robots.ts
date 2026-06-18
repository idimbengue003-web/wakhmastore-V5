import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/complete-profile/', '/admin'],
      },
    ],
    sitemap: 'https://wakhmastore.com/sitemap.xml',
  };
}
