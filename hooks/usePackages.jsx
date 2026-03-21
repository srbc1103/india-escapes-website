'use client';

import { useQuery } from '@tanstack/react-query';
import Data from '../lib/backend';

/**
 * Custom hook to fetch packages with caching
 * Multiple components can use this hook with the same parameters,
 * and React Query will only make ONE API call and share the result
 */
export function usePackages(payload = {}) {
  return useQuery({
    queryKey: ['packages', payload],
    queryFn: () => Data.fetchPackages(payload),
    staleTime: 3 * 60 * 1000, // 3 minutes - matches your API cache
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    enabled: true, // Set to false if you want to control when to fetch
  });
}

/**
 * Hook for fetching packages by category
 */
export function usePackagesByCategory(category, options = {}) {
  return useQuery({
    queryKey: ['packages', 'category', category],
    queryFn: () => Data.fetchPackages({ category }),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!category, // Only fetch if category exists
    ...options,
  });
}

/**
 * Hook for fetching featured packages
 */
export function useFeaturedPackages(limit) {
  return useQuery({
    queryKey: ['packages', 'featured', limit],
    queryFn: () => Data.fetchPackages({ featured: true, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Hook for package search
 */
export function useSearchPackages(query) {
  return useQuery({
    queryKey: ['packages', 'search', query],
    queryFn: () => Data.searchPackages({ query }),
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    gcTime: 5 * 60 * 1000,
    enabled: !!query && query.trim().length > 0, // Only search if query exists
  });
}

/**
 * Hook for fetching package bundles (deals/labels)
 */
export function usePackageBundles(payload, type = 'deals') {
  return useQuery({
    queryKey: ['packages', 'bundles', type, payload],
    queryFn: () => Data.fetchPackagesBundles(payload, type),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching regions with packages
 */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => Data.fetchRegions({}),
    staleTime: 60 * 60 * 1000, // 1 hour - regions don't change often
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

/**
 * Hook for fetching complete package data (all related info)
 */
export function usePackageComplete(url, category = []) {
  return useQuery({
    queryKey: ['package', 'complete', url, category],
    queryFn: () => Data.fetchPackageComplete({ url, category }),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!url, // Only fetch if URL exists
  });
}

/**
 * Hook for fetching related packages
 */
export function useRelatedPackages(packageID, category = [], limit = 2) {
  return useQuery({
    queryKey: ['packages', 'related', packageID, category, limit],
    queryFn: () => Data.fetchRelatedPackages(packageID),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!packageID,
  });
}

/**
 * Hook for fetching images metadata
 */
export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: () => Data.fetchImages({}),
    staleTime: 30 * 60 * 1000, // 30 minutes - images don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
