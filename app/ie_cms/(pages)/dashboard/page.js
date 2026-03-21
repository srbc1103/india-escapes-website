'use client';

import { COLLECTIONS, HASH, LIST_LIMIT } from "../../../../constants";
import Data from "../../../../lib/backend";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Eye, MoreHorizontal, Trash } from "lucide-react";
import usePopup from "../../../../hooks/usePopup";
import Pagination from "../../../../components/Pagination";
import { calculateTotalPages } from "../../../../functions";
import PageHead from "../../../../components/PageHead";
import moment from "moment";
import { ReviewsStatsForm } from "../../../../components/Forms";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryDetail, setQueryDetail] = useState(null);
  const [state, setState] = useState({
    total: 0,
    items: [],
    filtered_items: [],
  });

  const { showDialog, hideDialog, dialog: packageForm } = usePopup({
    form: queryDetail,
    container_styles: 'max-w-[750px]'
  });

  useEffect(() => {
    document.title = "Admin - India Escapes";
  }, []);

  useEffect(() => {
    get_items();
  }, [currentPage]);

  async function get_items() {
    setLoading(true);
    const offset = LIST_LIMIT * (currentPage - 1);
    Data.get_items_list({ collection_id: COLLECTIONS.QUERIES, offset }).then(d => {
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
    let cnf = confirm('Are you sure you want to delete this query? This action cannot be undone');
    if (!cnf) return;
    setUpdating(true);
    Data.delete_item({ collection_id: COLLECTIONS.QUERIES, document_id: oid }).then(d => {
      let { status, message } = d;
      if (status === 'success') {
        toast.success('Query deleted successfully');
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

  return (
    <div className="w-full py-8 px-2">
      {packageForm}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3">
          <PageHead text="Queries" styles="mb-2 text-xl"/>
          <div className="bg-white dark:bg-gray-800 overflow-hidden">
            <div className="overflow-x-auto p-1 py-4">
              <table className="w-full table-auto text-sm rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-gray-100 text-black">
                    <th className="px-4 py-3 text-left text-xs uppercase font-medium">#</th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-medium">Contact Details</th>
                    <th className="px-4 py-3 text-xs uppercase font-medium text-center">Type</th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-medium">Date</th>
                    <th className="px-4 py-3 text-xs uppercase font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="px-4 py-3"><Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 mx-auto" /></td>
                      </tr>
                    ))
                  ) : state.filtered_items?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                        No query received.
                      </td>
                    </tr>
                  ) : (
                    state.filtered_items.map((item, index) => {
                      const { name, mobile, email, destination, query_type, createdAt, metadata } = item;
                      const isMsForm = query_type === 'ms_form' && metadata;
                      const ms = isMsForm ? JSON.parse(metadata) : null;

                      const displayName = isMsForm ? ms.name || name : name;
                      const displayMobile = isMsForm ? ms.mobile || mobile : mobile;
                      const displayEmail = isMsForm ? ms.email || email : email;
                      const displayDestination = isMsForm ? ms.destination || destination : destination;

                      return (
                        <tr key={item.id} className="border-b border-gray-200/50 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1 + (currentPage - 1) * LIST_LIMIT}</td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium cursor-pointer" role="button" onClick={() => {
                            setQueryDetail(<QueryDetail {...item} />);
                            showDialog();
                          }}>
                            {displayName}
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                            <p>{displayMobile}</p>
                            <p className="text-[10px] text-gray-500">{displayEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-200">
                            <p className="w-fit p-1 px-3 rounded-full text-[10px] bg-gray-100 capitalize border border-gray-300 mx-auto">
                              {query_type === 'ms_form' ? 'Custom Quote' : query_type.replaceAll('_', ' ')}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {moment(createdAt).format('DD MMM, y')}
                            <p className="text-[10px] text-gray-500">{moment(createdAt).format('hh:mm A')}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Popover>
                              <PopoverTrigger className="square_btn h-8 w-8 mx-auto"><MoreHorizontal size={18} /></PopoverTrigger>
                              <PopoverContent className="bg-white text-sm w-[150px] -mt-2 absolute -right-4 p-0 rounded-xl shadow-lg border-none overflow-hidden" style={{ zIndex: 100 }}>
                                <button
                                  className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 border-b border-gray-200/50 transition duration-300 hover:bg-green-50 w-full"
                                  onClick={() => {
                                    setQueryDetail(<QueryDetail {...item} />);
                                    showDialog();
                                  }}
                                  disabled={updating}
                                >
                                  <div className="aspect-square rounded-full flex-center-jc bg-green-50 h-8"><Eye size={15} className='text-green-600' /></div>View
                                </button>
                                <button
                                  className="p-2 flex gap-2 items-center justify-start disabled:pointer-events-none disabled:opacity-60 text-red-500 transition duration-300 hover:bg-red-50 w-full"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={updating}
                                >
                                  <div className="aspect-square rounded-full flex-center-jc bg-red-50 h-8"><Trash size={15} className='text-red-500' /></div>Delete
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
          {!loading && state.total > 0 && (
            <div className="mt-2 max-w-4xl">
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
        <div>
          {/* <PageHead text="Reviews Stats" styles="mb-2 text-xl"/>
          <ReviewsStatsForm/> */}
        </div>
      </div>
    </div>
  );
}

function QueryDetail(props) {
  const { query_type, metadata, name, mobile, email, destination, message, createdAt } = props;

  const isMsForm = query_type === 'ms_form' && metadata;
  const ms = isMsForm ? JSON.parse(metadata) : null;

  if (isMsForm && ms) {
    return (
      <div className="w-full py-8 max-h-[85vh] overflow-y-auto px-4">
        <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">
          <span className="text-red-500">Custom Quote</span> Query
        </p>

        <div className="w-[90%] md:w-[70%] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold text-gray-800 text-base">{ms.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Mobile</p>
              <a href={`tel:${ms.mobile}`} className="font-semibold text-gray-800 text-base hover:text-blue-600">
                {ms.mobile}
              </a>
            </div>
            {ms.email && (
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <a href={`mailto:${ms.email}`} className="font-semibold text-gray-800 text-base hover:text-blue-600">
                  {ms.email}
                </a>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-sm">Destination / Package</p>
              <p className="font-semibold text-gray-800 text-base">{ms.destination || 'General Query'}</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-6">
            <div>
              <p className="text-gray-500 text-sm mb-2">Travel Date</p>
              <p className="font-semibold text-gray-800">
                {ms.travelDateType === 'Fixed' 
                  ? (ms.fixedDate ? moment(ms.fixedDate).format('DD MMM, YYYY') : 'Not specified')
                  : `Flexible - ${ms.flexibleMonths?.join(', ') || 'Any time'}`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Trip Duration</p>
                <p className="font-semibold text-gray-800">{ms.duration}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Travelling With</p>
                <p className="font-semibold text-gray-800">{ms.travellers}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Budget (per person)</p>
                <p className="font-semibold text-gray-800">{ms.budget}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Preferred Accommodation</p>
              <div className="flex flex-wrap gap-2">
                {ms.accommodation?.map((acc, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                    {acc}
                  </span>
                )) || <span className="text-gray-400">Not specified</span>}
              </div>
            </div>

            {ms.interests && ms.interests.trim() !== '' && (
              <div>
                <p className="text-gray-500 text-sm mb-2">Interests / Special Requests</p>
                <p className="font-medium text-gray-700 text-base leading-relaxed whitespace-pre-line">
                  {ms.interests}
                </p>
              </div>
            )}

            {ms.message && ms.message.trim() !== '' && (
              <div>
                <p className="text-gray-500 text-sm mb-2">Additional Message</p>
                <p className="font-medium text-gray-700 text-base leading-relaxed whitespace-pre-line">
                  {ms.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-6 border-t border-gray-100 mt-8">
            <a
              href={`tel:${ms.mobile}`}
              className="px-6 py-3 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Call Now
            </a>
            {ms.email && (
              <a
                href={`mailto:${ms.email}?subject=Your%20Custom%20India%20Escape%20Quote&body=Dear%20${encodeURIComponent(ms.name)},%0A%0AThank%20you%20for%20your%20interest%20in%20India%20Escapes...`}
                className="px-6 py-3 text-sm font-semibold rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
              Send Quote
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for regular quote/callback
  const fallbackName = ms?.name || name;
  const fallbackMobile = ms?.mobile || mobile;
  const fallbackEmail = ms?.email || email;
  const fallbackDestination = ms?.destination || destination || 'General';
  const fallbackMessage = ms?.message || message;

  return (
    <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
      <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">
        <span className="text-red-500">
          {query_type === 'quote' ? 'Quote' : 'Call Back'}
        </span>{' '}
        Query
      </p>

      <div className="w-[90%] md:w-[70%] mx-auto">
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Name</p>
          <p className="font-semibold text-gray-800 text-base">{fallbackName}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-500 text-sm">Mobile</p>
          <a href={`tel:${fallbackMobile}`} className="font-semibold text-gray-800 text-base hover:text-blue-600">
            {fallbackMobile}
          </a>
        </div>

        {fallbackEmail && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm">Email</p>
            <a href={`mailto:${fallbackEmail}`} className="font-semibold text-gray-800 text-base hover:text-blue-600">
              {fallbackEmail}
            </a>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-500 text-sm">Destination / Package</p>
          <p className="font-semibold text-gray-800 text-base">
            {fallbackDestination}
          </p>
        </div>

        {fallbackMessage && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm">Remarks</p>
            <p className="font-medium text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {fallbackMessage}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-4 border-t border-gray-100 mt-6">
          <a
            href={`tel:${fallbackMobile}`}
            className="px-5 py-2 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Call
          </a>
          {fallbackEmail && (
            <a
              href={`mailto:${fallbackEmail}`}
              className="px-5 py-2 text-sm font-semibold rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
            >
              Reply
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
