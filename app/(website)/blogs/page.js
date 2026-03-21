'use client'

import { BlogsSection, CategorySection, PackageBlockSkeleton } from "../../../components/PackageBlock"
import { Skeleton } from "../../../components/ui/skeleton"
import Header from "../../../components/website/Header"
import { COLLECTIONS, FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants"
import { useFeaturedImage, useFetchList } from "../../../hooks/useFetch"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.blogs})
  
  useEffect(()=>{
    document.title = 'Blogs'
  },[])

  return (
    <>
      <Header color={{desktop:'black', mobile:'black'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
              <Image src={featuredImage || IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Blogs</h1>
                {/* <p className="text-xs md:text-sm lg:text-lg mt-2">Handpicked packages</p> */}
              </div>
          </div>
      </div>
      <div className="my-4 mb-20">
        <BlogsSection />
      </div>
    </>
  )
  }

