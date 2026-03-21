'use client'

import Button, { RoundButton } from "../../../../components/Buttons"
import Input, { DatePicker, MultiSelect1, TextArea } from "../../../../components/Input"
import MediaSelector from "../../../../components/MediaSelector"
import PageHead from "../../../../components/PageHead"
import { COLLECTIONS } from "../../../../constants"
import { useFetchList } from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Data from "../../../../lib/backend"
import { CircleCheckBig, ImagePlus, Images, Plus, Save, Trash, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { Skeleton } from "../../../../components/ui/skeleton"
import { Switch } from "../../../../components/ui/switch"
import TextEditor from "../../../../components/TextEditor"

function PackagePageContent() {
    const [loading, setLoading] = useState(true)
    const q = useSearchParams()
    const router = useRouter()
    const bid = q.get('bid')

    const [updating, setUpdating] = useState(false)
    const [disabled, setDisabled] = useState(true)


    const [state, setState] = useState({
        name: '',
        title: '',
        featured_image: '',
        content: '',
        active: false,
        short_description:'',
        url:'',canonical_url:'',meta_title:'',meta_description:''
    })

    const [selector, setSelector] = useState(null)

    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: selector,
        container_styles: 'max-w-[800px]',
        zIndex: 150
    })

    const loadPackage = async () => {
        setLoading(true)
        Data.get_item_detail({ collection_id: COLLECTIONS.BLOGS, document_id: bid }).then(d => {
            const { status, message } = d
            if (status === 'success') {
                const { name, title, content, active, featured_image, short_description,url, meta_title, meta_description, canonical_url } = d.document
                setState(s => ({ ...s, name, title, content, active, featured_image, short_description,url, meta_title, meta_description, canonical_url }))
                document.title = title
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
        setDisabled(!state.name || !state.title || !state.url)
    }, [state])

    useEffect(() => {
        if (bid) {
            loadPackage()
        } else {
            router.replace('/ie_cms/blogs')
        }
    }, [bid])

    const updateFeaturedImage = async (img) => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.BLOGS, document_id: bid, item_data: { featured_image: img || state.featured_image } }).then(d => {
            const { status, message } = d
            if (status === 'success') toast.success('Featured image updated successfully.')
            else toast.error(message)
        }).catch(err => toast.error(err.message)).finally(() => setUpdating(false))
    }

    const handleSubmit = async () => {
        if (disabled || updating) return
        setUpdating(true)
        try {
            const res = await Data.update_item({ collection_id: COLLECTIONS.BLOGS, document_id: bid, item_data: state })
            if (res.status !== 'success') throw new Error(res.message)
            toast.success('Blog updated successfully')
            setState(state)
        } catch (err) {
            toast.error(err.message || 'Failed to update deal')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this blog?`)) return
        setUpdating(true)
        try {
            const response = await Data.delete_item({ collection_id: COLLECTIONS.BLOGS, document_id: bid })
            if (response.status === 'success') {
                router.replace('/ie_cms/blogs')
                toast.success('Blog deleted')
            } else {
                throw new Error(response.message)
            }
        } catch (err) {
            toast.error(err.message || 'Failed to delete blog')
        } finally {
            setUpdating(false)
        }
    }

    const publishPackage = async () => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.BLOGS, document_id: bid, item_data: { active: true } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Blog published successfully.')
                setState(s=>({...s,active:true}))
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setUpdating(false)
        })
    }

    return (
        <div className="w-full py-8 px-2">
            {mediaSelector}
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
                        <PageHead text={state.name || 'Blog'} styles="font-medium" />
                        {(!state.active && state.featured_image && state.title && state.name) ? <Button
                            onClick={publishPackage}
                            disabled={updating}
                            styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                        >
                            <CircleCheckBig size={12} /> Publish
                        </Button> : <></>}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-[800px] col-span-2">
                            <Input
                                label="Blog Name"
                                value={state.name}
                                onChange={e => setState(s => ({ ...s, name: e.target.value }))}
                                placeholder="Blog Name"
                            />
                            <div className="hidden md:block" />
                            <Input
                                label="Title"
                                value={state.title}
                                onChange={e => setState(s => ({ ...s, title: e.target.value }))}
                                placeholder="Title"
                            />
                            <div className="hidden md:block" />
                            <Input
                                label="slug"
                                value={state.url}
                                onChange={e => setState(s => ({ ...s, url: e.target.value }))}
                                placeholder="slug"
                            />
                            <Input
                                label="Canonical URL"
                                value={state.canonical_url}
                                onChange={e => setState(s => ({ ...s, canonical_url: e.target.value }))}
                                placeholder="Canonical URL"
                            />
                            <TextArea
                                rows={3}
                                label="Short Description"
                                value={state.short_description}
                                onChange={(e) => setState(state => ({ ...state, short_description: e.target.value }))}
                                placeholder="Short Description"
                            />
                            <div className="hidden md:block" />
                            <TextArea
                                value={state.meta_title}
                                label="Meta Title"
                                onChange={e => setState(s => ({ ...s, meta_title: e.target.value }))}
                                placeholder="Enter Meta Title"
                            />
                            <TextArea
                                value={state.meta_description}
                                label="Meta Desciption"
                                onChange={e => setState(s => ({ ...s, meta_description: e.target.value }))}
                                placeholder="Enter Meta Desciption"
                            />
                            <div className="md:col-span-2 input_grp">
                                <label className="text-xs ml-1 block mb-1">Blog Content</label>
                                <TextEditor value={state.content} onChange={val => setState(s => ({ ...s, content: val }))} />
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
                            <div className="pb-2 mb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Featured Image</p>
                            </div>
                            <div className="h-40 lg:h-52 rounded-xl flex flex-col items-center justify-center border relative overflow-hidden border-dashed border-gray-100">
                                {state.featured_image ? (
                                    <img src={state.featured_image} alt="Featured" className="h-full w-full object-cover" />
                                ) : (
                                    <div
                                        className="flex h-full w-full items-center justify-center gap-2 flex-col cursor-pointer bg-gray-200 opacity-30 hover:opacity-50 transition"
                                        onClick={() => {
                                            setSelector(
                                                <MediaSelector
                                                    type="image/"
                                                    onSelect={(img) => {
                                                        const fi = img[0] || null
                                                        setState(s => ({ ...s, featured_image: fi }))
                                                        hideMediaSelector()
                                                        updateFeaturedImage(fi)
                                                    }}
                                                    selection_limit={1}
                                                    selected_files={state.featured_image ? [state.featured_image] : []}
                                                    onCancel={() => hideMediaSelector()}
                                                />
                                            )
                                            showMediaSelector()
                                        }}
                                    >
                                        <ImagePlus size={80} />
                                        <p>Add Image</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex-center-jc gap-2 mt-4">
                                {state.featured_image && (
                                    <Button
                                        onClick={() => {
                                            setState(s => ({ ...s, featured_image: null }))
                                            updateFeaturedImage()
                                        }}
                                        disabled={updating}
                                        styles="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center gap-2 justify-center text-xs"
                                    >
                                        <Trash size={18} /> Remove
                                    </Button>
                                )}
                                {state.featured_image && (
                                    <Button
                                        onClick={() => {
                                            setSelector(
                                                <MediaSelector
                                                    type="image/"
                                                    onSelect={(img) => {
                                                        const fi = img[0] || null
                                                        setState(s => ({ ...s, featured_image: fi }))
                                                        hideMediaSelector()
                                                        updateFeaturedImage(fi)
                                                    }}
                                                    selection_limit={1}
                                                    selected_files={state.featured_image ? [state.featured_image] : []}
                                                    onCancel={() => hideMediaSelector()}
                                                />
                                            )
                                            showMediaSelector()
                                        }}
                                        disabled={updating}
                                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                                    >
                                        <Save size={18} /> Change
                                    </Button>
                                )}
                            </div>
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