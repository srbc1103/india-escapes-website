'use client'

import BreadCrumb from "../../../components/BreadCrumb"
import { PackageBlockSkeleton } from "../../../components/PackageBlock"
import Header from "../../../components/website/Header"
import { COLLECTIONS, FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants"
import useFetch, { useFeaturedImage, useFetchList } from "../../../hooks/useFetch"
import { BrushCleaning } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function Page() {
  const { loading, list, load_list, message, total } = useFetchList({collection_id:COLLECTIONS.CATEGORIES})
  let bc_array = [
      { text: 'Home', url: `/` },
      { text: 'Trip Types', url: `` },
  ]
  const [breadCrumb, setBC] = useState(<BreadCrumb options={bc_array} active="Trip Types" />);
const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.categories})

  return (
    <>
      <Header color={{desktop:'black', mobile:'black'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
              <Image src={featuredImage || IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Categories</h1>
                <p className="text-xs md:text-sm lg:text-lg mt-2">Where every byte leads to adventure</p>
              </div>
          </div>
      </div>
      <div className="w_80_90">
        {breadCrumb}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 lg:mt-8 w_80_90 mb-20">
        {loading ? <>
          <PackageBlockSkeleton hide_content={true}/>
          <PackageBlockSkeleton hide_content={true}/>
          <PackageBlockSkeleton hide_content={true}/>
        </> : list.length == 0 ? <>
          <div className="md:col-span-2 lg:col-span-3 py-20 flex-center-jc flex-col gap-4">
            <BrushCleaning size={200} className="text-gray-200"/>
            <p className="text-lg text-gray-400">No category created</p>
          </div>
        </> : <>
          {list.map((category,i)=>{
            let {id,name,url,images} = category
            let image = images[0] || null

            return <Link key={i} href={`/categories/${url}`}>
              <div className="h-88 lg:h-108 rounded-3xl group overflow-hidden relative">
                <Image src={image || IMAGES.placeholder} height={400} width={400} className="h-full w-full absolute object-cover transition duration-300 group-hover:scale-110" alt="" style={{zIndex:-1}}/>
                <div className="h-full w-full flex items-start p-4 justify-end flex-col ralative bg-gradient-to-t from-black/50 to-transparent text-white z-10">
                  <p className="font-medium text-lg lg:text-xl">{name}</p>
                </div>
              </div>
            </Link>
          })}
        </>}
      </div>
    </>
  )
}
