'use client'

import { PackageBlockSkeleton, PackageSwiper } from "../../../components/PackageBlock"
import { IMAGES, REGIONS } from "../../../constants"
import { useEffect, useState } from "react"
import { useRegions } from "../../../hooks/useFetch"
import Heading from "../../../components/ui/Heading"
import Header from "../../../components/website/Header"
import Image from "next/image"
import BreadCrumb from "../../../components/BreadCrumb"

export default function Page() {
  
  const { loading: loadingRegions, regions: list } = useRegions();
  const [packages,setPackages] = useState([])
  const [loading,setLoading] = useState(true)
  const [breadCrumb, setBC] = useState(null);


  useEffect(()=>{
    document.title = 'Descover India'
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
    setBreadCrumb()
  },[list])

  function setBreadCrumb() {
    let bc_array = [
        { text: 'Home', url: `/` },
        { text: 'Discover India', url: `` },
    ];
    setBC(<BreadCrumb options={bc_array} active="Discover India" />);
}

  return(
    <>
      <Header color={{desktop:'black', mobile:'black'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-16 lg:mt-12">
              <Image src={IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-black/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Regions</h1>
                <p className="text-xs md:text-sm lg:text-lg mt-2">Find Your Perfect Getaway for Less</p>
              </div>
          </div>
      </div>
      <div className="w_80_90">
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
        {packages.map((type,i)=>{
          let {region,packages,slug} = type
          if(packages.length == 0) return
          return <div className="" key={i}>
            <div className="flex items-center justify-between w_80_90">
              <div>
                <Heading styles="lg:text-5xl" text={region}/>
              </div>
            </div>
            <div className="md:my-4 lg:my-8 mb-8 pb-8 lg:mb-12 lg:pb-12 border-b border-gray-200">
              <PackageSwiper packages={packages} url={`/regions/${slug}`}/>
            </div>
          </div>
        })}
        </>}
      </div>
    </>
  )
}

  
