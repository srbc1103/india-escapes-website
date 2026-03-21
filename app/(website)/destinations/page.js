'use client'

import { CategorySection, PackageBlockSkeleton } from "../../../components/PackageBlock"
import { Skeleton } from "../../../components/ui/skeleton"
import Header from "../../../components/website/Header"
import { COLLECTIONS, FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants"
import { useFeaturedImage, useFetchList } from "../../../hooks/useFetch"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
  const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.destinations})
  
  useEffect(()=>{
    document.title = 'Destinations'
  },[])

  return (
    <>
      <Header color={{desktop:'black', mobile:'black'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
              <Image src={featuredImage || IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Destinations</h1>
                <p className="text-xs md:text-sm lg:text-lg mt-2">Handpicked packages</p>
              </div>
          </div>
      </div>
      <div className="my-4">
        <PackageGroup collection_id={COLLECTIONS.DESTINATIONS} package_type="destinations"/>
      </div>

    </>
  )
  }


export function PackageGroup(props){
  let {collection_id,package_type} = props
  const { loading:loadingCategories, list:categories, total } = useFetchList({collection_id})

  return(
    <>
      {loadingCategories ? <>
        {[...Array(3)].map((_,i)=>{
          return (
            <div key={i} className="mb-20">
              <div className="flex items-center justify-between w_80_90">
                <div className="">
                  <Skeleton className="h-7 w-60 rounded-full mb-2" />
                  <Skeleton className="h-4 w-[60vw] rounded-full mb-2" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w_80_90 mt-8">
                <PackageBlockSkeleton />
                <PackageBlockSkeleton />
                <PackageBlockSkeleton />
              </div>
            </div>
          )
        })}
      </> : <>
        {categories.map((category,i)=>{
          return <CategorySection key={i} {...category} type={package_type}/>
        })}
      </>}
    </>
  )

}
  
