'use client'

import { useEffect, useState } from "react"
import Input, { MultiSelect, PhoneNumberInput, Select, SelectInput1, TextArea } from "./Input"
import { COLLECTIONS, REGIONS } from "../constants"
import Button, { RoundButton } from "./Buttons"
import { slugify } from "../functions"
import Data from "../lib/backend"
import { toast } from "sonner"
import { Save, Trash, FileText, Plus, List, X, LoaderCircle, ImagePlus } from "lucide-react"
import usePopup from "../hooks/usePopup"
import MediaSelector from "./MediaSelector"
import { useFetchList } from "../hooks/useFetch"

export default function Forms() {
  return (
    <div>Forms</div>
  )
}

export function MediaDetailForm(props){
    const {mime_type, name, title, alt, description, $id, file_id, onSave, url,tags} = props
    const [updating,setUpdating] = useState(false)
    const [state,setState] = useState({name,title,alt,description,tags})
    const isImage = (mimeType) => mimeType?.startsWith('image/');
    const isVideo = (mimeType) => mimeType?.startsWith('video/');
    const isPdf = (mimeType) => mimeType === 'application/pdf';

    const handleSubmit = async () => {
        if(!state.name) return
        setUpdating(true)
        Data.update_file_metadata({ $id, metadata:state }).then(d=>{
            let {status,message} = d
            if(status == 'success'){
                if(state.name !== name){
                    renameFile()
                }else{
                    toast.success('Metadata saved successfully');
                    setUpdating(false)
                    onSave()
                }
            }else{
                toast.error(message)
                setUpdating(false)
            }
        })
    };

    async function renameFile(){
        setUpdating(true)
        Data.rename_file({ file_id, $id, new_name:state.name }).then(d=>{
            let {status,message} = d
            if(status == 'success'){
                toast.success('File renamed successfully')
                onSave()
            }else{
                toast.error(message)
            }
        }).catch(err=>{
            toast.error(err.message)
        }).finally(()=>{
            setUpdating(false)
        })
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        setUpdating(true)
        const response = await Data.delete_file({ file_id, $id });
        if (response.status === 'success') {
            toast.success('File deleted successfully');
            onSave();
        } else {
            toast.error(response.message);
        }
        setUpdating(false)
    };

    return(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap:4 w-full items-center">
            <div className="py-8 mt-8 lg:mt-0">
              {isImage(mime_type) ? (
                <img src={url} alt={alt || name} className="w-[90%] lg:w-[80%] h-[80%] max-h-[60vh] object-contain rounded-md mx-auto"/>
                ) : isVideo(mime_type) ? (
                <video controls className="w-full h-[40vh] mb-2 rounded-md">
                    <source src={url} type={mime_type} />
                </video>
                ) : isPdf(mime_type) ? (
                <div className="flex justify-center items-center h-[40vh] lg:h-[70vh] bg-gray-100 dark:bg-gray-700 rounded-md w-[80%] mx-auto">
                    <iframe
                        src={url}
                        title={title || name || "PDF Preview"}
                        className="w-full h-full rounded-md"
                        style={{ border: "none" }}
                    />
                </div>
                ) : (
                <div className="flex justify-center items-center h-40 mb-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <File size={48} className="text-gray-500" />
                </div>
              )}
            </div>
            <div>
                <div className="grid grid-cols-1 gap-4 w-[90%] mx-auto lg:mx-0 mb-8">
                    <Input label="File Name" value={state.name} onChange={(e)=>setState(state=>({...state,name:e.target.value}))} placeholder="File Name"/>
                    <div className="grid gap-4 grid-cols-2">
                      <Input label="Title" value={state.title} onChange={(e)=>setState(state=>({...state,title:e.target.value}))} placeholder="Title"/>
                      <Input label="Alt Text" value={state.alt} onChange={(e)=>setState(state=>({...state,alt:e.target.value}))} placeholder="Alt Text"/>
                    </div>
                    <TextArea rows={2} label="Tags" value={state.tags} onChange={(e)=>setState(state=>({...state,tags:e.target.value}))} placeholder="eg. destination, shimla, manali etc."/>
                    <TextArea rows={2} label="Description" value={state.description} onChange={(e)=>setState(state=>({...state,description:e.target.value}))} placeholder="Description"/>
                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button onClick={handleDelete} disabled={updating} styles="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center gap-2 justify-center" > <Trash size={18} /> Delete </Button>
                    <Button onClick={handleSubmit} disabled={!state.name || updating} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Save size={18} /> Save </Button>
                </div>
            </div>
        </div>
    )
}

export function QueryForm(props){
    const {onSave, destination ,type} = props
    const [saving,setSaving] = useState(false)
    const [disabled,setDisabled] = useState(true)
    const [state,setState] = useState({
        name:'',
        email:'',
        mobile:'',
        destination:destination || '',
        message:'',
        query_type:type || 'quote'
    })

    useEffect(()=>{
        let {name,mobile} = state
        if(name && mobile){
            setDisabled(false)
        }else{
            setDisabled(true)
        }
    },[state])

    async function handleSubmit(e){
        e.preventDefault()
        if(disabled) return
        setSaving(true)
        const res1 = await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        });
        const res = await fetch('/api/query-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        });
        const data = await res.json();
        if(data.status == 'success'){
            toast.success("We've received your request. We'll get back to you ASAP!")
            onSave()
        }else{
            toast.error(data.message || 'Something went wrong. Please try again later.')
        }
        setSaving(false)
    }

    return(
        <>
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">Get a <span className="text-red">{type == 'quote' ? 'Quote' : 'Call Back'}</span></p>
            <div className="grid grid-cols-1 gap-4 w-[90%] mx-auto mb-8">
                <Input label="Name" value={state.name} onChange={(e)=>setState(state=>({...state,name:e.target.value}))} placeholder="Name"/>
                <PhoneNumberInput label="Mobile" val={state.mobile} fun={(e)=>setState(state=>({...state,mobile:e}))} placeholder="Mobile"/>

                {type == 'quote' ? <>
                    <Input label="Email" value={state.email} onChange={(e)=>setState(state=>({...state,email:e.target.value}))} placeholder="Email"/>
                    <TextArea rows={2} label="Message" value={state.message} onChange={(e)=>setState(state=>({...state,message:e.target.value}))} placeholder="Message"/>
                </> : <>

                </>}
            </div>
            <div className="flex-center-jc gap-2 ">
                <Button onClick={handleSubmit} disabled={disabled || saving} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > {saving ? <><LoaderCircle className="animate-spin"/> Please wait </> : 'Submit'} </Button>
            </div>
        </div>
        </>
    )
        
}

export function LocationForm(props){
    const {onSave,mode,id,name,description,images,type,page_heading='',meta_title='',meta_description='',meta_keywords=''} = props
    const [saving,setSaving] = useState(false)
    const [disabled,setDisabled] = useState(true)
    const [region,setRegion] = useState(props.region || '')
    const [state,setState] = useState({
        name,
        description,
        images : images || [],page_heading,meta_title,meta_description,meta_keywords
    })
    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: (
            <MediaSelector
            type = 'image/'
            onSelect = {(img)=>{
                setState(s=>({...s,images:img}))
                hideMediaSelector()
            }}
            selection_limit={type == 'category' ? 1 : 4}
            selected_files={state.images}
            onCancel={()=>hideMediaSelector()}

            />
        ),
        container_styles: 'max-w-[800px]',
        zIndex:150
    });

    useEffect(()=>{
        let {name} = state
        if(name){
            setDisabled(false)
        }else{
            setDisabled(true)
        }
    },[state])

    const handleSubmit = async(e)=>{
        e.preventDefault()
        if(disabled) return
        let {name,page_heading,meta_title,meta_description,meta_keywords,images,description} = state
        let item_data = {name,description,images}
        item_data.url = slugify(name)
        if(type == 'destination' && region){
            item_data.region = region
        }
        if(type == 'category' && state.images.length > 0){
            item_data.featured_image = state.images[0]
        }
        if(type == 'destination' || type == 'category') {
            item_data.page_heading = page_heading
            item_data.meta_title = meta_title
            item_data.meta_description = meta_description
            item_data.meta_keywords = meta_keywords
        }
        setSaving(true)
        mode == 'create' ? 
        Data.create_item({item_data,collection_id:type == 'location' ? COLLECTIONS.LOCATIONS : type == 'experience' ? COLLECTIONS.ACTIVITIES : type=='category' ? COLLECTIONS.CATEGORIES : type == 'accommodation' ? COLLECTIONS.ACCOMMODATIONS : type == 'deal' ? COLLECTIONS.DEALS : type == 'label' ? COLLECTIONS.LABELS : COLLECTIONS.DESTINATIONS}).then(d=>{
            let {status} = d
            if(status == 'success'){
                let {document,insert_id} = d
                toast.success(`New ${type} added successfully`)
                onSave(insert_id)
            }else{
                toast.error(d.message)
            }
        }).catch(err=>{
            toast.error(err.message)
        }).finally(()=>{
            setSaving(false)
        }) : Data.update_item({item_data,collection_id:type == 'location' ? COLLECTIONS.LOCATIONS : type == 'experience' ? COLLECTIONS.ACTIVITIES : type=='category' ? COLLECTIONS.CATEGORIES : type == 'accommodation' ? COLLECTIONS.ACCOMMODATIONS : type == 'deal' ? COLLECTIONS.DEALS : type == 'label' ? COLLECTIONS.LABELS : COLLECTIONS.DESTINATIONS,document_id:id}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`${type} updated successfully`)
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

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        setUpdating(true)
        const response = await Data.delete_item({ collection_id:type == 'location' ? COLLECTIONS.LOCATIONS : type == 'experience' ? COLLECTIONS.ACTIVITIES : type=='category' ? COLLECTIONS.CATEGORIES : type == 'accommodation' ? COLLECTIONS.ACCOMMODATIONS : type == 'deal' ? COLLECTIONS.DEALS : type == 'label' ? COLLECTIONS.LABELS : COLLECTIONS.DESTINATIONS, document_id:id });
        if (response.status === 'success') {
            toast.success(`${type} deleted successfully`);
            onSave();
        } else {
            toast.error(response.message);
        }
        setUpdating(false)
    };

    return(
        <>
        {type !== 'label' && mediaSelector}
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">{mode == 'edit' ? 'Edit' : 'Add'} {type == 'location' ? 'Sightseeing' : type}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-center p-4">
                <div className="flex flex-wrap items-start justify-center gap-2 h-full px-4">
                    {state.images.map((image,ind)=>{
                        return <div key={ind} className="h-24 w-24 overflow-hidden rounded-lg relative">
                            <img src={image?.replace('&mode=admin','')} alt={state.name} className="h-full w-full object-cover"/>
                            {!saving && <RoundButton onClick={()=>{
                                let images = state.images
                                images = images.filter(e=>e !== image)
                                setState(s=>({...s,images}))

                            }} styles="absolute top-1 right-1 bg-white h-4 md:h-6" title="Remove Image"><X size={14}/></RoundButton>}
                        </div>
                    })}
                    {(type == 'category' && state.images.length > 0) ? <></> :  <button className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-lg transition duration-300 disabled:opacity-50" onClick={showMediaSelector} role="button" disabled={saving}>
                        <Plus size={40}/>
                    </button>}
                </div>
                <div>
                    <div className="grid grid-cols-1 gap-4 w-[90%] mx-auto lg:mx-0 mb-8">
                        <Input label={`${type} Name`} value={state.name} onChange={(e)=>setState(state=>({...state,name:e.target.value}))} placeholder={`${type} name`}/>
                        {type == 'destination' ? <SelectInput1 label={`Region`} value={region} fun={(e)=>setRegion(e)} placeholder={`Select Region`} options={REGIONS}/> : <></>}
                        
                        <TextArea rows={2} label="Description" value={state.description} onChange={(e)=>setState(state=>({...state,description:e.target.value}))} placeholder="Description"/>
                        {type == 'destination' || type == 'category' ? <>
                            <Input label={`Page Heading`} value={state.page_heading} onChange={(e)=>setState(state=>({...state,page_heading:e.target.value}))} placeholder={`Page Heading`}/>
                            <Input label={`Meta Title`} value={state.meta_title} onChange={(e)=>setState(state=>({...state,meta_title:e.target.value}))} placeholder={`Meta Title`}/>
                            <TextArea rows={2} label="Meta Description" value={state.meta_description} onChange={(e)=>setState(state=>({...state,meta_description:e.target.value}))} placeholder="Meta Description"/>
                            <TextArea rows={2} label="Meta Keywords" value={state.meta_keywords} onChange={(e)=>setState(state=>({...state,meta_keywords:e.target.value}))} placeholder="Meta Keywords"/>
                        </> : <></>}
                    </div>
                    <div className="flex-center-jc gap-2 ">
                        {mode == 'update' ? <Button onClick={handleDelete} disabled={saving} styles="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center gap-2 justify-center" > <Trash size={18} /> Delete </Button> : <></>}
                        <Button onClick={handleSubmit} disabled={!state.name || saving} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Save size={18} /> Save </Button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export function AddPackageForm(props){
    const {onSave} = props
    const [saving,setSaving] = useState(false)
    const { loading: loadingCategories, list: categories, load_list } = useFetchList({collection_id:COLLECTIONS.CATEGORIES,limit:1000})
    const [state,setState] = useState({
        name:'',
        categories:[],
    })

    const handleSubmit = async(e)=>{
        e.preventDefault()
        let {name} = state
        if(!name) return
        let item_data = {...state}
        item_data.url = slugify(name)
        setSaving(true)
        Data.create_item({item_data,collection_id:COLLECTIONS.PACKAGES}).then(d=>{
            let {status} = d
            if(status == 'success'){
                let {insert_id} = d
                createItineraryDoc(insert_id)
            }else{
                toast.error(d.message)
                setSaving(false)
            }
        }).catch(err=>{
            toast.error(err.message)
            setSaving(false)
        })
    }

    const createItineraryDoc = async(pid)=>{
        setSaving(true)
        Data.create_item({item_data:{package_id:pid,days:[]},collection_id:COLLECTIONS.ITINERARY}).then(d=>{
            let {status} = d
            if(status == 'success'){
                createExpenseDoc(pid)
            }else{
                toast.error(d.message)
                setSaving(false)
            }
        }).catch(err=>{
            toast.error(err.message)
            setSaving(false)
        })
    }

    const createExpenseDoc = async(pid)=>{
        setSaving(true)
        Data.create_item({item_data:{package_id:pid},collection_id:COLLECTIONS.EXPENSES}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`New package added successfully`)
                onSave(pid)
                createInclusionDoc(pid)
                createExclusionDoc(pid)
                createInfoDoc(pid)
            }else{
                toast.error(d.message)
            }
        }).catch(err=>{
            toast.error(err.message)
        }).finally(()=>{
            setSaving(false)
        })
    }
    const createInclusionDoc = async(pid)=>{
        setSaving(true)
        Data.create_item({item_data:{package_id:pid},collection_id:COLLECTIONS.INCLUSIONS}).then(d=>{
            let {status} = d
            
        }).catch(err=>{
            toast.error(err.message)
        })
    }
    const createInfoDoc = async(pid)=>{
        setSaving(true)
        Data.create_item({item_data:{package_id:pid},collection_id:COLLECTIONS.INFO}).then(d=>{
            let {status} = d
            
        }).catch(err=>{
            toast.error(err.message)
        })
    }
    const createExclusionDoc = async(pid)=>{
        setSaving(true)
        Data.create_item({item_data:{package_id:pid},collection_id:COLLECTIONS.EXCLUSIONS}).then(d=>{
            let {status} = d
            
        }).catch(err=>{
            toast.error(err.message)
        })
    }

    return(
        <>
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">Add New Package</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Input label="Package Name" value={state.name} onChange={(e)=>setState(state=>({...state,name:e.target.value}))} placeholder="Package Name"/>
                    {!loadingCategories && <MultiSelect label="Package Category" selected={state.categories} setSelected={(e)=>setState(state=>({...state,categories:e}))} placeholder="Package Category" list={categories}/>}
                </div>
                <div className="flex-center-jc gap-2 ">
                    {/* {mode == 'update' ? <Button onClick={handleDelete} disabled={saving} styles="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white flex items-center gap-2 justify-center" > <Trash size={18} /> Delete </Button> : <></>} */}
                    <Button onClick={handleSubmit} disabled={!state.name || saving} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Save size={18} /> Save </Button>
                </div>
            </div>
        </div>
        </>
    )
}

export function AddBlogForm(props){
    const {onSave} = props
    const [saving,setSaving] = useState(false)
    const [state,setState] = useState({
        name:'',
        title:'',
    })

    const handleSubmit = async(e)=>{
        e.preventDefault()
        let {name} = state
        if(!name) return
        let item_data = {...state}
        item_data.url = slugify(name)
        setSaving(true)
        Data.create_item({item_data,collection_id:COLLECTIONS.BLOGS}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`New blog added successfully`)
                onSave()
            }else{
                toast.error(d.message)
                setSaving(false)
            }
        }).catch(err=>{
            toast.error(err.message)
            setSaving(false)
        })
    }


    return(
        <>
        <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">Add New Blog</p>
            <div className="p-4 w-[90%] mx-auto ">
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Input label="Name" value={state.name} onChange={(e)=>setState(state=>({...state,name:e.target.value}))} placeholder="Name"/>
                    <Input label="Blog Title" value={state.title} onChange={(e)=>setState(state=>({...state,title:e.target.value}))} placeholder="Blog Title"/>
                </div>
                <div className="flex-center-jc gap-2 ">
                    <Button onClick={handleSubmit} disabled={!state.name || saving} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Save size={18} /> Save </Button>
                </div>
            </div>
        </div>
        </>
    )
}

export function FeaturedImageForm(props){
    const {onSave,id,name,featured_image} = props
    const [saving,setSaving] = useState(false)
    const [selector,setSelector] = useState(null)
    const [state,setState] = useState({
        featured_image,
    })
    const { showDialog: showMediaSelector, hideDialog: hideMediaSelector, dialog: mediaSelector } = usePopup({
        form: selector,
        container_styles: 'max-w-[800px]',
        zIndex:200
    });

    const handleSubmit = async(img)=>{
        setSaving(true)
        Data.update_item({item_data:{featured_image:img || state.featured_image},collection_id: COLLECTIONS.FEATURED_IMAGE,document_id:id}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`Image updated successfully`)
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

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to remove image?`)) return;
        setSaving(true)
        Data.update_item({item_data:{featured_image:''},collection_id: COLLECTIONS.FEATURED_IMAGE,document_id:id}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`Image remove successfully`)
                onSave()
            }else{
                toast.error(d.message)
            }
        }).catch(err=>{
            toast.error(err.message)
        }).finally(()=>{
            setSaving(false)
        })
    };

    return(
        <>
        {mediaSelector}
        <div className="w-[90%] mx-auto py-8 max-h-[85vh] overflow-y-auto">
            <div className="border-t lg:border-t-transparent lg:border-l border-gray-200 ">
                <div className="md:col-span-2 pb-2 mb-2 border-b border-gray-100">
                    <p className="font-semibold text-lg">{name}</p>
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
                                            handleSubmit(fi)
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
                            onClick={handleDelete}
                            disabled={saving}
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
                                            handleSubmit(fi)
                                        }}
                                        selection_limit={1}
                                        selected_files={state.featured_image ? [state.featured_image] : []}
                                        onCancel={() => hideMediaSelector()}
                                    />
                                )
                                showMediaSelector()
                            }}
                            disabled={saving}
                            styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center text-xs"
                        >
                            <Save size={18} /> Change
                        </Button>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}

export function ReviewsStatsForm(props){
    const {onSave} = props
    const [saving,setSaving] = useState(false)
    const [state,setState] = useState({
        total_review:0,
        average_ratings:0,
        trip_advisor_ratings:0,
        in_short:''
    })

    const loadStats = async () => {
        try {
            const d = await Data.get_item_detail({ collection_id: COLLECTIONS.REVIEWS, document_id: '693e17f4001a64205c2b' });
            if (d.status === 'success') {
            const { total_review, average_ratings, trip_advisor_ratings, in_short} = d.document;
            setState({total_review, average_ratings, trip_advisor_ratings, in_short});
            } 
        } catch (err) {
        }
    };

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setSaving(true)
        Data.update_item({item_data:state,collection_id:COLLECTIONS.REVIEWS,document_id:'693e17f4001a64205c2b'}).then(d=>{
            let {status} = d
            if(status == 'success'){
                toast.success(`Review stats updated successfully`)
            }else{
                toast.error(d.message)
            }
        }).catch(err=>{
            toast.error(err.message)
        }).finally(()=>{
            setSaving(false)
        })
    }

    useEffect(()=>{
        loadStats()
    },[])


    return(
        <>
        <div className="py-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
                <Input label="Total Reviews" value={state.in_short} onChange={(e)=>setState(state=>({...state,in_short:e.target.value}))} placeholder="Total Reviews"/>
                <Input type="number" label="Average Ratings" value={state.average_ratings} onChange={(e)=>setState(state=>({...state,average_ratings:e.target.value}))} placeholder="Average Ratings"/>
                <Input type="number" label="Trip Advisor Reviews" value={state.total_review} onChange={(e)=>setState(state=>({...state,total_review:e.target.value}))} placeholder="Trip Advisor Reviews"/>
                <Input type="number" label="Trip Advisor Ratings" value={state.trip_advisor_ratings} onChange={(e)=>setState(state=>({...state,trip_advisor_ratings:e.target.value}))} placeholder="Trip Advisor Ratings"/>
            </div>
            <div className="flex-center-jc gap-2 ">
                <Button onClick={handleSubmit} disabled={saving} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Save size={18} /> Save </Button>
            </div>
        </div>
        </>
    )
}

