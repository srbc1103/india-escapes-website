'use effect'

import { COLLECTIONS } from "../../constants"
import useFetch from "../../hooks/useFetch"
import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import Image from "next/image"
import { Skeleton } from "../ui/skeleton"
import { useCurrency } from "../../context/CurrencyContext"
import { useTranslation } from "../../hooks/useTranslation"
import { ImageIcon } from "lucide-react"

export default function DetailBlock(props) {
    const {id, type} = props
    const { loading, data } = useFetch({document_id:id, collection_id:COLLECTIONS[type]})
    const [state,setState] = useState({
        name:'',description:'',images:[]
    })
    useEffect(()=>{
        if(data){
            let {name,description,images} = data
            setState(s=>({...s,name,description,images}))
        }
    },[data])

    if (loading) {
        return (
          <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
            {/* Title Skeleton */}
            <Skeleton className="w-[80%] h-8 mx-auto mb-8" />
    
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-start p-4">
              {/* Image Slider Skeleton */}
              <div className="h-60">
                <div className="flex gap-2 h-full">
                  <Skeleton className="flex-1 rounded-2xl" />
                  <Skeleton className="flex-1 rounded-2xl hidden sm:block" />
                  <Skeleton className="flex-1 rounded-2xl hidden lg:block" />
                </div>
              </div>
    
              {/* Content Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-11/12" />
              </div>
            </div>
          </div>
        );
      }
  return (
    <div className="w-full py-8 max-h-[85vh] overflow-y-auto">
        <p className="w-[80%] mx-auto font-medium text-lg md:text-xl pb-2 mb-8 border-b text-center border-b-gray-300 capitalize">{state.name}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-center p-4">
            <div className="h-60">
                <Swiper
                    modules={[Autoplay,Navigation,Pagination]}
                    spaceBetween={10}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="mySwiper w-full h-full"
                    loop={false}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                >
                {state.images.map((img, index) => (
                    <SwiperSlide key={index} className="w-full">
                        <div className="rounded-2xl overflow-hidden h-full w-full">
                            <Image src={img} height={200} width={200} alt="" className="cover_img"/>
                        </div>
                    </SwiperSlide>
                ))}
                <div className="swiper-button-prev !text-white !rounded-full !left-3 after:!text-lg" />
                <div className="swiper-button-next !text-white !rounded-full !right-3 after:!text-lg" />
                </Swiper>
            </div>
            <div>
                <p className="font-medium text-xl md:text-2xl lg:text-3xl mb-2">{state.name}</p>
                <p className="text-xs text-gray-600">{state.description}</p>
            </div>
        </div>
    </div>
  )
}

export function AddonBlock(props) {
  const {title, featured_image, description, cost} = props
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  return (
    <div className="w-full lg:p-8 py-8 max-h-[85vh] overflow-y-auto">
        <p className="w-[80%] mx-auto font-medium text-lg md:text-xl pb-2 mb-8 border-b text-center border-b-gray-300 capitalize">{title}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center p-4">
            <div className="h-60">
                <div className="rounded-2xl overflow-hidden h-full w-full flex-center-jc">
                  {featured_image ? <Image src={featured_image} alt={title || ''} height={200} width={200} className="cover_img" /> : <ImageIcon size={200} className="text-gray-100" />}
                </div>
            </div>
            <div>
              <p className="font-medium text-xl md:text-xl lg:text-2xl mb-2">{title}</p>
              <p className="text-xs text-gray-600">{description}</p>
              {cost ? <>
                <div className="flex items-center justify-start gap-2">
                  <span className="text-lg font-medium text-red">{formatPrice(cost)}</span>
                  <span className="text-xs text-gray-500">{t('common.perPerson')}</span>
                </div>
              </> : <></>}
            </div>
        </div>
    </div>
  )
}
