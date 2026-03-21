'use client'

import Button from "../../../../components/Buttons"
import Input, { MultiSelect1, TextArea } from "../../../../components/Input"
import PageHead from "../../../../components/PageHead"
import { COLLECTIONS } from "../../../../constants"
import { useFetchList } from "../../../../hooks/useFetch"
import Data from "../../../../lib/backend"
import { Save, Trash, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { Skeleton } from "../../../../components/ui/skeleton"

function PackagePageContent() {
    const [loading, setLoading] = useState(true)
    const q = useSearchParams()
    const router = useRouter()
    const lid = q.get('lid')

    const [updating, setUpdating] = useState(false)
    const [disabled, setDisabled] = useState(true)

    const { loading: loadingPackages, list: packages } = useFetchList({ collection_id: COLLECTIONS.PACKAGES, limit: 1000 })

    const [state, setState] = useState({
        name: '',
        description: '',
        packages: [],
    })

    const loadPackage = async () => {
        setLoading(true)
        Data.get_item_detail({ collection_id: COLLECTIONS.LABELS, document_id: lid }).then(d => {
            const { status, message } = d
            if (status === 'success') {
                const { name, description, packages } = d.document
                setState(s => ({ ...s, name, description, packages }))
                document.title = name
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        setDisabled(!state.name)
    }, [state.name])

    useEffect(() => {
        if (lid) {
            loadPackage()
        } else {
            router.replace('/ie_cms/labels')
        }
    }, [lid])

    const handleSubmit = async () => {
        if (disabled || updating) return
        setUpdating(true)

        const payload = { ...state }

        try {
            const res = await Data.update_item({ collection_id: COLLECTIONS.LABELS, document_id: lid, item_data: payload })
            if (res.status !== 'success') throw new Error(res.message)

            toast.success('Label details updated')
            setState(payload)
        } catch (err) {
            toast.error(err.message || 'Failed to update label')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this label?`)) return
        setUpdating(true)

        try {
            const response = await Data.delete_item({ collection_id: COLLECTIONS.LABELS, document_id: lid })
            if (response.status === 'success') {
                router.replace('/ie_cms/labels')
                toast.success('Label deleted')
            } else {
                throw new Error(response.message)
            }
        } catch (err) {
            toast.error(err.message || 'Failed to delete label')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="w-full py-8 px-2">
            {loading ? (
                <div className="w-full py-8 px-2">
                    <Skeleton className="h-6 w-1/3 mx-auto mb-4" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-[800px] col-span-2">
                            <Skeleton className="h-6 w-1/4 md:col-span-2" />
                            <div className="md:col-span-2 flex gap-2 overflow-x-auto">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-24 rounded-lg" />
                                ))}
                            </div>
                            <Skeleton className="h-10 w-32 md:col-span-2" />
                            <Skeleton className="h-6 w-1/4 md:col-span-2" />
                            <Skeleton className="h-10 w-full" />
                            <div className="hidden md:block" />
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:col-span-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full lg:col-span-2" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-40 w-full md:col-span-2" />
                            <div className="md:col-span-2 flex-center-jc gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                        <div className="border-t lg:border-t-transparent lg:border-l border-gray-200 lg:pl-8 pt-8 lg:pt-0">
                            <Skeleton className="h-6 w-1/4 md:col-span-2 mb-2" />
                            <Skeleton className="h-40 lg:h-52 w-full rounded-xl" />
                            <div className="md:col-span-2 flex-center-jc gap-2 mt-4">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-start gap-2 flex-col md:flex-row md:justify-between">
                        <PageHead text={state.name || 'Label Detail'} styles="font-medium" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-[800px] col-span-2">

                            <Input
                                label="Label Name"
                                value={state.name}
                                onChange={e => setState(s => ({ ...s, name: e.target.value }))}
                                placeholder="Label Name"
                            />
                            <div className="hidden md:block" />
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:col-span-2">
                                <div className="lg:col-span-2">
                                    {(!loading && !loadingPackages) && (
                                        <MultiSelect1
                                            list={packages}
                                            label="Included Packages"
                                            selected={state.packages}
                                            setSelected={v => setState(s => ({ ...s, packages: v }))}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 input_grp mt-2">
                                <label className="text-xs ml-1 block mb-1">Description</label>
                                <TextArea
                                    value={state.description}
                                    onChange={e => setState(s => ({ ...s, description: e.target.value }))}
                                />
                            </div>

                            <div className="md:col-span-2 flex-center-jc gap-2 mt-8">
                                <Button
                                    onClick={handleDelete}
                                    disabled={updating}
                                    styles="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center gap-2 justify-center"
                                >
                                    <Trash size={18} /> Delete
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={disabled || updating}
                                    styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                                >
                                    <Save size={18} /> Update
                                </Button>
                            </div>
                        </div>

                        <div className="border-t lg:border-t-transparent lg:border-l border-gray-200 lg:pl-8 pt-8 lg:pt-0">

                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="w-full py-8 px-2"><Skeleton className="h-6 w-1/3 mx-auto" /></div>}>
            <PackagePageContent />
        </Suspense>
    )
}