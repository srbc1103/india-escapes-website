'use client'

import BreadCrumb from "../../../../components/BreadCrumb"
import { ShareButton } from "../../../../components/Buttons"
import { Select } from "../../../../components/Input"
import PackageBlock, { PackageBlock1, PackageBlockSkeleton } from "../../../../components/PackageBlock"
import Heading from "../../../../components/ui/Heading"
import { Skeleton } from "../../../../components/ui/skeleton"
import DetailBlock from "../../../../components/website/DetailBlock"
import Header from "../../../../components/website/Header"
import { COLLECTIONS } from "../../../../constants"
import useFetch from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Data from "../../../../lib/backend"
import { BrushCleaning } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import {  Autoplay } from 'swiper/modules'

export default function Deal({params}) {

    const {url} = use(params)
    const router = useRouter()

    const { loading, data: deal_detail, load_detail: loadDeal } = useFetch({url, item_type: 'label',collection_id: COLLECTIONS.LABELS})

    const [loadingPackages, setLoadingPackages] = useState([])
    const [packages, setPackages] = useState([])

    const [breadCrumb, setBC] = useState(null);

    const [state, setState] = useState({
        name: '', description: '', packages: [], end_date: null, active: true, featured_image: '', discount_rate: 0, images:[]
    })
    
    useEffect(()=>{
        if(deal_detail){
            let { name, packages, featured_image, description, images } = deal_detail
            setState(s=>({...s, name, description, packages: packages || [], featured_image, images: images || []}))
            LoadDeals([deal_detail])
            document.title = name
            let bc_array = [
                { text: 'Home', url: `/` },
                { text: 'Labels', url: `/labels` },
                {text:name,url:''}
            ]
            setBC(<BreadCrumb options={bc_array} active={name} />)
        }
    },[deal_detail])

    async function LoadDeals(deals){
        setLoadingPackages(true)
        Data.fetchPackagesBundles(deals,'labels').then(d=>{
          setPackages(d.items[0]?.packages || [])
        }).catch(err=>{
    
        }).finally(()=>{
          setLoadingPackages(false)
        })
    }

    useEffect(()=>{
        if(!url){
            router.replace('/labels')
        }else{
            loadDeal()
        }
    },[url])
    
  return (
    <div>
        <Header color="black" fixed/>
        {loading ? 
        <>
            <div>
                <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative overflow-hidden">
                    <Skeleton className="absolute inset-0 w-full h-full opacity-40" />
                    <div className="bg-gradient-to-t from-white to-transparent h-full w-full absolute bottom-0 left-0" />
                    <div className="w_80_90 relative z-10">
                        <Skeleton className="h-12 w-3/4 mb-2 lg:mb-4"/>
                        <Skeleton className="h-5 w-1/2"/>
                    </div>
                </div>
            </div>
        </> : <>
            {state.images && state.images.length > 0 ? <>
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="mySwiper w-full h-[30vh] lg:h-[60vh] relative bg-black"
                    loop={true}
                >
                    {state.images.map((img, index) => {
                    return <SwiperSlide key={index} className={`w-full  h-full`}>
                        <Image src={img} alt="" height={1000} width={1000} className='w-full h-full object-cover opacity-90'/>
                    </SwiperSlide>
                    })}
                </Swiper>
                </>: <div className="h-[32vh] lg:h-[65vh] flex-center-jc relative bg-white">
                {state.featured_image ? <Image src={state.featured_image} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover" style={{zIndex:0}} alt=""/> : <div className="w_80_90 relative">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-2 lg:mb-4 pt-20 lg:pt-12">{state.name}</h1>
                    <p className="text-xs md:text-sm lg:text-lg">{state.description}</p>
                </div>}
                {/* <div className="bg-gradient-to-b from-white to-transparent h-[50%] w-full absolute bottom-0 left-0"/> */}
                
            </div>}
        </>}
        <div className="w_80_90 mt-8 flex items-center justify-between">
            {breadCrumb}
            <ShareButton title={state.name} url={typeof window !== 'undefined' ? window.location.href : ''} text={`Check out this amazing ${state.name} on India Escapes. ${state.description}`} button_text="Share deal" styles="text-xs lg:text-sm p-2 lg:px-4" button_styles="hidden md:block"/>
        </div>
        {((state.images && state.images.length > 0) || state.featured_image) ? <div className="w_80_90 py-4 md:py-8 md:space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-red">{state.name}</h1>
            <p className="text-xs md:text-lg text-gray-600 max-w-2xl">{state.description}</p>
        </div> : <></>}
        {!loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 lg:mt-8 w_80_90 pb-20">
            {loadingPackages ? <>
                <PackageBlockSkeleton/>
                <PackageBlockSkeleton/>
                <PackageBlockSkeleton/>
            </> : <>
                {packages ? packages.map((pkg,i)=>{
                    return <PackageBlock1 {...pkg} key={i}/>
                }) : <>
                    <div className="md:col-span-2 lg:col-span-3 py-20 flex-center-jc flex-col gap-4">
                        <BrushCleaning size={200} className="text-gray-200"/>
                        <p className="text-lg text-gray-400">No package available</p>
                    </div>
                </>}
            </>}
        </div> : <></>}
    </div>
  )
}

export function PackagesSection(props){
    const {destination_id, category, tag, location, activity, accommodation, limit, hide_filter=false} = props
    let params = {
        category: category || null,
        tag:  tag || null,
        location: location || null,
        activity:  activity || null,
        accommodation: accommodation || null,
        destination_id:  destination_id || null,
        limit: limit || null
    }

    const duration_options = [
        {id:'asc',name:'Shortest first'},
        {id:'desc',name:'Longest first'},
    ]

    const price_options = [
        {id:'asc',name:'Low to High'},
        {id:'desc',name:'High to Low'},
    ]

    const [filters, setFilters] = useState({
        duration_option: null,
        price_option: null
    })
    
    const [state,setState] = useState({
        list:[],filtered_list:[]
    })
    const [loadingPackages,setLoadingPackages] = useState(true)
    useEffect(()=>{
        loadPackages()
    },[props])

    useEffect(()=>{
        let {duration_option,price_option} = filters
        let {list} = state
        let new_list = []
        if(duration_option || price_option){
            if(duration_option){
                new_list = list.filter(e=>e.duration )
                new_list.sort((a,b)=>{
                    let d1 = parseInt(a.duration) || 0 
                    let d2 = parseInt(b.duration) || 0
                    if(duration_option == 'desc'){
                        return d2 - d1
                    }else{
                        return d1 - d2
                    }
                })
            }
            if(price_option){
                new_list = list.filter(e=> (e.price || e.offer_price) )
                new_list.sort((a,b)=>{
                    let d1 = parseInt(a.offer_price || a.price) || 0
                    let d2 = parseInt(b.offer_price || b.price) || 0
                    if(price_option == 'desc'){
                        return d2 - d1
                    }else{
                        return d1 - d2
                    }
                })
            }
        }else{
            new_list = list
        }
        setState(s=>({...s,filtered_list:new_list}))
    },[filters])

    async function loadPackages(){
        setLoadingPackages(true)
        Data.fetchPackages({...params}).then(d=>{
            let {packages} = d
            setState(s=>({...s,list:packages,filtered_list:packages}))
        }).catch(err=>{

        }).finally(()=>{
            setLoadingPackages(false)
        })
    }
    return(<>
        <div className="w_80_90 mt-4">
            {(loadingPackages || hide_filter) ? <></> : <div className="flex items-center justify-start lg:justify-end gap-2">
                <Select input_styles="border rounded-full text-red border-red p-1 px-3 lg:p-2 lg:px-4 min-h-0 cursor-pointer hover:bg-red/5" label="" options={price_options} value={filters.price_option} onChange={e=>{
                    setFilters(s=>({...s,price_option:e.target.value}))
                }} placeholder="Sort by Price"/>
                <Select input_styles="border rounded-full text-red border-red p-1 px-3 lg:p-2 lg:px-4 min-h-0 cursor-pointer hover:bg-red/5" label="" options={duration_options} value={filters.duration_option} onChange={e=>{
                    setFilters(s=>({...s,duration_option:e.target.value}))
                }} placeholder="Sort by Duration"/>
            </div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 lg:mt-8">
                {loadingPackages ? <>
                    <PackageBlockSkeleton/>
                    <PackageBlockSkeleton/>
                    <PackageBlockSkeleton/>
                </> : <>
                    {state.filtered_list ? state.filtered_list.map((pkg,i)=>{
                        return <PackageBlock {...pkg} key={i}/>
                    }) : <>
                        <div className="md:col-span-2 lg:col-span-3 py-20 flex-center-jc flex-col gap-4">
                            <BrushCleaning size={200} className="text-gray-200"/>
                            <p className="text-lg text-gray-400">No package available</p>
                        </div>
                    </>}
                </>}
            </div>
        </div>
    </>)
}
