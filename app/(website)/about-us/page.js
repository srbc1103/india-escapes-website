'use client'
import Footer from "../../../components/website/Footer";
import Header from "../../../components/website/Header";
import { FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants";
import { Award, GraduationCap, MapPin, MessageCircle, Milestone, Search, Settings, ShieldCheck, ThumbsUp, Wallet } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useFeaturedImage } from "../../../hooks/useFetch";

export default function Page() {
  const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.about_us})

  const process = [
    {title:'Speak with a Specialist',text:'Talk to our experts regarding what you want and how you wish to travel. Let them know what you expect from this holiday.',icon: <MessageCircle className="h-8 lg:h-12 w-auto"/>},
    {title:'Refineyour choices',text:'Based on expert opinion, we will generate a personalized holiday package that includes our ideas for a fulfilling trip.',icon: <Milestone className="h-8 lg:h-12 w-auto"/>},
    {title:'Travel worry-free',text:'We manage all your reservations and other logistical aspects of the trip. Rest assured, traveling with us would be a stress-free experience.',icon: <ThumbsUp className="h-8 lg:h-12 w-auto"/>}
  ]

  const our_values = [
    {title:'Be Passionate About Travel',values:['Create special experiences people will always remember','Share your information, knowledge and personal experiences']},
    {title:'Be Positive',values:['Support and encourage each other','Celebrate success, learn from and do not fear failure']},
    {title:'Be One Team',values:['Work together, share ideas, agree and adopt best practice across all offices','Listen, be curious, seek out different views']},
    {title:'Be the Difference',values:['Spot opportunities to do the right thing','Actively support responsible travel and community ideas']},
  ]

  const differences = [
    {title:'Tailor-made by professionals',text:'We have professionals working round-the-clock to create trips that match your preferences. Our packages are tailor-made, just for you!',icon: <GraduationCap className="h-8 lg:h-12 w-auto"/>},
    {title:'Trusted Service',text:'We have professionals working round-the-clock to create trips that match your preferences. Our packages are tailor-made, just for you!',icon: <ShieldCheck className="h-8 lg:h-12 w-auto"/>},
    {title:'Knowledge of local experts',text:'We have professionals working round-the-clock to create trips that match your preferences. Our packages are tailor-made, just for you!',icon: <Award className="h-8 lg:h-12 w-auto"/>},
    {title:'Value for money and No Hidden Charges',text:'We have professionals working round-the-clock to create trips that match your preferences. Our packages are tailor-made, just for you!',icon: <Wallet className="h-8 lg:h-12 w-auto"/>},
  ]

  return (
    <>
      <Header color={{mobile:'white',desktop:'white'}} fixed/>
      <div className="flex items-end py-20 justify-center relative min-h-[50vh] lg:min-h-[80vh] bg-black">
        <Image src={featuredImage || IMAGES.about_page_top_img} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover opacity-70" style={{zIndex:0}} alt=""/>
        <div className="w_80_90 text-white relative">
          <p className="text-3xl font-semibold lg:text-5xl flex-1" style={{lineHeight:'120%'}}> Who <span className="text-red">we are?</span></p>
          <p className="relative text-xs md:text-lg w-[90%] lg:w-[60%]">We are a team of specialists handcrafting an ideal tour package for our customers. Our itineraries are embedded with customer inputs to generate maximum customer satisfaction. With India Escapes, you can choose how you wish to travel, and we make it a reality.</p>
        </div>
      </div>
      <div className="bg-white flex-center-jc py-12 lg:py-20">
        <div className="w_80_90">
          <p className="text-2xl font-semibold lg:text-4xl flex-1 w-[70%] md:w-full" style={{lineHeight:'120%'}}> Our <span className="text-red">Process,</span> your <span className="text-red">peace of mind</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 lg:mt-8">
            {process.map((item,ind)=>{
              let {title,text,icon} = item
              return(
                <div key={ind} className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-100 border border-gray-100">
                  {icon}
                  <p className="font-medium lg:font-semibold text-lg lg:text-xl my-2">{title}</p>
                  <p className="text-xs md:text-sm text-gray-600">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="bg-[#f8f7f7] flex-center-jc py-12 lg:py-20">
        <div className="w_80_90">
          <p className="text-2xl font-semibold lg:text-4xl flex-1 w-[70%] md:w-full" style={{lineHeight:'120%'}}> Our Core <span className="text-red">Values</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 lg:my-8">
            {our_values.map((item,ind)=>{
              let {title,values} = item
              return(
                <div key={ind} className="bg-white rounded-3xl p-6 lg:p-8 shadow shadow-gray-100 border border-gray-100">
                  <p className="font-medium lg:font-semibold text-lg lg:text-xl my-2">{title}</p>
                  <ul className="ml-4 text-sm md:text-base text-gray-500 list-disc">
                    {values.map((val,i)=>{
                      return <li key={i} className="mb-1">{val}</li>
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
          <Image src={IMAGES.about_page_img} height={1000} width={1000} className="w-full h-auto rounded-2xl lg:rounded-3xl" alt=""/>
        </div>
      </div>
      <div className="bg-white flex-center-jc py-12 lg:py-20">
        <div className="w_80_90">
          <p className="text-xl font-semibold lg:text-4xl flex-1" style={{lineHeight:'120%'}}> What makes the <span className="text-red">difference,<br/></span> when you travel <span className="text-red">The India Escapes</span> way?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-8">
            {differences.map((item,ind)=>{
              let {title,text,icon} = item
              return(
                <div key={ind} className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-100 border border-gray-100">
                  {icon}
                  <p className="font-medium lg:font-semibold text-lg lg:text-xl my-2">{title}</p>
                  <p className="text-xs text-gray-500">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
