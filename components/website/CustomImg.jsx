import { useImages } from "../../hooks/useFetch";
import { cn } from "../../lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CustomImg(props) {
    const {url,al,styles} = props
    const { loading, images } = useImages();
    const [image,setImage] = useState(null)
    useEffect(()=>{
        let img = images?.find(e=>e.url == url) || null
        if(img){
            let {name,title,alt} = img
            let obj = {name,title,alt}
            setImage(obj)
        }
    },[url,images])

  return (
    <>{loading ? <></> : <Image src={url} height={1000} width={1000} alt={image?.alt || al || ''} title={image?.title || ''} className={cn(``,styles)} {...props}/>}</>
  )
}
