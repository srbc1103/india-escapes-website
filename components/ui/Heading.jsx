import { cn } from '../../lib/utils'
import React from 'react'

export default function Heading(props) {
    let {text,span_text,styles,span_styles} = props
  return (
    <p className={cn(`text-lg font-semibold lg:text-xl flex-1`,styles)} style={{lineHeight:'120%'}}>{text} <span className={cn(`text-red`,span_styles)}>{span_text}</span></p>
  )
}
