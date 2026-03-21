'use client'

import BreadCrumb from "../../../../components/BreadCrumb"
import { Select } from "../../../../components/Input"
import PackageBlock, { BlogCard, BlogCard1, PackageBlock1, PackageBlockSkeleton } from "../../../../components/PackageBlock"
import { Skeleton } from "../../../../components/ui/skeleton"
import Header from "../../../../components/website/Header"
import { COLLECTIONS } from "../../../../constants"
import useFetch from "../../../../hooks/useFetch"
import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"


export default function Blog({params}) {
    const {url} = use(params)
    const router = useRouter()
    const { loading, data, load_detail } = useFetch({url,item_type:'blog',collection_id:COLLECTIONS.BLOGS})
    const [breadCrumb, setBC] = useState(null);
    const [state, setState] = useState({
        title:'',updatedAt:'',createdAt:'',content:'',featured_image:'',related_blogs:[]
    })
    
    useEffect(()=>{
        if(data){
            let { title, updatedAt, createdAt, content, featured_image, related } = data
            setState(s=>({...s,title, updatedAt, createdAt, content, featured_image, related_blogs : related || []}))
            setBreadCrumb(title)
            document.title = title
        }
    },[data])

    function setBreadCrumb(name) {
        let bc_array = [
            { text: 'Home', url: `/` },
            { text: 'Blogs', url: `/blogs` },
            { text: name, url: '' },
        ];
        setBC(<BreadCrumb options={bc_array} active={name} />);
    }

    useEffect(()=>{
        if(!url){
            router.replace('/blogs')
        }else{
            load_detail()
        }
    },[url])

    
  return (
    <div>
        <Header color="black" fixed/>
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
            <div className="h-[32vh] lg:h-[60vh] flex items-end justify-center relative">
                {state.featured_image ? <Image src={state.featured_image} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover opacity-30 grayscale-20" style={{zIndex:0}} alt={state.title}/> : <></>}
                <div className="bg-gradient-to-t from-white to-transparent h-full w-full absolute bottom-0 left-0"/>
                <div className="w_80_90 relative">
                    {breadCrumb}
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-2 lg:mb-4 pt-20 lg:pt-8">{state.title}</h1>
                    {(state.updatedAt || state.createdAt) ? <p className="text-xs md:text-sm lg:text-lg">{moment(state.updatedAt || state.createdAt).format('DD MMM, y')}</p> : <></>}
                </div>
            </div>
            {state.content ? <div className="w_80_90 py-12 lg:py-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div
                        className="package_ec_css text-sm lg:text-base text-gray-700 flex-1 lg:col-span-3"
                        dangerouslySetInnerHTML={{ __html: state.content }}
                    />
                    {state.related_blogs ? <div className="lg:border-l lg:pl-4 border-gray-100">
                        <div className="mt-8 mb-4">
                            <p className="text-lg font-semibold lg:text-xl flex-1" style={{lineHeight:'120%'}}>Read <span className="text-red">More</span></p>
                        </div>
                        <div className="grid gap-4">
                            {state.related_blogs.map((item,i)=>{
                                return <BlogCard1 key={i} {...item}/>
                            })}
                        </div>
                    </div> : <></>}
                </div>
            </div> : <></>}
        </>}
    </div>
  )
}
