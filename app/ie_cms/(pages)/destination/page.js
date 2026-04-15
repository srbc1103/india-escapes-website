'use client'

import Button, { RoundButton } from "../../../../components/Buttons"
import Input, { MultiSelect, MultiSelect1, SelectInput1, TextArea } from "../../../../components/Input"
import MediaSelector from "../../../../components/MediaSelector"
import PageHead from "../../../../components/PageHead"
import TextEditor from "../../../../components/TextEditor"
import { COLLECTIONS, REGIONS } from "../../../../constants"
import { useCUD } from "../../../../hooks/useCUD"
import { useFetchList } from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Data from "../../../../lib/backend"
import { ArrowLeft, CircleCheckBig, ImagePlus, Images, Pencil, Plus, Save, Trash, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { Skeleton } from "../../../../components/ui/skeleton"
import { slugify } from "../../../../functions"

function DestinationPageContent() {
    const [loading, setLoading] = useState(true)
    const q = useSearchParams()
    const router = useRouter()
    const did = q.get('did')
    
    const [updating, setUpdating] = useState(false)
    const [disabled, setDisabled] = useState(true)
    
    const { loading: loadingLocations, list: locations, load_list } = useFetchList({ collection_id: COLLECTIONS.LOCATIONS, limit: 1000 })

    const [selector, setSelector] = useState(null)

    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: selector,
        container_styles: 'max-w-[800px]',
        zIndex: 150
    })

    const [state, setState] = useState({
        name: '', description:'', images:[], locations:[], full_detail:'', featured_image:'', region:'',page_heading:'',meta_title:'',meta_description:'',meta_keywords:''
    })


    useEffect(() => {
        let { name } = state
        if (name ) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [state])

    const loadPackage = async () => {
        setLoading(true)
        Data.get_item_detail({ collection_id: COLLECTIONS.DESTINATIONS, document_id: did }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                let { name, images, locations, full_detail, featured_image, description, region,page_heading='',meta_title='',meta_description='',meta_keywords=''   } = d.document
                setState(s => ({ ...s, name, images,  locations, full_detail, featured_image, description, region,page_heading,meta_title,meta_description,meta_keywords }))
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

    const updateImages = async () => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.DESTINATIONS, document_id: did, item_data: { images: state.images } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Images updated successfully.')
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setUpdating(false)
        })
    }

    const updateFeaturedImage = async (img) => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.DESTINATIONS, document_id: did, item_data: { featured_image: img || state.featured_image } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Featured image updated successfully.')
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setUpdating(false)
        })
    }

    useEffect(() => {
        if (did) {
            loadPackage()
        } else {
            router.replace('/ie_cms/destinations')
        }
    }, [did])
    

    const handleSubmit = async () => {
        if (disabled) return
        setUpdating(true)
        let {name} = state
        let url = slugify(name)
        const location_list = state.locations
        let location_metadata = []
        location_list.forEach(a=>{
            let location = locations.find(e => e.id == a)
            if (location) {
                let img = location?.images[0] || null
                let { name, description, id, url } = location
                let obj = { name, description, img, id, url }
                location_metadata.push(obj)
            }
        })
        Data.update_item({ collection_id: COLLECTIONS.DESTINATIONS, document_id: did, item_data: { ...state,location_metadata,url } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Destination details updated successfully.')
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setUpdating(false)
        })
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this destination?`)) return
        setUpdating(true)
        const response = await Data.delete_item({ collection_id: COLLECTIONS.DESTINATIONS, document_id: did })
        if (response.status === 'success') {
            router.replace('/ie_cms/destinations')
        } else {
            toast.error(response.message)
        }
        setUpdating(false)
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
                    <div>
                        <Skeleton className="h-6 w-1/4 md:col-span-2 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-lg" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            ) : (
                <>
                    <RoundButton styles="p-2 text-xs font-medium bg-gray-200 mb-4" title="Close" onClick={()=>router.back()}><ArrowLeft size={16}/></RoundButton>
                    <PageHead text={state.name || 'Destination Detail'} styles="font-medium" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4">
                    {/* main section */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-[800px] col-span-2">
                        {/* images section */}
                            <div className="md:col-span-2 pb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Images</p>
                            </div>
                            <div className="md:col-span-2 flex gap-2 overflow-x-auto">
                                {state.images.map((image, ind) => {
                                    return (
                                        <div key={ind} className="h-24 w-24 overflow-hidden rounded-lg relative">
                                            <img src={image} alt={state.name} className="h-full w-full object-cover" />
                                            {!updating && (
                                                <RoundButton
                                                    onClick={() => {
                                                        let images = state.images
                                                        images = images.filter(e => e !== image)
                                                        setState(s => ({ ...s, images }))
                                                    }}
                                                    styles="absolute top-1 right-1 bg-white h-4 md:h-6"
                                                    title="Remove Image"
                                                >
                                                    <X size={14} />
                                                </RoundButton>
                                            )}
                                        </div>
                                    )
                                })}
                                <button
                                    className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-lg transition duration-300 disabled:opacity-50"
                                    onClick={() => {
                                        setSelector(
                                            <MediaSelector
                                                type="image/"
                                                onSelect={(img) => {
                                                    setState(s => ({ ...s, images: img }))
                                                    hideMediaSelector()
                                                }}
                                                selection_limit={10}
                                                selected_files={state.images}
                                                onCancel={() => hideMediaSelector()}
                                            />
                                        )
                                        showMediaSelector()
                                    }}
                                    role="button"
                                    disabled={updating}
                                >
                                    <Plus size={40} />
                                </button>
                            </div>
                            <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                                <Button
                                    onClick={updateImages}
                                    disabled={updating || state.images.length == 0}
                                    styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                                >
                                    <Images size={12} /> Save Images
                                </Button>
                            </div>
                        {/* package detail section */}
                            <div className="md:col-span-2 pb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Destination Detail</p>
                            </div>
                            <Input
                                label="Destination Name"
                                value={state.name || ''}
                                onChange={(e) => setState(state => ({ ...state, name: e.target.value }))}
                                placeholder="Destination Name"
                            />
                            <div className="hidden md:block" />
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:col-span-2">
                                <div className="lg:col-span-2">
                                    {(!loading && !loadingLocations) && (
                                        <MultiSelect1
                                            list={locations}
                                            label="Locations"
                                            selected={state.locations}
                                            setSelected={v => { setState(s => ({ ...s, locations: v })) }}
                                        />
                                    )}
                                </div>
                                <div className="lg:col-span-2">
                                    {(!loading) && (
                                        <SelectInput1
                                            options={REGIONS}
                                            label="Region"
                                            selected={state.region}
                                            fun={v => { setState(s => ({ ...s, region: v })) }}
                                        />
                                    )}
                                </div>
                            </div>
                            <Input
                                label="Page Heading"
                                value={state.page_heading || ''}
                                onChange={(e) => setState(state => ({ ...state, page_heading: e.target.value }))}
                                placeholder="Page Heading"
                            />
                            <Input
                                label="Meta Title"
                                value={state.meta_title || ''}
                                onChange={(e) => setState(state => ({ ...state, meta_title: e.target.value }))}
                                placeholder="Meta Title"
                            />
                            <TextArea
                                rows={3}
                                label="Meta Description"
                                value={state.meta_description}
                                onChange={(e) => setState(state => ({ ...state, meta_description: e.target.value }))}
                                placeholder="Meta Description"
                            />
                            <TextArea
                                rows={3}
                                label="Meta Keywords"
                                value={state.meta_keywords}
                                onChange={(e) => setState(state => ({ ...state, meta_keywords: e.target.value }))}
                                placeholder="Meta Keywords"
                            />
                             <div className="md:col-span-2">
                                <TextArea
                                    rows={3}
                                    label="Description"
                                    value={state.description}
                                    onChange={(e) => setState(state => ({ ...state, description: e.target.value }))}
                                    placeholder="Description"
                                />
                            </div>
                            <div className="md:col-span-2 input_grp mt-4">
                                <label className="text-xs ml-1 block mb-1">More Detail about {state.name || 'Destination'}</label>
                                <TextEditor value={state.full_detail} onChange={val => setState(s => ({ ...s, full_detail: val }))} />
                            </div>
                            <div className="md:col-span-2 flex-center-jc gap-2">
                                <Button
                                    onClick={handleDelete}
                                    disabled={updating || loading}
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
                    {/* side bar (featured image section) */}
                        <div className="border-t lg:border-t-transparent lg:border-l border-gray-200 lg:pl-8 pt-8 lg:pt-0">
                            <div className="md:col-span-2 pb-2 mb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Featured Image</p>
                            </div>
                            <div className="h-40 lg:h-52 rounded-xl flex flex-col items-center justify-center border relative overflow-hidden border-dashed border-gray-100">
                                {state.featured_image ? (
                                    <img src={state.featured_image} alt="Featured Image" className="h-full w-full object-cover" />
                                ) : (
                                    <div
                                        className="flex h-full items-center justify-center gap-2 flex-col cursor-pointer transition duratin-500 opacity-30 hover:opacity-50 bg-gray-200 w-full"
                                        role="button"
                                        onClick={() => {
                                            if (state.featured_image) return
                                            setSelector(
                                                <MediaSelector
                                                    type="image/"
                                                    onSelect={(img) => {
                                                        let fi = img[0] || null
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
                            <div className="md:col-span-2 flex-center-jc gap-2 mt-4">
                                {state.featured_image && (
                                    <Button
                                        onClick={() => {
                                            setState(s => ({ ...s, featured_image: null }))
                                            updateFeaturedImage()
                                        }}
                                        disabled={updating || loading}
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
                                                        let fi = img[0] || null
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
                                        disabled={disabled || updating}
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
            <DestinationPageContent />
        </Suspense>
    )
}
