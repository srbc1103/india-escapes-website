'use client'

import { toast } from "sonner"

export default function useCopy({} = {}) {
    function copyText(text,copymessage){
        navigator.clipboard.writeText(text)
        toast.success(copymessage || 'Copied to clipboard')
    }
  return {copyText}
}
