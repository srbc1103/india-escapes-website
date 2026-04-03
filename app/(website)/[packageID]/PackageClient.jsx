'use client'

import { COLLECTIONS, IMAGES } from "../../../constants";
import Data from "../../../lib/backend";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import Header from "../../../components/website/Header";
import Image from "next/image";
import { CircleCheckBig, CircleX, Images, MapPin, ImageIcon, ChevronUp, Star, Info } from "lucide-react";
import { csvToArray } from "../../../functions";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "../../../components/ui/skeleton";
import Button, { ShareButton } from "../../../components/Buttons";
import usePopup from "../../../hooks/usePopup";
import DetailBlock, { AddonBlock } from "../../../components/website/DetailBlock";
import CustomImg from "../../../components/website/CustomImg";
import { QueryForm } from "../../../components/Forms";
import Widget from "../../../components/Widget";
import moment from "moment";
import { useCurrency } from "../../../context/CurrencyContext";
import { useTranslation } from "../../../hooks/useTranslation";
import BreadCrumb from "../../../components/BreadCrumb";
import { ICON_MAP } from "../../../constants";

function saveToRecentlyViewed(packageData) {
  if (typeof window === 'undefined') return;
  try {
    const STORAGE_KEY = 'india_escapes_recently_viewed';
    const MAX_ITEMS = 6;
    let recentlyViewed = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) recentlyViewed = JSON.parse(stored);
    recentlyViewed = recentlyViewed.filter(item => item.id !== packageData.id);
    recentlyViewed.unshift({
      id: packageData.id,
      name: packageData.name,
      url: packageData.url,
      price: packageData.price,
      offer_price: packageData.offer_price,
      featured_image: packageData.featured_image,
      duration: packageData.duration,
      viewedAt: new Date().toISOString()
    });
    recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
}

function InclusionExclusionAccordion({ items, type = "inclusion" }) {
  const [openIndices, setOpenIndices] = useState([]);
  const isInclusion = type === "inclusion";

  const toggle = (i) => {
    setOpenIndices(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const toggleAll = () => {
    if (openIndices.length === items.length) {
      setOpenIndices([]);
    } else {
      setOpenIndices(items.map((_, i) => i));
    }
  };

  const getIcon = (title = "") => {
    if(type == 'info'){
      return Info
    }
    const lower = title.toLowerCase();
    for (const [key, Icon] of Object.entries(ICON_MAP)) {
      if (lower.includes(key)) return Icon;
    }
    return isInclusion ? CircleCheckBig : CircleX;
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.length > 1 && (
        <div className="flex justify-end mb-4">
          <button onClick={toggleAll} className="text-sm underline text-gray-600 hover:text-gray-900 transition">
            {openIndices.length === items.length ? "Collapse All" : "Expand All"}
          </button>
        </div>
      )}

      {items.map((item, i) => {
        const Icon = getIcon(item.title);
        const isOpen = openIndices.includes(i);

        return (
          <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition shadow-gray-50">
            <button
              onClick={() => toggle(i)}
              className="w-full p-3 md:px-5 md:py-4 flex items-center justify-between text-left gap-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-9 h-9 rounded-full flex-center-jc ${type == 'info' || isInclusion ? 'bg-green/10' : 'bg-red-100'}`}>
                  <Icon className={`w-5 h-5 ${type == 'info' || isInclusion ? 'text-green' : 'text-red-600'}`} />
                </div>
                <p className="font-medium text-base lg:text-lg">{item.title}</p>
              </div>
              <ChevronUp className={`text-gray-600 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} size={18} />
            </button>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`px-5 pb-6 ${type == 'info' ? 'pt-4' : 'pt-0'} border-t border-gray-100`}>
                <div className="package_ec_css text-sm lg:text-base text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description || '' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PackageClient({ packageID }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [breadCrumb, setBC] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingItinerary, setLoadingItinerary] = useState(true);
  const [loadingInclusions, setLoadingInclusions] = useState(true);
  const [loadingExclusions, setLoadingExclusions] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [itinerary, setItinerary] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [moreInfo, setMoreInfo] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [fetchingRelated, setFetchingRelated] = useState(false);
  const [openDays, setOpenDays] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false);

  let [deal, setDeal] = useState({ name: '', discount: '', end_date: null, active: false, days_remaining: 0,url:'',featured_image:'' });

  const [detailBlock, setDetailBlock] = useState(null);
  const [maxW, setMaxW] = useState('max-w-[500px]')
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const { showDialog, hideDialog, dialog } = usePopup({ container_styles: maxW,form:detailBlock });

  const [state, setState] = useState({
    name: '', price: '', offer_price: '', description: '', duration: '',
    images: [], active: false, categories: [], locations: [], seo_keywords: '',
    featured_image: '', tags: [], extra_content: '', discount: 0, pid: null, widget: '',highlights:[]
  });

  const sectionRefs = {
    overview: useRef(null),
    itinerary: useRef(null),
    inclusions: useRef(null),
    exclusions: useRef(null),
    important_info: useRef(null),
  };

  const tabs = [
    { id: 'overview', label: t('detail.overview') },
    { id: 'itinerary', label: t('detail.itinerary') },
    ...(inclusions.length > 0 ? [{ id: 'inclusions', label: "Inclusions" }] : []),
    ...(exclusions.length > 0 ? [{ id: 'exclusions', label: "Exclusions" }] : []),
    { id: 'important_info', label: t('detail.importantInfo') },
  ];

  const toggleDay = (index) => {
    setOpenDays(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const toggleAll = () => {
    if (allExpanded) {
      setOpenDays([]);
      setAllExpanded(false);
    } else {
      setOpenDays(itinerary.map((_, i) => i));
      setAllExpanded(true);
    }
  };

  useEffect(() => {
    setAllExpanded(openDays.length === itinerary.length && itinerary.length > 0);
  }, [openDays, itinerary.length]);

  const loadPackage = async () => {
    setLoading(true);
    setLoadingItinerary(true);
    setLoadingInclusions(true);
    setLoadingExclusions(true);
    setLoadingInfo(true);
    setLoadingExpenses(true);
    setFetchingRelated(true);

    try {
      // Fetch all package data in one batched API call
      // packageID is actually the URL slug, not the database ID
      const d = await Data.fetchPackageComplete({
        url: packageID,
        category: []
      });

      if (d.status === 'success' && d.package) {
        const { name, images, price, offer_price, description, categories, duration, active, locations, seo_keywords, featured_image, tags, extra_content, id, widget, deal_metadata, highlights } = d.package;
        let hl = []
        highlights.forEach(h=>{
          let obj = JSON.parse(h)
          hl.push(obj)
        })
        let discount = 0;
        setBreadCrumb(name);
        if (offer_price && price) {
          let off = Math.round(((parseInt(offer_price) || 0) / (parseInt(price) || 0)) * 100);
          discount = isNaN(off) ? 0 : 100 - off;
        }
        if (deal_metadata) {
          let dm = JSON.parse(deal_metadata);
          setDeal({
            name: dm.name || '',
            discount: dm.discount_rate || '',
            end_date: dm.end_date || null,
            url: dm.url || null,
            featured_image: dm.featured_image || null,
            active: dm.status == 'active',
            days_remaining: moment(dm.end_date).diff(moment(), 'days') || 0
          });
        }

        // Set all data from batched response
        setItinerary(d.itinerary || []);
        setInclusions(d.inclusions || []);
        setExclusions(d.exclusions || []);
        setMoreInfo(d.info || []);
        setExpenses(d.expenses || []);
        setRelatedPackages(d.related || []);

        setState({
          ...state,
          name, images, price, offer_price, description,
          categories, duration, active, locations, seo_keywords,
          featured_image, tags: tags ? csvToArray(tags) : [],
          extra_content, discount, pid: id, widget, highlights: hl || []
        });
        document.title = name;
        saveToRecentlyViewed({ id, name, url: packageID, price, offer_price, featured_image, duration });
      } else {
        toast.error(d.message);
        router.replace('/packages');
      }
    } catch (err) {
      // toast.error(err.message);
      router.replace('/packages');
    } finally {
      setLoading(false);
      setLoadingItinerary(false);
      setLoadingInclusions(false);
      setLoadingExclusions(false);
      setLoadingInfo(false);
      setLoadingExpenses(false);
      setFetchingRelated(false);
    }
  };

  useEffect(() => {
    if (packageID) loadPackage();
    else router.replace('/packages');
  }, [packageID]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const ref = sectionRefs[tabId]?.current;
    if (ref) {
      const y = ref.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (loading) return;
    const offsets = {};
    Object.entries(sectionRefs).forEach(([id, ref]) => {
      if (ref.current) offsets[id] = ref.current.offsetTop - 120;
    });
    const onScroll = () => {
      const scrollY = window.scrollY;
      let newTab = 'overview';
      let maxBelow = -Infinity;
      Object.entries(offsets).forEach(([id, top]) => {
        if (scrollY >= top && top > maxBelow) {
          maxBelow = top;
          newTab = id;
        }
      });
      if (newTab !== activeTab) setActiveTab(newTab);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, activeTab]);

  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const scrollThreshold = 300;
  useEffect(() => {
    const handleScroll = () => setShowStickyButtons(window.scrollY > scrollThreshold);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function setBreadCrumb(name) {
    let bc_array = [{ text: 'Home', url: '/' }, { text: name, url: '' }];
    setBC(<BreadCrumb options={bc_array} active={name} />);
  }

  return (
    <div>
      {dialog}
      <Header color="black" fixed={{ mobile: false, desktop: false }} />

      {loading ? (
        <div className="w_80_90 mx-auto my-4 space-y-12">
          <PackageImagesLoading />
          <Skeleton className="h-10 w-3/4 mb-2" />
          <div className="flex gap-2 flex-wrap">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
          </div>
          <div className="flex gap-2 overflow-x-auto py-2 border-t border-b border-gray-100">
            {tabs.map((tab) => (
              <Skeleton key={tab.id} className={`h-10 w-28 shrink-0 rounded-xl ${tab.id === 'overview' ? 'bg-red/20' : ''}`} />
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[70%] space-y-12">
              <section id="overview"><Skeleton className="h-8 w-32 mb-3" /><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div></section>
              <section id="itinerary"><Skeleton className="h-8 w-24 mb-3" /><div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="ml-8">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
                {/* <Skeleton className "h-4 w-5/6 mt-1" /> */}
              </div>)}</div></section>
            </div>
          </div>
        </div>
      ) : (
        <>
          <PackageImages images={state.images} t={t} />

          <div className="w_80_90 mx-auto my-4 lg:my-12">
            {breadCrumb}
            <h1 className="text-2xl font-semibold md:text-3xl lg:text-4xl">{state.name}</h1>
            {state.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap my-2 lg:my-4">
                {state.tags.map((tag, i) => (
                  <Link key={i} href={`/tag/${tag.toLowerCase().replaceAll(' ', '-')}`} target="_blank"
                    className="capitalize text-blue bg-blue/5 p-1 px-3 rounded-full border border-[#e7edf3] text-xs lg:text-sm transition hover:brightness-90">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-start overflow-x-auto border-t border-b border-gray-100 py-2 gap-2 mb-6 sticky top-0 bg-white z-10">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                  className={`p-2 px-4 shrink-0 rounded-xl transition duration-300 ${activeTab === tab.id ? 'bg-red text-white shadow-lg shadow-red/20' : 'bg-gray-100 text-black hover:bg-gray-50'} capitalize text-xs md:text-sm lg:text-lg lg:px-6`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[70%] space-y-12">

                <section id="overview" ref={sectionRefs.overview}>
                  <h2 className="text-xl font-medium lg:text-3xl mb-3">About the tour</h2>
                  <div className="package_ec_css text-sm lg:text-base text-gray-700" dangerouslySetInnerHTML={{ __html: state.description }} />
                  {state.highlights ? <><h2 className="text-xl font-medium lg:text-3xl mb-3 mt-6">Highlights</h2>
                    {state.highlights.length > 0 ? state.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 flex-1 mb-2">
                          <div className={`w-9 h-9 rounded-full flex-center-jc bg-green/10`}>
                            <Star className={`w-4 h-4 text-green`} />
                          </div>
                          <p className="text-sm lg:text-base text-gray-700">{highlight}</p>
                        </div>
                      ))
                     : <></>}
                  </>:<></>}
                </section>

                <section id="itinerary" ref={sectionRefs.itinerary}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium lg:text-3xl">{t('detail.itinerary')}</h2>
                    {itinerary.length > 0 && (
                      <button onClick={toggleAll} className="text-sm underline transition">
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                      </button>
                    )}
                  </div>

                  {loadingItinerary ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="ml-8">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6 mt-1" />
                        </div>
                      ))}
                    </div>
                  ) : itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.map((d, i) => (
                        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition shadow-gray-50">
                          <button onClick={() => toggleDay(i)} className="w-full p-3 lg:px-6 lg:py-5 flex items-center justify-between text-left gap-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4 justify-start lg:justify-between flex-1">
                              <div className={`w-8 aspect-square rounded-full flex-center-jc text-white font-medium text-xs md:text-sm ${i === 0 ? 'bg-red' : 'bg-gray-600'}`}>
                                {d.day}
                              </div>
                              <p className="font-medium lg:text-xl w-[80%] lg:flex-1 lg:w-auto">
                                Day {d.day} - {d.title}
                              </p>
                              <ChevronUp className={`duration-300 text-red ${openDays.includes(i) ? '' : 'rotate-180'}`} size={14}/>
                            </div>
                          </button>

                          <div className={`transition-all duration-500 ease-in-out ${openDays.includes(i) ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                            <div className="p-3 md:px-6 md:pb-6 space-y-6 border-t border-gray-100">
                              <div className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                {d.description}
                              </div>

                              {d.location_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">Sightseeing</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.location_metadata.map((l, j) => (
                                      <MetaDataBlock key={j} {...l} type="location" fun={() => {
                                        setMaxW('lg:max-w-[50vw]')
                                        setDetailBlock(<DetailBlock id={l.id || null} type="LOCATIONS" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {d.activity_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">{t('detail.activities')}</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.activity_metadata.map((a, j) => (
                                      <MetaDataBlock key={j} {...a} type="activity" fun={() => {
                                        setMaxW('lg:max-w-[50vw]')
                                        setDetailBlock(<DetailBlock id={a.id || null} type="ACTIVITIES" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {d.accommodation_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">{t('detail.accommodations')}</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.accommodation_metadata.map((acc, j) => (
                                      <MetaDataBlock key={j} {...acc} type="accommodation" fun={() => {
                                        setMaxW('lg:max-w-[50vw]')
                                        setDetailBlock(<DetailBlock id={acc.id || null} type="ACCOMMODATIONS" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>

                {inclusions.length > 0 && (
                  <section id="inclusions" ref={sectionRefs.inclusions}>
                    <h2 className="text-xl font-medium lg:text-3xl mb-2">
                      {t('detail.packageIncludes')} <span className="text-green">{t('detail.includes')}</span>
                    </h2>
                    {loadingInclusions ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                      </div>
                    ) : (
                      <InclusionExclusionAccordion items={inclusions} type="inclusion" />
                    )}
                  </section>
                )}

                {exclusions.length > 0 && (
                  <section id="exclusions" ref={sectionRefs.exclusions}>
                    <h2 className="text-xl font-medium lg:text-3xl mb-2">
                      {t('detail.packageIncludes')} <span className="text-red-600">{t('detail.excludes')}</span>
                    </h2>
                    {loadingExclusions ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                      </div>
                    ) : (
                      <InclusionExclusionAccordion items={exclusions} type="exclusion" />
                    )}
                  </section>
                )}

                <section id="important_info" ref={sectionRefs.important_info}>
                  {/* {state.extra_content && (
                    <div className="package_ec_css text-sm lg:text-base text-gray-700" dangerouslySetInnerHTML={{ __html: state.extra_content }} />
                  )} */}
                  <h2 className="text-xl font-medium lg:text-3xl mb-2"><span className="text-green">Important</span> Information</h2>
                  {loadingInfo ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                  ) : (
                    <InclusionExclusionAccordion items={moreInfo} type="info" />
                  )}
                </section>

                {!loadingExpenses && <ExpenseSection expenses={expenses} />}
              </div>

              <div className="flex-1 relative">
                {deal.active && deal.days_remaining > 0 ? (
                  <>
                  <Link href={deal.url ? `/deals/${deal.url}` : '#'} target="_blank">
                  {deal.featured_image ? 
                  <>
                    <Image src={deal.featured_image} height={1000} width={1000} className="w-full object-contain mb-4 h-auto rounded-3xl" alt={deal.name}/>
                  </> : <>
                    <div className="rounded-3xl text-white bg-green p-4 mb-4">
                      <p>{deal.name}</p>
                      {deal.discount ? <p className="text-lg md:text-2xl lg:text-3xl mt-2">Get <span className="font-semibold">{deal.discount}%</span> off!</p> : null}
                      {deal.days_remaining < 10 ? <p className="block w-full animate-pulse text-white text-[10px] font-light">Hurry! {deal.days_remaining} day{deal.days_remaining > 1 ? 's' : ''} remaining</p> : null}
                    </div>
                  
                  </>}
                  </Link>
                  </>
                ) : null}

                <div className="p-4 lg:p-6 border border-gray-200 bg-gray-50 rounded-3xl overflow-hidden">
                  {state.discount > 0 && <p>{t('common.from')} <span className="line-through">{formatPrice(state.price)}</span></p>}
                  {(state.price || state.offer_price) ? (
                    <div className="flex items-center justify-between w-full">
                      <p className="font-medium text-lg md:text-xl lg:text-3xl">
                        {formatPrice(state.offer_price || state.price || 0)}
                        <span className="text-sm text-gray-600 font-light">/{t('common.perPerson').split(' ')[1] || 'person'}</span>
                      </p>
                      {state.discount ? <div className="border border-red text-red rounded-full flex-center-jc p-2 px-3 font-medium">-{state.discount}%</div> : null}
                    </div>
                  ) : null}

                  <div className="my-2 lg:my-4 flex items-center justify-start gap-2 rounded-full bg-white p-2">
                    <div className="h-16 aspect-square rounded-full flex-center-jc">
                      <Image src={IMAGES.call} height={200} width={200} alt="" className="h-[60%] object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('detail.talkToExpert')}</p>
                      <Link href="tel:+918091066115" className="font-semibold text-xl lg:text-2xl transition duration-500 hover:text-red">+91 80910 66115</Link>
                    </div>
                  </div>

                  <div className={`mx-auto w-[100%] fixed bottom-0 left-0 h-auto bg-white p-3 px-4 border-t border-gray-200 lg:relative lg:p-0 lg:border-none transition-transform duration-300 ease-in-out ${showStickyButtons ? 'translate-y-0' : 'translate-y-full'} lg:translate-y-0`} style={{ zIndex: 5 }}>
                  <div className="lg:hidden mb-2">
                    {state.discount > 0 && <p className="text-xs">{t('common.from')} <span className="line-through">{formatPrice(state.price)}</span></p>}
                    {(state.price || state.offer_price) ? (
                      <div className="flex items-center justify-start gap-2 w-full">
                        <p className="font-medium text-lg md:text-xl lg:text-3xl">
                          {formatPrice(state.offer_price || state.price || 0)}
                          <span className="text-sm text-gray-600 font-light">/{t('common.perPerson').split(' ')[1] || 'person'}</span>
                        </p>
                        {state.discount ? <div className="text-[10px] border border-red text-red rounded-full flex-center-jc p-1 px-2 font-medium">-{state.discount}%</div> : null}
                        {state.duration ? <div className="text-[10px] border border-black text-white rounded-full flex-center-jc p-1 px-2 font-medium bg-black">{`${state.duration}D / ${state.duration-1}N`}</div> : null}
                      </div>
                    ) : null}
                  </div>
                    <div className="flex-center-jc gap-2 w-full">
                      <Button onClick={() => {
                        if (state.widget) {
                          document.getElementById('wetravel_widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          setMaxW('lg:max-w-[500px]')
                          setDetailBlock(<QueryForm destination={state.name} type="quote" onSave={hideDialog} />);
                          showDialog();
                        }
                      }} disabled={loading} styles="px-4 py-2 flex-1 border border-red text-white bg-red whitespace-nowrap">
                        {state.widget ? 'Check Availability' : "Get Quote"}
                      </Button>
                      <ShareButton title={state.name} url={window.location.href} />
                    </div>
                  </div>

                </div>

                {state.widget ? <div id="wetravel_widget" className="my-4"><Widget uuid={state.widget} /></div> : null}

                {fetchingRelated ? null : relatedPackages.length > 0 ? (
                  <>
                    <div className="mt-8 mb-4">
                      <p className="text-lg font-semibold lg:text-xl flex-1" style={{ lineHeight: '120%' }}>
                        {t('detail.moreDiscover')} <span className="text-red">{t('detail.discover')}</span>
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {relatedPackages.map((pkg, i) => {
                        let duration_string = pkg.duration ? `${pkg.duration}D/${pkg.duration - 1}N` : '';
                        return (
                          <Link key={i} href={`/${pkg.url}`}>
                            <div className="h-88 lg:h-108 rounded-3xl group overflow-hidden relative">
                              <Image src={pkg.featured_image || IMAGES.placeholder} height={400} width={400} className="h-full w-full absolute object-cover transition duration-300 group-hover:scale-110" alt="" style={{ zIndex: -1 }} />
                              <div className="h-full w-full flex items-start p-4 justify-end flex-col bg-gradient-to-t from-black/50 to-transparent text-white z-10">
                                <p className="w-fit p-1 px-2 bg-green text-white rounded-full text-xs mb-1">{duration_string}</p>
                                <p className="font-medium text-lg lg:text-xl">{pkg.name}</p>
                                {(pkg.price || pkg.offer_price) ? <p className="font-medium">{t('common.from')} {formatPrice(pkg.offer_price || pkg.price || 0)}</p> : null}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PackageImages({ images, t }) {
  const containerRef = useRef(null);
  const lgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !images?.length) return;

    const raf = requestAnimationFrame(() => {
      const lg = lightGallery(containerRef.current, {
        selector: 'a',
        plugins: [lgThumbnail, lgZoom],
        speed: 400,
        thumbnail: false,
        zoom: false,
        download: false,
        counter: true,
        mobileSettings: { controls: false, showCloseIcon: true },
      });
      lgRef.current = lg;
    });

    return () => {
      cancelAnimationFrame(raf);
      lgRef.current?.destroy();
    };
  }, [images]);

  return (
    <div ref={containerRef} className="w-[90%] lg:w-[85%] mx-auto grid grid-cols-2 lg:grid-cols-3 relative h-[40vh] lg:h-[60vh] gap-2 md:gap-4 lg:mt-4">
      {images && images.length > 0 ? (
        images.slice(0, 3).map((img, i) => (
          <div
            key={`visible-${i}`}
            className={`relative overflow-hidden rounded-lg md:rounded-2xl cursor-pointer transition duration-300 hover:brightness-105 
            ${i === 0 ? 'col-span-2 lg:row-span-2' : ''} 
          `}
            // ${(i === 0 || i === 2) ? 'hidden lg:block' : ''}
            onClick={() => lgRef.current?.openGallery(i)}
          >
            <CustomImg url={img} al="" styles="h-full w-full object-cover" />
          </div>
        ))
      ) : (
        [...Array(3)].map((_, i) => (
          <div key={i} className={`relative overflow-hidden lg:rounded-2xl bg-gray-100 ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''} ${(i === 0 || i === 2) ? 'hidden lg:block' : ''}`}>
            <Image src={IMAGES.placeholder} height={500} width={500} alt="" className="h-full w-full object-cover opacity-20" />
          </div>
        ))
      )}

      <div className="hidden">
        {images.map((img, i) => (
          <a key={`lg-${i}`} href={img}>
            <Image src={img} width={1} height={1} alt="" />
          </a>
        ))}
      </div>
      {images && images.length > 0 && (
        <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 p-1 lg:p-2 px-2 lg:px-4 border border-white rounded-full flex-center-jc gap-2 backdrop-blur-sm bg-white/10 text-white pointer-events-none text-xs lg:text-sm">
          <Images size={12} /> {t('detail.viewAllImages')}
        </div>
      )}
    </div>
  );
}

function PackageImagesLoading() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 relative h-[40vh] lg:h-[60vh] gap-4">
      <Skeleton className="lg:col-span-2 lg:row-span-2 rounded-2xl" />
      <Skeleton className="hidden lg:block rounded-2xl" />
      <Skeleton className="hidden lg:block rounded-2xl" />
      <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 p-1 lg:p-2 px-2 lg:px-4 rounded-full bg-white/10 backdrop-blur-sm">
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

function MetaDataBlock({ name, description, img, featured_image, type, fun, cost, title }) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  return (
    <div role="button" className={`shrink-0 ${type == 'experience' ? 'w-36 lg:w-44' : 'w-32 md:w-36 lg:w-40'} cursor-pointer`} onClick={fun || null}>
      <div className="rounded-xl overflow-hidden shadow border border-gray-100 hover:shadow-lg transition">
        <div className="h-20 lg:h-24 flex-center-jc overflow-hidden bg-gray-100/50">
          {img || featured_image ? <Image src={img || featured_image} alt={name || title || ''} height={200} width={200} className="w-full h-full object-cover" /> : <ImageIcon size={60} className="text-gray-200" />}
        </div>
        <div className="p-2">
          <p className={`text-xs md:text-sm font-medium ${type == 'experience' ? '' : 'truncate'}`}>{name || title}</p>
          {type !== 'experience' ? <p className="text-[8px] lg:text-[10px] text-gray-500 line-clamp-2">{description?.slice(0, 100)}{description?.length > 100 ? '...' : ''}</p> : <></>}
          {cost ? <>
            <div className="flex items-start md:items-center justify-start md:gap-2 flex-col md:flex-row mt-2 md:mt-0">
              <span className="text-sm md:text-base lg:text-lg font-medium text-red">{formatPrice(cost)}</span>
              <span className="text-[10px] md:text-xs text-gray-500">{t('common.perPerson')}</span>
            </div>
          </> : <></>}
        </div>
      </div>
    </div>
  );
}

function ExpenseSection({ expenses }) {
  const { t } = useTranslation();
  const [detailBlock,setDetailBlock] = useState(null)
  const [maxW, setMaxW] = useState('max-w-[500px]')
  const { showDialog, hideDialog, dialog } = usePopup({ container_styles: maxW,form:detailBlock });
  return (
    <>
    {dialog}
    <section id="optional_addons" className="space-y-6">
      <h2 className="text-xl font-medium lg:text-3xl mb-4">Optional Experiences</h2>
      <div className="flex gap-3 overflow-x-auto lg:flex-wrap pb-2 shrink-0">
        {expenses.map((l, j) => (
          <MetaDataBlock key={j} {...l} type="experience" fun={() => {
            setMaxW('lg:max-w-[60vw]')
            setDetailBlock(<AddonBlock {...l}/>);
            showDialog();
          }} />
        ))}
      </div>
    </section>
      {/* {expenses.length > 0 && (
        <section id="optional_addons" className="space-y-6">
          <h2 className="text-xl font-medium lg:text-3xl mb-4">{t('detail.optionalAddons')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xl shadow-gray-100/50 hover:shadow transition">
                <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2">{exp.title}</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-3">{exp.description}</p>
                <div className="flex items-center justify-start gap-2">
                  <span className="text-lg font-medium text-red">{formatPrice(exp.cost)}</span>
                  <span className="text-xs text-gray-500">{t('common.perPerson')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}
    </>
  );
}