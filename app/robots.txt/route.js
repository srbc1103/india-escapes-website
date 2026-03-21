// app/robots.txt/route.js
import { NextResponse } from 'next/server';
import Data from '../../lib/backend';
import { COLLECTIONS } from '../../constants';
import { Query } from 'appwrite';

export async function GET() {
  try {
    const res = await Data.get_items_list({
      collection_id: COLLECTIONS.SETTINGS,
      queries: [Query.equal('key', 'robots_txt')],
      limit: 1,
    });

    const content = res.documents?.[0]?.value || `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`;

    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return new NextResponse(
      `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }
}