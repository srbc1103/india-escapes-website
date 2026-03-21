'use client'

import Footer from "../../../components/website/Footer";
import Header from "../../../components/website/Header";
import { FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants";
import Image from "next/image";
import { Shield, Lock, Eye, Smartphone, Cookie, Users, Mail, Globe, FileLock, Phone, AlertTriangle, Scale } from "lucide-react";
import { useFeaturedImage } from "../../../hooks/useFetch";
import { useEffect } from "react";

export default function Page() {
    const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.privacy_policy})
  useEffect(()=>{
      document.title = 'Privacy Policy - India Escapes'
    },[])
  return (
    <>
      <Header color={{desktop:'black', mobile:'white'}} fixed={{desktop:true,mobile:true}}/>
      
      {/* Hero Banner - Privacy Focused */}
      <div className="h-[35vh] lg:h-[60vh] flex items-center justify-center relative">
        <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex items-center justify-center lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20">
          <Image 
            src={featuredImage || IMAGES.hero_bg} 
            height={1000} 
            width={1000} 
            className="absolute top-0 h-full w-full left-0 object-cover" 
            alt="India Escapes - Your Privacy is Our Priority" 
          />
            <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">Privacy Policy</h1>
            </div>
        </div>
      </div>

      {/* Main Content - Privacy Sections */}
      <div className="bg-gradient-to-b from-white to-green/5 py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-16 lg:space-y-20">

          {/* Information We Collect */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-3 lg:p-4 bg-green/10 rounded-2xl">
                  <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-green" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-12 space-y-6">
                <div className="flex gap-4">
                  <Users className="w-6 h-6 lg:w-8 lg:h-8 text-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2">Personal Information</h3>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      Name, email, phone number, passport details, travel preferences, and payment information 
                      provided during booking or inquiries.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Smartphone className="w-6 h-6 lg:w-8 lg:h-8 text-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2">Usage & Device Data</h3>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      IP address, browser type, pages visited, time spent on site, and device identifiers 
                      collected automatically via cookies and analytics tools.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Cookie className="w-6 h-6 lg:w-8 lg:h-8 text-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2">Cookies & Tracking</h3>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      We use essential, analytics, and marketing cookies to improve your experience. 
                      You can manage preferences via your browser settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <Image src="/dataprotection.jpg" width={600} height={400} alt="Data Protection" className="rounded-3xl shadow-2xl object-cover grayscale-100 opacity-20" />
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="text-center mb-10 lg:mb-12">
              <div className="flex justify-center mb-4 lg:mb-6">
                <div className="p-4 lg:p-5 bg-green/10 rounded-full">
                  <Lock className="w-10 h-10 lg:w-12 lg:h-12 text-green" />
                </div>
              </div>
              <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">How We Use Your Information</h2>
              <p className="mt-3 text-sm md:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Your data helps us deliver magical India journeys while keeping everything secure and personalized
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { title: "Booking & Services", items: ["Process reservations", "Confirm itineraries", "Provide travel updates", "Customer support"] },
                { title: "Personalization", items: ["Tailored recommendations", "Special offers", "Birthday surprises", "Travel history"] },
                { title: "Communication", items: ["Email newsletters", "SMS alerts", "WhatsApp updates", "Emergency contact"] },
                { title: "Improvement & Security", items: ["Site analytics", "Fraud prevention", "Legal compliance", "Service enhancements"] }
              ].map((col, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition-shadow">
                  <h3 className="text-lg lg:text-xl font-bold text-green mb-4 lg:mb-6">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 lg:gap-3">
                        <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-green flex-shrink-0 mt-0.5" />
                        <span className="text-sm lg:text-base text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Data Sharing & Protection */}
          <section>
            <div className="text-center mb-10 lg:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">Data Sharing & Protection</h2>
              <p className="mt-3 text-sm md:text-base lg:text-xl text-gray-600">We never sell your data. Sharing only when necessary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {[
                { icon: Globe, title: "Trusted Partners", desc: "Hotels, airlines, guides, and payment gateways – all under strict NDA & GDPR-compliant agreements." },
                { icon: FileLock, title: "Secure Storage", desc: "Encrypted databases, SSL protection, regular security audits, and limited staff access." },
                { icon: Mail, title: "Marketing Opt-Out", desc: "Unsubscribe anytime from emails. We respect your inbox – no spam, ever." },
                { icon: Smartphone, title: "Your Rights", desc: "Access, correct, delete, or export your data anytime. Just contact our DPO." }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="inline-flex p-5 lg:p-6 bg-green/5 rounded-full mb-4 lg:mb-6 group-hover:bg-green/10 transition-colors">
                    <item.icon className="w-10 h-10 lg:w-12 lg:h-12 text-green" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Your Rights & Responsibilities */}
          <section>
            <div className="text-center mb-10 lg:mb-12">
              <div className="flex justify-center mb-4 lg:mb-6">
                <div className="p-4 lg:p-5 bg-green/5 rounded-full">
                  <Scale className="w-10 h-10 lg:w-12 lg:h-12 text-green" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">Your Rights & Responsibilities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: Eye, title: "Right to Access", desc: "Request a copy of all data we hold about you – free of charge." },
                { icon: AlertTriangle, title: "Right to be Forgotten", desc: "Ask us to delete your data (except where legally required to retain)." },
                { icon: Lock, title: "Data Portability", desc: "Receive your data in a structured, machine-readable format." },
                { icon: Cookie, title: "Cookie Control", desc: "Accept/reject non-essential cookies via our banner." },
                { icon: Users, title: "Children’s Privacy", desc: "We do not knowingly collect data from children under 16." },
                { icon: Globe, title: "International Transfers", desc: "Data may be processed in India/EU with adequate safeguards." }
              ].map((resp, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 bg-green/10 rounded-2xl flex-shrink-0">
                      <resp.icon className="w-6 h-6 lg:w-8 lg:h-8 text-green" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">{resp.title}</h3>
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{resp.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section - Privacy Contact */}
          <section className="bg-green/5 rounded-3xl p-8 lg:p-16 text-center text-green mx-4 lg:mx-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">Questions About Your Privacy?</h2>
            <p className="text-sm md:text-base lg:text-xl mb-8 lg:mb-10 max-w-2xl mx-auto">
              Our Data Protection Officer is here 24/7. Reach out anytime – your peace of mind matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+918091066115" 
                className="inline-flex w-full md:w-fit items-center justify-center gap-1 px-8 py-4 bg-green/10 backdrop-blur-sm text-green border-2 border-white/50 rounded-full text-sm md:text-lg lg:text-xl font-bold hover:bg-green hover:text-white transition duration-300"
              >
                <Phone className="w-5 h-5 lg:w-7 lg:h-7" />
                +91 80910 66115
              </a>
            </div>
            <p className="mt-8 text-xs lg:text-sm opacity-90">
              Last updated: November 09, 2025
            </p>
          </section>

        </div>
      </div>
    </>
  )
}