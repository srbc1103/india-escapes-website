'use client'

import Image from "next/image"
import Button, { RoundButton } from "../Buttons"
import { IMAGES } from "../../constants"
import Link from "next/link"
import { Facebook, Instagram, MessageCircle, MessageCircleMore, Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, TwitterIcon, X } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"
import { useState } from "react"
import usePopup from "../../hooks/usePopup"
import { QueryForm } from "../Forms"
import MultiStepQueryForm from "../MSQueryForm"
import {motion} from "framer-motion"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

export default function Footer() {
  const { t } = useTranslation();
  const [detailBlock,setDetailBlock] = useState(null)
  const { showDialog, hideDialog, dialog } = usePopup({
    form: detailBlock,
    container_styles: 'max-w-[500px] p-0'
  });
  const partners = [
    {name:'HP Tourism',img:IMAGES.hptdc},
    // {name:'Ministry of Tourism',img:IMAGES.ministry_of_tourism},
    {name:'Ministry of Commerce',img:IMAGES.doc},
    {name:'Travel for Life',img:IMAGES.travel_for_life},
    {name:'Nidhi+',img:IMAGES.nidhi},
    {name:'Get your guide',img:IMAGES.get_your_guide},
    {name:'Viator',img:IMAGES.viator},
    {name:'Trip Advisor',img:IMAGES.trip_advisor},
    {name:'We Travel',img:IMAGES.we_travel},
    {name:'Tour Radar',img:IMAGES.tour_radar},
  ]
  return (
    <footer>
    {dialog}
        {/* <div className="min-h-[50vh] py-12 flex items-center justify-center flex-col gap-4 text-white text-center relative">
            <Image src={IMAGES.footer_bg} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover" style={{zIndex:0}} alt=""/>
            <p className="relative text-2xl md:text-4xl lg:text-6xl font-medium">{t('footer.talkToSpecialist')}</p>
            <p className="relative text-xs md:text-lg w-[90%] lg:w-[50%]">{t('footer.talkDescription')}</p>
            <Button styles="relative bg-red text-white rounded-full lg:text-xl lg:px-6 hover:bg-white hover:text-red" onClick={()=>{
                setDetailBlock(<MultiStepQueryForm destination="General Query" type="quote" onSave={hideDialog}/>)
                showDialog()
            }}>{t('footer.sendQuery')}</Button>
        </div> */}
        <section className="py-12 lg:py-20 bg-black rounded-4xl text-center text-white flex-center-jc overflow-hidden w_80_90 flex-col gap-4 relative">
            <Image src={IMAGES.tts_bg} height={500} width={500} className="absolute top-0 left-0 h-full w-full object-cover opacity-80" style={{zIndex:0}} alt="Footer Background"/>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold relative">Talk to a <span className="text-red">Specialist</span></h2>
            <p className="text-xs md:text-base lg:text-xl w-[90%] max-w-2xl relative">{t('footer.talkDescription')}</p>
            <Button styles="relative bg-red text-white rounded-full lg:text-xl lg:px-6 hover:bg-black duration-500" onClick={()=>{
                // setDetailBlock(<MultiStepQueryForm destination="General Query" type="quote" onSave={hideDialog}/>)
                setDetailBlock(<QueryForm destination="General Query" type="quote" onSave={hideDialog} />)
                showDialog()
            }}>Get a Quote</Button>
        </section>
        <div className="flex items-center justify-center py-20 flex-col">
            <div className="w-[90%] lg:w-[85%] grid grid-cols-2 lg:grid-cols-5 gap-4 border-b border-gray-200/60 pb-8">
                <div className="col-span-2 lg:col-span-1">
                    <Image src={IMAGES.logo} height={200} width={200} className="h-12 w-auto" alt="Logo"/>
                    <div className="my-4">
                        <ul className="flex items-center justify-start gap-2">
                            <li className=""><Link target="_blank" href="https://www.facebook.com/Indiaescapes.in/" className="h-8 aspect-square border-black border rounded-full flex items-center justify-center transition duration-300 text-black hover:bg-black hover:text-white"><Facebook size={16}/></Link></li>
                            <li className=""><Link  target="_blank" href={"https://www.instagram.com/india_escapes/"} className="h-8 aspect-square border-black border rounded-full flex items-center justify-center transition duration-300 text-black hover:bg-black hover:text-white"><Instagram size={16}/></Link></li>
                            <li className=""><Link  target="_blank" href={"https://x.com/India_escapes"} className="h-8 aspect-square border-black border rounded-full flex items-center justify-center transition duration-300 text-black hover:bg-black hover:text-white"><TwitterIcon size={16}/></Link></li>
                            <li className=""><Link  target="_blank" href={"https://wa.me/+918091066115"} className="h-8 aspect-square border-black border rounded-full flex items-center justify-center transition duration-300 text-black hover:bg-black hover:text-white"><MessageCircle size={16}/></Link></li>
                        </ul>
                    </div>
                    {/* <div className="my-4">
                        <a href="mailto:sales@indiaescapes.in" className="text-black text-sm transition duration-300 hover:text-red block">sales@indiaescapes.in</a>
                        <a href="tel:+918091066115" className="text-black text-sm transition duration-300 hover:text-red">+91 80910 66115</a>
                    </div>
                    <p className="text-sm">Top floor, Verma building,<br/>Bhatakuffer bypass, Sanjauli,<br/>Shimla - H.P - 171006
                    </p> */}
                </div>
                <div className="">
                    <ul className="ft_ul">
                        <li className="ft_li"><Link href="/destinations" className="ft_lia">{t('footer.destinations')}</Link></li>
                        <li className="ft_li"><Link href="/tours" className="ft_lia">{t('footer.tours')}</Link></li>
                        <li className="ft_li"><Link href="/about-us" className="ft_lia">{t('footer.aboutUs')}</Link></li>
                        <li className="ft_li"><Link href="/contact" className="ft_lia">{t('footer.contactUs')}</Link></li>
                    </ul>
                </div>
                <div className="">
                    <ul className="ft_ul">
                        <li className="ft_li"><Link href="/deals" className="ft_lia">{t('footer.deals')}</Link></li>
                        <li className="ft_li"><Link href="/blogs" className="ft_lia">{t('footer.blogs')}</Link></li>
                    </ul>
                </div>
                <div className="">
                    <ul className="ft_ul">
                        <li className="ft_li"><Link href="/terms-and-conditions" className="ft_lia">{t('footer.terms')}</Link></li>
                        <li className="ft_li"><Link href="/privacy-policy" className="ft_lia">{t('footer.privacy')}</Link></li>
                        <li className="ft_li"><Link href="/terms-and-conditions#cancellation" className="ft_lia">{t('footer.refund')}</Link></li>
                        <li className="ft_li"><Link href="/booking-form" className="ft_lia">{t('footer.bookingForm')}</Link></li>
                    </ul>
                </div>
                <div className="">
                    <ul className="ft_ul">
                        <li className="ft_li"><Link target="_blank" href="https://razorpay.me/@indiaescapes" className="ft_lia">Pay Now</Link></li>
                        <li className="ft_li"><Link target="_blank" href="/packing_list.pdf" className="ft_lia">What to pack list</Link></li>
                        {/* <li className="ft_li"><Link href="#" className="ft_lia">You book we plant</Link></li> */}
                        <li className="ft_li"><Link href="/faq" className="ft_lia">FAQs</Link></li>
                    </ul>
                </div>
            </div>
            {/* <center><Image src={IMAGES.partners} height={1000} width={1000} alt="Partners" className="my-8 md:my-12 w-auto h-9 md:h-16"/></center> */}
            <p className="text-center font-medium mt-8">Affiliation and Accreditation</p>
            <div className="py-3 mb-6 w-[90%] max-w-5xl mx-auto ">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={8}
                    slidesPerView={3}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="mySwiper w-full h-full relative"
                    loop={true}
                    breakpoints={{
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 12,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 12,
                        },
                    }}
                >
                    {partners.map((partner, index) => {
                        let {name, img} = partner
                        return <SwiperSlide key={index} className={``}>
                        <div className="flex-center-jc h-20 lg:h-24 p-2 px-3 overflow-hidden rounded-xl border border-gray-100 shadow-lg shadow-gray-100/50 my-2">
                            <Image src={img} height={200} width={200} alt={name || ''} className="max-h-full max-w-full object-contain"/>
                        </div>
                        </SwiperSlide>
                    })}
                </Swiper>
            </div>
            <div className="w-[90%] lg:w-[85%] text-center text-xs md:text-sm">
                <p className="">Registered office: Top floor, Verma Building, Bhatakuffer Chowk, Sanjauli, Shimla, HP, India</p>
                <p className="mt-[2px] opacity-90">Copyright &copy; India Escapes | Registered in India, HP: 131124/46975</p>
            </div>
        </div>
    </footer>
  )
}

export function NeedHelp(){
    const [opened,setOpened] = useState(false)
    const [form,setForm] = useState(null)
    const { showDialog, hideDialog, dialog } = usePopup({ container_styles: "max-w-[500px]",form });
    
    return(
        <>
        {dialog}
            {opened ? <>
                <div className="fixed inset-0 bg-black/20 backdrop-blur z-20" onClick={()=>{setOpened(false)}}></div>
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ duration: 0.3}}
                    className="fixed bottom-0 right-0 w-[100vw] rounded-t-2xl bg-white shadow-xl shadow-black/5 p-6 border-2 border-gray-100 border-r-transparent lg:w-[400px] md:rounded-l-2xl md:rounded-tr-none md:bottom-1/2 md:translate-y-1/2 mh_dialog alert_wrap z-30" 
                    // onClick={()=>{
                    //     setOpened(false)
                    // }}
                >
                    <div className="flex items-center justify-start gap-4 mb-4 relative">
                        <RoundButton styles="p-2 md:p-2 text-xs font-medium bg-white absolute -top-4 -right-4" title="Close" onClick={()=>setOpened(false)} style={{zIndex:100}}><X size={14}/></RoundButton>

                        <div className="flex-center-jc shadow-xl overflow-hidden aspect-square rounded-full border-2 border-white h-12 shrink-0">
                            <Image src={IMAGES.call} height={200} width={200} alt="" className="cover_img"/>
                        </div>
                        <div className="">
                            <p className="font-medium text-black">Need help?</p>
                            <p className="text-sm text-gray-500">Our travel consultants are here to help 7 days a week, 8am - 8pm Mon - Fri, 8am - 7pm Sat & Sun (IST)</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-start gap-4 md:w-[90%] mx-auto border-t border-gray-200 p-4 py-5 cursor-pointer hover:bg-gray-100/50 transition duration-300">
                        <div className="flex-center-jc">
                            <PhoneOutgoing className="text-green" size={28}/>
                        </div>
                        <Link className="" href="tel:+918091066115">
                            <p className="font-medium text-black">+91 80910 66115</p>
                            <p className="text-xs text-gray-500">Speak to an expert </p>
                        </Link>
                    </div>
                    <div className="flex items-center justify-start gap-4 md:w-[90%] mx-auto border-t border-gray-200 p-4 py-5 cursor-pointer hover:bg-gray-100/50 transition duration-300"
                    onClick={()=>{
                        setForm(<QueryForm type="callback" onSave={hideDialog} />);
                        showDialog();
                        setOpened(false)
                    }}
                    >
                        <div className="flex-center-jc">
                            <PhoneIncoming className="text-green" size={28}/>
                        </div>
                        <div className="" >
                            <p className="font-medium text-black">Request a Callback</p>
                            <p className="text-xs text-gray-500">Our travel expert will call you soon</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-start gap-4 md:w-[90%] mx-auto border-t border-gray-200 p-4 py-5 cursor-pointer hover:bg-gray-100/50 transition duration-300">
                        <div className="flex-center-jc">
                            <MessageCircleMore className="text-green" size={28}/>
                        </div>
                        <Link className="" href="https://wa.me/+918091066115" target="_blank">
                            <p className="font-medium text-black">Chat Now</p>
                            <p className="text-xs text-gray-500">Chat with a travel expert</p>
                        </Link>
                    </div>

                </motion.div>
            </> : <>
                <motion.div
                    initial={{opacity:0,marginRight:-100}}
                    animate={{opacity:1,marginRight:0}}
                    // transition={{duration:0.5}}
                    exit={{opacity:0,marginRight:-100}}
                    className="fixed top-2/3 md:top-[65%] -right-10 md:right-0 z-20 flex-center-jc flex-col gap-2 bg-white rounded-tr-2xl rounded-tl-2xl md:rounded-l-2xl md:rounded-r-none transition duration-300 cursor-pointer shadow-xl p-4 lg:p-2 py-2 border-2 border-gray-100 border-r-transparent hover:shadow-2xl -rotate-90 md:rotate-0" onClick={()=>{
                        setOpened(true)
                    }}
                >
                    <div className=" shadow-xl overflow-hidden aspect-square rounded-full border-2 border-white h-8 hidden md:flex md:items-center md:justify-center">
                        <Image src={IMAGES.call} height={200} width={200} alt="" className="cover_img"/>
                    </div>
                    <p className="font-medium text-sm lg:text-xs text-gray-700">Need help?</p>
                </motion.div>
            </>}
        </>
    )
}
