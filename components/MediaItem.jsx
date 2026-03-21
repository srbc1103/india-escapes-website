'use client'
import { Copy, Pencil, File, FileText, Image, Check } from 'lucide-react'
import { RoundButton } from './Buttons'
import useCopy from '../hooks/useCopy'
import usePopup from '../hooks/usePopup'
import { MediaDetailForm } from './Forms'
import { Skeleton } from './ui/skeleton'

export default function MediaItem(props) {
    let {mime_type, url, alt,name, title, reload, tags, onSelect, selected, as_selection, height } = props
    const isImage = (mimeType) => mimeType?.startsWith('image/');
    const isVideo = (mimeType) => mimeType?.startsWith('video/');
    const isPdf = (mimeType) => mimeType === 'application/pdf';
    const {copyText} = useCopy()

    const {showDialog, hideDialog, dialog} = usePopup({form:<MediaDetailForm {...props} onSave={()=>{
        hideDialog()
        reload()
    }}/>, container_styles:'w-full max-w-4xl min-h-[80vh] max-h-[95vh] pb-8 md:pb-0 overflow-y-auto'})

  return (
    <>
    {dialog}
    
    <div className={`bg-gray-100/50 dark:bg-gray-800 p-2 rounded-lg border shadow-lg shadow-gray-200/50 h-fit relative ${as_selection ? 'cursor:pointer' : ''}`} role={as_selection ? 'button' : 'none'} onClick={as_selection ? onSelect : null}>
        {isImage(mime_type) ? (
        <img
            src={url?.replace('&mode=admin','')}
            alt={alt || name}
            className={`w-full ${height || 'h-28 md:h-32'} object-cover mb-2 rounded-md`}
        />
        ) : isVideo(mime_type) ? (
        <video controls className={`w-full ${height || 'h-28 md:h-32'} mb-2 rounded-md`}>
            <source src={url?.replace('&mode=admin','')} type={mime_type} />
        </video>
        ) : isPdf(mime_type) ? (
        <div className={`flex justify-center items-center ${height || 'h-28 md:h-32'} mb-2 bg-gray-100 dark:bg-gray-700 rounded-md`}>
            <FileText size={80} className="text-gray-500" />
        </div>
        ) : (
        <div className={`flex justify-center items-center ${height || 'h-28 md:h-32'} mb-2 bg-gray-100 dark:bg-gray-700 rounded-md`}>
            <File size={48} className="text-gray-500" />
        </div>
        )}
        {as_selection ? <><div className={`flex items-center justify-center absolute top-3 right-3 rounded-xl border border-black h-6 w-6 ${selected ? 'bg-black' : ''}`}>
          {selected ? <Check size={16} color="white"/> : <></>}
        </div></> : <></>}
        <div className="relative">
            {as_selection ? <><p className="font-medium text-xs">{name}</p></> : <><RoundButton onClick={showDialog} styles="absolute top-0 right-0 bg-white h-6 md:h-8" title="View Detail"><Pencil size={14}/></RoundButton>
            <p className="font-medium text-sm">{name}</p></>}
            {as_selection ? <></> : <>
            <p className="text-[10px] opacity-70 my-1">Title: <span className='font-medium'>{title}</span></p>
            <div className="relative bg-white/60 border rounded-md p-1 wrap-break-word max-h-[36px] overflow-hidden pr-8">
                <p className='text-[9px] text-black/70'>{url?.replace('&mode=admin','')}</p>
                <RoundButton onClick={()=>copyText(url?.replace('&mode=admin',''),'URL Copied to the clipboard')} title="Copy File URL" styles="absolute top-1 right-1 bg-black/10 hover:bg-gray-500 h-4 md:h-6 text-black hover:text-white rounded-md"><Copy size={12}/></RoundButton>
            </div></>}
            <p className="text-[10px] opacity-70 mt-1">Tags: <span className="font-medium">{tags}</span></p>
        </div>
    </div>
    </>
  )
}

export function MediaItemSkeleton() {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800 p-2 rounded-lg border shadow-lg shadow-gray-200/50">
      <Skeleton className="w-full h-32 mb-2 rounded-md skeleton_bg flex-center-jc">
        <Image size={80} className='text-gray-300'/>
      </Skeleton>
      <div className="relative">
        <RoundButton styles="absolute top-0 right-0 bg-white h-6 md:h-8">
          <Skeleton className="w-4 h-4 rounded-full skeleton_bg" />
        </RoundButton>
        <Skeleton className="w-3/4 h-4 mb-2 rounded skeleton_bg" />
        <Skeleton className="w-1/2 h-3 my-1 mb-2 rounded skeleton_bg" />
        <div className="relative bg-white/60 border rounded-md p-1 pr-8">
          <Skeleton className="w-full h-7 rounded skeleton_bg" />
          <RoundButton styles="absolute top-1 right-1 bg-black/10 h-4 md:h-6 rounded-md">
            <Skeleton className="w-3 h-3 rounded-full skeleton_bg" />
          </RoundButton>
        </div>
      </div>
    </div>
  )
}
