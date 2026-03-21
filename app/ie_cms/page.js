'use client'
import Loader from '../../components/Loader'
import Data from '../../lib/backend'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Layout() {
  const router = useRouter()
  useEffect(()=>{
    let user = Data.check_user()
    if(!user){
      router.push('/signin')
    }else{
      router.push('/dashboard')
    }
  },[])
  return <Loader/>
}
