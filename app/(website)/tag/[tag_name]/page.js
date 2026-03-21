'use client'

import { Select } from "../../../../components/Input"
import PackageBlock, { PackageBlockSkeleton } from "../../../../components/PackageBlock"
import Heading from "../../../../components/ui/Heading"
import { Skeleton } from "../../../../components/ui/skeleton"
import DetailBlock from "../../../../components/website/DetailBlock"
import Header from "../../../../components/website/Header"
import { COLLECTIONS, IMAGES } from "../../../../constants"
import useFetch from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Data from "../../../../lib/backend"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { PackagesSection } from "../../destinations/[url]/page"


export default function Destination({params}) {
    const {tag_name} = use(params)
    let tag = tag_name?.replaceAll('-',' ')
    const router = useRouter()

    useEffect(()=>{
        if(!tag_name){
            router.replace('/packages')
        }else{
            document.title = tag || tag_name
        }
    },[tag, tag_name])

    
  return (
    <div>
        <Header color="black" fixed={{mobile:true,desktop:true}}/>
        <>
            <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
                <Image src={IMAGES.hero_bg} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover opacity-40 grayscale-50" style={{zIndex:0}} alt=""/>
                <div className="bg-gradient-to-t from-white to-transparent h-full w-full absolute bottom-0 left-0"/>
                <div className="w_80_90 relative">
                    <h1 className="text-3xl md:text-5xl font-bold mb-2 lg:mb-4 pt-20 lg:pt-0 capitalize">{tag}</h1>
                </div>
            </div>
            <PackagesSection tag={tag}/>
            <div className="mb-20"/>
        </>
    </div>
  )
}

