'use client'

import BreadCrumb from "../../../../components/BreadCrumb"
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
import { ShareButton } from "../../../../components/Buttons"

export default function Destination({params}) {
    const {url} = use(params)
    const router = useRouter()
    const { loading, data: destination_detail, load_detail: loadDestination, message } = useFetch({url,item_type:'destination',collection_id:COLLECTIONS.DESTINATIONS})
    const [destinationID,setDestinationID] = useState(null)
    const [detailBlock,setDetailBlock] = useState(null)
    const [breadCrumb, setBC] = useState(null);
    const { showDialog, hideDialog, dialog } = usePopup({
        form: detailBlock,
        container_styles: 'max-w-[800px]'
      });

    const [state, setState] = useState({
        name: '', description:'', images:[], locations:[], full_detail:'', featured_image:'',location_metadata:null
    })
    
    useEffect(()=>{
        if(destination_detail){
            let { name, images, location_metadata, full_detail, featured_image, description, id, region } = destination_detail
            setState(s=>({...s,name,description,images:images||[],full_detail,featured_image,location_metadata:JSON.parse(location_metadata) || []}))
            setBreadCrumb(region,name)
            setDestinationID(id)
            document.title = name
        }
    },[destination_detail])

    function setBreadCrumb(region,name) {
        let bc_array = [
            { text: 'Home', url: `/` },
            { text: 'Discover India', url: `/regions` },
            { text: region, url: region ? `/regions/${region.toLowerCase().replaceAll(' ','-')}` : `/destinations` },
            { text: name, url: '' },
        ];
        setBC(<BreadCrumb options={bc_array} active={name} />);
    }

    useEffect(()=>{
        if(!url){
            router.replace('/destinations')
        }else{
            loadDestination()
        }
    },[url])

    
  return (
    <div>
        <Header color="white" fixed/>
        { dialog }
        {loading ? <>
            <div>
      {/* Hero Section Skeleton */}
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative overflow-hidden">
        {/* Background Image Placeholder */}
        <Skeleton className="absolute inset-0 w-full h-full opacity-40" />

        {/* Gradient Overlay */}
        <div className="bg-gradient-to-t from-white to-transparent h-full w-full absolute bottom-0 left-0" />

        <div className="w_80_90 relative z-10">
          <Skeleton className="h-12 w-3/4 mb-2 lg:mb-4" /> {/* Title */}
          <Skeleton className="h-5 w-1/2" /> {/* Description */}
        </div>
      </div>

      {/* Packages Section */}
      <div className="w_80_90 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
        </div>
      </div>

      {/* Tourist Attractions Section */}
      <div className="w_80_90 pt-12 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="relative h-32 md:h-40 rounded-2xl overflow-hidden group flex-center-jc flex-col gap-2 border-4 border-white bg-gray-100"
            >
              <Skeleton className="absolute inset-0 w-full h-full" />
              <Skeleton className="relative h-6 w-24 rounded-full bg-white/50 backdrop-blur-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Full Detail Section */}
      <div className="w_80_90 py-12 lg:py-20">
        <div className="flex gap-4 items-start justify-between">
          {/* Text Content */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Featured Image (lg only) */}
          <Skeleton className="hidden lg:block rounded-2xl aspect-square w-[30%] h-64" />
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
                        <Image src={img} alt={state.name} height={1000} width={1000} className='w-full h-full object-cover opacity-80'/>
                    </SwiperSlide>
                    })}
                </Swiper>
                </>: <div className="h-[32vh] lg:h-[65vh] flex-center-jc relative bg-black">
                {state.featured_image ? <Image src={state.featured_image} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover opacity-90" style={{zIndex:0}} alt=""/> : <div className="w_80_90 relative">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-2 lg:mb-4 pt-20 lg:pt-12">{state.name}</h1>
                    <p className="text-xs md:text-sm lg:text-lg">{state.description}</p>
                </div>}
                <div className="bg-gradient-to-t from-white to-transparent h-[50%] w-full absolute bottom-0 left-0"/>
                
            </div>}
            <div className="w_80_90 mt-8 flex items-center justify-between">
                {breadCrumb}
                <ShareButton title={state.name} url={typeof window !== 'undefined' ? window.location.href : ''} text={`Check out this amazing ${state.name} travel destination on India Escapes. ${state.description}`} button_text="Share" styles="text-xs lg:text-sm p-2 lg:px-4" button_styles="hidden md:block"/>
            </div>
            {((state.images && state.images.length > 0) || state.featured_image) ? <div className="w_80_90 py-4 md:py-8 space-y-2 md:space-y-4">
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-red">{state.name}</h1>
                <p className="text-xs md:text-lg text-gray-600 max-w-2xl">{state.description}</p>
            </div> : <></>}
            <PackagesSection destination_id={destinationID}/>
            {state.location_metadata ? <div className="w_80_90 pt-12 lg:py-20">
                <Heading styles="mb-4 lg:text-3xl" text={state.name} span_text="tourist attractions"/>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                    {state.location_metadata.map((location,i)=>{
                        let {name,url,img,id} = location
                        return <div key={i} className="relative h-32 md:h-40 rounded-2xl overflow-hidden group flex-center-jc flex-col gap-2 transition duration-300 hover:shadow-xl cursor-pointer border-4 border-white" role="button" onClick={()=>{
                            setDetailBlock(<DetailBlock id={id} type="LOCATIONS"/>)
                            showDialog()
                        }}>
                            {img ? <Image src={img} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover transition duration-500 group-hover:scale-105" style={{zIndex:0}} alt=""/> : <></>}
                            <p className="text-center w-fit relative bg-white/30 backdrop-blur-sm p-1 px-4 rounded-full transition duration-500 group-hover:bg-black group-hover:text-white text-sm">{name}</p>
                        </div>
                    })}
                </div>
            </div> : <></>}

            {state.full_detail ? <div className="w_80_90 py-12 lg:py-20">
                <Heading styles="mb-4 lg:text-3xl" text="More detail about" span_text={state.name}/>
                <div className="flex gap-4 items-center justify-between">
                    <div
                        className="package_ec_css text-sm lg:text-base text-gray-700 flex-1"
                        dangerouslySetInnerHTML={{ __html: state.full_detail }}
                    />
                    {state.featured_image ? <Image src={state.featured_image} height={500} width={500} className="rounded-2xl aspect-square w-[30%] hidden lg:block" style={{zIndex:0}} alt=""/> : <></>}
                </div>
                
            </div> : <></>}
        </>}
    </div>
  )
}

export function PackagesSection(props){
    const {destination_id, category, tag, location, activity, accommodation, limit, hide_filter=false, search=null} = props
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
        if(search){
            Data.searchPackages({query:search}).then(d=>{
                let {packages} = d
                setState(s=>({...s,list:packages,filtered_list:packages}))
            }).catch(err=>{
    
            }).finally(()=>{
                setLoadingPackages(false)
            })
        }else{
            Data.fetchPackages({...params}).then(d=>{
                let {packages} = d
                setState(s=>({...s,list:packages,filtered_list:packages}))
            }).catch(err=>{
    
            }).finally(()=>{
                setLoadingPackages(false)
            })
        }

    }
    return(<>
        <div className="w_80_90 mt-4">
            {(loadingPackages || hide_filter) ? <></> : <div className="flex items-center justify-start gap-2">
                <Select input_styles="border rounded-full text-red border-red p-1 px-3 text-xs min-h-0 cursor-pointer hover:bg-red/5" label="" options={price_options} value={filters.price_option} onChange={e=>{
                    setFilters(s=>({...s,price_option:e.target.value}))
                }} placeholder="Sort by Price"/>
                <Select input_styles="border rounded-full text-red border-red p-1 px-3 text-xs min-h-0 cursor-pointer hover:bg-red/5" label="" options={duration_options} value={filters.duration_option} onChange={e=>{
                    setFilters(s=>({...s,duration_option:e.target.value}))
                }} placeholder="Sort by Duration"/>
            </div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mt-4 lg:mt-8">
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
