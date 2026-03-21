import { cn } from "../lib/utils"

export default function PageHead(props) {
  const {styles} = props
  return (
    <h1 className={cn(`text-2xl font-bold mb-6`, styles)}>{props.text}</h1>
  )
}
