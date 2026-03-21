'use client'
import Footer from "../../components/website/Footer";
import Header from "../../components/website/Header";
import { COLLECTIONS, IMAGES } from "../../constants";
import { Award, MapPin, Search, Settings, Star, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PackageGroup } from "./destinations/page";
import { CategorySection, PackageBundle, DealsSlider, Regions, BlogsSection } from "../../components/PackageBlock";
import { useTranslation } from "../../hooks/useTranslation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrency } from "../../context/CurrencyContext";
import Heading from "../../components/ui/Heading";
import { TripAdvisorReviews, TripAdvisorReviewWidget, TripAdvisorWideWidget, TripAdvisorWidget } from "../../components/Widget";
import { FAQComponent, QueryComponent } from "./faq/page";
import Data from "../../lib/backend";
import { formatNumber, formatNumber1 } from "../../functions";

// Component to display recently viewed packages
function RecentlyViewedPackages() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('india_escapes_recently_viewed');
      if (stored) {
        const packages = JSON.parse(stored);
        setRecentlyViewed(packages);
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, []);

  if (recentlyViewed.length === 0) {
    return null; // Don't show section if no recently viewed
  }

  return (
    <section className="py-12 lg:pb-20">
      <div className="w_80_90">
        <div className="mb-6 lg:mb-8">
          <Heading styles="text-xl lg:text-3xl" text={t('home.recentlyViewed')}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {recentlyViewed.map((pkg, i) => {
            const durationString = pkg.duration ? `${pkg.duration}D/${pkg.duration - 1}N` : '';
            return (
              <Link key={i} href={`/${pkg.url}`}>
                <div className="h-52 rounded-3xl group overflow-hidden relative">
                  <Image
                    src={pkg.featured_image || IMAGES.placeholder}
                    height={400}
                    width={400}
                    className="h-full w-full absolute object-cover transition duration-300 group-hover:scale-110"
                    alt=""
                    style={{ zIndex: -1 }}
                  />
                  <div className="h-full w-full flex items-start p-4 justify-end flex-col relative bg-gradient-to-t from-black/50 to-transparent text-white z-10">
                    {durationString && (
                      <p className="w-fit p-1 px-2 bg-green text-white rounded-full text-xs mb-1">
                        {durationString}
                      </p>
                    )}
                    <p className="font-medium lg:text-xl">{pkg.name}</p>
                    {(pkg.price || pkg.offer_price) ? (
                      <p className="font-medium text-sm">
                        {t('common.from')} {formatPrice(pkg.offer_price || pkg.price || 0)}
                      </p>
                    ) : <></>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [search,setSearch] = useState(null)
  const { t } = useTranslation();
  const router = useRouter()

  const handleSearch = e=>{
    e.preventDefault()
    if(!search){
      return
    }
    router.push(`/search?q=${search}`)
  }

  const [reviewStats,setReviewStats] = useState({
    total_review:50456,
    average_ratings:5,
    trip_advisor_ratings:4,
    in_short:'50k'
  })

  const loadStats = async () => {
    try {
      const d = await Data.get_item_detail({ collection_id: COLLECTIONS.REVIEWS, document_id: '693e17f4001a64205c2b' });
      if (d.status === 'success') {
        const { total_review, average_ratings, trip_advisor_ratings, in_short} = d.document;
        setReviewStats({total_review, average_ratings, trip_advisor_ratings, in_short});
      } 
    } catch (err) {
    }
  };

  const about_us_cards = [
    {title:t('home.tailorMade'),text:t('home.tailorMadeText'),icon: <Settings size={28}/>},
    {title:t('home.trustedService'),text:t('home.trustedServiceText'),icon: <ThumbsUp size={28}/>},
    {title:t('home.localExpertise'),text:t('home.localExpertiseText'),icon: <Award size={28}/>}
  ]

  // useEffect(()=>{
  //   loadStats()
  // },[])

  return (
    <>
      <Header color={{mobile:'white',desktop:'white'}} fixed/>
      {/* header section */}
      <div className="h-[75vh] max-w-[100vw] lg:h-[90vh] relative flex-center-jc flex-col gap-8 overflow-hidden bg-black">
        <video autoPlay muted loop playsInline preload="auto" poster="/poster.webp" className="absolute top-0 h-full lg:-top-[25%] lg:h-[125%] w-full left-0 object-cover opacity-80" style={{zIndex:0}}>
          <source src="/vdo.webm" type="video/webm" />
          <source src="/vdo.mp4" type="video/mp4" />
        </video>
        {/* <Image src={IMAGES.white_strip} height={500} width={500} className="absolute -bottom-1 lg:-bottom-4 h-auto w-full left-0 object-contain" style={{zIndex:0}} alt=""/> */}
        {/* <Image src={IMAGES.hero_bg} height={500} width={500} className="absolute top-0 h-full w-full left-0 object-cover" style={{zIndex:0}} alt=""/> */}
        <h1 className="w_80_90 text-center text-white text-2xl md:text-3xl relative lg:text-5xl mt-12" style={{lineHeight:'130%'}}>
          Your dream Indian escape, personally designed with expert local insight
        </h1>
        <form onSubmit={handleSearch} className="relative rounded-full bg-white/10 backdrop-blur-xl overflow-hidden w-[85%] lg:w-[40%] flex items-center justify-between p-1 md:p-2 gap-1 border border-white/20">
          <MapPin className="w-8 md:ml-2 aspect-square lg:h-8 block text-white" strokeWidth={1.25}/>
          <input className="w-[80%] border-none outline-none p-2 md:text-lg text-white placeholder:text-white placeholder:opacity-100 placeholder:font-light" placeholder={t('home.searchPlaceholder')} autoComplete="off" value={search || ''} onChange={e=>{
            setSearch(e.target.value)
          }}/>
          <button disabled={!search} className="rounded-full aspect-square p-1 lg:w-[8%] disabled:opacity-30 disabled:pointer-events-none border-2 border-white hover:bg-white text-white hover:text-red flex-center-jc transition duration-300"><Search className="h-4 aspect-square md:h-6 lg:h-8"/></button>
        </form>
      </div>
      <DealsSlider/>
      <PackageBundle type="deals"/>
      <RecentlyViewedPackages />
      <CategorySection featured={true} type="featured"/>
      {/* about us section */}
      <Regions/>
      <section className="flex-center-jc min-h-screen bg-[#f8f7f7] py-8 lg:py-20">
        <div className="w_80_90">
          <p className="uppercase text-2xl lg:text-lg text-gray-600">{t('home.aboutUs')}</p>
          <div className="flex items-start justify-start gap-4 my-4 flex-wrap">
            <p className="text-2xl md:text-3xl font-semibold lg:text-4xl flex-1" style={{lineHeight:'120%'}}>{t('home.whyBest')} <span className="text-red block">{t('home.bestMarket')}</span></p>
            <p className="w-full lg:w-[60%] lg:p-4 text-gray-600 text-sm md:text-base lg:text-lg">{t('home.aboutDescription')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {about_us_cards.map((item,ind)=>{
              let {title,text,icon} = item
              return(
                <div key={ind} className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-xl">{title}</p>
                    {icon}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <PackageBundle type="labels"/>
      {/* <div className="mt-8 lg:mt-12">
        <PackageGroup collection_id={COLLECTIONS.DESTINATIONS} package_type="destinations"/>
      </div> */}
      <section className="flex-center-jc bg-[#f8f7f7] py-8 lg:py-12 flex-col gap-4 lg:gap-8">
        <div className="w_80_90">
          <p className="text-xl lg:text-3xl font-semibold flex-1" style={{lineHeight:'120%'}}>Journey <span className="text-red">Stories</span></p>
        </div>
        <BlogsSection limit={3}/>
      </section>

      <section className="pt-8 lg:py-20 relative h-[80vh] md:h-auto">
        <div className="w_80_90 relative">
          <div className="mb-8 space-y-2">
            <p className="text-xl lg:text-5xl font-semibold" style={{lineHeight:'120%'}}>
              See what <span className="text-red block">travellers are saying</span>
            </p>
            <p className="text-gray-700 text-sm md:text-xl">Crafting lasting memories for every traveler</p>
            <div className="flex items-center justify-start border border-gray-300 rounded-2xl w-fit p-4 my-4 md:my-6">
              <div className="flex items-start justify-center flex-col pr-4 md:pr-6 border-r border-red">
                {/* <p className="font-medium text-2xl md:text-4xl lg:text-6xl"><span className="text-red">+</span>{reviewStats.in_short}</p>
                <span className="text-gray-500 text-xs md:text-sm">Customer Reviews</span> */}
                <Image src={IMAGES.trip_advisor_logo} height={500} width={500} alt="Trip Advisor" className="h-16 md:h-20 lg:h-24 w-auto"/>
              </div>
              <div className="flex items-start justify-center flex-col pl-4 md:pl-6">
                <p className="font-medium text-2xl md:text-4xl lg:text-6xl"><span className="text-red">+</span>{reviewStats.average_ratings}</p>
                <span className="text-gray-500 text-xs md:text-sm">Average Ratings</span>
              </div>
            </div>
            {/* <div className="flex items-center justify-start w-fit mb-4 md:mb-6">
              <div className="flex items-start justify-center flex-col pr-4 border-r-2 border-red">
                <p className="font-medium text-xl md:text-2xl mb-1">Trip Advisor</p>
                <span className="text-gray-500 text-xs md:text-sm">{formatNumber1(reviewStats.total_review || 0)} Reviews</span>
              </div>
              <div className="flex items-start justify-center flex-col pl-4">
                <p className="font-medium text-xs md:text-base">Trip Advisor rating</p>
                <ul className="flex items-center justify-start my-1 gap-.5">
                  {[...Array(5)].map((_,i)=>{
                    let is_filled = i+1 <= parseInt(reviewStats.trip_advisor_ratings || 4)
                    return <Star key={i} size={14} className={is_filled ? 'text-[#fcbb02]' : 'text-gray-400'} fill={is_filled ? '#fcbb02' : 'white'}/>
                  })}
                </ul>
                <span className="text-gray-500 text-xs">{reviewStats.trip_advisor_ratings}/5</span>
              </div>
            </div> */}
            <Link
              href="https://www.tripadvisor.in/Attraction_Review-g304552-d32742468-Reviews-India_Escapes-Shimla_Shimla_District_Himachal_Pradesh.html"
              target="_blank"
              className=" bg-red hover:bg-black text-white py-2 px-4 rounded-full transition-all duration-500 text-xs md:text-lg"
            >
              View All Reviews
            </Link>
          </div>
          {/* <div className="space-y-8">
            <TripAdvisorReviewWidget
              uniq="903"
              locationId="32742468"
              nreviews={4}
              iswide={true}
              className="w-full"
            />
            <TripAdvisorReviews/>
          </div> */}
        </div>
        <Image src={IMAGES.review_graphic} height={1000} width={1000} alt="Review" className="absolute -bottom-4 md:bottom-0 right-0 h-1/2 md:h-[90%] w-auto md:max-w-[60%] pointer-events-none object-contain -z-10"/>
      </section>
      <section className="min-h-screen bg-[#f8f7f7] py-20 flex-center-jc">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w_80_90 items-start">
          <FAQComponent/>
          <QueryComponent/>
        </div>
      </section>
    </>
  )
}
