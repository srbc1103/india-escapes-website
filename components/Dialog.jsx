import { X } from 'lucide-react'
import React from 'react'
import { RoundButton } from './Buttons'
import { cn } from '../lib/utils'

export default function Dialog() {
  return (
    <div>Dialog</div>
  )
}


export function DialogContainer(props){
    let {onClose,children,containerStyles,zIndex,allowOverflow=false} = props

    return(
        <div className="alert_wrap fixed top-0 left-0 h-[100dvh] md:h-screen w-screen bg-gray-400/20 dark:bg-black/5 flex items-center justify-center backdrop-blur-md" style={{zIndex:zIndex }}>
            <div className="relative h-full w-full flex items-center justify-center" style={allowOverflow ? {overflow: 'visible'} : {}}>
                <div
                    className={cn(
                        "rounded-none rounded-t-2xl md:rounded-2xl bg-white dark:bg-black shadow-md w-screen h-auto max-w-[500px] min-h-[30vh] flex flex-col items-center justify-center pop_c",
                        allowOverflow ? "overflow-visible md:overflow-visible" : "overflow-hidden",
                        allowOverflow ? "absolute bottom-0 md:static" : "fixed bottom-0 left-0 md:relative md:bottom-auto md:left-auto",
                        containerStyles
                    )}
                    style={allowOverflow ? {position: 'static', zIndex: 'auto'} : {}}
                >
                    {onClose && <RoundButton styles="p-2 md:p-2 text-xs font-medium bg-white absolute top-2 right-2" title="Close" onClick={onClose} style={{zIndex:100}}><X size={14}/></RoundButton>}
                    {children}
                </div>
            </div>
        </div>
    )
}