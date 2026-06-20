import type { APIRoute } from 'astro';
import questionData from '../../content/questions.json';

export const GET: APIRoute = ({ site }) => {
  const baseUrl = (site ?? new URL('https://melos9.github.io')).toString().replace(/\/$/, '');
  const base = import.meta.env.BASE_URL;
  const today = new Date().toISOString().split('T')[0];

  const staticPaths = ['', 'review/', 'stats/'];

  const quizPaths = questionData.categories.map((c) => `quiz/${c.id}/`);
  const allPaths = [...staticPaths, ...quizPaths];

  const urls = allPaths
    .map((path) => {
      const loc = `${baseUrl}${base}${path}`;
      const priority = path === '' ? '1.0' : path.startsWith('quiz') ? '0.8' : '0.6';
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
