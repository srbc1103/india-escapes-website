import { COLLECTIONS, IMAGES } from "../../../constants";
import Data from "../../../lib/backend";
import PackageClient from "./PackageClient";

export async function generateMetadata({ params }) {
  const { packageID } = await params;

  try {
    const d = await Data.get_item_detail({
      collection_id: COLLECTIONS.PACKAGES,
      url: packageID,
      item_type: 'package'
    });

    if (d.status === 'success') {
      const { name, description, featured_image, meta_description } = d.document;

      let pageTitle = name;
      let pageDescription = description?.replace(/<[^>]*>/g, '').slice(0, 160) || `${name} - Explore this amazing tour package with India Escapes.`;
      let ogImage = featured_image || IMAGES.hero_bg;

      // Parse custom meta description if available
      if (meta_description) {
        try {
          const md = JSON.parse(meta_description);
          if (md?.title) pageTitle = md.title;
          if (md?.description) pageDescription = md.description;
        } catch (e) {
          // Use defaults if parsing fails
        }
      }

      return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
          title: pageTitle,
          description: pageDescription,
          images: [ogImage],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: pageDescription,
          images: [ogImage],
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }

  // Fallback metadata
  return {
    title: 'Package Details - India Escapes',
    description: 'Explore amazing tour packages with India Escapes',
  };
}

export default async function Page({ params }) {
  const { packageID } = await params;

  return <PackageClient packageID={packageID} />;
}
