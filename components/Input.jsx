'use client'

import { AlertCircle, CalendarIcon, Check, CheckIcon, ChevronDown, ChevronDownCircle, ChevronsUpDown, Eye, EyeOff, Plus, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "../lib/utils"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { toast } from "sonner";
import { Editor } from '@tinymce/tinymce-react';
import { formatDate, timeToFullDate } from "../functions"

export default function Input(props) {
    let {label,styles,text,password,readOnly,text_styles,input_styles,value} = props
    let [showPwToggle,setShowPwToggle] = useState(password ? true : false)
    let [mode,setMode] = useState('password')
  return (
    <div className={cn(`input_grp relative`,styles)}>
        {label && <label className="text-xs ml-1 block mb-1 capitalize">{label}</label>}
        <input type={password ? mode : ''} className={cn(`input_box relative`,input_styles)} {...props} autoComplete="off" title={label} readOnly={readOnly} value={value || ''}/>
        {text && <p className={cn(`text-xs text-gray-500 dark:text-white mt-1 ml-1`,text_styles)}>{text}</p>}
        {showPwToggle && <>
        <button className="absolute grid items-center h-[40%] bg-white dark:bg-black top-[60%] right-2 translate-y-[-38%] px-1" type="button" onClick={()=>setMode(s=>s == 'password' ? 'text' : 'password')}>
          {mode !== 'password' ? <Eye size={16} title="Show Password"/> : <EyeOff size={16} title="Hide Password"/>}
        </button>
      </>}
    </div>
  )
}

export function PhoneNumberInput(props) {
  let {label,fun,val,styles} = props
  useEffect(()=>{
    document.querySelector('._phninp').querySelector('input').classList.remove('PhoneInputInput')
    document.querySelector('._phninp').querySelector('input').focus()
  },[])
  const [value, setValue] = useState(val || '');
  const [error, setError] = useState('');
  const handleChange = (phoneNumber) => {
    if (phoneNumber?.length > 13) return;
    setValue(phoneNumber);
    
    if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
      setError("");
      fun(phoneNumber);
    } else {
      setError("Please enter a valid number.");
      fun("");
    }
  };
  return (
    <div className={cn(`input_grp relative _phninp`, styles)}>
      <p className="text-xs ml-1 block mb-1 capitalize">{label}</p>
      <PhoneInput
        placeholder="9876543210"
        defaultCountry="IN"
        className={`input_box relative ${error && 'ring-1 ring-red'}`}
        onChange={handleChange}
        value={value}
        />
      {error && <p className="text-xs text-red text-left absolute -bottom-5 left-2 flex gap-1 items-center justify-start"><AlertCircle size={12} className="-mt-[2px]"/> {error}</p>}
    </div>
  )
}

export function InputPH(props) {
  let {styles} = props
  return (
    <div className={cn(`input_grp relative`, styles)}>
      <div className="text-xs ml-1 block mb-1 capitalize h-4 w-24 bg-purple/5 dark:bg-purple/10 rounded animate-pulse"></div>
      <div className="input_box relative h-10 bg-purple/5 dark:bg-purple/10 rounded animate-pulse"></div>
    </div>
  )
}

export function Input1(props) {
return (
    <input className="outline-none border-b transition duration-300 p-1 bg-transparent focus:border-b-blue inline-block w-full font-medium md:pt-[2px] dark:border-b-gray-100/20" {...props} autoComplete="off"/>
)
}

export function Select(props){
    let {label, options, styles, value, input_styles, placeholder} = props
    let styles_string = `input_grp ${styles}`
    return (
      <div className={styles_string}>
            {label && <label className="text-xs ml-1 block mb-1">{label}</label>}
            <select className={cn(`input_box capitalize`, input_styles)} {...props} autoComplete="off">
                <option value="">{`${placeholder || `Select ${label}`}`}</option>
                {options.map(o=>{
                    let {id,name} = o
                    return (<option value={id} key={id} className="capitalize">{name}</option>)
                })}
            </select>
        </div>
    )
}

export function TextArea(props) {
    let {label,styles,value} = props
  return (
    <div className={cn(`input_grp`,styles)}>
        <label className="text-xs ml-1 block mb-1">{label}</label>
        <textarea className="input_box" {...props} value={value || ''} autoComplete="off" title={label}></textarea>
    </div>
  )
}


export function MultiSelect(props){
  let {list,selected,label,setSelected} = props
  let [showList,setShowList] = useState(false)
  let [search,setSearch] = useState('')
  let [listContent,setListContent] = useState([])
  let [state,setState] = useState({
    selected: selected || [],
    list
  })
  let selectItem = id=>{
    let {selected} = state
    let isThere = selected.includes(id)
    if(!isThere){
      let ar = selected.concat(id)
      setSelected(ar)
      setState(s=>({...s,selected:ar}))
      setSearch('')
    }
    setShowList(false)
  }
  let handleChange = e=>{
    let v = e.target.value
    setSearch(v)
    let {list,selected} = state
    if(v !== ''){
      let l = list.filter(item=>item.name.toLowerCase().match(v.toLowerCase()) && selected.indexOf(item.id) === -1 )
      setListContent(l)
    }else{
      onFocusFilter()
    }
  }
  let styles_string = `relative input_grp`
  const removeItem = id =>{
    let {selected} = state
    let items = selected.filter(e=>e!== id)
    setSelected(items)
    setState(s=>({
      ...s,selected:items
    }))
  }
  let onFocusFilter = ()=>{
    let {list,selected,value} = state
    let l = []
    list.forEach(s=>{
      let isThere = selected.find(e=>e === s.id)
      if(!isThere){
        if(value){
          if(s.name.toLowerCase().match(value.toLowerCase())){
            l.push(s)
          }
        }else{
          l.push(s)
        }
      }
    })
    setListContent(l)
    setShowList(true)
  }
  return (
    <div className={styles_string} 
      onBlur={()=>{
        setTimeout(()=>{
          setShowList(false)
        },300)
      }}
    >
        {label && <label className="text-xs ml-1 block mb-1">{label}</label>}
        <input className="input_box" {...props} autoComplete="off" value={search} onChange={handleChange} onFocus={onFocusFilter}/>
        {showList && 
          <div className="rounded-md bg-white shadow-md absolute top-18 left-[50%] w-[97%] max-h-[200px] overflow-y-auto  border dark:border-gray-100/10z-10 translate-x-[-50%]">
            {listContent.map((l,i)=>{
              let {id,name} = l
              return (
                <div className={`capitalize text-sm text-gray-700 cursor-pointer duration-300 transition hover:bg-gray-200/50 p-3 py-2 ${i!== 0 && 'border-t border-t-gray-200/50'}`} role="button" onClick={()=>selectItem(id)} key={i}>{`${name}`}</div>
              )
            })}
          </div>
        }
        {state.selected.length > 0 && 
        <div className="mt-1 flex flex-wrap gap-x-1">
          {state.selected.map((i,ind)=>{
            let item = list.find(e=>e.id == i)
            if(item){
              let {name} = item
              return(
                <div key={ind} className="bg-black text-white p-1 items-center inline-flex rounded-xl max-w-[80px] md:max-w-[120px] cursor-context-menu">
                  <p className="capitalize ml-1 text-xs">{name}</p>
                  <button type="button" onClick={()=>removeItem(i)} className="text-black aspect-square h-3 rounded-full ml-2 duration-300 transition bg-white flex text-center items-center justify-center"><X size={10}/></button>
                </div>
              )
            }
          })}
        </div>
        }
    </div>
  )
}

export function MultiSelect1({ list, selected, label, setSelected, styles, placeholder }) {
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState([]);
  const [state, setState] = useState({ value: "", selected: selected || [] });
  const ref = useRef(null); 

  useEffect(() => {
    setListContent(list);
    let items = []
    selected?.forEach(s=>{
      let is_there = list?.find(e=>e.id == s)
      if(is_there){
        items.push(s)
      }
    })
    set_value(items);
  }, [list, selected]);

  useEffect(() => {
    const handleClickOutside = (e) => !ref.current.contains(e.target) && setShowList(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filter = (e) => {
    let v = e.target.value.replace(/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/]/g, "");
    setListContent(v ? list.filter((l) => l.name.toLowerCase().includes(v.toLowerCase())) : list);
  };

  const selectItem = (id) => {
    let arr = state.selected.includes(id) ? state.selected.filter((e) => e !== id) : [...state.selected, id];
    setState((s) => ({ ...s, selected: arr }));
    set_value(arr);
    setSelected(arr);
  };

  const set_value = (selected) => {
    let str = selected
      .map((s, i) => {
        let name = list.find((e) => e.id === s)?.name || "";
        return i === selected.length - 1 && selected.length > 1 ? `and ${name}` : name;
      })
      .join(", ");
    setState((s) => ({ ...s, value: str,selected }));
  };

  return (
    <div ref={ref} className={`relative input_grp ${styles}`}>
      {label && <label className="text-xs ml-1 block mb-1">{label}</label>}
      <div
        role="button"
        className="group relative cursor-text whitespace-nowrap block w-full"
        onClick={() => setShowList(true)}
      >
        <p className="input_box overflow-ellipsis overflow-hidden mr-3">
          {state.value || placeholder || "Select Option"}
        </p>
        <p className="absolute right-2 top-[50%] translate-y-[-50%] text-gray-500">
          <ChevronDownCircle size={15} className={`${showList ? 'rotate-180' : ''} transition duration-300 text-bg-black`}/>
        </p>
        {showList && (
          <div className="rounded-md bg-white dark:bg-black shadow-md absolute top-[3.1rem] left-[50%] w-[100%] border dark:border-gray-100/10 z-10 translate-x-[-50%]">
            <div className="p-2">
              <input
                className="bg-white/30 dark:bg-black text-bg-black p-2 dark:text-white rounded-md outline-none transition duration-300 w-full border-2 dark:border-gray-100/10 focus:bg-white/50 text-sm"
                placeholder={`Search ${label}...`}
                onChange={filter}
                autoFocus={true}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto ">
              {listContent.map((l, i) => {
                let { id, name } = l;
                let isThere = state.selected.includes(id);
                return (
                  <div
                    className={`capitalize text-sm text-gray-700 dark:text-white cursor-pointer duration-300 transition p-3 py-2 ${
                      i !== 0 && "border-t border-t-gray-200/50"
                    } flex items-center justify-start ${
                      isThere ? "bg-blue/5" : "bg-white dark:bg-black hover:brightness-[103%]"
                    }`}
                    role="button"
                    key={i}
                    onClick={() => selectItem(id)}
                  >
                    <div
                      className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition ${
                        isThere ? "text-white bg-black" : "bg-none text-gray-200"
                      }`}
                    >
                      <Check size={12} />
                    </div>{" "}
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export function MultiSelect2({ list, selected, label, setSelected, styles, placeholder }) {
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState([]);
  const [state, setState] = useState({ value: "", selected: selected || [] });
  const ref = useRef(null); 

  useEffect(() => {
    setListContent(list);
    set_value(selected);
  }, [list, selected]);

  useEffect(() => {
    const handleClickOutside = (e) => !ref.current.contains(e.target) && setShowList(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filter = (e) => {
    let v = e.target.value.replace(/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/]/g, "");
    setListContent(v ? list.filter((l) => l.name.toLowerCase().includes(v.toLowerCase())) : list);
  };

  const selectItem = (id) => {
    let arr = state.selected.includes(id) ? state.selected.filter((e) => e !== id) : [...state.selected, id];
    setState((s) => ({ ...s, selected: arr }));
    set_value(arr);
    setSelected(arr);
  };

  const set_value = (selected) => {
    let str = selected
      .map((s, i) => {
        let name = list.find((e) => e.id === s)?.name || "";
        return i === selected.length - 1 && selected.length > 1 ? `and ${name}` : name;
      })
      .join(", ");
    setState((s) => ({ ...s, value: str }));
  };

  return (
    <div ref={ref} className={`relative input_grp ${styles}`}>
      {label && <label className="text-xs ml-1 block mb-1">{label}</label>}
      <div
        role="button"
        className="group relative cursor-text whitespace-nowrap block w-full"
        onClick={() => setShowList(true)}
      >
        <p className="input_box overflow-ellipsis overflow-hidden mr-3">
          {state.value || placeholder || "Select Option"}
        </p>
        <p className="absolute right-2 top-[50%] translate-y-[-50%] text-gray-500">
          <ChevronsUpDown size={15} />
        </p>
        {showList && (
          <div className="rounded-md bg-white dark:bg-black shadow-md absolute top-[3.1rem] left-[50%] w-[100%] border dark:border-gray-100/10 z-10 translate-x-[-50%]">
            <div className="p-2">
              <input
                className="bg-gray-100/50 dark:bg-black p-2 dark:text-white rounded-md outline-none transition duration-300 w-full border-2 dark:border-gray-100/10 focus:bg-white focus:shadow-md text-sm"
                placeholder={`Search ${label}...`}
                onChange={filter}
                autoFocus={true}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto ">
              {listContent.map((l, i) => {
                let { id, name, date } = l;
                let isThere = state.selected.includes(id);
                return (
                  <div
                    className={`capitalize text-xs text-gray-700 dark:text-white cursor-pointer duration-300 transition p-3 py-2 ${
                      i !== 0 && "border-t border-t-gray-200/50"
                    } flex items-center justify-start ${
                      isThere ? "bg-blue/5" : "bg-white dark:bg-black hover:bg-gray-100/50"
                    }`}
                    role="button"
                    key={i}
                    onClick={() => selectItem(id)}
                  >
                    <div
                      className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition ${
                        isThere ? "text-white bg-blue" : "bg-none text-gray-200"
                      }`}
                    >
                      <Check size={12} />
                    </div>{" "}
                    {`${name} (${date})`}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="w-full p-2 px-0">
        <ul className="grid gap-1">
          {listContent.map((s, i) => {
            let is_there = state.selected.includes(s.id);
            if(is_there){
              let {id,name,date} = s
              return <li className={`border border-gray-400/60 rounded-lg p-2 text-xs bg-blue/5 flex items-center justify-start transition duration-300 hover:bg-blue/10 w-fit min-w-[52%]`} role="button" key={i} onClick={() => selectItem(id)}>
              <div
                  className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition text-white bg-blue`}
                >
                  <Check size={12} />
                </div>{" "}
              {`${name} (${date})`}</li>
            }
          })}
        </ul>
      </div>
    </div>
  );
}

export function SelectInput1(props) {
  let { selected, label, styles, placeholder, fun, options,inputStyles,readOnly,hide_search,hide_checkbox,disabled, as_filter, addFun } = props;
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState([]);
  const [state, setState] = useState({ value: "", selected: selected || "" });
  const ref = useRef(null);

  useEffect(() => setListContent(options || []), [options]);
  useEffect(() => set_value(selected), []);
  useEffect(() => {
    if (!selected) setState((s) => ({ ...s, selected: "", value: "" }));
  }, [selected]);
  useEffect(() => {
    const handleClickOutside = (e) => !ref.current.contains(e.target) && setShowList(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filter = (e) => {
    let v = e.target.value.replace(/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/]/g, "");
    setListContent(v ? options?.filter((l) => l.name.toLowerCase().includes(v.toLowerCase())) : options || []);
  };

  const selectItem = (id) => {
    if (state.selected == id) {
      setState((s) => ({ ...s, selected: "", value: "" }));
      fun("");
    } else {
      setState((s) => ({ ...s, selected: id, value: options.find((e) => e.id == id)?.name || "" }));
      fun(id);
    }
    setTimeout(() => {
      setShowList(false);
    }, 100);
  };

  const set_value = (s) => {
    let name = options?.find((e) => e.id == s)?.name || "";
    setState((s) => ({ ...s, value: name }));
    setListContent(options)
  };

  return (
    <div ref={ref} className={cn(`relative input_grp ${disabled && 'opacity-60'} ${as_filter ? 'p-0' : ''}`,styles)}>
      {label && <label className={`${as_filter ? 'text-[10px]' : 'text-xs'}  ml-1 block mb-1 whitespace-nowrap truncate`}>{label}</label>}
      <div role="button" className={cn(`input_box group relative cursor-pointer whitespace-nowrap  disabled:opacity-80 disabled:pointer-events-none ${as_filter ? 'text-sm p-2 min-h-[10px] h-auto' : ''} `,inputStyles)} onClick={() => !readOnly && !disabled && setShowList(true)} disabled={disabled}>
        <p className={`overflow-ellipsis overflow-hidden mr-3 capitalize`}>{state.value || placeholder || "Select Option"}</p>
        <p className={`absolute right-2 top-[50%] translate-y-[-50%] text-gray-500`}><ChevronDown size={15} className={`${showList ? 'rotate-180' : ''} transition duration-300 text-bg-black`}/></p>
        {showList && (
          <div className={`rounded-md bg-white dark:bg-black dark:text-white shadow absolute top-[3.1rem] left-0 w-[100%] border dark:border-gray-100/10 z-10 shadow-purple/10 ${as_filter ? 'md:min-w-[200px]' : ''}`}>
            {!hide_search && <div className="p-2">
              <input
                className="bg-white/30 dark:bg-black text-bg-black p-2 dark:text-white rounded-md outline-none transition duration-300 w-full border-2 dark:border-gray-100/10 focus:bg-white/50"
                placeholder={`Search ${label || ""}...`}
                onChange={filter}
                autoFocus={true}
                autoComplete="off"
              />
            </div>}
            <div className="max-h-[200px] overflow-y-auto">
              {listContent.map((item, i) => {
                let { id, name } = item
                return <div
                  key={i}
                  role="button"
                  className={`capitalize text-xs md:text-sm text-gray-700 dark:text-white cursor-pointer duration-300 transition p-3 py-2 ${i !== 0 && "border-t border-t-gray-200/50 dark:border-t-gray-100/10"} flex items-center justify-start ${hide_checkbox && state.selected == id && 'border-l-4 border-bg-black'} ${
                    state.selected == id ? "bg-blue/5" : "hover:bg-gray-100/50 dark:hover:bg-gray-200/5"
                  }`}
                  onClick={() => selectItem(id)}
                >
                  {!hide_checkbox && <div
                    className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition ${
                      state.selected == id ? "text-white bg-black" : "bg-none text-gray-200"
                    }`}
                  >
                    <Check size={12} />
                  </div>}
                  <p>
                    {name}
                    {item.text && <span className="text-xs text-bg-black block">{`(${item.text})`}</span>}
                  </p>
                </div>
              })}
              {addFun && <div
                  role="button"
                  className={`capitalize text-xs md:text-sm cursor-pointer duration-300 transition p-3 py-2 border-t border-t-gray-200/50 dark:border-t-gray-100/10 flex items-center justify-start truncate bg-black text-white rounded-b hover:brightness-110`}
                  onClick={addFun}
                  title={`Add New ${label}`}
                >
                  <div
                    className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition`}
                  >
                    <Plus size={12} />
                  </div>
                  <p className="trucate">
                    {`Add New`}
                  </p>
                </div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CitySelectInput1(props) {
  let { selected, label, styles, placeholder, fun, options, filterInp } = props
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState([]);
  const [state, setState] = useState({ value: "", selected: selected || "" });
  const ref = useRef(null);

  useEffect(() => setListContent(options || []), [options]);
  useEffect(() => {
    set_value(selected)
    const handleClickOutside = (e) => !ref.current.contains(e.target) && setShowList(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filter = (e) => {
    let v = e.target.value.replace(/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/]/g, "");
    setListContent(v ? options?.filter((l) => ( l.name.toLowerCase().includes(v.toLowerCase()) || l.additional_details.toLowerCase().includes(v.toLowerCase()) || l.state?.toLowerCase().includes(v.toLowerCase()))) : options || []);
  };

  const selectItem = (id) => {
    if (state.selected === id) {
      setState((s) => ({ ...s, selected: "", value: "" }));
      fun("");
    } else {
      let value = options.find((e) => e.id === id)?.name || ""
      setState((s) => ({ ...s, selected: id, value}));
      fun(id,value);
    }
    setTimeout(() => {
      setShowList(false);
      setListContent(options || [])
    }, 100);
  };

  const set_value = (s) => {
    if(s){
      let name = options?.find((e) => e.id == s)?.name || "";
      setState((s) => ({ ...s, value: name }));
      setListContent(options)
    }
    
  };

  return (
    <div ref={ref} className={`relative input_grp ${styles}`}>
      {label && <label className="text-xs ml-1 block mb-1">{label}</label>}
      <div role="button" className={`input_box group relative cursor-text whitespace-nowrap ${filterInp && 'rounded-full md:min-w-[15vw]'}`} onClick={() => setShowList(true)}>
        <p className="vls overflow-ellipsis overflow-hidden mr-3 capitalize">{state.value || placeholder || "Select Option"}</p>
        <p className="absolute right-2 top-[50%] translate-y-[-50%] text-gray-500"><ChevronsUpDown size={15} /></p>
        {showList && (
          <div className="rounded-md bg-white dark:bg-black dark:text-white shadow-md absolute top-[3.1rem] left-[50%] w-[100%] border dark:border-gray-100/10 z-10 translate-x-[-50%]">
            <div className="p-2">
              <input
                className="bg-gray-100/50 dark:bg-black p-2 dark:text-white rounded-md outline-none transition duration-300 w-full  border-2 dark:border-gray-100/10 focus:bg-white focus:shadow-md"
                placeholder={`Search ${label || ""}...`}
                onChange={filter}
                autoFocus={true}
                autoComplete="off"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto ">
              {listContent.map((l, i) => {
                let { id, name, additional_details } = l;
                let isThere = state.selected == id;
                return (
                  <div
                    className={`capitalize text-xs text-gray-700 dark:text-white cursor-pointer duration-300 transition p-3 py-2 ${
                      i !== 0 && "border-t border-t-gray-200/50 dark:border-t-gray-100/10"
                    } ${isThere ? "bg-blue/5" : "hover:bg-gray-100/50 dark:hover:bg-gray-200/5"}`}
                    role="button"
                    onClick={() => selectItem(id)}
                    key={i}
                  >
                    <div className="flex items-center justify-start">
                      <div
                        className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition ${
                          isThere ? "text-white bg-blue" : "bg-none text-gray-200"
                        }`}
                      >
                        <Check size={12} />
                      </div>
                      {name}
                    </div>
                    <p className="text-gray-500 ml-6 dark:text-gray-200" style={{ fontSize: 9 }}>{additional_details}</p>
                    {l.state && <p className="text-gray-500 ml-6 dark:text-gray-200" style={{ fontSize: 8 }}>State: {l.state}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CitySelectInput2(props) {
  let { selected, label, styles, placeholder, fun, options } = props
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState([]);
  const [state, setState] = useState({ value: "", selected: selected || "" });
  const ref = useRef(null);

  useEffect(() => setListContent(options || []), [options]);
  useEffect(() => {
    set_value(selected)
    const handleClickOutside = (e) => !ref.current.contains(e.target) && setShowList(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filter = (e) => {
    let v = e.target.value.replace(/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/]/g, "");
    setListContent(v ? options?.filter((l) => ( l.name.toLowerCase().includes(v.toLowerCase()) || l.additional_details.toLowerCase().includes(v.toLowerCase()) || l.state?.toLowerCase().includes(v.toLowerCase()))) : options || []);
  };

  const selectItem = (id) => {
    if (state.selected === id) {
      setState((s) => ({ ...s, selected: "", value: "" }));
      fun("");
    } else {
      let value = options.find((e) => e.id === id)?.name || ""
      setState((s) => ({ ...s, selected: id, value}));
      fun(id,value);
    }
    setTimeout(() => {
      setShowList(false);
      setListContent(options || [])
    }, 100);
  };

  const set_value = (s) => {
    if(s){
      let name = options?.find((e) => e.id == s)?.name || "";
      setState((s) => ({ ...s, value: name }));
      setListContent(options)
    }
    
  };

  return (
    <div ref={ref} className={`relative input_grp w-[50%] lg:w-[35%]`}>
      <div role="button" className="group relative cursor-text whitespace-nowrap text-xs border border-gray-200 dark:border-gray-200/10 p-[.55rem] w-full rounded-full" onClick={() => setShowList(true)}>
        <p className="vls overflow-ellipsis overflow-hidden mr-3 capitalize">{state.value || placeholder || "Select Location"}</p>
        <p className="absolute right-2 top-[50%] translate-y-[-50%] text-gray-500"><ChevronsUpDown size={12} /></p>
        {showList && (
          <div className="rounded-md bg-white dark:bg-black dark:text-white shadow-md absolute top-[3.1rem] left-[50%] w-[100%] border dark:border-gray-100/10 z-10 translate-x-[-50%]">
            <div className="p-2">
              <input
                className="bg-gray-100/50 dark:bg-black p-2 dark:text-white rounded-md outline-none transition duration-300 w-full  border-2 dark:border-gray-100/10 focus:bg-white focus:shadow-md"
                placeholder={`Search ${label || ""}...`}
                onChange={filter}
                autoFocus={true}
                autoComplete="off"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto ">
              {listContent.map((l, i) => {
                let { id, name, additional_details } = l;
                let isThere = state.selected == id;
                return (
                  <div
                    className={`capitalize text-xs text-gray-700 dark:text-white cursor-pointer duration-300 transition p-3 py-2 ${
                      i !== 0 && "border-t border-t-gray-200/50 dark:border-t-gray-100/10"
                    } ${isThere ? "bg-blue/5" : "hover:bg-gray-100/50 dark:hover:bg-gray-200/5"}`}
                    role="button"
                    onClick={() => selectItem(id)}
                    key={i}
                  >
                    <div className="flex items-center justify-start">
                      <div
                        className={`flex items-center justify-center h-4 aspect-square mr-2 rounded-md border-1 duration-300 transition ${
                          isThere ? "text-white bg-blue" : "bg-none text-gray-200"
                        }`}
                      >
                        <Check size={12} />
                      </div>
                      {name}
                    </div>
                    <p className="text-gray-500 ml-6 dark:text-gray-200" style={{ fontSize: 10 }}>{additional_details}</p>
                    {l.state && <p className="text-gray-500 ml-6 dark:text-gray-200 -mt-1" style={{ fontSize: 9 }}>State: {l.state}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export function SearchInput(props){
  let {placeholder,fun,clear,styles,label,hide_label,wrapper_styles,filter} = props
  let [val,setVal] = useState('')
  let [disabled,setDisabled] = useState(true)
  function handleSubmit(e) {
    e.preventDefault();
    if (val) {
      let v = parseInt(val);
      if (isNaN(v)) {
        fun(val, 'name_match');
      } else {
        fun(v, 'num_match');
      }
    } else {
      clear();
    }
  }
  
  useEffect(()=>{
    if(val){
      setDisabled(false)
    }else{
      setDisabled(true)
      clear()
    }
  },[val])
  return(
    <div className={cn(``,wrapper_styles)}>
    {label && <label className={`${filter ? 'text-[10px]' : 'text-xs'} ml-1 block mb-1`}>{hide_label ? '.': label}</label>}
    <form className={cn(`w-full flex items-center justify-between bg-white/50 dark:bg-black hover:border-bg-black rounded-full  ${filter ? 'p-0 px-1' : 'p-1 px-3'} transition duration-300 border dark:border-gray-100/20`,styles)} onSubmit={handleSubmit}>
      <input type="search" placeholder={placeholder} title={placeholder} onChange={e=>{setVal(e.target.value)}} className={`${filter ? 'text-sm' : ''} p-2 border-none outline-none border-r w-[90%] dark:bg-black bg-transparent`} required/>
      <button type="submit" className="bg-none text-bg-black disabled:text-gray-300 duration-300 transition hover:text-blue-dark" disabled={disabled}><Search size={filter ? 18 : 24}/></button>
    </form>
    </div>
  )
}

export function DateRangePicker(props) {
  let { label, from_date, to_date, fun, filter, rangePresets, readOnly, minDate, hide_label, styles, inputStyles, disabled, as_filter } = props;
  const [date, setDate] = useState({
    from: from_date || null,
    to: to_date || null,
  });
  let [preset, setPreset] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRangePresetChange = (value) => {
    if (!isNaN(value)) {
      let to = new Date();
      let from = new Date();
      from.setDate(to.getDate() - value);
      if (minDate && from < new Date(minDate)) {
        from = new Date(minDate);
      }
      setPreset(value);
      setDate({ from, to });
      setIsPopoverOpen(false);
    }
  };

  let range_presets = [
    { name: 'Last 7 Days', value: 7 },
    { name: 'Last 14 Days', value: 14 },
    { name: 'Last 30 Days', value: 30 },
  ];

  useEffect(() => {
    if (!from_date || !to_date) {
      setDate({ from: null, to: null });
    }
  }, [from_date, to_date]);

  useEffect(() => {
    if (date?.from && date?.to) {
      fun({ from_date: date.from, to_date: date.to });
    } else {
      fun({ from_date: '', to_date: '' });
    }
  }, [date]);

  const handleDateSelect = (selectedDate) => {
    if (minDate && selectedDate?.from && selectedDate.from < new Date(minDate)) {
      selectedDate.from = new Date(minDate);
    }
    setDate(selectedDate);
    setPreset('');
    if (selectedDate?.from && selectedDate?.to) {
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className={cn(`${!filter && 'input_grp'} ${disabled && 'opacity-60'}`,styles)}>
      {!hide_label && <label className={`ml-1 block mb-1 ${as_filter ? 'text-[10px]' : 'text-xs'}`}>{label}</label>}
      <div className="flex items-center justify-start gap-2">
        <Popover open={isPopoverOpen} onOpenChange={readOnly ? () => {} : setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              role="button"
              title={`Select ${label}`}
              id="date"
              disabled={disabled}
              className={cn(`outline-none border rounded-lg bg-white/50 dark:bg-black-black2 duration-300 border-gray-400/40 hover:border-gray-400/80 focus:border-gray-400 focus:shadow-sm text-sm ${as_filter ? 'p-2' : 'min-h-[48px] p-3'} dark:text-white w-full justify-start font-normal flex items-center ${!date && "text-muted-foreground"} disabled:pointer-events-none`,inputStyles)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span className="text-gray-400">{`Select ${label || 'Dates'}`}</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-black dark:border-gray-800" align="start">
            {rangePresets && (
              <div className="lg:w-[50%] my-2 input_grp p-2">
                <select
                  className="input_box"
                  placeholder="Select Range"
                  value={preset ?? ''}
                  onChange={(e) => handleRangePresetChange(parseInt(e.target.value))}
                >
                  <option value="">Select Duration</option>
                  {range_presets.map((r, i) => (
                    <option key={i} value={r.value}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              fromDate={minDate ? new Date(minDate) : undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function DatePicker(props) {
  let { label, selectedDate, onDateSelect, readOnly, minDate } = props
  const [date, setDate] = useState(selectedDate || null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    setDate(selectedDate || null);
  }, [selectedDate]);

  const handleDateSelect = (selected) => {
    if (minDate && selected < new Date(minDate)) {
      selected = new Date(minDate);
    }
    setDate(selected);
    onDateSelect(selected);
    setIsPopoverOpen(false);
  };

  return (
    <div className="input_grp">
      <label className="text-xs ml-1 block mb-1">{label}</label>
      <Popover open={isPopoverOpen} onOpenChange={readOnly ? () => {} : setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            title={`Select ${label}`}
            className="outline-none border rounded-lg p-3 bg-white/50 dark:bg-black-black2 duration-300 border-gray-400/40 hover:border-gray-400/80 focus:border-gray-400 focus:shadow-sm text-sm min-h-[48px] dark:text-white w-full flex items-center"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "LLL dd, y")
            ) : (
              <span className="text-gray-400">Select {label || "Date"}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white dark:bg-black dark:border-gray-800" align="start">
          <Calendar
            initialFocus
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            fromDate={minDate ? new Date(minDate) : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePicker1(props) {
  let { selectedDate, onDateSelect, readOnly, minDate } = props
  const [date, setDate] = useState(selectedDate || null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    setDate(selectedDate || null);
  }, [selectedDate]);

  const handleDateSelect = (selected) => {
    if (minDate && selected < new Date(minDate)) {
      selected = new Date(minDate);
    }
    setDate(selected);
    onDateSelect(selected);
    setIsPopoverOpen(false);
  };

  return (
    <div className="">
      <Popover open={isPopoverOpen} onOpenChange={readOnly ? () => {} : setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            title={`Select Date`}
            className="outline-none border rounded-lg duration-300 w-full flex items-center hover:bg-purple/5"
          >
            <CalendarIcon size={20} className="text-purple md:-ml-2"/>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white dark:bg-black dark:border-gray-800" align="start">
          <Calendar
            initialFocus
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            fromDate={minDate ? new Date(minDate) : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MultipleDateRangePicker(props) {
  let { label, selected, fun, max } = props;
  let [state, setState] = useState({ ranges: [] });
  const [date, setDate] = useState({ from: null, to: null });

  function findOverlappingRange(newRange, ranges) {
    let nr_i = new Date(newRange.effective_from).getTime();
    let nr_o = new Date(newRange.effective_to).getTime();
    for (let range of ranges) {
      let cid = new Date(range.effective_from).getTime();
      let cod = new Date(range.effective_to).getTime();

      if (
        (nr_i > cid && nr_i < cod) ||
        (nr_o > cid && nr_o < cod) ||
        (nr_i < cid && nr_o > cod) ||
        nr_i === cid ||
        nr_o === cod
      ) {
        return range;
      }
    }
    return null;
  }

  const handleDateSelection = () => {
    if(max && state.ranges.length == max){
      toast(`You can select maximum ${max} date ranges.`)
      return
    }
    let { from, to } = date;
    let { ranges } = state;
    let from_date = formatDate(from);
    let to_date = formatDate(to);
    let date_obj = { effective_from: from_date, effective_to: to_date };
    const overlappingRange = findOverlappingRange(date_obj, ranges);
    if (overlappingRange) {
      toast(`Date overlap with existing range - from: ${timeToFullDate(
          overlappingRange.effective_from
        )} to: ${timeToFullDate(overlappingRange.effective_to)}`);
    } else {
      let arr = ranges.concat(date_obj);
      arr.sort((a, b) => {
        let d1 = new Date(a.effective_from);
        let d2 = new Date(b.effective_from);
        return d1 - d2;
      });
      setState((s) => ({ ...s, ranges: arr }));
      setDate({ from: null, to: null });
    }
  };

  function removeItem(d) {
    let { ranges } = state;
    let { effective_from, effective_to } = d;
    let arr = ranges.filter(
      (e) => e.effective_from !== effective_from && e.effective_to !== effective_to
    );
    setState((s) => ({ ...s, ranges: arr }));
  }

  useEffect(() => {
    fun(state.ranges);
  }, [state.ranges]);

  useEffect(() => {
    if (selected && selected.length > 0) {
      setState((s) => ({ ...s, ranges: selected }));
    }
  }, [props]);

  return (
    <div className="input_grp">
      <label className="text-xs ml-1 block mb-1">{label}</label>
      <div className="flex items-center justify-start gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <div
              role="button"
              title={`Select ${label}`}
              id="date"
              className={`outline-none border rounded-lg p-3 bg-white/50 dark:bg-black-black2 duration-300 border-gray-400/40 hover:border-gray-400/80 focus:border-gray-400 focus:shadow-sm text-sm min-h-[48px] dark:text-white w-[82vw] md:max-w-[300px] justify-start font-normal flex items-center ${
                !date && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date?.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span className="text-gray-400">{`Select ${label}`}</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white dark:bg-black dark:border-gray-800"
            align="start"
            side="bottom"
            sideOffset={4}
            collisionPadding={8}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {date?.from && date?.to && (
          <div
            className="h-7 aspect-square flex items-center justify-center bg-black rounded-lg text-white transition duration-300 hover:bg-blue-dark"
            role="button"
            onClick={handleDateSelection}
          >
            <CheckIcon size={20} />
          </div>
        )}
      </div>
      {state.ranges && state.ranges.length > 0 && (
        <div className="mt-2 flex items-center md:flex-wrap gap-1 whitespace-nowrap overflow-x-scroll md:overflow-x-hidden md:whitespace-normal max-w-[90vw]">
          {state.ranges.map((d, i) => {
            let { effective_from, effective_to } = d;
            return (
              <div
                key={i}
                className="bg-black text-white px-2 py-[5px] items-center inline-flex rounded-xl cursor-context-menu"
              >
                <p className="ml-1 text-xs">{`${timeToFullDate(
                  effective_from
                )} - ${timeToFullDate(effective_to)}`}</p>
                <button
                  type="button"
                  title="Remove Range"
                  onClick={() => removeItem(d)}
                  className="text-blue aspect-square h-3 rounded-full ml-2 duration-300 transition hover:text-blue-dark bg-white flex text-center items-center justify-center -mt-[1px]"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const TextEditor = (props)=>{
  let {value,onChange,label} = props
  let [value1,setValue] = useState(value)
  function handleEditorChange(content, editor) {
    onChange(content) 
    setValue(content)
  }
  useEffect(()=>{
    setValue(value)
  },[value])
  return (
    <div className="input_grp">
      <label className="text-xs ml-1 block mb-1">{label}</label>
      <Editor
        apiKey='d5wq8qbk9mg38kd7hzxe021m9zr22lc4lwxnwxycd2etuhpd'
        init={{
          plugins: [
            'anchor', 'autolink', 'charmap', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
          ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        }}
        value={value1}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}




