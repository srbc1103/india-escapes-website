// app/sitemap.xml/route.js
import { NextResponse } from 'next/server';
import { COLLECTIONS } from '../../constants';
import Data from '../../lib/backend';
import { Query } from 'appwrite';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
  try {
    // Packages
    const pkgRes = await Data.get_items_list({
      collection_id: COLLECTIONS.PACKAGES,
      queries: [Query.equal('active', true)],
      limit: 50000,
    });

    const packages = (pkgRes.documents || []).map(p => ({
      url: `${SITE_URL}/packages/${p.url}`,
      lastmod: p.updatedAt,
      changefreq: 'weekly',
      priority: 0.8,
    }));

    // Categories
    const catRes = await Data.get_items_list({
      collection_id: COLLECTIONS.CATEGORIES,
      queries: [Query.equal('active', true)],
      limit: 50000,
    });

    const categories = (catRes.documents || []).map(c => ({
      url: `${SITE_URL}/categories/${c.url}`,
      lastmod: c.updatedAt,
      changefreq: 'weekly',
      priority: 0.7,
    }));

    // Destinations
    const destRes = await Data.get_items_list({
      collection_id: COLLECTIONS.DESTINATIONS,
      queries: [Query.equal('active', true)],
      limit: 50000,
    });

    const destinations = (destRes.documents || []).map(d => ({
      url: `${SITE_URL}/destinations/${d.url}`,
      lastmod: d.updatedAt,
      changefreq: 'monthly',
      priority: 0.7,
    }));

    // Blogs
    const blogRes = await Data.get_items_list({
      collection_id: COLLECTIONS.BLOGS,
      queries: [Query.equal('active', true)],
      limit: 50000,
    });

    const blogs = (blogRes.documents || []).map(b => ({
      url: `${SITE_URL}/blogs/${b.url}`,
      lastmod: b.updatedAt,
      changefreq: 'weekly',
      priority: 0.6,
    }));

    // Static pages
    const staticPages = [
      { url: SITE_URL, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { url: `${SITE_URL}/destinations`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/blogs`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
    ];

    const allUrls = [...staticPages, ...packages, ...categories, ...destinations, ...blogs];

    // XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastmod, changefreq, priority }) => `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`.trim();

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap error</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}