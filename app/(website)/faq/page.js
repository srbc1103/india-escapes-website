'use client'

import MultiStepQueryForm from "../../../components/MSQueryForm";
import Heading from "../../../components/ui/Heading";
import Footer from "../../../components/website/Footer";
import Header from "../../../components/website/Header";
import { COLLECTIONS, FEATURED_IMAGE_PAGE_MAP, IMAGES } from "../../../constants";
import { useFeaturedImage, useFetchList } from "../../../hooks/useFetch";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Page() {
  const [openIndex, setOpenIndex] = useState(null);
  const { loading, list, load_list } = useFetchList({ collection_id: COLLECTIONS.FAQ, limit: 1000 })
const {featuredImage} = useFeaturedImage({id:FEATURED_IMAGE_PAGE_MAP.faq})

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // const faqs = [
  //   {
  //     q: "What can you expect on an India tour?",
  //     a: `An India tour offers an incredibly diverse and rich travel experience. In the Himalayas, explore snow-capped peaks, serene hill stations like Shimla, and high-altitude deserts such as Spiti Valley and Leh-Ladakh, famous for breathtaking landscapes and Buddhist monasteries. Dive into Rajasthan’s royal culture with majestic forts, palaces, and vibrant bazaars in Jaipur, Udaipur, and Jodhpur.\n\nIn North India, explore iconic heritage sites like the Taj Mahal, bustling cities like Delhi, and spiritual hubs including Varanasi, known for its sacred Ganges ghats and evening Ganga Aarti ceremonies. The sacred city of Rishikesh offers world-renowned yoga and pilgrimage experiences.\n\nTravel south to Kerala’s tranquil backwaters for peaceful houseboat cruises amid lush greenery and spices. Enjoy the tropical beaches of Goa and the Andaman Islands, perfect for sun, sand, and water sports. Discover ancient wonders at Elephanta and Ellora Caves near Mumbai, and marvel at the intricate temples of Khajuraho and Ayodhya’s spiritual heritage.\n\nWildlife enthusiasts can venture into India’s national parks such as Ranthambore and Jim Corbett for tiger safaris and rich biodiversity. Many UNESCO World Heritage Sites across India celebrate its architectural and cultural magnificence.\n\nOverall, an India tour means encountering vivid traditions, spectacular landscapes, spiritual depth, royal grandeur, wildlife adventures, and a sensory feast, making for an unforgettable journey tailored to any traveler’s interests.`
  //   },
  //   {
  //     q: "When is the best time to travel to India?",
  //     a: `Planning the best time to visit India depends on the specific regions and experiences you want because India’s climate varies greatly from north to south and east to west. Generally, the most favorable season for most travelers is between **October and March**, when the weather is cooler and dry across large parts of the country.\n\n**Month-by-month guide:**\n- **January–February**: Peak season, cool weather – perfect for Golden Triangle & Kerala.\n- **March**: Holi festival, warming up but still pleasant.\n- **April–May**: Hot in plains; escape to hill stations or Ladakh.\n- **June–September**: Monsoon – lush greenery, ideal for Kerala Ayurveda & Ladakh.\n- **October–December**: Post-monsoon freshness, festivals like Diwali – best for Rajasthan & wildlife.\n\n**Quick tips:**\n- Rajasthan/Golden Triangle: Nov–Feb\n- Kerala backwaters: Oct–Mar\n- Ladakh/Spiti: May–Sep\n- Wildlife safaris: Feb–Apr`
  //   },
  //   {
  //     q: "What is the visa information to visit India and how can tourists apply for it?",
  //     a: `Most international travelers can apply for the convenient **Indian e-Tourist Visa** online – no embassy visit needed!\n\n**Key details:**\n- Apply at: https://indianvisaonline.gov.in/evisa/tvoa.html (up to 120 days in advance)\n- Validity: Usually 60 days stay with double entry\n- Cost: $10–$60 USD (varies by nationality)\n- Requirements: Passport valid 6+ months, recent photo, passport scan\n- Processing: 3–4 days (print ETA & carry with passport)\n\nFor longer stays or non-eligible nationalities, apply at Indian Embassy. Always check the official site for latest updates.`
  //   },
  //   {
  //     q: "How many days are enough to explore India, especially for first-time travelers?",
  //     a: `For first-timers, **14 days** is the sweet spot! It gives you enough time to experience the iconic Golden Triangle (Delhi–Agra–Jaipur), see the Taj Mahal at sunrise, explore Rajasthan’s palaces, and add a relaxing Kerala backwater houseboat or a quick Shimla toy-train ride – all without feeling rushed.\n\nLess than 10 days? Too tight unless focusing on one region.\n3 weeks+? Perfect for deeper south India or Himalayan adventures.\n\nOur expert tip: Fly between major cities + private driver = maximum sightseeing, minimum fatigue.`
  //   },
  //   {
  //     q: "How do I make changes to my booking?",
  //     a: `Simply contact our Customer Experience Team (details on your confirmation). Changes are usually possible up to 60 days before departure (subject to availability & any supplier fees). We’ll guide you through options and confirm any cost adjustments.`
  //   },
  //   {
  //     q: "How do I cancel or transfer my booking? India Escapes Conditions?",
  //     a: `Cancellation/terms are outlined in your booking confirmation. Standard policy:\n- 60+ days: Full refund minus deposit\n- 30–59 days: 50% refund\n- <30 days: No refund (travel insurance recommended)\n\nTransfer to another trip/date may be possible with admin fee. Contact us early – we’re here to help make it stress-free.`
  //   },
  //   {
  //     q: "How do I pay my balance?",
  //     a: `Balance is due 120 days before departure (150 days for Polar-style adventures). We’ll send a reminder 1–2 weeks prior. Pay securely via your booking portal or contact our team – credit card, bank transfer, or UPI accepted.`
  //   },
  //   {
  //     q: "Passport details & requirements?",
  //     a: `Passport must be valid 6+ months beyond return date with 2 blank pages. Some trips require passport details at booking. If you renew after booking, inform us immediately – you may need to carry both old & new passports.`
  //   },
  //   {
  //     q: "About land-only booking?",
  //     a: `Choose land-only if booking your own flights. You still get all on-ground services: hotels, guides, transfers, internal flights/trains. We’ll coordinate arrival transfers to match your schedule whenever possible.`
  //   },
  //   {
  //     q: "Where do I meet the leader and the group?",
  //     a: `Your tour leader & group meet at the start hotel (details in Final Joining Instructions sent 3–4 weeks before departure). Arrival transfer is usually included – just look for the India Escapes sign! Leader contact provided in final docs.`
  //   },
  //   {
  //     q: "What Happens Next after booking?",
  //     a: `1. Instant confirmation + invoice\n2. Customer Experience Team takes over\n3. Balance reminder ~2 weeks before due date\n4. Final Joining Instructions + luggage tags 2–3 weeks before departure\n\nAny questions? We’re just an email/call away!`
  //   },
  //   {
  //     q: "Preparing for my trip – insurance, packing, money?",
  //     a: `**Insurance**: Mandatory – must cover medical, cancellation & activities.\n**Packing**: Check Trip Notes + Universal Packing List. Layers, comfortable shoes, modest clothing for temples.\n**Money**: ATMs widely available; carry USD for exchange. Credit cards accepted in cities. Tipping guide provided in docs.\n\nNeed gear? We can advise or rent sleeping bags/down jackets for Himalayan trips.`
  //   }
  // ];

  useEffect(()=>{
    document.title = 'Frequently Asked Questions'
  },[])

  return (
    <>
      <Header color={{desktop:'black', mobile:'white'}} fixed={{desktop:true,mobile:true}}/>
      <div className="h-[32vh] lg:h-[60vh] flex-center-jc relative">
          <div className="relative h-full w-full overflow-hidden lg:w-[85%] flex-center-jc lg:rounded-3xl lg:h-fit lg:py-24 lg:mt-20 bg-black">
              <Image src={featuredImage || IMAGES.hero_bg} height={1000} width={1000} className="absolute top-0 h-full w-full left-0 opacity-80 object-cover" alt="" style={{zIndex:0}}/>
              <div className="relative rounded-3xl w-fit flex-center-jc flex-col text-white bg-green/70 text-center p-4 px-12 mt-8 lg:mt-0">
                <h1 className="font-semibold text-lg md:text-xl lg:text-5xl">FAQs</h1>
                <p className="text-xs md:text-sm lg:text-lg mt-2">Frequently Asked Questions</p>
              </div>
          </div>
      </div>

      {/* FAQ Section – matching About Us style */}
      <div className="bg-white flex-center-jc py-8 pb-16">
        <div className="w_80_90">
          <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {loading ? <>
            {[...Array(5)].map((_, i) => (
              <SkeletonFAQItem key={i} />
            ))}
          </> : 
          <>
            {list.map((faq, ind) => (
              <div
                key={ind}
                className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <button
                  onClick={() => toggleFAQ(ind)}
                  className="w-full p-4 lg:px-8 py-5 flex items-start justify-between text-left group"
                >
                  <p className="font-medium lg:font-semibold md:text-lg lg:text-xl pr-4">
                    {faq.question}
                  </p>
                  {openIndex === ind ? (
                    <ChevronUp className="mt-1 h-4 w-4 text-red flex-shrink-0 transition-transform group-hover:scale-110" />
                  ) : (
                    <ChevronDown className="mt-1 h-4 w-4 text-gray-600 flex-shrink-0 transition-transform group-hover:scale-110" />
                  )}
                </button>
                {openIndex === ind && (
                  <div className="px-6 lg:px-8 pb-6 pt-2 border-t border-gray-100">
                    <p className="text-xs md:text-base text-gray-600 whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </>
          }
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg md:text-xl text-gray-700">
              Still have questions?{" "}
              <span className="text-red font-semibold">We’re here 24/7</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Chat with our India specialists or call +91-99999-12345
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export function FAQComponent(){
  const { loading, list, load_list } = useFetchList({ collection_id: COLLECTIONS.FAQ, limit: 1000 })
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return(
    <div>
      <div className="mb-4">
        <Heading styles="lg:text-3xl text-red" text="FAQs"/>
      </div>
      <div className="">
        {loading ? <></> : <>
          <div className="grid grid-cols-1 gap-3">
            {list.map((faq, ind) => (
              <div
                key={ind}
                className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <button
                  onClick={() => toggleFAQ(ind)}
                  className="w-full p-4 lg:px-8 py-5 flex items-start justify-between text-left group"
                >
                  <p className="font-medium text-sm md:text-lg pr-4">
                    {faq.question}
                  </p>
                  {openIndex === ind ? (
                    <ChevronUp className="mt-1 h-4 w-4 text-red flex-shrink-0 transition-transform group-hover:scale-110" />
                  ) : (
                    <ChevronDown className="mt-1 h-4 w-4 text-gray-600 flex-shrink-0 transition-transform group-hover:scale-110" />
                  )}
                </button>
                {openIndex === ind && (
                  <div className="px-6 lg:px-8 pb-6 pt-2 border-t border-gray-100">
                    <p className="text-xs md:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  )

}

export function QueryComponent(){
  return(
    <div className="lg:sticky lg:top-8">
      <div className="mb-4">
        <Heading styles="lg:text-3xl" text="Get a" span_styles="capitalize" span_text="Quote"/>
      </div>
      <div className="">
        <MultiStepQueryForm destination="General Query" type="quote" onSave={()=>{}} dynamic={true}/>
      </div>
    </div>
  )

}

export function SkeletonFAQItem() {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full p-4 lg:px-8 py-5 flex items-start justify-between">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
      </div>
      <div className="px-6 lg:px-8 pb-6 pt-2 border-t border-gray-100">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}