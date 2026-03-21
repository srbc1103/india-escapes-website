'use client'

import { PackageBlockSkeleton, PackageSwiper } from "../../../../components/PackageBlock"
import { FEATURED_IMAGE_PAGE_MAP, IMAGES, REGIONS } from "../../../../constants"
import { use, useEffect, useState } from "react"
import { useFeaturedImage, useRegions } from "../../../../hooks/useFetch"
import Heading from "../../../../components/ui/Heading"
import Header from "../../../../components/website/Header"
import Image from "next/image"
import { useRouter } from "next/navigation"
import BreadCrumb from "../../../../components/BreadCrumb"

export default function Page({params}) {
  const {slug} = use(params)
  const { loading: loadingRegions, regions: list } = useRegions();
  const [loading,setLoading] = useState(true)
  const router = useRouter()
  const [title,setTitle] = useState('')
  const [breadCrumb, setBC] = useState(null);
  const [state,setState] = useState({
    destinations:[]
  })

  const {featuredImage} = useFeaturedImage({id:slug ? FEATURED_IMAGE_PAGE_MAP[slug.replaceAll('-','_')] : ''})

  useEffect(()=>{
    if(!slug){
        router.replace('/regions')
    }
    if(list && !loadingRegions){
        let name = REGIONS.find(e=>e.slug == slug)?.name || null
        let rgn = list.find(e=>e.region == name) || null
        if(rgn && name){
            let {region,destinations} = rgn
            setBreadCrumb(region)
            setTitle(region)
            setState(s=>({...s,destinations}))
            setLoading(false)
        }else{
            router.replace('/regions')
        }
    }
  },[list,slug,loadingRegions])

  function setBreadCrumb(region) {
    let bc_array = [
        { text: 'Home', url: `/` },
        { text: 'Discover India', url: `/regions` },
        { text: region, url: '' },
    ];
    setBC(<BreadCrumb options={bc_array} active={region} />);
  }

  return(
    <>
      <Header color={{desktop:'black', mobile:'black'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
              <Image src={featuredImage || IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">{title}</h1>
                {/* <p className="text-xs md:text-sm lg:text-lg mt-2">Find Your Perfect Getaway for Less</p> */}
              </div>
          </div>
      </div>
      <div className="w_80_90 mt-4 lg:mt-0">
        {breadCrumb}
      </div>
      <div className="grid grid-cols-1">
        {loading || loadingRegions ? <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w_80_90 mt-8">
            <PackageBlockSkeleton />
            <PackageBlockSkeleton />
            <PackageBlockSkeleton />
          </div>
        </> : <>
        {state.destinations.map((type,i)=>{
          let {name,packages,url} = type
          if(packages.length == 0) return
          return <div className="" key={i}>
            <div className="flex items-center justify-between w_80_90">
              <div>
                <Heading styles="lg:text-5xl" text={name}/>
              </div>
            </div>
            <div className="md:my-4 lg:my-8 mb-8 pb-8 lg:mb-12 lg:pb-12 border-b border-gray-200">
              <PackageSwiper packages={packages} url={`/destinations/${url}`}/>
            </div>
          </div>
        })}
        </>}
      </div>
    </>
  )
}

  
