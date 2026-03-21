// app/sitemap.xml/route.js
import { NextResponse } from 'next/server';
import { databases } from '../../lib/appwrite';
import { COLLECTIONS, DBID } from '../../constants';
import { Query } from 'appwrite';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

async function listAll(collection_id, queries = []) {
  const res = await databases.listDocuments(DBID, collection_id, [
    ...queries,
    Query.limit(5000),
  ]);
  return res.documents || [];
}

export async function GET() {
  try {
    const [pkgDocs, catDocs, destDocs, blogDocs] = await Promise.all([
      listAll(COLLECTIONS.PACKAGES,    [Query.equal('active', true)]),
      listAll(COLLECTIONS.CATEGORIES,  [Query.equal('active', true)]),
      listAll(COLLECTIONS.DESTINATIONS,[Query.equal('active', true)]),
      listAll(COLLECTIONS.BLOGS,       [Query.equal('active', true)]),
    ]);

    const packages     = pkgDocs.map(p  => ({ url: `${SITE_URL}/packages/${p.url}`,     lastmod: p.$updatedAt, changefreq: 'weekly',  priority: 0.8 }));
    const categories   = catDocs.map(c  => ({ url: `${SITE_URL}/categories/${c.url}`,   lastmod: c.$updatedAt, changefreq: 'weekly',  priority: 0.7 }));
    const destinations = destDocs.map(d => ({ url: `${SITE_URL}/destinations/${d.url}`, lastmod: d.$updatedAt, changefreq: 'monthly', priority: 0.7 }));
    const blogs        = blogDocs.map(b => ({ url: `${SITE_URL}/blogs/${b.url}`,         lastmod: b.$updatedAt, changefreq: 'weekly',  priority: 0.6 }));

    const staticPages = [
      { url: SITE_URL,                      lastmod: new Date().toISOString(), changefreq: 'daily',  priority: 1.0 },
      { url: `${SITE_URL}/destinations`,    lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/blogs`,           lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
    ];

    const allUrls = [...staticPages, ...packages, ...categories, ...destinations, ...blogs];

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
    console.error('Sitemap error:', error);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><error>${error?.message || String(error)}</error>`, {
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
