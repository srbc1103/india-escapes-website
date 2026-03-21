import { generateID } from "../functions"
import { useState } from "react"

export const useCUD = ({items = []} = {}) =>{
    const [list,setList] = useState(items || [])

    const add_new_item = (obj)=>{
        if(!obj || typeof obj !== 'object'){
            console.log('Invalid item provided')
            return
        }
        let id = obj?.id || generateID()
        let item = obj
        item.id = id
        setList(s=>([...s,item]))
    }

    const reset_list = list =>{
        setList(list)
    }

    const update_item = (obj)=>{
        if(!obj || typeof obj !== 'object'){
            console.log('Invalid item provided')
            return
        }
        let {id} = obj
        let ind = list.findIndex(e=>e.id == id)
        if(ind !== -1){
            let l = [...list]
            l[ind] = obj
            setList(l)
        }
    }

    const delete_item = id =>{
        const updated_items = list.filter(e=>e.id !== id)
        setList(updated_items)
    }

    return {list, add_new_item, update_item, delete_item, reset_list}
}