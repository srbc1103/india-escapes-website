'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Data from '../lib/backend';
import { toast } from 'sonner';
import { COLLECTIONS, LIST_LIMIT } from '../constants';

// Cache duration constants (in milliseconds)
const CACHE_TIMES = {
  // Long cache - rarely changing data (1 hour)
  LONG: 60 * 60 * 1000,
  // Medium cache - semi-static data (10 minutes)
  MEDIUM: 10 * 60 * 1000,
  // Short cache - frequently updated data (3 minutes)
  SHORT: 3 * 60 * 1000,
  // Very short cache - dynamic data (1 minute)
  VERY_SHORT: 1 * 60 * 1000,
};

// Get appropriate cache time based on collection type
function getCacheTime(collection_id) {
  switch (collection_id) {
    // Long cache - rarely changes
    case COLLECTIONS.CATEGORIES:
    case COLLECTIONS.DESTINATIONS:
    case COLLECTIONS.REGIONS:
    case COLLECTIONS.FAQ:
    case COLLECTIONS.SETTINGS:
      return CACHE_TIMES.LONG;

    // Medium cache - changes occasionally
    case COLLECTIONS.BLOGS:
    case COLLECTIONS.LOCATIONS:
    case COLLECTIONS.ACTIVITIES:
    case COLLECTIONS.ACCOMMODATIONS:
      return CACHE_TIMES.MEDIUM;

    // Short cache - frequently updated
    case COLLECTIONS.PACKAGES:
    case COLLECTIONS.DEALS:
    case COLLECTIONS.LABELS:
    case COLLECTIONS.REVIEWS_STATS:
    case COLLECTIONS.FEATURED_IMAGE:
      return CACHE_TIMES.SHORT;

    // Very short cache for everything else
    default:
      return CACHE_TIMES.VERY_SHORT;
  }
}

export default function useFetch({ collection_id = null, document_id = null, url = null, item_type = null } = {}) {
  const queryClient = useQueryClient();
  const cacheTime = getCacheTime(collection_id);

  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ['item', collection_id, document_id, url, item_type],
    queryFn: async () => {
      if (!collection_id || (!document_id && !url)) {
        throw new Error('Collection ID and Document ID are required');
      }
      const d = await Data.get_item_detail({ collection_id, document_id, url, item_type });
      const { status, document, message } = d;
      if (status === 'success') {
        return document;
      } else {
        throw new Error(message || 'Failed to fetch item');
      }
    },
    enabled: !!(collection_id && (document_id || url)),
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
  });

  return {
    loading: isLoading,
    data: queryData || null,
    load_detail: refetch,
    message: error?.message || null,
  };
}

export function useDelete({ collection_id = null, document_id = null } = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!collection_id || !document_id) {
        throw new Error('Collection ID and Document ID are required');
      }
      const response = await Data.delete_item({ collection_id, document_id });
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to delete item');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['items', collection_id] });
      queryClient.invalidateQueries({ queryKey: ['item', collection_id] });
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const delete_item = async () => {
    try {
      await mutation.mutateAsync();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    loading: mutation.isPending,
    delete_item,
    message: mutation.error?.message || null,
  };
}

export function useUpdate({ collection_id = null, document_id = null } = {}) {
  const queryClient = useQueryClient();
  const [updatedData, setUpdatedData] = useState(null);

  const mutation = useMutation({
    mutationFn: async (item_data) => {
      if (!collection_id || !document_id) {
        throw new Error('Collection ID and Document ID are required');
      }
      if (!item_data || Object.keys(item_data).length === 0) {
        throw new Error('Item data is required');
      }
      const response = await Data.update_item({ collection_id, document_id, item_data });
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to update item');
      }
      return response;
    },
    onSuccess: (response) => {
      setUpdatedData(response.document);
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['items', collection_id] });
      queryClient.invalidateQueries({ queryKey: ['item', collection_id, document_id] });
      toast.success('Item updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
  });

  const update_item = async (item_data) => {
    try {
      await mutation.mutateAsync(item_data);
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    loading: mutation.isPending,
    update_item,
    message: mutation.error?.message || null,
    updatedData,
  };
}

export function useFetchList({ collection_id = null, limit = LIST_LIMIT, useCache = false } = {}) {
  const cacheTime = getCacheTime(collection_id);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['items', collection_id, limit],
    queryFn: async () => {
      if (!collection_id) {
        throw new Error('Collection ID is required');
      }
      const d = collection_id === COLLECTIONS.BLOGS
        ? await Data.fetchBlogs({ collection_id, limit })
        : await Data.get_items_list({ collection_id, limit });
      const { status, items, message, total } = d;
      if (status === 'success') {
        return { items, total };
      } else {
        throw new Error(message || 'Failed to fetch items');
      }
    },
    enabled: !!collection_id,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
  });

  return {
    loading: isLoading,
    list: data?.items || [],
    load_list: refetch,
    message: error?.message || null,
    total: data?.total || 0,
  };
}

export function useRegions({} = {}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const d = await Data.fetchRegions({});
      return d.items || [];
    },
    staleTime: CACHE_TIMES.LONG, // Regions rarely change
    gcTime: CACHE_TIMES.LONG * 2,
  });

  return {
    regions: data || [],
    loading: isLoading,
    loadRegions: refetch,
  };
}

export function useImages({} = {}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const d = await Data.fetchImages({});
      return d.items || [];
    },
    staleTime: CACHE_TIMES.MEDIUM, // Images change occasionally
    gcTime: CACHE_TIMES.MEDIUM * 2,
  });

  return {
    images: data || [],
    loading: isLoading,
    loadImages: refetch,
  };
}

export function useFeaturedImage({ id } = {}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['featuredImage', id],
    queryFn: async () => {
      if (!id) return null;
      const d = await Data.get_item_detail({
        collection_id: COLLECTIONS.FEATURED_IMAGE,
        document_id: id,
      });
      const { status, document } = d;
      if (status === 'success') {
        return document.featured_image || null;
      }
      return null;
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.SHORT, // Featured images can change
    gcTime: CACHE_TIMES.SHORT * 2,
  });

  return {
    featuredImage: data || null,
    loading: isLoading,
    loadFeaturedImage: refetch,
  };
}
