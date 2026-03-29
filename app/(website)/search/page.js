// app/search/page.tsx   (single file – fully updated & working)

'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../../components/website/Header';
import { IMAGES } from '../../../constants';
import Image from 'next/image';
import Heading from '../../../components/ui/Heading';
import { Skeleton } from '../../../components/ui/skeleton';
import { PackageBlockSkeleton } from '../../../components/PackageBlock';
import { PackagesSection } from '../destinations/[url]/DestinationClient';

/* ------------------------------------------------------------------ */
/*  Skeleton shown while Suspense resolves (client hydration)         */
/* ------------------------------------------------------------------ */
function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header color="black" fixed={{ mobile: true, desktop: true }} />
      <div className="h-[32vh] lg:h-[60vh] relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <PackageBlockSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner component – uses useSearchParams safely (client-only)       */
/* ------------------------------------------------------------------ */
function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q')?.trim();

  useEffect(() => {
    if (!q) {
      router.replace('/packages');
    } else {
      document.title = `Search: ${q} | India Escapes`;
    }
  }, [q, router]);

  // Will never render if redirect happens
  if (!q) return null;

  return (
    <>
      <Header color="black" fixed={{ mobile: true, desktop: true }} />
      <div className="h-[32vh] lg:h-[50vh] flex-center-jc relative overflow-hidden">
        <Image
          src={IMAGES.hero_bg}
          alt="Search background"
          fill
          className="object-cover opacity-40 grayscale"
          priority
        />
        <div className="bg-gradient-to-t from-white via-white/70 to-transparent h-full w-full absolute bottom-0 left-0" />
        <div className="relative z-10 w_80_90">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 lg:mb-4 pt-20 lg:pt-0 capitalize text-gray-900">
            {q}
          </h1>
          <p className="text-lg text-gray-700">Discover your perfect escape</p>
        </div>
      </div>

      <section className=" mx-auto px-4 py-12">
        <PackagesSection search={q} />
      </section>

      <div className="h-20" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page – wraps everything in Suspense (required by Next.js)         */
/* ------------------------------------------------------------------ */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchInner />
    </Suspense>
  );
}