'use client'

import Image from 'next/image'
import { BedDouble, Binoculars, Car, ChevronLeft, ChevronRight, ImageIcon, Salad } from 'lucide-react'
import { csvToArray } from '../functions'
import Link from 'next/link'
import { Skeleton } from './ui/skeleton';
import Heading from './ui/Heading'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { useEffect, useState } from 'react'
import Data from '../lib/backend'
import moment from 'moment'
import { COLLECTIONS, REGIONS } from '../constants'
import { useFetchList, useRegions } from '../hooks/useFetch'
import { useCurrency } from '../context/CurrencyContext'
import { useTranslation } from '../hooks/useTranslation'
import CustomImg from './website/CustomImg'

export default function PackageBlock(props){
    const {name,price,offer_price,images,url,locations,duration,activities,featured_image,accommodations,tags} = props
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();
    let discount = 0
    const tags_list = tags ? csvToArray(tags) : []
    if(offer_price && price ){
      let off = Math.round(((parseInt(offer_price) || 0) / (parseInt(price) || 0)) * 100)
      discount = isNaN(off) ? 0 : 100-off
    }
    let duration_string = ''
    if(duration){
      duration_string =  `${duration}D / ${duration-1}N`
    }
    let locations_string = locations.map((l,i)=>(`${l}`)).join(', ')

    let inclusions = [
      {title:t('package.hotels'),icon:<BedDouble/>},
      {title:t('package.sightSeeing'),icon:<Binoculars/>},
      {title:t('package.meals'),icon:<Salad/>},
      {title:t('package.transport'),icon:<Car/>},
    ]

    return(
      <div className="relative rounded-2xl package_block">
        <div className="absolute top-4 left-4 flex items-center justify-start gap-1 flex-wrap z-10">
          {tags_list && tags_list.map((tag,i)=>{
            return <Link key={i} href={`/tag/${tag.replaceAll(' ','-').toLowerCase()}`} className="text-xs bg-black/10 border border-white rounded-full transition duration-500 hover:bg-white hover:text-black p-1 px-2 text-white backdrop-blur">{tag}</Link>
          })}
        </div>
        <div className="h-88 lg:h-108 rounded-4xl overflow-hidden bg-gray-100 flex-center-jc hover:scale-[99%] transition duration-80 relative">
          {featured_image ? <CustomImg url={featured_image} al={name} styles="cover_img"/> : <ImageIcon className='text-gray-200' size={100}/>}
          
          {/* <Image src={featured_image} alt={name} height={500} width={500} className='cover_img'/> */}
          <p className="w-fit p-1 px-2 bg-green text-white rounded-full text-sm absolute bottom-4 left-4" style={{zIndex:3}}>{duration_string}</p>
        </div>
        <Link href={`/${url}`}>
          <div className="p-4 group">
            <p className="font-medium text-xl transition duration-300 group-hover:text-red">{name}</p>
            {/* <p className='text-xs text-gray-500 lg:text-sm my-1'>
              {locations.map((l,i)=>(
                `${l}`
              )).join(', ')}
            </p> */}
            <p className="text-xs text-gray-500 lg:text-sm my-1">
              {locations_string && locations_string.length > 150 
                ? locations_string.slice(0, 150) + "..." 
                : locations_string}
            </p>
            {/* <div className="grid grid-cols-4 gap-1 my-3">
                {inclusions.map((item,i)=>{
                  let {title,icon} = item
                  return <div className="flex-center-jc flex-col gap-[2px] text-gray-500 text-center rounded border border-gray-200 p-2" key={i}>
                    {icon}
                    <p className="text-[10px]">{title}</p>
                  </div>
                })}
            </div> */}
            {(price || offer_price) ? <div className="flex items-center justify-between mt-2">
              <div className="font-medium flex items-center justify-start gap-1 text-lg md:text-xl relative">
                <span>{t('common.from')}</span>
                {offer_price ? formatPrice(offer_price) : formatPrice(price) || ''}
                {offer_price && price ? <span className='line-through font-light text-gray-500'>{formatPrice(price)}</span> : ''}
                <span className="text-[10px] lg:text-sm block text-gray-500 absolute -bottom-3 lg:-bottom-4 left-0 font-light">{t('common.perPerson')}</span>
              </div>
              {discount ? <div className="border-red border text-red rounded-full h-12 flex-center-jc aspect-square font-medium text-sm">-{discount}%</div> : <></>}
            </div> : <></>}
          </div>
        </Link>
      </div>
    )
}


export function PackageBlock1(props){
    const {name,price,offer_price,url,duration,featured_image,deal_metadata} = props
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();
    let discount = 0
    let [deal,setDeal] = useState({
      name:'',discount:'',end_date:null,active:false,days_remaining:0
    })
    useEffect(()=>{
      if(deal_metadata){
        let dm = JSON.parse(deal_metadata)
        setDeal({
          name: dm.name || '',
          discount: dm.discount_rate || '',
          end_date: dm.end_date || null,
          active: dm.status == 'active' ? true : false,
          days_remaining: moment(dm.end_date).diff(moment(), 'days') || 0
        })
      }

    },[deal_metadata])
    if(offer_price && price ){
      let off = Math.round(((parseInt(offer_price) || 0) / (parseInt(price) || 0)) * 100)
      discount = isNaN(off) ? 0 : 100-off
    }
    let duration_string = ''
    if(duration){
      duration_string =  `${duration} Day${duration > 1 ? 's' : ''}`
    }

    return(
      <Link href={`/${url}`}>
        <div className="relative rounded-2xl transition duration-300 hover:scale-[99%]">
          <div className="absolute top-4 left-4 flex items-center justify-start gap-1 flex-wrap" style={{zIndex:2}}>
            {(deal.name && deal.active && deal.days_remaining > 0) ? <>
              {deal.days_remaining < 10 ? <>
                <p className="block w-full animate-pulse text-white text-xs ml-2">{`Hurry! ${deal.days_remaining} day${deal.days_remaining > 1 ? 's' : ''} remaining`}</p>
              </> : <></>}
              <div className="rounded-full bg-green text-white p-1 px-2 md:p-2 md:px-4 text-xs md:text-sm font-medium">
                {deal.name}
              </div>
            </> : <></>}
          </div>
          <div className="h-80 lg:h-108 rounded-4xl overflow-hidden bg-gray-100 flex-center-jc transition duration-80 relative">
            {featured_image ? <CustomImg url={featured_image} al={name} styles="cover_img"/> : <ImageIcon className='text-gray-200' size={100}/>}
            <div className="absolute bottom-0 left-0 w-full h-[80%] bg-gradient-to-t from-black/80 to-transparent p-4 lg:p-6 text-white flex flex-col items-start justify-end gap-2">
              <p className="text-xs md:text-sm lg:text-base font-light">{duration_string}</p>
              <p className="text-lg md:text-xl lg:text-2xl" style={{lineHeight:'130%'}}>{name}</p>
              {(price || offer_price) ? <div className={`flex items-center justify-between w-full ${discount ? '-mt-2' : '' }`}>
                <div className="text-xs md:text-sm lg:text-lg font-light flex items-center justify-start gap-1 relative text-gray-300">
                  <span>{t('common.from')}</span>
                  <span className="font-medium text-white">{offer_price ? formatPrice(offer_price) : formatPrice(price) || ''}</span>
                  {offer_price && price ? <span className='line-through font-light'>{formatPrice(price)}</span> : ''}
                  {/* <span className="text-[10px] block absolute -bottom-3 left-0 font-light">{t('common.perPerson')}</span> */}
                </div>
                {discount ? <div className="bg-white text-black p-2 px-3 rounded-full flex-center-jc text-xs lg:text-sm">-{discount}%</div> : <></>}
              </div> : <></>}
            </div>
            {/* <p className="w-fit p-1 px-2 bg-red text-white rounded-full text-sm absolute bottom-4 left-4" style={{zIndex:3}}>{duration_string}</p> */}
          </div>

        </div>
      </Link>
    )
}

export function RegionBlock(props){
  const {packages,name,slug,img} = props
  if(packages.length == 0) return
  return(
    <Link href={slug ? `/regions/${slug}` : '/regions'}>
      <div className="relative rounded-2xl transition duration-300 hover:scale-[99%]">
        <div className="absolute top-4 left-4 flex items-center justify-start gap-1 flex-wrap" style={{zIndex:2}}>
            <div className="rounded-full bg-white/70 text-black p-1 px-2 md:p-2 md:px-4 text-xs md:text-sm font-medium">
              {`${packages.length} trip${packages.length > 1 ? 's' : ''}`}
            </div>
        </div>
        <div className="h-80 lg:h-108 rounded-4xl overflow-hidden bg-gray-100 flex-center-jc transition duration-80 relative">
          {/* <Image src={img} alt={name} height={500} width={500} className='cover_img'/> */}
          <CustomImg url={img} al={name} styles="cover_img"/>
          {/* <div className="absolute bottom-0 left-0 w-full h-[80%] bg-gradient-to-t from-black/80 to-transparent p-4 lg:p-6 text-white flex flex-col items-start justify-end gap-2">
            <p className="text-lg md:text-xl lg:text-2xl" style={{lineHeight:'130%'}}>{name}</p>
          </div> */}
        </div>
      </div>
    </Link>
  )
}

export function PackageBlockSkeleton({hide_content=false}) {
  return (
    <div className="relative rounded-2xl">
      {/* Tag Badges Skeleton */}
      <div className="absolute top-4 left-4 flex items-center justify-start gap-1 flex-wrap z-10">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Featured Image Placeholder */}
      <div className="h-88 lg:h-108 rounded-4xl overflow-hidden bg-gray-100 flex-center-jc">
        <ImageIcon className="text-gray-200" size={100} />
      </div>

      {/* Content Area */}
      {!hide_content ? <div className="p-4">
        {/* Title */}
        <Skeleton className="h-7 w-4/5 mb-2" />

        {/* Locations */}
        <Skeleton className="h-4 w-3/4 mb-3" />

        {/* Price Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-16 ml-2 line-through opacity-60" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div> : <></> }
    </div>
  );
}

export function DealsSlider(){
  const { loading, list, total } = useFetchList({collection_id:COLLECTIONS.DEALS})
  return(<>
    {loading ? <>
      <div className="w_80_90 py-12 pb-8 lg:py-20 lg:pb-20">
        <Skeleton className="w-full h-[16vh] md:h-[30vh] lg:h-[52.8vh] rounded-3xl bg-gray-200"/>
      </div>
    </> :
     total == 0 ? <></> : <div className="w_80_90 py-12 pb-8 lg:py-20 lg:pb-4">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={8}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="mySwiper relative h-[20vh] md:h-[30vh] lg:h-[52.8vh]"
        loop={true}
      >
        {list.map((deal, index) => {
          let {active,featured_image,name,url} = deal
          if(!active) return
          return <SwiperSlide key={index} className={`w-full h-full`}>
            <Link href={`/deals/${url}`} className="h-full w-full">
              {featured_image ? <CustomImg url={featured_image} al={name} styles="w-full h-full object-cover rounded-xl md:rounded-2xl lg:rounded-3xl"/> : <></>}
              {/* {featured_image ? <Image src={featured_image} alt={name} height={1000} width={1000} className='w-full h-full object-cover rounded-3xl'/> : <></>} */}
            </Link>
          </SwiperSlide>
        })}
      </Swiper>
    </div>}
  </>)
}

export function CategorySection(props){
  let {type,id,name,url,featured,hide_text=false} = props
  const [loading,setLoading] = useState(true)
  const [packages,setPackages] = useState([])

  const [params, setParams] = useState({
    category: null,
    tag:  null,
    location: null,
    activity:  null,
    accommodation: null,
    destination_id:  null,
    limit: 6,
    featured: featured ? true : false
  })

  useEffect(()=>{
    let {category,tag,location,activity,accommodation,destination_id, featured} = params
    if(category || tag || location || activity || accommodation || destination_id || featured){
      loadPackages()
    }
  },[params])

  async function loadPackages(){
    setLoading(true)
    Data.fetchPackages({...params}).then(d=>{
      setPackages(d.packages || [])
    }).catch(err=>{

    }).finally(()=>{
      setLoading(false)
    })
  }

  useEffect(()=>{
    if(type){
      if(type == 'categories'){
        setParams(s=>({...s,category:id}))
      }
      if(type == 'destinations'){
        setParams(s=>({...s,destination_id:id}))
      }
    }
  },[type])

  if(!packages.length && !loading){
    return <></>
  }

  return(
    <>
      <div className="flex items-center justify-between w_80_90">
        {type == 'featured' ? <>
          <div className="">
            <Heading styles="text-xl lg:text-3xl text-red mt-8 md:mt-12" text="Traveler's Choice:" span_styles="text-black" span_text="Our Most-Loved Journeys"/>
          </div>
        </> : <div className="">
          <Heading styles="text-xl lg:text-3xl" text={name}/>
          {!hide_text && <p className="text-xs lg:text-2xl text-gray-400 mt-1">Let us unlock the globe's wonders for you!</p>}
        </div>}
      </div>
      <div className="my-2 mb-8 pb-8 border-b border-gray-200">
        {loading ? <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w_80_90 mt-8">
              <PackageBlockSkeleton />
              <PackageBlockSkeleton />
              <PackageBlockSkeleton />
          </div>
        </> : <PackageSwiper packages={packages} url={type == 'featured' ? null : `${type}/${url}`}/>}
      </div>
    </>
  )
}

export function PackageBundle({type}){
  const { loading, list, total } = useFetchList({collection_id:type == 'deals' ? COLLECTIONS.DEALS : COLLECTIONS.LABELS})
  const [dealsData,setDealsData] = useState([])
  const [loadingDeals,setLoadingDeals] = useState(true)
  useEffect(()=>{
    let deals = []
    if(list && list.length > 0){
      list.forEach(deal=>{
        if(type == 'deals'){
          if(deal.active){
            deals.push(deal)
          }
        }else{
          deals.push(deal)
        }
      })
    }
    if(deals && deals.length > 0){
      LoadDeals(deals)
    }
  },[list])

  async function LoadDeals(deals){
    setLoadingDeals(true)
    Data.fetchPackagesBundles(deals,type).then(d=>{
      setDealsData(d.items || [])
    }).catch(err=>{

    }).finally(()=>{
      setLoadingDeals(false)
    })
  }

  return(
    <div className="grid grid-cols-1">
      {(loadingDeals || loading) ? <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w_80_90 mt-8">
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
        </div>
      </> : dealsData.length == 0 ? <></> : <>
        {dealsData.length > 0 && dealsData.map((deal,i)=>{
          let {name,url,packages} = deal
          if(packages.length == 0) return
          return(
            <div className="" key={i}>
              <div className="flex items-center justify-between w_80_90 mt-8 lg:mt-12">
                <div>
                  <Heading styles="text-xl lg:text-3xl text-red" text={type == 'deals' ? `flat ${deal.discount_rate}% off - ` : <></>} span_styles="text-black capitalize" span_text={name}/>
                  {type == 'labels' && <p className="text-xs lg:text-lg text-gray-400 mt-1">{deal.description}</p>}
                </div>
              </div>
              <div className="md:my-4 lg:my-8 mb-0 pb-8 lg:mb-0 lg:pb-12 border-b border-gray-200">
                <PackageSwiper packages={packages} url={`/${type}/${url}`}/>
              </div>
            </div>
          )
        })}
      </>}
    </div>
  )
}

export function PackageSwiper(props){
  const {packages,url,type} = props
  return(
    <div className="">
      <Swiper
        modules={[Autoplay,Navigation,Pagination]}
        spaceBetween={0}
        slidesPerView={1.5}
        // autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="mySwiper w-full h-full relative"
        loop={false}
        navigation={{
          nextEl: '.next',
          prevEl: '.prev',
        }}
        breakpoints={{
          768: {
            slidesPerView: 2.2,
            spaceBetween: 12,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
        }}
      >
        {packages.map((pkg, index) => (
          <SwiperSlide key={index} className={`w-full p-3 py-4 mb-4 md:mb-8 ${index == 0 ? 'ml-[3%] md:ml-[5%] lg:ml-[7%]' : ""}`}>
            {type && type == 'regions' ? <RegionBlock {...pkg}/> : <PackageBlock1 {...pkg}/>}
          </SwiperSlide>
        ))}
        {packages.length > 3 ? <SwiperSlide className="hidden w-4"><div className="block w-4"></div></SwiperSlide> : <></>}
        {packages.length > 3 && url ? <div className="w_80_90 flex-center-jb">
          <Link href={url || '#'} className="border border-red text-red transition duratin-300 hover:bg-red hover:text-white p-1 px-4 rounded-full text-sm lg:text-base">View All</Link>
          <div className="flex items-center justify-end gap-2">
            <button className="swiper_btn prev"><ChevronLeft className="h-4 lg:h-8 w-auto"/></button>
            <button className="swiper_btn next"><ChevronRight className="h-4 lg:h-8 w-auto"/></button>  
          </div>
        </div> : <></>}
      </Swiper>
    </div>
    )
}

export function Regions(){
  const { loading: loadingRegions, regions: list } = useRegions();
  const [packages,setPackages] = useState([])
  const [loading,setLoading] = useState(true)
  useEffect(()=>{
    let items = []
    list.forEach(rgn=>{
      let {region,destinations} = rgn
      let data = REGIONS.find(e=>e.name == region)
      let pkgs = []
      destinations.forEach(d=>{
        pkgs = [...pkgs,...d.packages]
      })
      let obj = {region,packages:pkgs,...data}
      items.push(obj)
    })
    setPackages(items)
    setLoading(false)
  },[list])
  return(
    <div className="grid grid-cols-1">
      {(loading) ? <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w_80_90 mt-8">
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
          <PackageBlockSkeleton />
        </div>
      </> : <>
        <div className="flex items-center justify-between w_80_90">
          <div>
            <Heading styles="text-xl lg:text-3xl text-red" text="Discover" span_styles="text-black capitalize" span_text="India"/>
          </div>
        </div>
        <div className="md:my-4 lg:my-8 mb-0 pb-8 lg:mb-0 lg:pb-12">
          <PackageSwiper packages={packages} url={null} type="regions"/>
        </div>
      </>}
    </div>
  )
}

export function BlogsSection(props){
  let {limit} = props
  const { loading, list, total } = useFetchList({collection_id:COLLECTIONS.BLOGS,limit: limit || 100})

  return(
  <>
    <div className="w_80_90 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? <></> : <>
        {list.map((item,i)=>{
          return <BlogCard key={i} {...item}/>
        })}
      </>}
    </div>
    {limit ? <Link href={'/blogs'} className="border border-red text-white transition duratin-300 bg-red hover:text-red hover:bg-transparent p-1 px-3 rounded-full text-sm lg:text-base lg:px-4">View All</Link> : <></>}
    </>)

}

export function BlogCard(props){
  let {title,short_description,url,createdAt,updatedAt,featured_image} = props
  return(<Link href={`/blogs/${url}`}>
    <div className="bg-white rounded-2xl border border-gray-200 p-4 overflow-hidden transition duration-300 hover:shadow">
      <p className="font-medium text-xl md:text-2xl">{title}</p>
      <p className="text-[10px] text-gray-400 my-1">{moment(updatedAt || createdAt).format('DD MMM, y')}</p>
      <p className="text-xs text-gray-500">
        {short_description && short_description.length > 150 
          ? short_description.slice(0, 150) + "..." 
          : short_description}
      </p>
      {featured_image ? <>
        <div className="rounded-lg overflow-hidden aspect-video mt-2">
          <Image src={featured_image} height={1000} width={1000} alt={title} className='cover_img'/>
        </div>
      </> : <></>}
    </div>
  </Link>)
}

export function BlogCard1(props){
  let {title,short_description,url,createdAt,updatedAt,featured_image} = props
  return(<Link href={`/blogs/${url}`}>
    <div className="bg-white rounded-2xl border border-gray-200 p-2 overflow-hidden transition duration-300 hover:shadow">
      {featured_image ? <>
        <div className="rounded-lg overflow-hidden aspect-video mb-2">
          <Image src={featured_image} height={1000} width={1000} alt={title} className='cover_img'/>
        </div>
      </> : <></>}
      <p className="text-[10px] text-gray-400">{moment(updatedAt || createdAt).format('DD MMM, y')}</p>
      <p className="font-medium text-sm md:text-base">{title}</p>
      <p className="text-[10px] text-gray-500">
        {short_description && short_description.length > 100 
          ? short_description.slice(0, 100) + "..." 
          : short_description}
      </p>
    </div>
  </Link>)
}