'use client'

import Button, { RoundButton } from "../../../../components/Buttons"
import PageHead from "../../../../components/PageHead"
import { Skeleton } from "../../../../components/ui/skeleton"
import { COLLECTIONS } from "../../../../constants"
import { useFetchList } from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import { useState } from "react"
import { FAQForm } from "../package/page"
import Data from "../../../../lib/backend"
import { toast } from "sonner"
import { Pencil, Plus, Trash, Download } from "lucide-react"
import { downloadCSV } from "../../../../functions"

export default function FAQ() {
    const { loading, list, load_list } = useFetchList({ collection_id: COLLECTIONS.FAQ, limit: 1000 })
    const [updating, setUpdating] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [form,setForm] = useState(null)
    const { showDialog: showDayForm, hideDialog, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]'
    })
    const handleDelete = async (oid) => {
        let cnf = confirm('Are you sure you want to delete this FAQ? This action cannot be undone');
        if (!cnf) return;
        setUpdating(true);
        Data.delete_item({ collection_id: COLLECTIONS.FAQ, document_id: oid }).then(d => {
          let { status, message } = d;
          if (status === 'success') {
            toast.success('FAQ deleted successfully');
            load_list();
          } else {
            toast.error(message);
          }
        }).catch(err => {
          toast.error(err.message);
        }).finally(() => {
          setUpdating(false);
        });
      };

    const handleExport = async () => {
        setExporting(true);
        try {
          const response = await Data.get_all_items_for_export({
            collection_id: COLLECTIONS.FAQ
          });

          if (response.status === 'success' && response.items.length > 0) {
            downloadCSV(response.items, 'faq.csv');
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
        <PageHead text="FAQs" />
        {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || list.length === 0}
          >
            <Download size={16} className="mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button> */}
      </div>
        {dialog}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {loading ? (
                <>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </>
            ) : (
                <>
                    <div
                        className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                        role="button"
                        onClick={() => {
                            setForm(
                                <FAQForm
                                    onSave={()=>{
                                        hideDialog()
                                        load_list()
                                    }}
                                    mode="create"
                                />
                            )
                            showDayForm()
                        }}
                        disabled={updating || loading}
                    >
                        <Plus size={40} color="#ccc" />
                        <p className="font-medium">Add FAQ</p>
                    </div>
                    {list.map((item, ind) => {
                        const { id, question, answer } = item
                        return (
                            <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                <div className="flex items-center justify-end gap-2">
                                    <RoundButton
                                        onClick={() => {
                                            setForm(
                                                <FAQForm
                                                    onSave={()=>{
                                                        hideDialog()
                                                        load_list()
                                                    }}
                                                    mode="edit"
                                                    {...item}
                                                />
                                            )
                                            showDayForm()
                                        }}
                                        disabled={updating}
                                        styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                        title="Edit FAQ"
                                    >
                                        <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                    </RoundButton>
                                    <RoundButton
                                        onClick={() => {
                                            handleDelete(id)

                                        }}
                                        styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                        title="Delete FAQ"
                                        disabled={updating}
                                    >
                                        <Trash size={16} color="white" />
                                    </RoundButton>
                                </div>
                                <h3 className="font-semibold capitalize mt-4">{question}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{answer?.slice(0, 200)}{answer?.length > 200 ? '...' : ''}</p>
                            </div>
                        )
                    })}
                </>
            )}
        </div>
    </div>
  )
}
