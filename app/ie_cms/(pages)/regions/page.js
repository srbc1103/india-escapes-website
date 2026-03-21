'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "../../../../components/ui/skeleton";
import Link from "next/link";
import PageHead from "../../../../components/PageHead";
import { useRegions } from "../../../../hooks/useFetch";
import Button from "../../../../components/Buttons";
import { Download } from "lucide-react";
import { downloadCSV } from "../../../../functions";
import Data from "../../../../lib/backend";
import { COLLECTIONS } from "../../../../constants";
import { toast } from "sonner";

export default function Regions() {
  const { loading: loadingRegions, regions: list } = useRegions();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    document.title = "Regions";
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Export destinations data (which is what regions are based on)
      const response = await Data.get_all_items_for_export({
        collection_id: COLLECTIONS.DESTINATIONS
      });

      if (response.status === 'success' && response.items.length > 0) {
        downloadCSV(response.items, 'regions_destinations.csv');
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
      <div className="flex items-center justify-between">
        <PageHead text="Regions" />
        {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || list.length === 0}
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
                <th className="px-4 py-3 text-left text-xs uppercase font-medium">Name</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-center">Packages</th>
              </tr>
            </thead>
            <tbody>
              {loadingRegions ? (
                // Skeleton Loading State
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3"><Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 mx-auto" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No region added.
                  </td>
                </tr>
              ) : (
                list.map((item, index) => {
                    let {region,destinations} = item
                 return <tr key={index} className="border-b border-gray-200/50 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/ie_cms/destinations?rgn=${region.replaceAll(' ','-')}`}
                        className="text-gray-800 dark:text-gray-200 font-medium transition duration-300 hover:underline"
                      >
                        {region}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">{destinations?.length}</td>
                  </tr>
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}