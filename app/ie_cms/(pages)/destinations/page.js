'use client';

import { COLLECTIONS, LIST_LIMIT } from "../../../../constants";
import Data from "../../../../lib/backend";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Eye, MoreHorizontal, Pencil, Trash, Download } from "lucide-react";
import Link from "next/link";
import Button from "../../../../components/Buttons";
import usePopup from "../../../../hooks/usePopup";
import { LocationForm } from "../../../../components/Forms";
import Pagination from "../../../../components/Pagination";
import { calculateTotalPages, downloadCSV } from "../../../../functions";
import PageHead from "../../../../components/PageHead";
import { SearchInput } from "../../../../components/Input";
import useCMSSearch from "../../../../hooks/useCMSSearch";

function DESTINATIONS() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [allDestinations, setAllDestinations] = useState([]); // All items from DB
  const [filteredItems, setFilteredItems] = useState([]);     // After region filter
  const [displayItems, setDisplayItems] = useState([]);       // Paginated slice
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Decode region: ?rgn=north-india → "North India"
  const rawRegion = searchParams.get('rgn');
  const region = rawRegion
    ? rawRegion.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null;

  // Search functionality
  const {
    searchQuery,
    isSearching,
    searchResults,
    clearSearch,
    handleSearch
  } = useCMSSearch({ collection_id: COLLECTIONS.DESTINATIONS });

  // Compute final display items (search results override normal flow)
  const finalDisplayItems = searchQuery
    ? (searchResults?.items || []).slice((currentPage - 1) * LIST_LIMIT, currentPage * LIST_LIMIT)
    : displayItems;

  const finalTotal = searchQuery
    ? (searchResults?.total || 0)
    : totalFiltered;

  const isLoading = loading || isSearching;

  // Create forms
  const { showDialog: showLocationForm, hideDialog: hideLocationForm, dialog: locationForm } = usePopup({
    form: (
      <LocationForm
        onSave={(id) => {
          hideLocationForm();
          router.push(`/ie_cms/destination?did=${id}`);
        }}
        type="destination"
        mode="create"
        region={region || undefined}
      />
    ),
    container_styles: 'max-w-[800px]'
  });

  const [editForm, setEditForm] = useState(null);
  const { showDialog: showEditForm, hideDialog: hideEditForm, dialog: editLocationForm } = usePopup({
    form: editForm,
    container_styles: 'max-w-[800px]'
  });

  useEffect(() => {
    document.title = region ? `${region} - India Escapes` : "Destinations - India Escapes";
  }, [region]);

  // Fetch once on mount
  useEffect(() => {
    fetchAllDestinations();
  }, []);

  async function fetchAllDestinations() {
    setLoading(true);
    try {
      let all = [];
      let offset = 0;
      const batch = 100;

      while (true) {
        const res = await Data.get_items_list({
          collection_id: COLLECTIONS.DESTINATIONS,
          offset,
          limit: batch
        });

        if (res.status !== 'success' || !res.items?.length) break;
        all = [...all, ...res.items];
        if (res.items.length < batch) break;
        offset += batch;
      }

      setAllDestinations(all);
    } catch (err) {
      toast.error("Failed to load destinations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Filter + paginate whenever data, region or page changes
  useEffect(() => {
    if (!allDestinations.length) {
      setFilteredItems([]);
      setDisplayItems([]);
      setTotalFiltered(0);
      setTotalPages(1);
      return;
    }

    let filtered = allDestinations;

    if (region) {
      const lower = region.toLowerCase();
      filtered = allDestinations.filter(dest => 
        dest.region?.toLowerCase().includes(lower)
      );
    }

    setTotalFiltered(filtered.length);
    setTotalPages(calculateTotalPages(filtered.length));

    const start = LIST_LIMIT * (currentPage - 1);
    const end = start + LIST_LIMIT;
    setFilteredItems(filtered);
    setDisplayItems(filtered.slice(start, end));
  }, [allDestinations, region, currentPage]);

  const handleDelete = async (oid) => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone')) return;

    setUpdating(true);
    try {
      const res = await Data.delete_item({
        collection_id: COLLECTIONS.DESTINATIONS,
        document_id: oid
      });

      if (res.status === 'success') {
        toast.success('Destination deleted successfully');
        setAllDestinations(prev => prev.filter(i => i.id !== oid));
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const openEditForm = (item) => {
    setEditForm(
      <LocationForm
        onSave={(id) => {
          hideEditForm();
          router.push(`/ie_cms/destination?did=${id}`);
        }}
        type="destination"
        mode="edit"
        initialData={item}
      />
    );
    showEditForm();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await Data.get_all_items_for_export({
        collection_id: COLLECTIONS.DESTINATIONS
      });

      if (response.status === 'success' && response.items.length > 0) {
        downloadCSV(response.items, 'destinations.csv');
        toast.success('Data exported successfully!');
      } else {
        toast.error('No data to export');
      }
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full049 py-8 px-2">
      {locationForm}
      {editLocationForm}

      <div className="flex items-center justify-between">
        <PageHead text={region || 'Destinations'} />
        <div className="flex gap-2">
          {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || allDestinations.length === 0}
          >
            <Download size={16} className="mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button> */}
          <Button onClick={showLocationForm} styles="text-sm">+ New Destination</Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3 max-w-xl">
        <SearchInput
          placeholder="Search destinations by name..."
          fun={handleSearch}
          clear={clearSearch}
          label="Search"
        />
      </div>

      {/* Search Status */}
      {searchQuery && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {isSearching ? 'Searching...' : `Found ${finalTotal} result${finalTotal !== 1 ? 's' : ''}`}
          <button
            onClick={clearSearch}
            className="ml-2 text-blue-600 hover:underline text-xs"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto py-4">
          <table className="w-full max-w-4xl table-auto text-sm rounded-xl overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">#</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">Name</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">Region</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3"><Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 mx-auto" /></td>
                  </tr>
                ))
              ) : finalDisplayItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : region
                        ? `No destinations found in ${region}.`
                        : "No destination added."}
                  </td>
                </tr>
              ) : (
                finalDisplayItems.map((item, idx) => {
                  const globalIndex = (currentPage - 1) * LIST_LIMIT + idx + 1;
                  return (
                    <tr key={item.id} className="border-b border-gray-200/50 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{globalIndex}</td>
                      <td className="px-4 py-3">
                        <Link
                          className="text-gray-800 dark:text-gray-200 font-medium transition duration-300 hover:underline"
                          href={`/ie_cms/destination?did=${item.id}`}
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.region}</td>
                      <td className="px-4 py-3 text-center">
                        <Popover>
                          <PopoverTrigger className="square_btn h-8 w-8 mx-auto"><MoreHorizontal size={18} /></PopoverTrigger>
                          <PopoverContent className="bg-white text-sm w-[150px] -mt-2 absolute -right-4 p-0 rounded-xl shadow-lg border-none overflow-hidden" style={{ zIndex: 100 }}>
                            <button
                              className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 border-b border-gray-200/50 transition duration-300 hover:bg-green/5 w-full"
                              onClick={() => openEditForm(item)}
                              disabled={updating}
                            >
                              <div className="aspect-square rounded-full flex-center-jc bg-green/5 h-8"><Pencil size={15} className='text-green' /></div>Edit
                            </button>
                            <button
                              className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 text-red-500 transition duration-300 hover:bg-red-500/5 w-full"
                              onClick={() => handleDelete(item.id)}
                              disabled={updating}
                            >
                              <div className="aspect-square rounded-full flex-center-jc bg-red-500/5 h-8"><Trash size={15} className='text-red-500' /></div>Delete
                            </button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && finalTotal > 0 && !searchQuery && (
        <div className="mt-6 max-w-4xl">
          <Pagination
            current={currentPage}
            total={totalFiltered}
            itemsPerPage={LIST_LIMIT}
            onPageChange={setCurrentPage}
            pages={totalPages}
            hide_text
          />
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
      <Suspense fallback={<div className="w-full py-8 px-2"><Skeleton className="h-6 w-1/3 mx-auto" /></div>}>
          <DESTINATIONS />
      </Suspense>
  )
}