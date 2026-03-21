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
import { FeaturedImageForm, LocationForm } from "../../../../components/Forms";
import Pagination from "../../../../components/Pagination";
import { calculateTotalPages, downloadCSV } from "../../../../functions";
import PageHead from "../../../../components/PageHead";
import Image from "next/image";

export default function Locations() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [state, setState] = useState({
    total: 0,
    items: [
        {id:'6944442864a85a5616f8', name:'About Us', featured_image:''},
        {id:'6944442864a7634ef0f2', name:'Blogs', featured_image:''},
        {id:'6944442864a67a5ce9e9', name:'Contact Us', featured_image:''},
        {id:'6944442864a57d95bc23', name:'Deals', featured_image:''},
        {id:'69444428649c3819b852', name:'Tours', featured_image:''},
        {id:'6944442864a487bff800', name:'Destinations', featured_image:''},
        {id:'69444428649ddb663888', name:'Categories', featured_image:''},
        {id:'6944442864a3851a412e', name:'FAQs', featured_image:''},
        {id:'6944442864a2b439d086', name:'Privacy Policy', featured_image:''},
        {id:'69444428649096f70115', name:'Terms & Conditions', featured_image:''},
        {id:'6944442864a1c6f2d932', name:'North India', featured_image:''},
        {id:'6944442864a0cf08f129', name:'South India', featured_image:''},
        {id:'69444428649fd9aea6e2', name:'West & Central India', featured_image:''},
        {id:'69444428649efaa3acf1', name:'More Regions', featured_image:''},
    ],
  });
  const [editForm,setEditForm] = useState(null)

  const { showDialog: showEditLocationForm, hideDialog: hideEditLocationForm, dialog: editLocationForm } = usePopup({
    form: editForm,
    container_styles: 'max-w-[400px]'
  });

  useEffect(() => {
    document.title = "Featured Images";
  }, []);

  useEffect(() => {
    get_items();
  }, [currentPage]);

  async function get_items() {
    setLoading(true);
    const offset = LIST_LIMIT * (currentPage - 1);
    Data.get_items_list({ collection_id: COLLECTIONS.FEATURED_IMAGE, offset }).then(d => {
      let { status } = d;
      if (status === 'success') {
        let { total, items } = d;
        let mappedItems = state.items.map(page => {
            let matchedImage = items.find(img => img.id === page.id);
            return {
                ...page,
                featured_image: matchedImage ? matchedImage.featured_image : ''
            };
        });
        setState(s => ({ ...s, total, items: mappedItems }));
        // setState(s => ({ ...s, total, items, filtered_items: items }));
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

  const renderEditLocationForm = ({ name, id, featured_image }) => {
    setEditForm(
        <FeaturedImageForm
          name={name}
          id={id}
          featured_image={featured_image}
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
        collection_id: COLLECTIONS.FEATURED_IMAGE
      });

      if (response.status === 'success' && response.items.length > 0) {
        downloadCSV(response.items, 'featured_images.csv');
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
      {editLocationForm}
      <div className="flex items-center justify-between">
        <PageHead text="Featured Images" />
        {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || state.items.length === 0}
          >
            <Download size={16} className="mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button> */}
        </div>
       <div className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto py-4">
          <table className="w-full max-w-4xl table-auto text-sm rounded-xl overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">#</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">Page</th>
                <th className="px-4 py-3 text-center text-xs uppercase font-medium">Featured Image</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Loading State
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3"><Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                  </tr>
                ))
              ) : state.items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No page added.
                  </td>
                </tr>
              ) : (
                state.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200/50 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p
                        className="text-gray-800 dark:text-gray-200 font-medium transition duration-300"
                      >
                        {item.name}
                      </p>
                    </td>
                    <td>
                        {item.featured_image ? <Image height={100} width={100} src={item.featured_image} alt={item.name} className="h-12 w-12 object-cover rounded-full mx-auto"/> : <></>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Popover>
                        <PopoverTrigger className="square_btn h-8 w-8 mx-auto"><MoreHorizontal size={18} /></PopoverTrigger>
                        <PopoverContent className="bg-white text-sm w-[150px] -mt-2 absolute -right-4 p-0 rounded-xl shadow-lg border-none overflow-hidden" style={{ zIndex: 100 }}>
                          <button
                            className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 border-b border-gray-200/50 transition duration-300 hover:bg-green/5 w-full"
                            role="button"
                            onClick={() => {
                              renderEditLocationForm({ name: item.name, id: item.id, featured_image: item.featured_image })
                            }}
                            disabled={updating}
                          >
                            <div className="aspect-square rounded-full flex-center-jc bg-green/5 h-8"><Pencil size={15} className='text-green' /></div>Edit
                          </button>
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
      
    </div>
  );
}