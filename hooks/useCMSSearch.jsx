import { useState, useEffect, useCallback } from 'react';
import Data from '../lib/backend';

/**
 * Reusable hook for CMS admin pages to add search functionality
 * @param {Object} params
 * @param {string} params.collection_id - The Appwrite collection ID to search
 * @returns {Object} Search state and handlers
 */
export default function useCMSSearch({ collection_id }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);

  // Debounced search effect (300ms delay)
  useEffect(() => {
    // If no query, clear results
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setError(null);
      return;
    }

    // Debounce: wait 300ms after user stops typing
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await Data.get_items_list({
          collection_id,
          search_query: searchQuery,
          limit: 100, // Show up to 100 search results
          offset: 0
        });

        if (response.status === 'success') {
          setSearchResults({
            items: response.items,
            total: response.total
          });
        } else {
          setError(response.message || 'Search failed');
          setSearchResults({ items: [], total: 0 });
        }
      } catch (err) {
        setError(err.message || 'An error occurred during search');
        setSearchResults({ items: [], total: 0 });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    // Cleanup: cancel timeout if query changes before 300ms
    return () => clearTimeout(timeout);
  }, [searchQuery, collection_id]);

  // Handler for search input changes
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Handler to clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    searchQuery,
    isSearching,
    searchResults,
    error,
    clearSearch,
    handleSearch
  };
}
