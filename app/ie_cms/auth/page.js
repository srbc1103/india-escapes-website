'use client'
import { account } from '../../../lib/appwrite'
import Button from '../../../components/Buttons'
import Input from '../../../components/Input'
import Data from '../../../lib/backend'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { HASH } from '../../../constants'

export default function Page() {
  const router = useRouter()
  useEffect(() => {
    const checkUser = async () => {
      let user = await Data.check_user()
      if (user) {
        router.push('/ie_cms/dashboard')
      } else {
        document.title = "Login - India Escapes CMS"
      }
    }
    checkUser()
  }, [router])
  const [state,setState] = useState({
    username:'',password:''
  })
  const [loading,setLoading] = useState(false)

  async function handleLogin(e){
    e.preventDefault()
    let {username,password} = state
    if(!username || !password){
      toast.error("Please enter username and password")
      return
    }
    setLoading(true)
    Data.login({username,password}).then(d=>{
      let {status,message} = d  
      if(status == 'success'){
        toast.success('Login successful!')
        router.push('/ie_cms/dashboard')
      }else{
        if(message == 'Creation of a session is prohibited when a session is active.'){
            account.getSession('current').then(session => {
              if(session && session.$id && session.userId){
                Cookies.set(HASH.TOKEN, session.$id, { expires: 365 })
                const userID = session.userId
                Data.setUser({userID})
                toast.success('Login successful!')
                router.push('/ie_cms/dashboard')
              }else{
                toast('Session error. Please try again.')
              }
            }).catch(() => {
              toast('Session error. Please try again.')
            })
        }
        // toast.error(message)
      }
    }).catch(err=>{
      toast.error(err.message)
    }).finally(()=>{
      setLoading(false)
    })  
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100/50">
      <div className="p-4 py-8 rounded-xl w-[90%] md:w-[400px] bg-white border">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4 px-4">
            <Input label="Username" value={state.username} onChange={(e)=>setState(state=>({...state,username:e.target.value}))} placeholder="Enter Username"/>
            <Input label="Password" value={state.password} onChange={(e)=>setState(state=>({...state,password:e.target.value}))} placeholder="Password" password/>
          </div>
          <div className="flex items-center justify-center mt-6">
            <Button disabled={loading || !state.username || !state.password} styles="">Login</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
