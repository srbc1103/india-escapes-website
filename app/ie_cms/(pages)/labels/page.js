'use client';

import { COLLECTIONS, LIST_LIMIT } from "../../../../constants";
import Data from "../../../../lib/backend";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function DEALS() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [state, setState] = useState({
    total: 0,
    items: [],
    filtered_items: [],
  });
  const [editForm,setEditForm] = useState(null)

  // Search functionality
  const {
    searchQuery,
    isSearching,
    searchResults,
    clearSearch,
    handleSearch
  } = useCMSSearch({ collection_id: COLLECTIONS.LABELS });

  // Compute display data based on search state
  const displayItems = searchQuery
    ? (searchResults?.items || [])
    : state.filtered_items;

  const displayTotal = searchQuery
    ? (searchResults?.total || 0)
    : state.total;

  const isLoading = loading || isSearching;

  const { showDialog: showLocationForm, hideDialog: hideLocationForm, dialog: locationForm } = usePopup({
    form: (
      <LocationForm
        onSave={() => {
          hideLocationForm();
          get_items()
        }}
        type="label"
        mode="create"
      />
    ),
    container_styles: 'max-w-[800px]'
  });

  const { showDialog: showEditLocationForm, hideDialog: hideEditLocationForm, dialog: editLocationForm } = usePopup({
    form: editForm,
    container_styles: 'max-w-[800px]'
  });

  useEffect(() => {
    document.title = "Labels";
  }, []);

  useEffect(() => {
    get_items();
  }, [currentPage]);

  async function get_items() {
    setLoading(true);
    const offset = LIST_LIMIT * (currentPage - 1);
    Data.get_items_list({ collection_id: COLLECTIONS.LABELS, offset }).then(d => {
      let { status } = d;
      if (status === 'success') {
        let { total, items } = d;
        setState(s => ({ ...s, total, items, filtered_items: items }));
        setPages(calculateTotalPages(total));
      }
      if (status !== 'success') {
        toast(d.message);
      }
    }).catch(err => {
      console.log(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  const handleDelete = async (oid) => {
    let cnf = confirm('Are you sure you want to delete this label? This action cannot be undone');
    if (!cnf) return;
    setUpdating(true);
    Data.delete_item({ collection_id: COLLECTIONS.LABELS, document_id: oid }).then(d => {
      let { status, message } = d;
      if (status === 'success') {
        toast.success('Label deleted successfully');
        get_items();
      } else {
        toast.error(message);
      }
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setUpdating(false);
    });
  };

  const renderEditLocationForm = ({ name, id, description, images }) => {
    setEditForm(
        <LocationForm
          name={name}
          id={id}
          description={description}
          images={images||[]}
          mode="update"
          type="label"
          onSave={() => {
            hideEditLocationForm();
            get_items();
          }}
        />
      )
    showEditLocationForm()
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await Data.get_all_items_for_export({
        collection_id: COLLECTIONS.LABELS
      });

      if (response.status === 'success' && response.items.length > 0) {
        downloadCSV(response.items, 'labels.csv');
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
    <div className="w-full py-8 px-2">
      {locationForm}
      {editLocationForm}
      <div className="flex items-center justify-between">
        <PageHead text="Labels" />
        <div className="flex gap-2">
          {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || state.total === 0}
          >
            <Download size={16} className="mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button> */}
          <Button onClick={showLocationForm} styles="text-sm">+ New Label</Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3 max-w-xl">
        <SearchInput
          placeholder="Search labels by name..."
          fun={handleSearch}
          clear={clearSearch}
          label="Search"
        />
      </div>

      {/* Search Status */}
      {searchQuery && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {isSearching ? 'Searching...' : `Found ${displayTotal} result${displayTotal !== 1 ? 's' : ''}`}
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
                <th className="px-4 py-3 text-xs uppercase font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Skeleton Loading State
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3"><Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                  </tr>
                ))
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : "No label added."}
                  </td>
                </tr>
              ) : (
                displayItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200/50 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/ie_cms/label?lid=${item.id}`}
                        className="text-gray-800 dark:text-gray-200 font-medium transition duration-300 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Popover>
                        <PopoverTrigger className="square_btn h-8 w-8 mx-auto"><MoreHorizontal size={18} /></PopoverTrigger>
                        <PopoverContent className="bg-white text-sm w-[150px] -mt-2 absolute -right-4 p-0 rounded-xl shadow-lg border-none overflow-hidden" style={{ zIndex: 100 }}>
                          <button
                            className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 border-b border-gray-200/50 transition duration-300 hover:bg-green/5 w-full"
                            role="button"
                            onClick={() => {
                              router.push(`/ie_cms/label?lid=${item.id}`)
                            }}
                            disabled={updating}
                          >
                            <div className="aspect-square rounded-full flex-center-jc bg-green/5 h-8"><Pencil size={15} className='text-green' /></div>Edit
                          </button>
                          {/* <button
                            className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 text-red-500 transition duration-300 hover:bg-red-500/5 w-full"
                            role="button"
                            onClick={() => {
                              handleDelete(item.id);
                            }}
                            disabled={updating}
                          >
                            <div className="aspect-square rounded-full flex-center-jc bg-red-500/5 h-8"><Trash size={15} className='text-red-500' /></div>Delete
                          </button> */}
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!isLoading && displayTotal > 0 && !searchQuery && (
        <div className="mt-6 max-w-4xl">
          <Pagination
            current={currentPage}
            total={state.total}
            itemsPerPage={LIST_LIMIT}
            onPageChange={(page) => setCurrentPage(page)}
            pages={pages}
            hide_text
          />
        </div>
      )}
    </div>
  );
}