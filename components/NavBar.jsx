'use client'

import Data from "../lib/backend"
import { RoundButton } from "./Buttons"
import { Menu } from "lucide-react"

export default function NavBar() {
  return (
    <div className="h-16 border-b flex-center-jb">
      <div>
        <p className="text-xs">Welcome</p>
        <p className="text-lg md:text-xl font-semibold -mt-1 lg:-mt-[2px]">{Data.name}!</p>
      </div>
      <div className="flext-center-jc gap-2">
        <RoundButton styles="p-2 rounded-full lg:opacity-0 shadow-none" onClick={()=>{
          document.querySelector('nav').classList.add('show')
        }}><Menu size={24}/></RoundButton>
      </div>
    </div>
  )
}
