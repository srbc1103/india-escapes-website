'use client'

import Loader from "../../../components/Loader"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    let router = useRouter()
    useEffect(()=>{
        router.replace('/')
    },[])
  return (
    <Loader/>
  )
}
