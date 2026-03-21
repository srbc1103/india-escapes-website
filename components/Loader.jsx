import Image from "next/image";

export default function Loader() {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#f1f2ff] dark:bg-black`}>
          <div className="relative">
            <div className="w-44 h-44 border-2 border-black rounded-full animate-spin border-t-transparent"></div>
            <Image
              src="/icon.png"
              alt="India Escapes" 
              width={100}
              height={100}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
    </div>
  )
}
