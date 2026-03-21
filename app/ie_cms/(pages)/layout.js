'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import NavBar from "../../../components/NavBar"
import SideBar from "../../../components/SideBar"
import Data from "../../../lib/backend"

export default function Layout({ children }) {
  const router = useRouter()
  useEffect(() => {
    const checkUser = async () => {
      let user = await Data.check_user()
      if (!user) {
        router.push('/ie_cms/auth')
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="h-screen bg-[#f4f4f4] md:p-2">
      <div className="block lg:grid lg:grid-cols-6">
        <SideBar/>
        <div className="flex flex-col lg:col-span-5 bg-white lg:rounded-2xl shadow-xl shadow-[#f3f3f3] px-2 lg:px-4">
          <NavBar/>
          <div className="h-[92vh] md:h-[88vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
