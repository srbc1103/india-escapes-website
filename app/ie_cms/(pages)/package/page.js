'use client'

import Button, { RoundButton } from "../../../../components/Buttons"
import Input, { MultiSelect, MultiSelect1, SelectInput1, TextArea } from "../../../../components/Input"
import MediaSelector from "../../../../components/MediaSelector"
import PageHead from "../../../../components/PageHead"
import TextEditor from "../../../../components/TextEditor"
import { COLLECTIONS } from "../../../../constants"
import { useCUD } from "../../../../hooks/useCUD"
import { useFetchList } from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Data from "../../../../lib/backend"
import { ArrowBigLeft, ArrowLeft, CheckCircle, CircleCheckBig, ImagePlus, Images, Pencil, Plus, Save, Trash, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"
import { Skeleton } from "../../../../components/ui/skeleton"
import { formatNumber, generateID } from "../../../../functions"
import { Switch } from "../../../../components/ui/switch"
import Image from "next/image"
import { hi } from "date-fns/locale"

function PackagePageContent() {
    const [loading, setLoading] = useState(true)
    const q = useSearchParams()
    const router = useRouter()
    const pid = q.get('pid')
    
    const [updating, setUpdating] = useState(false)
    const [disabled, setDisabled] = useState(true)
    
    const { loading: loadingCategories, list: categories } = useFetchList({ collection_id: COLLECTIONS.CATEGORIES, limit: 1000 })
    const { loading: loadingDestinations, list: destinations } = useFetchList({ collection_id: COLLECTIONS.DESTINATIONS, limit: 1000 })
    const [meta,setMeta] = useState({
        title:'',description:''
    })

    const [highlights,setHighlights] = useState([])

    const [state, setState] = useState({
        name: '',
        price: '',
        offer_price: '',
        description: '',
        duration: '',
        images: [],
        active: false,
        categories: [],
        locations: [],
        seo_keywords: '',
        featured_image: '',
        tags:'',
        // extra_content:'',
        destinations:[],featured:false,widget:'',url:'',canonical_url:''
    })

    const [selector, setSelector] = useState(null)

    useEffect(() => {
        let { name, duration, url } = state
        if (name && duration && url) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [state])

    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: selector,
        container_styles: 'max-w-[800px]',
        zIndex: 150
    })

    const loadPackage = async () => {
        setLoading(true)
        Data.get_item_detail({ collection_id: COLLECTIONS.PACKAGES, document_id: pid }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                let { name, images, price, offer_price, description, categories, duration, active, locations, seo_keywords, featured_image, tags, destinations, featured, widget, url, meta_description, canonical_url, highlights } = d.document
                let desc = JSON.stringify(meta_description) || null
                setMeta(s=>({...s,title: desc?.title || '', description: desc?.description || ''}))
                setState(s => ({ ...s, name, images, price, offer_price, description, categories, duration, active, locations, seo_keywords, featured_image, tags, destinations, featured, widget, url, canonical_url }))
                document.title = name
                let h = []
                highlights?.forEach(item=>{
                    if(!item) return
                    let obj = { title: JSON.parse(item), id:generateID() }
                    h.push(obj)
                })
                setHighlights(h)
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
        let imgs = []
        state.images?.forEach(img=>{
            let src = img?.replace('&mode=admin','')
            imgs.push(src)
        })
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid, item_data: { images: imgs } }).then(d => {
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

    const publishPackage = async () => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid, item_data: { active: true } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Package published successfully.')
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

    const updateFeaturedImage = async (img) => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid, item_data: { featured_image: img || state.featured_image } }).then(d => {
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
        if (pid) {
            loadPackage()
        } else {
            router.replace('/ie_cms/packages')
        }
    }, [pid])

    const handleSubmit = async () => {
        if (disabled) return
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid, item_data: { ...state,price:parseFloat(state.price) || 0,offer_price:parseFloat(state.offer_price) || 0, meta_description: JSON.stringify(meta) } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Package details updated successfully.')
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
        if (!confirm(`Are you sure you want to delete this package?`)) return
        setUpdating(true)
        const response = await Data.delete_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid })
        if (response.status === 'success') {
            router.replace('/ie_cms/packages')
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
                    <div className="flex items-start justify-start gap-2 flex-col md:flex-row md:justify-between">
                        <PageHead text={state.name || 'Package Detail'} styles="font-medium" />
                        {(!state.active && state.featured_image && state.images.length > 0) ? <Button
                            onClick={publishPackage}
                            disabled={updating}
                            styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                        >
                            <CircleCheckBig size={12} /> Publish
                        </Button> : <></>}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4 mt-0">
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
                                <p className="font-semibold text-lg">Package Detail</p>
                            </div>
                            <Input
                                label="Package Name"
                                value={state.name}
                                onChange={(e) => setState(state => ({ ...state, name: e.target.value }))}
                                placeholder="Package Name"
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
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:col-span-2">
                                <Input
                                    type="number"
                                    min={0}
                                    label="Price"
                                    value={state.price}
                                    onChange={(e) => setState(state => ({ ...state, price: e.target.value }))}
                                    placeholder="Price"
                                />
                                <Input
                                    type="number"
                                    min={0}
                                    label="Offer Price"
                                    value={state.offer_price}
                                    onChange={(e) => setState(state => ({ ...state, offer_price: e.target.value }))}
                                    placeholder="Offer Price"
                                />
                                <Input
                                    type="number"
                                    min={0}
                                    label="Package Duration"
                                    value={state.duration}
                                    onChange={(e) => setState(state => ({ ...state, duration: e.target.value }))}
                                    placeholder="Duration"
                                />
                                <div className="lg:col-span-2">
                                    {(!loading && !loadingCategories) && (
                                        <MultiSelect1
                                            list={categories}
                                            label="Trip Type"
                                            selected={state.categories}
                                            setSelected={v => { setState(s => ({ ...s, categories: v })) }}
                                        />
                                    )}
                                </div>
                                <div className="lg:col-span-2">
                                    {(!loading && !loadingDestinations) && (
                                        <MultiSelect1
                                            list={destinations}
                                            label="Destinations"
                                            selected={state.destinations}
                                            setSelected={v => { setState(s => ({ ...s, destinations: v })) }}
                                        />
                                    )}
                                </div>
                            </div>
                            {/* <TextArea
                                rows={3}
                                label="Inclusions"
                                value={state.inclusions}
                                onChange={(e) => setState(state => ({ ...state, inclusions: e.target.value }))}
                                placeholder="Inclusions"
                            />
                            <TextArea
                                rows={3}
                                label="Exclusions"
                                value={state.exclusions}
                                onChange={(e) => setState(state => ({ ...state, exclusions: e.target.value }))}
                                placeholder="Exclusions"
                            /> */}
                            <TextArea
                                rows={1}
                                label="Tags"
                                value={state.tags}
                                onChange={(e) => setState(state => ({ ...state, tags: e.target.value }))}
                                placeholder="eg: Group Tour, Adventure, Culture"
                            />
                            {/* <TextArea
                                rows={3}
                                label="Booking Link"
                                value={state.package_link}
                                onChange={(e) => setState(state => ({ ...state, package_link: e.target.value }))}
                                placeholder="Booking Link"
                            /> */}
                            <TextArea
                                rows={1}
                                label="Booking Widget Code"
                                value={state.widget}
                                onChange={(e) => setState(state => ({ ...state, widget: e.target.value }))}
                                placeholder="Booking Calednar Widget Code"
                            />
                            <TextArea
                                value={meta.title}
                                label="Meta Title"
                                onChange={e => setMeta(s => ({ ...s, title: e.target.value }))}
                                placeholder="Enter Meta Title"
                            />
                            <TextArea
                                value={meta.description}
                                label="Meta Desciption"
                                onChange={e => setMeta(s => ({ ...s, description: e.target.value }))}
                                placeholder="Enter Meta Desciption"
                            />
                            <div className="flex items-center justify-start mb-6 gap-2 md:col-span-2">
                                <Switch
                                    id="featured"
                                    checked={state.featured}
                                    onCheckedChange={() => setState(s => ({ ...s, featured: !s.featured }))}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-black/20"
                                />
                                <label
                                    htmlFor="featured"
                                    className={`transition duration-300 text-xs ${state.featured ? 'font-medium text-green-500' : 'text-gray-500'}`}
                                >Featured</label>
                            </div>
                            <div className="md:col-span-2 input_grp">
                                <label className="text-xs ml-1 block mb-1">About the tour</label>
                                <TextEditor value={state.description} onChange={val => setState(s => ({ ...s, description: val }))} />
                            </div>
                            {/* <div className="md:col-span-2 input_grp mt-4">
                                <label className="text-xs ml-1 block mb-1">More Information</label>
                                <TextEditor value={state.extra_content} onChange={val => setState(s => ({ ...s, extra_content: val }))} />
                            </div> */}
                
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

                            <div className="md:col-span-2 pb-2 border-b border-gray-100 mt-16">
                                <p className="font-semibold text-lg">Tour Highlights</p>
                            </div>
                            <HighLightsManager pid={pid} highlights={highlights} setHighlights={setHighlights} />
                        </div>
                    </div>
                    {/* optional expenses section */}
                    <div className="">
                        <div className="md:col-span-2 pb-2 mb-4 border-b border-gray-100">
                            <p className="font-semibold text-lg md:text-xl lg:text-2xl">Itinerary</p>
                        </div>
                        <ItineraryManager pid={pid} duration={state.duration} />
                    </div>
                    <div className="">
                        <div className="md:col-span-2 pb-2 mb-4 border-b border-gray-100">
                            <p className="font-semibold text-lg md:text-xl lg:text-2xl">Inclusions</p>
                        </div>
                        <InclusionManager pid={pid} duration={state.duration} />
                    </div>
                    <div className="">
                        <div className="md:col-span-2 pb-2 mb-4 border-b border-gray-100">
                            <p className="font-semibold text-lg md:text-xl lg:text-2xl">Exclusions</p>
                        </div>
                        <ExclusionManager pid={pid} duration={state.duration} />
                    </div>
                    <div className="">
                        <div className="md:col-span-2 pb-2 mb-4 border-b border-gray-100">
                            <p className="font-semibold text-lg md:text-xl lg:text-2xl">Important Info</p>
                        </div>
                        <MoreInfoManager pid={pid} />
                    </div>
                    <div className="mt-8">
                        <div className="md:col-span-2 pb-2 mb-4 border-b border-gray-100">
                            <p className="font-semibold text-lg md:text-xl lg:text-2xl">Optional Experiences</p>
                        </div>
                        <ExpenseManager pid={pid}/>
                    </div>
                    
                </>
            )}
        </div>
    )
}

const InclusionManager = props => {
    const { pid } = props
    const [inclusions, setInclusions] = useState([])
    const [loadingInclusions, setLoadingInclusions] = useState(true)
    const [document_id, setDocumentId] = useState(null)
    
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: inclusions })
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(null)

    const { showDialog: showInclusionForm, hideDialog: hideInclusionForm, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]',
        allowOverflow: true
    })

    const updateInclusion = async () => {
        setSaving(true)
        let data = []
        list.forEach(item => {
            let obj = JSON.stringify(item)
            data.push(obj)
        })
        if(document_id){
            Data.update_item({ collection_id: COLLECTIONS.INCLUSIONS, document_id, item_data: { inclusions: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Inclusions updated successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }else{
            Data.create_item({ collection_id: COLLECTIONS.INCLUSIONS, item_data: { package_id:pid, inclusions: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Inclusions added successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }
        
    }

    const fetchInclusions = async () => {
        setLoadingInclusions(true)
        Data.fetch_inclusions(pid).then(d => {
            let { status, inclusions, document_id } = d
            if (status == 'success') {
                setInclusions(inclusions)
                setDocumentId(document_id)
                reset_list(inclusions)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoadingInclusions(false)
        })
    }

    useEffect(() => {
        fetchInclusions()
    }, [pid])

    const add_new_expense = (obj, type = 'add') => {
        if (type == 'edit') {
            update_item(obj)
        }
        if (type == 'add') {
            add_new_item(obj)
        }
        hideInclusionForm()
        setForm(null)
    }

    return (
        <>
            {dialog}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loadingInclusions ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {list.map((item, ind) => {
                            const { title, id, description } = item
                            const is_last = true
                            return (
                                <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <RoundButton
                                            onClick={() => {
                                                setForm(
                                                    <InclusionForm
                                                        onSave={(obj) => add_new_expense({ ...obj, id }, 'edit')}
                                                        mode="edit"
                                                        {...item}
                                                    />
                                                )
                                                showInclusionForm()
                                            }}
                                            styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                            title="Edit Day"
                                            disabled={loadingInclusions || saving}
                                        >
                                            <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                        </RoundButton>
                                        {is_last && (
                                            <RoundButton
                                                onClick={() => delete_item(id)}
                                                styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                                title="Delete Day"
                                                disabled={loadingInclusions || saving}
                                            >
                                                <Trash size={16} color="white" />
                                            </RoundButton>
                                        )}
                                    </div>
                                    <p className="font-medium mt-8">{title}</p>
                                    <div className="package_ec_css text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                            )
                        })}
                        <div
                            className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                            role="button"
                            onClick={() => {
                                setForm(
                                    <InclusionForm
                                        onSave={(obj) => {
                                            add_new_expense(obj)
                                        }}
                                        mode="create"
                                    />
                                )
                                showInclusionForm()
                            }}
                            disabled={loadingInclusions || saving}
                        >
                            <Plus size={40} color="#ccc" />
                            <p className="font-medium">Add Inclusion</p>
                        </div>
                    </>
                )}
            </div>
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                    <Button
                        onClick={updateInclusion}
                        disabled={loadingInclusions || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Inclusions
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

const ExclusionManager = props => {
    const { pid } = props
    const [exclusions, setExclusions] = useState([])
    const [loadingExclusions, setLoadingExclusions] = useState(true)
    const [document_id, setDocumentId] = useState(null)
    
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: exclusions })
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(null)

    const { showDialog: showExclusionForm, hideDialog: hideExclusionForm, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]',
        allowOverflow: true
    })

    const updateExclusion = async () => {
        setSaving(true)
        let data = []
        list.forEach(item => {
            let obj = JSON.stringify(item)
            data.push(obj)
        })
        if(document_id){
            Data.update_item({ collection_id: COLLECTIONS.EXCLUSIONS, document_id, item_data: { package_id:pid, exclusions: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Exclusions updated successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }else{
            Data.create_item({ collection_id: COLLECTIONS.EXCLUSIONS, item_data: { package_id:pid, exclusions: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Exclusions added successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }
        
    }

    const fetchExclusions = async () => {
        setLoadingExclusions(true)
        Data.fetch_exclusions(pid).then(d => {
            let { status, exclusions, document_id } = d
            if (status == 'success') {
                setExclusions(exclusions)
                setDocumentId(document_id)
                reset_list(exclusions)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoadingExclusions(false)
        })
    }

    useEffect(() => {
        fetchExclusions()
    }, [pid])

    const add_new_expense = (obj, type = 'add') => {
        if (type == 'edit') {
            update_item(obj)
        }
        if (type == 'add') {
            add_new_item(obj)
        }
        hideExclusionForm()
        setForm(null)
    }

    return (
        <>
            {dialog}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loadingExclusions ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {list.map((item, ind) => {
                            const { title, id, description } = item
                            const is_last = true
                            return (
                                <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <RoundButton
                                            onClick={() => {
                                                setForm(
                                                    <ExclusionForm
                                                        onSave={(obj) => add_new_expense({ ...obj, id }, 'edit')}
                                                        mode="edit"
                                                        {...item}
                                                    />
                                                )
                                                showExclusionForm()
                                            }}
                                            styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                            title="Edit Day"
                                            disabled={loadingExclusions || saving}
                                        >
                                            <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                        </RoundButton>
                                        {is_last && (
                                            <RoundButton
                                                onClick={() => delete_item(id)}
                                                styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                                title="Delete Day"
                                                disabled={loadingExclusions || saving}
                                            >
                                                <Trash size={16} color="white" />
                                            </RoundButton>
                                        )}
                                    </div>
                                    <p className="font-medium mt-8">{title}</p>
                                    <div className="package_ec_css text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                            )
                        })}
                        <div
                            className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                            role="button"
                            onClick={() => {
                                setForm(
                                    <ExclusionForm
                                        onSave={(obj) => {
                                            add_new_expense(obj)
                                        }}
                                        mode="create"
                                    />
                                )
                                showExclusionForm()
                            }}
                            disabled={loadingExclusions || saving}
                        >
                            <Plus size={40} color="#ccc" />
                            <p className="font-medium">Add Exclusion</p>
                        </div>
                    </>
                )}
            </div>
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                    <Button
                        onClick={updateExclusion}
                        disabled={loadingExclusions || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Exclusions
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

const MoreInfoManager = props => {
    const { pid } = props
    const [info, setInfo] = useState([])
    const [loadingInfo, setLoadingInfo] = useState(true)
    const [document_id, setDocumentId] = useState(null)
    
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: info })
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(null)

    const { showDialog: showExclusionForm, hideDialog: hideExclusionForm, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]',
        allowOverflow: true
    })

    const updateExclusion = async () => {
        setSaving(true)
        let data = []
        list.forEach(item => {
            let obj = JSON.stringify(item)
            data.push(obj)
        })
        if(document_id){
            Data.update_item({ collection_id: COLLECTIONS.INFO, document_id, item_data: { package_id:pid, info: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Info updated successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }else{
            Data.create_item({ collection_id: COLLECTIONS.INFO, item_data: { package_id:pid, info: data } }).then(d => {
                const { status, message } = d
                if (status == 'success') {
                    toast.success('Info added successfully.')
                } else {
                    toast.error(message)
                }
            }).catch(err => {
                toast.error(err.message)
            }).finally(() => {
                setSaving(false)
            })
        }
        
    }

    const fetchInfo = async () => {
        setLoadingInfo(true)
        Data.fetch_package_component(pid,'info').then(d => {
            let { status, data, document_id } = d
            if (status == 'success') {
                setInfo(data)
                setDocumentId(document_id)
                reset_list(data)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoadingInfo(false)
        })
    }

    useEffect(() => {
        fetchInfo()
    }, [pid])

    const add_new_expense = (obj, type = 'add') => {
        if (type == 'edit') {
            update_item(obj)
        }
        if (type == 'add') {
            add_new_item(obj)
        }
        hideExclusionForm()
        setForm(null)
    }

    return (
        <>
            {dialog}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loadingInfo ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {list.map((item, ind) => {
                            const { title, id, description } = item
                            const is_last = true
                            return (
                                <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <RoundButton
                                            onClick={() => {
                                                setForm(
                                                    <InfoForm
                                                        onSave={(obj) => add_new_expense({ ...obj, id }, 'edit')}
                                                        mode="edit"
                                                        {...item}
                                                    />
                                                )
                                                showExclusionForm()
                                            }}
                                            styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                            title="Edit Day"
                                            disabled={loadingInfo || saving}
                                        >
                                            <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                        </RoundButton>
                                        {is_last && (
                                            <RoundButton
                                                onClick={() => delete_item(id)}
                                                styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                                title="Delete Day"
                                                disabled={loadingInfo || saving}
                                            >
                                                <Trash size={16} color="white" />
                                            </RoundButton>
                                        )}
                                    </div>
                                    <p className="font-medium mt-8">{title}</p>
                                    <div className="package_ec_css text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                            )
                        })}
                        <div
                            className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                            role="button"
                            onClick={() => {
                                setForm(
                                    <InfoForm
                                        onSave={(obj) => {
                                            add_new_expense(obj)
                                        }}
                                        mode="create"
                                    />
                                )
                                showExclusionForm()
                            }}
                            disabled={loadingInfo || saving}
                        >
                            <Plus size={40} color="#ccc" />
                            <p className="font-medium">Add Exclusion</p>
                        </div>
                    </>
                )}
            </div>
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                    <Button
                        onClick={updateExclusion}
                        disabled={loadingInfo || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Info
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

const HighLightsManager = props => {
    const { pid, highlights, setHighlights } = props
    const [updating,setUpdating] = useState(false)
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: highlights })
    const [form, setForm] = useState(null)

    const handleSumit = async () => {
        setUpdating(true)
        let h = list.map(item=>JSON.stringify(item.title))
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id: pid, item_data: { highlights: h } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Highlights updated successfully.')
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
        <>
            <div className="grid grid-cols-1 gap-4 my-4">
                <>
                    {list.map((item, ind) => {
                        const { title, id } = item
                        return (
                            <HighLight hideForm={()=>setForm(null)} key={ind} title={title} onDelete={()=>delete_item(id)} onSave={(text)=>{
                            update_item({id,text})
                            }} updating={updating}/>
                        )
                    })}
                </>
            </div>
            {form ? <>
                <HighLight hideForm={()=>setForm(null)} view_type="edit" onSave={(text)=>{add_new_item({title:text}); setForm(null)}} updating={updating}/>
            </> : <div className="flex items-center justify-start w-full my-4">
                <RoundButton
                    onClick={() => {
                        setForm('add')
                    }}
                    styles="bg-black text-white dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                    title="Add Highlight"
                    disabled={updating}
                >
                    <Plus size={16} className="text-white" />
                </RoundButton>
            </div>}
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 my-4 pb-4 flex-center-jc">
                    <Button
                        onClick={handleSumit}
                        disabled={updating}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Highlights
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

const HighLight = props =>{
    const { title, onDelete, onSave, updating, hideForm, view_type, onCancel } = props
    const [mode,setMode] = useState(view_type || 'view')
    const [text,setText] = useState(title || '')
    return(
        <div className={`relative  rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100 ${mode == 'edit' ? 'p-2' : 'p-4'}`}>
            <div className="absolute bottom-2 right-2 flex gap-2">
            {mode == 'view' ? 
                <>
                <RoundButton
                    onClick={() => {
                        setMode('edit')
                        hideForm()
                    }}
                    styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                    title="Edit Day"
                    disabled={updating}
                >
                    <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                </RoundButton>
                    <RoundButton
                        onClick={onDelete}
                        styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                        title="Delete Day"
                        disabled={updating}
                    >
                        <Trash size={16} color="white" />
                    </RoundButton>
                </> : <>
                    <RoundButton
                        onClick={()=>{
                            onSave(text)
                            hideForm()
                            setMode('view')
                        }}
                        styles="bg-black dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm z-10"
                        title="Save Highlight"
                        disabled={updating || !text.trim()}
                    >
                        <CheckCircle size={16} className="text-white" />
                    </RoundButton>
                    {!title && <RoundButton
                        onClick={hideForm}
                        styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm z-10"
                        title="Cancel"
                        disabled={updating}
                    >
                        <X size={16} className="text-gray-600 dark:text-gray-300" />
                    </RoundButton>}

                </>}
                
            </div>
            {mode == 'edit' ? 
            <>
                <Input label="" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Highlight"/>
            </> : 
            <p className="font-medium text-xs">{text}</p> }
        </div>
    )

}

const ItineraryManager = props => {
    const { duration, pid } = props
    const [itinerary, setItinerary] = useState([])
    const [loadingItinerary, setLoadingItinerary] = useState(true)
    const [document_id, setDocumentId] = useState(null)
    const { loading: loadingLocations, list: locations } = useFetchList({ collection_id: COLLECTIONS.LOCATIONS, limit: 1000 })
    const { loading: loadingActivities, list: activities } = useFetchList({ collection_id: COLLECTIONS.ACTIVITIES, limit: 1000 })
    const { loading: loadingHotels, list: hotels } = useFetchList({ collection_id: COLLECTIONS.ACCOMMODATIONS, limit: 1000 })
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: itinerary })
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(null)

    const { showDialog: showDayForm, hideDialog: hideDayForm, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]'
    })

    const updateItinerary = async () => {
        setSaving(true)
        let data = []
        let locations = []
        let activities = []
        let accommodations = []
        list.forEach(item => {
            let {location_metadata, activity_metadata, accommodation_metadata} = item
            location_metadata?.forEach(l=>{
                let {name} = l
                if(!locations.find(e=>e == name)){
                    locations.push(name)
                }
            })
            activity_metadata?.forEach(l=>{
                let {name} = l
                if(!activities.find(e=>e == name)){
                    activities.push(name)
                }
            })
            accommodation_metadata?.forEach(l=>{
                let {name} = l
                if(!accommodations.find(e=>e == name)){
                    accommodations.push(name)
                }
            })
            let obj = JSON.stringify(item)
            data.push(obj)
        })
        Data.update_item({ collection_id: COLLECTIONS.PACKAGES, document_id:pid, item_data: {locations, activities} }).then(d => {
        }).catch(err => {
            toast.error(err.message)
        })
        Data.update_item({ collection_id: COLLECTIONS.ITINERARY, document_id, item_data: { days: data } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Itinerary updated successfully.')
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setSaving(false)
        })
    }

    const fetchItinerary = async () => {
        setLoadingItinerary(true)
        Data.fetch_itinerary(pid).then(d => {
            let { status, itinerary, document_id } = d
            console.log(d)
            if (status == 'success') {
                setItinerary(itinerary)
                setDocumentId(document_id)
                reset_list(itinerary)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoadingItinerary(false)
        })
    }

    useEffect(() => {
        fetchItinerary()
    }, [pid])

    const add_new_day = (obj, type = 'add') => {
        let activity_metadata = []
        let location_metadata = []
        let accommodation_metadata = []
        if (obj.activities && obj.activities.length > 0) {
            obj.activities.forEach(a => {
                let activity = activities.find(e => e.id == a)
                if (activity) {
                    let img = activity?.images[0] || null
                    let { name, description, id, url } = activity
                    let obj = { name, description, id, img, url }
                    activity_metadata.push(obj)
                }
            })
        }
        if (obj.locations && obj.locations.length > 0) {
            obj.locations.forEach(a => {
                let location = locations.find(e => e.id == a)
                if (location) {
                    let img = location?.images[0] || null
                    let { name, description, id, url } = location
                    let obj = { name, description, img, id, url }
                    location_metadata.push(obj)
                }
            })
        }
        if (obj.accommodations && obj.accommodations.length > 0) {
            obj.accommodations.forEach(a => {
                let accommodation = hotels.find(e => e.id == a)
                if (accommodation) {
                    let img = accommodation?.images[0] || null
                    let { name, description, id, url } = accommodation
                    let obj = { name, description, img, id, url }
                    accommodation_metadata.push(obj)
                }
            })
        }
        let item = { ...obj, activity_metadata, location_metadata, accommodation_metadata }
        if (type == 'edit') {
            update_item(item)
        }
        if (type == 'add') {
            item.day = list.length + 1
            add_new_item(item)
        }
        hideDayForm()
        setForm(null)
    }

    return (
        <>
            {dialog}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loadingItinerary ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {list.map((item, ind) => {
                            const { day, title, id, description, activity_metadata = [], location_metadata = [], accommodation_metadata = [] } = item
                            const is_last = list.length === ind + 1
                            return (
                                <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <RoundButton
                                            onClick={() => {
                                                setForm(
                                                    <ItineraryDayForm
                                                        onSave={(obj) => add_new_day({ ...obj, id }, 'edit')}
                                                        mode="edit"
                                                        activityList={activities}
                                                        locationList={locations}
                                                        accommdationList={hotels}
                                                        {...item}
                                                    />
                                                )
                                                showDayForm()
                                            }}
                                            styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                            title="Edit Day"
                                            disabled={loadingActivities || loadingHotels || loadingLocations || loadingItinerary || saving}
                                        >
                                            <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                        </RoundButton>
                                        {is_last && (
                                            <RoundButton
                                                onClick={() => delete_item(id)}
                                                styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                                title="Delete Day"
                                                disabled={loadingActivities || loadingHotels || loadingLocations || loadingItinerary || saving}
                                            >
                                                <Trash size={16} color="white" />
                                            </RoundButton>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Day {day}</p>
                                    <h3 className="font-semibold text-lg capitalize">{title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description?.slice(0, 100)}{description?.length > 100 ? '...' : ''}</p>
                                    {(activity_metadata.length > 0 || location_metadata.length > 0 || accommodation_metadata.length > 0) && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                                {activity_metadata.length > 0 && (
                                                    <div>
                                                        <strong>Experiences:</strong> {activity_metadata.map(a => a.name).join(', ')}
                                                    </div>
                                                )}
                                                {location_metadata.length > 0 && (
                                                    <div>
                                                        <strong>Sightseeing:</strong> {location_metadata.map(l => l.name).join(', ')}
                                                    </div>
                                                )}
                                                {accommodation_metadata.length > 0 && (
                                                    <div>
                                                        <strong>Accommodations:</strong> {accommodation_metadata.map(a => a.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {list.length < duration && (
                            <div
                                className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                                role="button"
                                onClick={() => {
                                    setForm(
                                        <ItineraryDayForm
                                            onSave={(obj) => {
                                                add_new_day(obj)
                                            }}
                                            mode="create"
                                            activityList={activities}
                                            locationList={locations}
                                            accommdationList={hotels}
                                        />
                                    )
                                    showDayForm()
                                }}
                                disabled={loadingActivities || loadingHotels || loadingLocations || loadingItinerary || saving}
                            >
                                <Plus size={40} color="#ccc" />
                                <p className="font-medium">Add day</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                    <Button
                        onClick={updateItinerary}
                        disabled={loadingActivities || loadingHotels || loadingLocations || loadingItinerary || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Itinerary
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

function ItineraryDayForm(props) {
    const { day, title, description, activities, locations, accommodations, activityList, locationList, accommdationList, onSave, mode } = props
    const [state, setState] = useState({
        day: day || 1,
        title: title || '',
        description: description || '',
        activities: activities || [],
        locations: locations || [],
        accommodations: accommodations || [],
    })

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} Day`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Input
                        label="Title"
                        value={state.title}
                        onChange={(e) => setState(state => ({ ...state, title: e.target.value }))}
                        placeholder="Title"
                        styles="col-span-2 lg:col-span-3"
                    />
                    <MultiSelect1
                        label="Sightseeing"
                        selected={state.locations}
                        setSelected={(e) => setState(state => ({ ...state, locations: e }))}
                        placeholder="Sightseeing"
                        list={locationList}
                    />
                    <MultiSelect1
                        label="Experiences"
                        selected={state.activities}
                        setSelected={(e) => setState(state => ({ ...state, activities: e }))}
                        placeholder="Experiences"
                        list={activityList}
                    />
                    <MultiSelect1
                        label="Accommodations"
                        selected={state.accommodations}
                        setSelected={(e) => setState(state => ({ ...state, accommodations: e }))}
                        placeholder="Accommodations"
                        list={accommdationList}
                    />
                    <TextArea
                        rows={5}
                        label="Description"
                        value={state.description}
                        onChange={(e) => setState(state => ({ ...state, description: e.target.value }))}
                        placeholder="Description"
                        styles="col-span-2 lg:col-span-3"
                    />
                    
                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={() => {
                            if (!state.title) {
                                toast.error('Please enter title')
                                return
                            }
                            onSave(state)
                        }}
                        disabled={!state.title}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function FAQForm(props) {
    const { mode, id, question, answer, onSave } = props
    const [saving,setSaving] = useState(false)
    const [state, setState] = useState({
        question: question || '',
        answer: answer || '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        let {question, answer} = state
        if(!question || !answer) return
        setSaving(true)
        if(mode == 'create'){
            Data.create_item({ collection_id: COLLECTIONS.FAQ, item_data: {question:state.question,answer:state.answer} }).then(d=>{
                let {status} = d
                if(status == 'success'){
                    toast.success(`New FAQ added successfully`)
                    onSave()
                }else{
                    toast.error(d.message)
                    setSaving(false)
                }
            }).catch(err=>{
                toast.error(err.message)
                setSaving(false)
            }).finally(()=>{
                setSaving(false)
            })
        }else{
            Data.update_item({ collection_id:COLLECTIONS.FAQ, document_id: id, item_data: state }).then(d=>{
                let {status} = d
                if(status == 'success'){
                    toast.success(`FAQ updated successfully`)
                    onSave()
                }else{
                    toast.error(d.message)
                }
            }).catch(err=>{
                toast.error(err.message)
            }).finally(()=>{
                setSaving(false)
            })
        }
    }

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} FAQ`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Input
                        label="Question"
                        value={state.question}
                        onChange={(e) => setState(state => ({ ...state, question: e.target.value }))}
                        placeholder="Question"
                        styles="col-span-2 lg:col-span-3"
                    />
                    <TextArea
                        rows={5}
                        label="Answer"
                        value={state.answer}
                        onChange={(e) => setState(state => ({ ...state, answer: e.target.value }))}
                        placeholder="Answer"
                        styles="col-span-2 lg:col-span-3"
                    />
                    
                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={handleSubmit}
                        disabled={!state.question || !state.answer || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

const ExpenseManager = props => {
    const { pid } = props
    const [expenses, setExpenses] = useState([])
    const [loadingExpenses, setLoadingExpenses] = useState(true)
    const [document_id, setDocumentId] = useState(null)
    
    const { list, add_new_item, update_item, delete_item, reset_list } = useCUD({ items: expenses })
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(null)

    const { showDialog: showExpenseForm, hideDialog: hideExpenseForm, dialog } = usePopup({
        form,
        container_styles: 'max-w-[800px]'
    })

    const updateExpense = async () => {
        setSaving(true)
        let data = []
        list.forEach(item => {
            let obj = JSON.stringify(item)
            data.push(obj)
        })
        Data.update_item({ collection_id: COLLECTIONS.EXPENSES, document_id, item_data: { expenses: data } }).then(d => {
            const { status, message } = d
            if (status == 'success') {
                toast.success('Expense updated successfully.')
            } else {
                toast.error(message)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setSaving(false)
        })
    }

    const fetchExpenses = async () => {
        setLoadingExpenses(true)
        Data.fetch_expenses(pid).then(d => {
            let { status, expenses, document_id } = d
            if (status == 'success') {
                setExpenses(expenses)
                setDocumentId(document_id)
                reset_list(expenses)
            }
        }).catch(err => {
            toast.error(err.message)
        }).finally(() => {
            setLoadingExpenses(false)
        })
    }

    useEffect(() => {
        fetchExpenses()
    }, [pid])

    const add_new_expense = (obj, type = 'add') => {
        if (type == 'edit') {
            update_item(obj)
        }
        if (type == 'add') {
            add_new_item(obj)
        }
        hideExpenseForm()
        setForm(null)
    }

    return (
        <>
            {dialog}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loadingExpenses ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {list.map((item, ind) => {
                            const { title, id, description, cost } = item
                            const is_last = true
                            return (
                                <div key={ind} className="relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 shadow-gray-100">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <RoundButton
                                            onClick={() => {
                                                setForm(
                                                    <ExpenseForm
                                                        onSave={(obj) => add_new_expense({ ...obj, id }, 'edit')}
                                                        mode="edit"
                                                        {...item}
                                                    />
                                                )
                                                showExpenseForm()
                                            }}
                                            styles="bg-gray-100 dark:bg-gray-700 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                            title="Edit Day"
                                            disabled={loadingExpenses || saving}
                                        >
                                            <Pencil size={16} className="text-gray-600 dark:text-gray-300" />
                                        </RoundButton>
                                        {is_last && (
                                            <RoundButton
                                                onClick={() => delete_item(id)}
                                                styles="bg-red-500 h-8 w-8 flex items-center justify-center rounded-full shadow-sm"
                                                title="Delete Day"
                                                disabled={loadingExpenses || saving}
                                            >
                                                <Trash size={16} color="white" />
                                            </RoundButton>
                                        )}
                                    </div>
                                    {item.featured_image ? <Image src={item.featured_image} height={200} width={200} className="rounded-2xl object-contain h-20 w-auto" alt=""/> : <></>}
                                    <p className="font-medium mt-8">{title}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description?.slice(0, 100)}{description?.length > 100 ? '...' : ''}</p>
                                    <p className="text-lg font-medium">{formatNumber(cost, 'INR')}/-</p>
                                </div>
                            )
                        })}
                        <div
                            className="flex items-center justify-center flex-col rounded-xl cursor-pointer transition duration-300 hover:brightness-95 bg-gray-100 p-4 disabled:pointer-events-none disabled:opacity-80 py-8"
                            role="button"
                            onClick={() => {
                                setForm(
                                    <ExpenseForm
                                        onSave={(obj) => {
                                            add_new_expense(obj)
                                        }}
                                        mode="create"
                                    />
                                )
                                showExpenseForm()
                            }}
                            disabled={loadingExpenses || saving}
                        >
                            <Plus size={40} color="#ccc" />
                            <p className="font-medium">Add Expense</p>
                        </div>
                    </>
                )}
            </div>
            {/* {!list.length == 0 && ( */}
                <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                    <Button
                        onClick={updateExpense}
                        disabled={loadingExpenses || saving}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-sm"
                    >
                        Save Expenses
                    </Button>
                </div>
            {/* )} */}
        </>
    )
}

function ExpenseForm(props) {
    const { title, description, cost, onSave, mode, featured_image } = props
    const [state, setState] = useState({
        title: title || '',
        description: description || '',
        cost: cost || 0,
        featured_image: featured_image || ''
    })
    const [selector, setSelector] = useState(null)
    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: selector,
        container_styles: 'max-w-[800px]',
        zIndex: 200
    })

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
        {mediaSelector}
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} Expense`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="h-40 rounded-xl flex flex-col items-center justify-center border relative overflow-hidden border-dashed border-gray-100">
                        {state.featured_image ? (
                            <div className="relative">
                                <img src={state.featured_image} alt="Featured Image" className="h-full w-full object-cover" />
                                {/* {!updating && ( */}
                                    <RoundButton
                                        onClick={() => {
                                            setState(s => ({ ...s, featured_image:'' }))
                                        }}
                                        styles="absolute top-4 right-1 bg-white h-4 md:h-6"
                                        title="Remove Image"
                                    >
                                        <X size={14} />
                                    </RoundButton>
                                {/* )} */}
                            </div>
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
                    <div className=""></div>
                    <Input
                        label="Title"
                        value={state.title}
                        onChange={(e) => setState(state => ({ ...state, title: e.target.value }))}
                        placeholder="Title"
                        styles=""
                    />
                    <Input
                        label="Cost (Per Person)"
                        type="number"
                        min={0}
                        value={state.cost}
                        onChange={(e) => setState(state => ({ ...state, cost: e.target.value }))}
                        placeholder="Cost"
                        styles=""
                    />
                    <TextArea
                        rows={5}
                        label="Description"
                        value={state.description}
                        onChange={(e) => setState(state => ({ ...state, description: e.target.value }))}
                        placeholder="Description"
                        styles="col-span-2"
                    />
                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={() => {
                            if (!state.title) {
                                toast.error('Please enter title')
                                return
                            }
                            onSave(state)
                        }}
                        disabled={!state.title}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

function InclusionForm(props) {
    const { title, description, onSave, mode } = props
    const [state, setState] = useState({
        title: title || '',
        description: description || '',
    })

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} Inclusion`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Input
                        label="Title"
                        value={state.title}
                        onChange={(e) => setState(state => ({ ...state, title: e.target.value }))}
                        placeholder="Title"
                        styles=""
                    />
                    <div className="md:col-span-2 input_grp mt-4">
                        <label className="text-xs ml-1 block mb-1">Description</label>
                        <TextEditor value={state.description} onChange={val => setState(s => ({ ...s, description: val }))} inModal={true} className="relative"/>
                    </div>

                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={() => {
                            if (!state.title) {
                                toast.error('Please enter title')
                                return
                            }
                            if (!state.description) {
                                toast.error('Please enter description')
                                return
                            }
                            onSave(state)
                        }}
                        disabled={!state.title || !state.description}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ExclusionForm(props) {
    const { title, description, onSave, mode } = props
    const [state, setState] = useState({
        title: title || '',
        description: description || '',
    })

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} Exclusion`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Input
                        label="Title"
                        value={state.title}
                        onChange={(e) => setState(state => ({ ...state, title: e.target.value }))}
                        placeholder="Title"
                        styles=""
                    />
                    <div className="md:col-span-2 input_grp mt-4">
                        <label className="text-xs ml-1 block mb-1">Description</label>
                        <TextEditor value={state.description} onChange={val => setState(s => ({ ...s, description: val }))} inModal={true} />
                    </div>

                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={() => {
                            if (!state.title) {
                                toast.error('Please enter title')
                                return
                            }
                            if (!state.description) {
                                toast.error('Please enter description')
                                return
                            }
                            onSave(state)
                        }}
                        disabled={!state.title || !state.description}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

function InfoForm(props) {
    const { title, description, onSave, mode } = props
    const [state, setState] = useState({
        title: title || '',
        description: description || '',
    })

    return (
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{`${mode == 'create' ? 'Add' : 'Update'} Info`}</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Input
                        label="Title"
                        value={state.title}
                        onChange={(e) => setState(state => ({ ...state, title: e.target.value }))}
                        placeholder="Title"
                        styles=""
                    />
                    <div className="md:col-span-2 input_grp mt-4">
                        <label className="text-xs ml-1 block mb-1">Description</label>
                        <TextEditor value={state.description} onChange={val => setState(s => ({ ...s, description: val }))} inModal={true} />
                    </div>

                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button
                        onClick={() => {
                            if (!state.title) {
                                toast.error('Please enter title')
                                return
                            }
                            if (!state.description) {
                                toast.error('Please enter description')
                                return
                            }
                            onSave(state)
                        }}
                        disabled={!state.title || !state.description}
                        styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center"
                    >
                        <Save size={18} /> Save
                    </Button>
                </div>
            </div>
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
