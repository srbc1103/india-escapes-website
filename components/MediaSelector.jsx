import Data from "../lib/backend"
import { useEffect, useState } from "react"
import MediaItem from "./MediaItem"
import { Check, Plus, RefreshCcw } from "lucide-react"
import Link from "next/link"
import Input from "./Input"
import { toast } from "sonner"
import Button from "./Buttons"

export default function MediaSelector(props) {
    const {type,onSelect,onCancel,selection_limit,selected_files} = props
    const [search,setSearch] = useState('')
    const [total,setTotal] = useState(0)
    const [state,setState] = useState({
        list: [], filtered_list: []
    })
    const [selected,setSelected] = useState(selected_files || [])
    const [loading,setLoading] = useState(true)

    const fetchMediaList = async () => {
        setLoading(true)
        Data.list_files({
          limit: 1000,
        }).then(d=>{
          let {status,message} = d
          if(status == 'success'){
            let {files} = d
            setTotal(d.total);
            let list = files
            if(type){
                list = list.filter(e=>e.mime_type?.startsWith(type))
            }
            setState(s=>({...s,list,filtered_list:list}))
          }else{
            toast.error(message);
          }
        }).catch(err=>{
          toast.error(err.message);
        }).finally(()=>{
          setLoading(false)
        })
    };

    useEffect(()=>{
        let q = search
        let list = state.list
        if(q){
            list = list.filter(e=>e.tags?.toLowerCase().includes(q.toLowerCase()) || e.name?.toLowerCase().includes(q.toLowerCase()))
        }
        setState(s=>({...s,filtered_list:list}))
    },[search])

    useEffect(()=>{
        fetchMediaList()
    },[])

  return (
    <div className="w-full p-8">
        <p className="w-[80%] mx-auto font-medium text-lg md:text-xl gradient_text pb-2 mb-8 border-b text-center border-b-gray-300">Select Media</p>
        <div className="py-4">
            <Input label="Search tag" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search tag..." styles="max-w-[400px]"/>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 h-[40vh] overflow-y-auto">
            <Link target="_blank" href="/ie_cms/media" className="h-20 md:h-24 w-full flex items-center justify-center bg-gray-100 rounded-lg" role="button">
                <Plus size={40}/>
            </Link>
            {state.filtered_list.map((media,ind)=>{
                const {url} = media
                const is_selected = selected.find(e=>e == url) ? true : false
                return <MediaItem key={ind} {...media} reload={()=>{}} as_selection selected={is_selected} onSelect={()=>{
                    if(is_selected){
                        let list = selected.filter(e=>e != url)
                        setSelected(list)
                    }else{
                        if(selection_limit && selected.length == selection_limit){
                            toast.info(`You can select only ${selection_limit} files.`);
                            return
                        }
                        let list = [...selected,url]
                        setSelected(list)
                    }
                }} height="h-20 md:h-24"/>
            })}
        </div>
        <div>
            <div className="flex-center-jc gap-2 ">
                <Button onClick={fetchMediaList} disabled={loading} styles="px-4 py-2 bg-black/10 text-black rounded-lg hover:bg-black hover:text-white flex items-center gap-2 justify-center" > <RefreshCcw size={18} /> Refresh </Button>
                <Button onClick={()=>onSelect(selected)} disabled={loading || selected.length == 0} styles="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 justify-center" > <Check size={18} /> Select </Button>
            </div>
        </div>
    </div>
  )
}
