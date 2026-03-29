'use client'

import Header from "../../../../components/website/Header"
import { COLLECTIONS, IMAGES } from "../../../../constants"
import useFetch from "../../../../hooks/useFetch"
import usePopup from "../../../../hooks/usePopup"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { PackagesSection } from "../../destinations/[url]/page"
import { PackageBlockSkeleton } from "../../../../components/PackageBlock"
import { Skeleton } from "../../../../components/ui/skeleton"
import BreadCrumb from "../../../../components/BreadCrumb"
import { setMetaTags } from "../../../../functions"

export default function CategoryPage({params}) {
    const {category} = use(params)
    const router = useRouter()
    const { loading, data: category_detail, load_detail: loadCategory, message } = useFetch({url:category,item_type:'category',collection_id:COLLECTIONS.CATEGORIES})
    const [categoryID,setCategoryID] = useState(null)
    const [state, setState] = useState({
        name: '', description:'', image: IMAGES.hero_bg, meta_title: '', meta_description: '', meta_keywords: '', page_heading: ''
    })
    let bc_array = [
        { text: 'Home', url: `/` },
        { text: 'Trip Types', url: `/categories` },
        { text: category, url: `` },
    ]
    const [breadCrumb, setBC] = useState(<BreadCrumb options={bc_array} active={category} />);

    useEffect(()=>{
        if(category_detail){
            let { name, images, description, id, meta_title, meta_description, meta_keywords, page_heading } = category_detail
            setState(s=>({...s,name,description,image:images[0] || IMAGES.hero_bg, page_heading: page_heading || name || ''}))
            setMetaTags({meta_title: meta_title || page_heading || name, meta_description: meta_description || description, meta_keywords: meta_keywords || '',title: meta_title || page_heading || name})
            setCategoryID(id)
            // document.title = name
        }
    },[category_detail])

    useEffect(()=>{
        if(!category){
            router.replace('/categories')
        }else{
            loadCategory()
        }
    },[category])
  return (
    <div>
        <Header color={{desktop:'black',mobile:'white'}} fixed={{desktop:true,mobile:true}}/>
        {loading ? <>
            <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative overflow-hidden">
                <div className="w_80_90 relative z-10 flex-center-jc flex-col">
                    <Skeleton className="h-12 w-3/4 mb-2 lg:mb-4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            </div>
            <div className="w_80_90 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <PackageBlockSkeleton />
                    <PackageBlockSkeleton />
                    <PackageBlockSkeleton />
                </div>
            </div>
        </> : <>
            <div className="h-fit flex-center-jc relative">
                <div className="relative h-[30vh] w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl bg-black lg:py-12  lg:mt-28 lg:h-[48vh]">
                    <Image src={state.image} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 object-cover opacity-80 md:opacity-100" alt="" style={{zIndex:0}}/>
                    {/* <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white text-center p-4 mt-12 lg:mt-0">
                        <h1 className="font-medium text-xl lg:text-4xl">{state.name}</h1>
                        <p className="text-[10px] md:text-sm mt-2 lg:w-[80%]">{state.description}</p>
                    </div> */}
                </div>
            </div>
            <div className="w_80_90 mt-8">
                {breadCrumb}
            </div>
            <div className="w_80_90 py-4 md:py-8 space-y-2 md:space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red">{state.page_heading || state.name}</h1>
                <p className="text-xs md:text-sm lg:text-base text-gray-600 max-w-2xl">{state.description}</p>
            </div>
            <PackagesSection category={categoryID}/>
            <div className="mb-20"/>
        </>}
    </div>
            
  )
}
