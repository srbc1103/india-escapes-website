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

function PackagePageContent() {
    const [loading, setLoading] = useState(true)
    const q = useSearchParams()
    const router = useRouter()
    const did = q.get('did')

    const [updating, setUpdating] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [currentRate, setDiscountRate] = useState(0)

    const { loading: loadingPackages, list: packages } = useFetchList({ collection_id: COLLECTIONS.PACKAGES, limit: 1000 })

    const [state, setState] = useState({
        name: '',
        featured_image: '',
        images: [],
        description: '',
        packages: [],
        end_date: null,
        active: false,
        discount_rate: 0,
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
        Data.get_item_detail({ collection_id: COLLECTIONS.DEALS, document_id: did }).then(d => {
            const { status, message } = d
            if (status === 'success') {
                const { name, description, images, packages, end_date, active, featured_image, discount_rate, url, meta_title, meta_description, canonical_url } = d.document
                setState(s => ({ ...s, name, description, images, packages, end_date, active, featured_image, discount_rate, url, meta_title, meta_description, canonical_url }))
                setDiscountRate(discount_rate)
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
        setDisabled(!state.name || !state.url)
    }, [state])

    useEffect(() => {
        if (did) {
            loadPackage()
        } else {
            router.replace('/ie_cms/deals')
        }
    }, [did])

    const updateImages = async () => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.DEALS, document_id: did, item_data: { images: state.images } }).then(d => {
            const { status, message } = d
            if (status === 'success') toast.success('Images updated successfully.')
            else toast.error(message)
        }).catch(err => toast.error(err.message)).finally(() => setUpdating(false))
    }

    const updateFeaturedImage = async (img) => {
        setUpdating(true)
        Data.update_item({ collection_id: COLLECTIONS.DEALS, document_id: did, item_data: { featured_image: img || state.featured_image } }).then(d => {
            const { status, message } = d
            if (status === 'success') toast.success('Featured image updated successfully.')
            else toast.error(message)
        }).catch(err => toast.error(err.message)).finally(() => setUpdating(false))
    }

    const updatePackageOffer = async (dealData, isDelete = false) => {
        if (!dealData.packages?.length) return

        const now = new Date()
        const isActive = !isDelete && dealData.active && dealData.end_date && new Date(dealData.end_date) > now

        const meta = isActive ? JSON.stringify({
            name: dealData.name,
            description: dealData.description,
            discount_rate: dealData.discount_rate,
            end_date: dealData.end_date,
            status: dealData.active?'active':'inactive',
            url:state.url,
            featured_image:dealData.featured_image || ''
        }) : null

        for (const pkgId of dealData.packages) {
            try {
                const pkg = await Data.get_item_detail({ collection_id: COLLECTIONS.PACKAGES, document_id: pkgId })
                if (pkg.status !== 'success') continue

                const originalPrice = pkg.document.price ?? 0
                let offer_price = null

                if (isActive) {
                    const discount = (originalPrice * (dealData.discount_rate ?? 0)) / 100
                    offer_price = originalPrice - discount
                }

                await Data.update_item({
                    collection_id: COLLECTIONS.PACKAGES,
                    document_id: pkgId,
                    item_data: {
                        offer_price,
                        deal_metadata: meta
                    }
                })
            } catch (e) {
                console.error(`Failed to update package ${pkgId}`, e)
            }
        }

        toast.success(isDelete ? 'Deal metadata cleared from packages' : 'Packages updated with offer price')
    }

    const handleSubmit = async () => {
        if (disabled || updating) return
        setUpdating(true)

        const payload = { ...state, discount_rate: parseInt(state.discount_rate) || 0 }

        try {
            const res = await Data.update_item({ collection_id: COLLECTIONS.DEALS, document_id: did, item_data: payload })
            if (res.status !== 'success') throw new Error(res.message)

            toast.success('Deal details updated. Updating packages now. Please wait.')
            setState(payload)
            await updatePackageOffer(payload)
        } catch (err) {
            toast.error(err.message || 'Failed to update deal')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this deal?`)) return
        setUpdating(true)

        try {
            await updatePackageOffer(state, true)
            const response = await Data.delete_item({ collection_id: COLLECTIONS.DEALS, document_id: did })
            if (response.status === 'success') {
                router.replace('/ie_cms/deals')
                toast.success('Deal deleted')
            } else {
                throw new Error(response.message)
            }
        } catch (err) {
            toast.error(err.message || 'Failed to delete deal')
        } finally {
            setUpdating(false)
        }
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
                        <PageHead text={state.name || 'Deal Detail'} styles="font-medium" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-[800px] col-span-2">
                            <div className="md:col-span-2 pb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Images</p>
                            </div>
                            <div className="md:col-span-2 flex gap-2 overflow-x-auto">
                                {state.images.map((image, ind) => (
                                    <div key={ind} className="h-24 w-24 overflow-hidden rounded-lg relative">
                                        <img src={image} alt={state.name} className="h-full w-full object-cover" />
                                        {!updating && (
                                            <RoundButton
                                                onClick={() => {
                                                    const imgs = state.images.filter(e => e !== image)
                                                    setState(s => ({ ...s, images: imgs }))
                                                }}
                                                styles="absolute top-1 right-1 bg-white h-4 md:h-6"
                                                title="Remove Image"
                                            >
                                                <X size={14} />
                                            </RoundButton>
                                        )}
                                    </div>
                                ))}
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
                                    disabled={updating}
                                >
                                    <Plus size={40} />
                                </button>
                            </div>
                            <div className="md:col-span-2 mb-4 pb-4 flex items-center justify-start">
                                <Button
                                    onClick={updateImages}
                                    disabled={updating || state.images.length === 0}
                                    styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                                >
                                    <Images size={12} /> Save Images
                                </Button>
                            </div>

                            <div className="md:col-span-2 pb-2 border-b border-gray-100">
                                <p className="font-semibold text-lg">Deal Detail</p>
                            </div>

                            <Input
                                label="Deal Name"
                                value={state.name}
                                onChange={e => setState(s => ({ ...s, name: e.target.value }))}
                                placeholder="Deal Name"
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
                                    label="Discount Rate"
                                    value={state.discount_rate}
                                    onChange={e => setState(s => ({ ...s, discount_rate: e.target.value }))}
                                    placeholder="Discount Rate"
                                />
                                <div className="lg:col-span-2">
                                    <DatePicker
                                        label="End Date"
                                        selectedDate={state.end_date}
                                        onDateSelect={e => setState(s => ({ ...s, end_date: e }))}
                                        placeholder="End Date"
                                        minDate={new Date()}
                                    />
                                </div>
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

                            <div className="md:col-span-2 input_grp mt-4">
                                <TextArea
                                    value={state.description}
                                    label="Description"
                                    onChange={e => setState(s => ({ ...s, description: e.target.value }))}
                                />
                            </div>
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

                            <div className="flex items-center justify-start mb-4 gap-2">
                                <Switch
                                    id="deal_active"
                                    checked={state.active}
                                    onCheckedChange={() => setState(s => ({ ...s, active: !s.active }))}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-black/20"
                                />
                                <label
                                    htmlFor="deal_active"
                                    className={`transition duration-300 text-xs ${state.active ? 'font-medium text-green-500' : 'text-gray-500'}`}
                                >
                                    {state.active ? 'Active' : 'Inactive'}
                                </label>
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